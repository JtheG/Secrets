//jshint esversion:6


require('dotenv').config();
console.log(process.env.SECRET);


const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true, useUnifiedTopology: true});

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});




// plugging in encrypt to userSchema.

userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"]});

// Now when .save() is called the password key value will be encrypted.
// When .find() is called the password key value will be decrypted
// secret: specifies the string to use for encryption.
// encrypted fields specifies the field to encrypt, omitting this will result in all fields being encrypted apart from _id and __v

const User = new mongoose.model("User", userSchema);

// -------------------------LEVEL 0 SECURITY-----------------------
// What I want available with no auth, if server gets request at THESE
// routes, render THIS page.
app.get("/", function(req, res){
  res.render("home");
});

app.get("/login", function(req, res){
  res.render("login");
});

app.get("/register", function(req, res){
  res.render("register");
});

// -------------------------LEVEL 1 SECURITY-----------------------
// creating and storing a username and password
// I am using app.post to create a new user and save it to the database
// If there was no problem adding user to database, I allow them access to the secrets page.


app.post("/register", function(req, res){
  const newUser = new User({
    email: req.body.username,
    password: req.body.password
  });

  newUser.save(function(err){ // because mongoose-encryption is plugged into userSchema, password will be encrypted here
    if(err){
      console.log(err);
    } else {
      res.render("secrets");
    }
  });
});

app.post("/login", function(req,res){
  const username = req.body.username;
  const password = req.body.password;
  User.findOne({email: username}, function(err, foundUser){ // password will be decrypted here due to mongoose-encryption
    if(err){
      console.log(err);
    } else {
      if(foundUser){
        if(foundUser.password === password){
          res.render("secrets");
        }
      }
    }
  });
});











app.listen(3000, function() {
    console.log("Server started on port 3000.");
});
