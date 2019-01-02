const express = require('express');
const fs = require('fs');
const hbs = require('hbs'); // used view engine - handlebars

// the port is got from the environment variable set by heroku servers
const port = process.env.PORT || 3000;
var app = express();

// partials are smaller pieces of html (like header and footer), which are used in several places
hbs.registerPartials(__dirname + '/views/partials');

// with set() we can configure express
app.set('view engine', 'hbs');

// with middleware we can add some functionality to express
// next() is called when the work in the middleware is done. if next() is not called the following routes handlers will never be executed
app.use((req, res, next) => {
    // log each visit of url to a log file
    var now = (new Date).toString();
    var log  = `${now} ${req.method} ${req.url}`;
    fs.appendFile('server.log', log + '\n', (err) => {
        if(err){
            console.log('Unable to append to server.log.');
        }
    });
    next();
});

// // if something goes wrong we don't call next
// app.use((req, res, next) => {
//     res.render('maintenance.hbs')
// });

// everything in public folder can be seen by everyone.
// for all these files you don't need to provide a custom route
// static is a build-in middleware in express and it shows the absolute path to the public/static files
// you can access all these files directly form the browser, without a custom route
app.use(express.static(__dirname + '/public'));

// register helper - if we need custom function which result to be rendered in handlebars/html
hbs.registerHelper('getCurrentYear', () => {
   return new Date().getFullYear()
});
// we can also pass arguments to the helper function
hbs.registerHelper('upperCase', (text) => {
    return text.toUpperCase()
});

app.get('/', (req, res) => {
   // res.send('Hello Express!');
   // res.send('<h1>Hello Express!</h1>');
   // res.send({   // if we send an object to client, express automatically converts it to json string
   //     name: 'Mom',
   //     age: 38
   // });
    res.render('home.hbs', {   // render() renders the template for the currently set view engine
        pageTitle: 'Home Page',
        welcomeMessage: 'Hello, this is my website'
    });
});
app.get('/about', (req, res) => {
    // res.send('About Page');
    res.render('about.hbs', {
        pageTitle: 'This is coming from handlebars template'
    });
});
app.get('/projects', (req, res) => {
    res.render('projects.hbs', {
        pageTitle: 'Projects'
    });
});
app.listen(port, () => {
    // in package.json we create new kye-value pair in scripts object with key 'start'.
    // That's because heroku can't start the app with command 'node server.js', it will search for 'start' instead
    console.log(`Server is up on port ${port}`);
});