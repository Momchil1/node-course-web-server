const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/TodoApp', {useNewUrlParser: true});

// the first argument in model function is singular (Todo), but mongoose will create a plural 'todos' collection in database
var Todo = mongoose.model('Todo', {
   text: {
       type: String,
       required: true, // set this field to br required
       minlength: 1, // set min length of the string
       trim: true // trims white spaces of string
   },
    completed: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Number,
        default: null
    }
});

var newTodo = new Todo({
    text: 'cook dinner'
});
newTodo.save().then((doc) => {
    console.log('Saved todo', doc);
}, (err) => {
    console.log('Unable to save todo');
});

var User = mongoose.model('User', {
   email: {
       type: String,
       required: true,
       trim: true,
       minlength: 1
   }
});

var user = new User({
    email: 'momo@abv.bg'
});
user.save().then((doc) => {
    console.log('Saved user', doc);
}, (err) => {
    console.log('Unable to save user');
});