const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/TodoApp', {useNewUrlParser: true});

// the first argument in model function is singular (Todo), but mongoose will create a plural 'todos' collection in database
var Todo = mongoose.model('Todo', {
   text: {
       type: String
   },
    completed: {
       type: Boolean
    },
    completedAt: {
       type: Number
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

var anotherTodo = new Todo({
    text: 'Feed the cat',
    completed: true,
    completedAt: 123
});
anotherTodo.save().then((doc) => {
    console.log('Saved todo', doc);
}, (err) => {
    console.log('Unable to save todo');
});