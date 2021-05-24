const express = require("express");
const BodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");

const app = express();
const http = require("http").createServer(app);

app.set("view engine", "ejs");

app.use(BodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true, useUnifiedTopology: true});

const userSchema = {
    name : String,
    age : Number,
    username : String,
    password : String
};

const User = mongoose.model("User", userSchema);

// const titles = [];
// const contents = [];

const blogSchema = {
    title : String,
    content : String,
    userContent : userSchema
};

const Blog = mongoose.model("Blog", blogSchema);

app.get("/", function(req, res){
    const titles = [];
    const contents = [];
    const authors = [];
    const usernames = [];
    Blog.find({}, function(err, blogs){
        if(err){
            console.log(err);
        }
        else{
            console.log("Blogs database found!");
        }

        blogs.forEach(function(blog){
            titles.push(blog.title);
            contents.push(blog.content);
            authors.push(blog.userContent.name);
            usernames.push(blog.userContent.username);
            //console.log(blog.userContent.name);
        });
        res.render("home", {titles : titles, contents : contents, authors : authors, usernames : usernames});
    });
});

app.get("/About", function(req, res){
    res.render("about");
});

app.get("/Contact", function(req, res){
    res.render("contact");
});

app.get("/SignUp", function(req, res){
    res.render("signup");
});

app.get("/SignIn", function(req, res){
    res.render("signin");
});

let name = "";
let username = "";

app.post("/", function(req, res){
    let Title = req.body.Title;
    let Content = req.body.Content;
    // titles.push(Title);
    // contents.push(Content);
    User.find(function(err, users){
        if(err){
            console.log(err);
        }
        else{
            console.log("No error found!");
        }

        users.forEach(function(user){
            if(user.username === username){
                Blog.insertMany([{
                    title : Title,
                    content : Content,
                    userContent : user
                }],function(err){
                    if(err){
                        console.log(err);
                    }
                    else{
                        console.log("Succesfully the blog has been added!");
                    }
                });
            }
        });

    });

    res.send("Added!");
});

app.post("/Write", function(req, res){
    if(req.body.button === "SignUp"){
        User.find({}, function(err, users){
            if(err){
                console.log(err);
            }
            else{
                console.log("No error found!");
            }

            users.forEach(function(user){
                if(user.username === req.body.username){
                    res.send("This username has already been taken! Please use another username.")
                }
            });
        });

        User.insertMany([{
            name : req.body.name,
            age : req.body.age,
            username : req.body.username,
            password : req.body.password
        }],function(err){
            if(err){
                console.log(err);
            }
            else{
                console.log("Succesfully added!");
            }
            name = req.body.name;
            username = req.body.username;
            res.render("write", {name : name});
        });
    }
    else if(req.body.button === "SignIn"){
       User.find(function(err, users){
            if(err){
                console.log(err);
            }
            else{
                console.log("Succesfully found!");
            }
            
            let flag = 1;
            users.forEach(function(user){
                if(user.username === req.body.username && user.password === req.body.password){
                    name = user.name;
                    username = user.username;
                    flag = 0;
                }
            });
            if(flag === 0){
                res.render("write", {name : name});
            }
            else{
                res.send("Either username or password is incorrect, kindly verify!");
            }
       }); 
    }
    else{
        User.find(function(err, users){
            if(err){
                console.log(err);
            }
            else{
                console.log("Succesfully found!");
            }
            
            users.forEach(function(user){
                if(user.username === req.body.username){
                    name = user.name;
                    username = user.username;
                }
            });
            res.render("write", {name : name});
        });
    }
});

app.post("/Blog", function(req, res){
    let Title = req.body.BlogTitle;
    let Content = req.body.BlogContent;
    let Author = req.body.BlogAuthor;
    let UserName = req.body.BlogUsername;
    res.render("Blog", {Title : Title, Content : Content, Author : Author, UserName : UserName});
});

app.post("/YourBlogs", function(req, res){
    const blogTitles = [];
    const blogContents = [];
    Blog.find({}, function(err, blogs){
        if(err){
            console.log(err);
        }
        else{
            console.log("No error found!");
        }

        blogs.forEach(function(blog){
            if(blog.userContent.username === username){
                blogTitles.push(blog.title);
                blogContents.push(blog.content);
            }
        });
        res.render("userblogs", {Titles : blogTitles, Contents : blogContents, name : name});
    });
});

app.post("/UserBlog", function(req, res){
    let Title = req.body.BlogTitle;
    let Content = req.body.BlogContent;
    res.render("userblog", {Title : Title, Content : Content, name : name});
});

http.listen("4000", function(req, res){
    console.log("Server is running on port 4000.");
});