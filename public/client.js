function register() {
	let username = document.getElementById("username-input").value;
	let password = document.getElementById("password-input").value;

	if (username.length == 0){
        alert("Please enter a username.");
        return;
    }

	if (password.length == 0){
        alert("Please enter a password.");
        return;
    }

	const reqBody = {
		username,
		password
	}

	let req = new XMLHttpRequest();

	req.onreadystatechange = function() {
		if(this.readyState == 4 && this.status == 201){
			alert("Successfully created " + username + "!");
			window.location = "/profile";
		} else if (this.readyState == 4 && this.status == 401) {
			alert("That user is taken. Please use a different username.");
		}
	};

	req.open("POST", "/register", true);
    req.setRequestHeader("Content-Type", "application/json")
	req.send(JSON.stringify(reqBody));
}

function login() {
	let username = document.getElementById("username-input").value;
	let password = document.getElementById("password-input").value;

	if (username.length == 0){
        alert("Please enter your username.");
        return;
    }

	if (password.length == 0){
        alert("Please enter your password.");
        return;
    }

	const reqBody = {
		username,
		password
	}

	let req = new XMLHttpRequest();

	req.onreadystatechange = function() {
		if(this.readyState == 4 && this.status == 200){
			alert("Logged in as " + username + "!");
			window.location = "/";
		} else if (this.readyState == 4 && this.status == 401) {
			alert("User not found.");
		} else if (this.readyState == 4 && this.status == 405) {
			alert("Please enter the correct password for " + username + ".");
		}
	};

	req.open("POST", "/login", true);
    req.setRequestHeader("Content-Type", "application/json")
	req.send(JSON.stringify(reqBody));
}

function logout() {
	const reqBody = {}

	let req = new XMLHttpRequest();

	req.onreadystatechange = function() {
		if(this.readyState == 4 && this.status == 200){
			alert("Logged out.");
			window.location = "/";
		} else if (this.readyState == 4 && this.status == 401) {
			alert("You cannot log out because you aren't logged in.");
		}
	};

	req.open("POST", "/logout", true);
    req.setRequestHeader("Content-Type", "application/json")
	req.send(JSON.stringify(reqBody));
}

function savePrivacy() {
	let priv;
	
	if (document.getElementById("privacyOn").checked) {
		priv = true;
	} else if(document.getElementById("privacyOff").checked) {
		priv = false ;
	}

	const reqBody = {
		priv
	}

	let req = new XMLHttpRequest();

	req.onreadystatechange = function() {
		if(this.readyState == 4 && this.status == 200){
			alert("Saved privacy settings!");
		} else if (this.readyState == 4 && this.status == 401) {
			alert("An error occurred");
		}
	};

	req.open("PUT", "/users", true);
    req.setRequestHeader("Content-Type", "application/json")
	req.send(JSON.stringify(reqBody));
}