//Create express app
const express = require('express');
const session = require('express-session')
const app = express();
const mongoose = require("mongoose");
const MongoDBStore = require("connect-mongodb-session")(session);

let Users = require("./UserModel");
let Orders = require("./OrderModel")

mongoose.connect('mongodb+srv://admin:admin@cluster0.pwml9.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', {useNewUrlParser: true});

let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log("Connected to a4 database.");
});

//View engine
app.set("view engine", "pug");

//Set up the routes
app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(express.json());

app.get("/", sendIndex);
app.get("/users", sendUsers);
app.get("/order", sendOrder);
app.get("/profile", sendProfile);

app.post("/logout", logout);

app.route("/register")
.get((req, res) => {
    res.render("pages/registration", {status: req.session.loggedin});
})
.post((req, res) => {
    // check if user already exists
    Users.exists({username: req.body.username}, function(err, result){
        if(err) throw err;
        if (result != null) {
            //user already exists
            res.status(401);
            res.end();
        } else {
            // create new user
            res.status(201);
            let username = req.body.username;
            let password = req.body.password;
            let user = new Users({username: username, password: password, privacy: false});
            // save user to database
            user.save(function(err, result) {
                if(err) throw err;
                req.session.username = username;
                req.session.loggedin = true;
                res.end();
            });
        }
    });
})

app.route("/login")
.get((req, res) => {
    // only render login page if not logged in
    if(req.session.loggedin){
		res.status(200).send("Already logged in.");
		return;
	}
	res.render("pages/login");
})
.post((req, res) => {
    if(req.session.loggedin){
		res.status(200).send("Already logged in.");
		return;
	}

	let username = req.body.username;
	let password = req.body.password;

    Users.exists({username: req.body.username}, function(err, foundUser){
        if(err) throw err;
        // username not found
        if (foundUser == null) {
            res.status(401);
            res.end();
        } else {
            Users.findById(foundUser, function(err, result) {
                // successful login
                if (result.password == password) {
                    res.status(200);
                    req.session.loggedin = true;
                    req.session.username = username;
                    res.end();
                // wrong password
                } else {
                    res.status(405);
                    res.end();
                }
            })        
        }        
    });
})

app.route("/users")
.put((req, res) => {
    //find user and update privacy setting
    Users.findOneAndUpdate({username: req.session.username}, {privacy: req.body.priv}, function(err, result){
        if (err) throw err;
        res.status(200);
        res.end();
    })
})

app.route("/users/:userID")
.get((req, res) => {
    let url = req.url;
    array = url.split("/");
    id = array[array.length-1];

    // find user from id in url
    user = Users.findById(id, function(err, foundUser) {
        if (err) throw err;
        // check privacy settings
        if (foundUser.privacy) {
            // if private, check if user is authorized
            if (foundUser.username != req.session.username) {
                res.status(403).send("Unauthorized");
                res.end();
            } else {
                Orders.find(function(err, ors){
                    if(err) throw err;
                    res.render("pages/user", {status: req.session.loggedin, user: foundUser, sessionUser: req.session.username, orders: ors});
                });	                
            }
        } else {
            Orders.find(function(err, ors){
                if(err) throw err;
                res.render("pages/user", {status: req.session.loggedin, user: foundUser, sessionUser: req.session.username, orders: ors});
            });	
        }
        
    })
})

app.route("/orders")
.post((req, res) => {
    // create new order using schema
    let order = new Orders({customer: req.session.username, restaurantID: req.body.restaurantID, restaurantName: req.body.restaurantName,
    subtotal: req.body.subtotal, total: req.body.total, fee: req.body.fee, tax: req.body.tax});
    console.log(req.body);

    // save order to database
    order.save(function(err, result) {
        if(err) throw err;
        res.end();
    });
})

app.route("/orders/:orderID")
.get((req, res) => {
    let url = req.url;
    array = url.split("/");
    id = array[array.length-1];

    // find order with id
    order = Orders.findById(id, function(err, foundOrder) {
        if (err) throw err;
        // find user to check privacy settings
        Users.findOne({username: foundOrder.customer}, function(err, result){
            if (err) throw err;
            if (result.privacy) {
                // if private, check to see if user matches
                if (!req.session.loggedin || req.session.username != foundOrder.customer) {
                    res.status(403).send("Unauthorized");
                    res.end();
                } else {
                    res.render("pages/order", {status: req.session.loggedin, order: foundOrder});  
                }
            } else {
                res.render("pages/order", {status: req.session.loggedin, order: foundOrder});    
            }
        });                
    });
})

function sendIndex(req, res, next){
	res.render("pages/index", {status: req.session.loggedin});
}

function sendUsers(req, res, next){
    // get list of all users
    Users.find(function(err, result){
        if(err) throw err;
        res.render("pages/users", {status: req.session.loggedin, users: result});
    });	
}

function sendOrder(req, res, next){
    //check if logged in
    if (req.session.loggedin) {
        res.render("pages/orderform", {status: req.session.loggedin});
    } else {
        res.status(403).send("Unauthorized; you must log in");
        res.end();
    }
	
}

function sendProfile(req, res, next){
    //check if logged in
    if (req.session.loggedin) {
        Users.findOne({username: req.session.username}, function(err, foundUser) {
            if (err) throw err;
            Orders.find(function(err, ors){
                if(err) throw err;
                res.render("pages/user", {status: req.session.loggedin, user: foundUser, sessionUser: req.session.username, orders: ors});
            });	
        });	
    } else {
        res.status(403).send("Unauthorized; you must log in");
        res.end();
    }
    
}

function logout(req, res, next) {
    //check if user is logged in
    if (req.session.loggedin) {
        res.status(200);
        req.session.loggedin = false;
        req.session.username = undefined;
        res.end()
    } else {
        res.status(401);
        res.end();
    }
}

// Start server
app.listen(process.env.PORT || 3000);
//console.log("Listening on port 3000");
