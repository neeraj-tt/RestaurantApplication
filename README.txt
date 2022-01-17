Author: Neeraj Thottupurath
Purpose: To provide a system where users can login and place
	 orders as well as view other users' orders
Design decisions:
	- added a collection called "orders" to database to
	  store user orders
	- decided to let users login on a separate page as
	  opposed to on the home page

To install dependencies (pug, express, mongoose, etc.):
	npm install

To run server:
	node database-initializer.js
	node server.js

Server will run on localhost:3000