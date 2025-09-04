const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
  let checkUsername = users.filter(user => user.username === username);
  if (checkUsername.length === 0) {
    return true;
  }
  else {
    return false;
  }
}

const authenticatedUser = (username, password)=>{ //returns boolean
  //write code to check if username and password match the one we have in records.
  // Filter the users array for any user with the same username and password
  let validusers = users.filter((user) => {
    return (user.username === username && user.password === password);
  });
  // Return true if any valid user is found, otherwise false
  if (validusers.length > 0) {
    return true;
  } else {
    return false;
  }

}

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
    const username = req.body.username;
    const password = req.body.password;
    // Check if username or password is missing
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in!" });
    }
    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });
        // Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const username = req.session.authorization.username;
    const isbn = req.params.isbn;
    const review = req.query.review;
    if (books[isbn]) {
        books[isbn].reviews[username] = review;
        res.status(200).send(`Review for ISBN: ${isbn} is Successfully updated. \n ${JSON.stringify(books[isbn])}`)
        }
    else {
        res.status(404).send("Book not found");
    }
  });

// Delete a Book Reviiew
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const username = req.session.authorization.username;
    const isbn = req.params.isbn;
    const userReview = books[isbn].reviews;
    if (username in books[isbn].reviews){
        delete books[isbn].reviews[username];
        res.status(200).send(`Review for ISBN: ${isbn} is successfully deleted. \n ${JSON.stringify(books[isbn])}`)
    }
    else {
        res.status(404).send(`No review found for user ${username} on ISBN: ${isbn}`);
    }
});
   
  

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
