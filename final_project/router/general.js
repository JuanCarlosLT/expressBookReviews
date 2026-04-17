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
        return res.status(500).json({ message: "Error al obtener los libros" });
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
            reject("Libro no encontrado");
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
    const result = Object.values(books).filter((book) => book.author === author);
    return res.send(result);
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title;
    const result = Object.values(books).filter((book) => book.title === title);
    return res.send(result);
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    return res.send(books[isbn].reviews);
});

module.exports.general = public_users;
