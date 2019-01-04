const _ = require('lodash');
const {ObjectID} = require('mongodb');
const express = require('express');
const bodyParser = require('body-parser');

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');
var {authenticate} = require('./middleware/authenticate');

var app = express();
const port = process.env.PORT || 3000; // this variable will be set if we are on heroku

app.use(bodyParser.json());

//-------------------- Todos ------------------------//
app.post('/todos', (req, res) => {
   var todo = new Todo({
       text: req.body.text // this comes from postman(user) as json and parsed to object by body-parser
   });
    todo.save().then((doc) => {
        res.send(doc)
    },(err) => {
      res.status(400).send(err); // 400 - bad request
    })
});

app.get('/todos', (req, res) => {
    // Todo.find() will fetch all the todos from database
   Todo.find().then((todos) => {
       // we can send only todos which is array, but if we put it in an object ({todos}),
       // we can add other things to that object like status code, etc.
       res.send({todos}) // short from {todos: todos}
   },(err) => {
       res.status(400).send(err);
   })
});

// we can pass value in the url and get it by ":" sign, which creates a variable with the name which is after the ":"
app.get('/todos/:id', (req, res) => {
    // params is an object with key - the name(s) of the variable(s) in the url (id) and value(s) - the passed value(s)
    var id = req.params.id;
    if (!ObjectID.isValid(id)){
        return res.status(404).send()
    }
    Todo.findById(id).then((doc) => {
        if (doc){
            res.send(doc)
        } else {
            res.status(404).send()
        }
    }).catch((err) => {
        res.status(404).send()
    })
});

app.delete('/todos/:id', (req, res) => {
    var id = req.params.id;
    if (!ObjectID.isValid(id)){
        return res.status(404).send()
    }
    Todo.findByIdAndRemove(id).then((doc) => {
        if(!doc){
            return res.status(404).send()
        }
        res.send(doc)
    }).catch((err) => {
        res.status(404).send()
    })
});
// update
app.patch('/todos/:id', (req, res) => {
    var id = req.params.id;
    // pick() method allows us to choose which ones of the properties we want to get from the original object(req.body) and
    // store them in the new variable (body), because we don't want the user to update all the properties like the id for example
    var body = _.pick(req.body, ['text', 'completed'])
    if (!ObjectID.isValid(id)){
        return res.status(404).send()
    }
    // if completed is boolean and it's true
    if (_.isBoolean(body.completed) && body.completed){
        body.completedAt = new Date().getTime();
    } else {
        body.completed = false;
        body.completedAt = null;
    }
    // $set updates the properties of the record with the new properties of the body object. With "new: true" we want the
    // updated document to be returned
    Todo.findByIdAndUpdate(id, {$set: body}, {new: true}).then((doc) => {
        if(!doc){
            return res.status(404).send()
        }
        res.send(doc)
    }).catch((err) => {
        res.status(404).send()
    })
});

//-------------------- Users ------------------------//
app.post('/users', (req, res) => {
   var body = _.pick(req.body, ['email', 'password']);
   var user = new User(body); // we pass the picked object to the new user

    user.save().then(() => {
        return user.generateAuthToken();
    }).then((token) => {
        res.header('x-auth', token).send(user); // "x-auth" is used if we want to send a custom header, like from jwt
    }).catch((e) => {
        res.status(400).send(e);
    })
});

//---- private routes (with authentication) ----//
// we use a middleware (authenticate) for authentication before we send the user data
app.get('/users/me', authenticate, (req, res) => {
    res.send(req.user);
});

// in package json we need to set the start script to point to server.js file
app.listen(port, () => {
    console.log(`Started on port ${port}`);
});