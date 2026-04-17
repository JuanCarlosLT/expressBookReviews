const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    let usersSameName = users.filter((user) => user.username === username);
    if (usersSameName.length > 0) {
        return true;
    } else {
        return false;
    }
}

const authenticatedUser = (username, password) => { //returns boolean
    //write code to check if username and password match the one we have in records.
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    return validusers.length > 0;
}

//only registered users can login
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    if (authenticatedUser(username, password)) {
        // Generar JWT
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });

        // Guardar el token y el nombre de usuario en la sesión
        req.session.authorization = {
            accessToken, username
        };
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid username or password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization?.username;
    const review = req.body.review;
    if (!review) {
        return res.status(400).json({ message: "The content of the review is required." });
    }
    // Verificamos si el libro existe en nuestra base de datos (booksdb.js)
    if (books[isbn]) {
        let book = books[isbn];

        // Si el usuario ya tiene una reseña para este ISBN, se sobreescribe.
        // Si no, se crea una nueva entrada bajo su nombre de usuario.
        book.reviews[username] = review;

        return res.status(200).json({
            message: `The review for the book with ISBN ${isbn} has been added/updated.`
        });
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization?.username;

    if (!username) {
        return res.status(401).json({ message: "Unauthenticated user" });
    }
    if (books[isbn]) {
        let book = books[isbn];
        
        // Verificamos si el usuario tiene una reseña para este libro
        if (book.reviews[username]) {
            // Eliminamos solo la reseña que pertenece a este nombre de usuario
            delete book.reviews[username];
            return res.status(200).json({ 
                message: `The review by user ${username} for the book with ISBN ${isbn} has been removed.` 
            });
        } else {
            return res.status(404).json({ message: "No review from this user was found for the book listed." });
        }
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
