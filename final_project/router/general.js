const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
    if (username && password){
        if (!isValid(username)) {
            users.push({"username": username, "password": password});
            return res.status(200).json({message: "User successfully registered. Now you can login"});
        } else {
            return res.status(404).json({message: "User already exists!"});
        }
    }else{
        return res.status(404).json({message: "The user could not be registered. Please check your username and password."});
    }
});

// Get the book list available in the shop
public_users.get('/',async function (req, res) {
    try {
        const getBooks = () => {
            return new Promise((resolve, reject) => {
                resolve(books);
            });
        };

        const response = await getBooks();
        return res.status(200).send(JSON.stringify(response, null, 4));
    } catch (error) {
        return res.status(500).json({ message: "Error retrieving the books" });
    }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    const getBook = new Promise((resolve, reject) => {
        const book = books[isbn];
        if (book) {
            resolve(book);
        } else {
            reject("Book not found");
        }
    });
    getBook
        .then((book) => {
            return res.status(200).json(book);
        })
        .catch((err) => {
            return res.status(404).json({ message: err });
        });
});
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const author = req.params.author;
    const getBooksByAuthor = new Promise((resolve, reject) => {
        // Obtenemos los valores del objeto libros y filtramos
        const allBooks = Object.values(books);
        const filteredBooks = allBooks.filter(book => book.author === author);

        if (filteredBooks.length > 0) {
            resolve(filteredBooks);
        } else {
            reject("No books were found for the indicated author.");
        }
    });
    getBooksByAuthor
        .then((result) => {
            return res.status(200).json(result);
        })
        .catch((error) => {
            return res.status(404).json({ message: error });
        });
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title;
    const getBooksByTitle = new Promise((resolve, reject) => {
        const allBooks = Object.values(books);
        const filteredBooks = allBooks.filter(book => book.title === title);

        if (filteredBooks.length > 0) {
            resolve(filteredBooks);
        } else {
            reject("No books were found with that title");
        }
    });

    getBooksByTitle
        .then((result) => {
            return res.status(200).json(result);
        })
        .catch((error) => {
            return res.status(404).json({ message: error });
        });
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    // return res.send(books[isbn].reviews);
    return res.status(200).json(books[isbn]);
});

module.exports.general = public_users;
