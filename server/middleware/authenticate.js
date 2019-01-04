var {User} = require('../models/user');

var authenticate = (req, res, next) => {
    var token = req.header('x-auth'); // getting the token from the request header
    User.findByToken(token).then((user) => {
        if (!user){
            // we can use the same as in the catch() block, but if we use Promise.reject() it will automatically go in catch() block
            return Promise.reject();
        }
        // we modify the request object
        req.user = user;
        req.token = token;
        next();
    }).catch((e) => {
        res.status(401).send();
    })
};
module.exports = {authenticate};