var {ObjectID} = require('mongodb');
var express = require('express');
var bodyParser = require('body-parser');

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');

var app = express();

app.use(bodyParser.json());
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

app.listen(3000, () => {
    console.log('Started on port 3000');
});