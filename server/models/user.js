require('../config/config');

const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

var UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        unique: true,
        validate: {
            // the validator property takes a function and if it returns true the email is valid,
            // otherwise we set an error message. isEmail function automatically takes the email passed by user
            validator: validator.isEmail,
            message: '{VALUE} is not a valid email'
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]
});

// we override the mongoose method called toJson(), because we need only certain things to be returned (like id and email)
// when we finally return data to the user
UserSchema.methods.toJSON = function () {
    var user = this;
    var userObject = user.toObject(); // converts mongoose object to regular object
    return _.pick(userObject, ['_id', 'email'])
};

// we can attach methods to the UserSchema's methods object. This is where we attach instance methods
UserSchema.methods.generateAuthToken = function () { // we use regular function, because we need to use "this"
    // "this" will be the value(user) of new instance of the User model
    var user = this;
    var access = 'auth';
    // we create a token from object with properties - string value of the user id and 'auth' and the secret 'abc123'
    var token = jwt.sign({_id: user._id.toHexString(), access: access}, 'abc123').toString();

    user.tokens.push({access: access, token: token});
    // it can be done also like this(there are some problems with the mongodb versions with the push method):
    // user.tokens = user.tokens.concat([{access, token}]);

    // in order to be able to chain another then() we use the first return
    return user.save().then(() => {
        return token
    })
};

UserSchema.methods.removeToken = function (token) {
  var user = this;

  return user.update({ // we use update() since we already have the user (instead of using find() and then save())
      $pull: { // $pull is mongoose method which removes selected element from array (the tokens object in this case)
          tokens: {
              token: token
          }
      }
  })
};

// on UserSchema's statics object we can also attach methods, but they are model methods (no instances)
UserSchema.statics.findByToken = function (token) {
  var User = this; // this points to the model User, not to an instance of User
  var decoded;

  try {
      decoded = jwt.verify(token, 'abc123'); // trying to verify the token which was sent in user's header
  } catch (e){
      // if the authentication is not correct we return a promise where reject() is called, so when the function
      // findByToken is called we can catch this rejection in the catch() block
      return new Promise((resole, reject) => {
          reject();
      })
      // this could be done simpler - return Promise.reject()
  }
  // we use return in order to be able to chain then() after calling this function (findByToken)
  return User.findOne({
      _id: decoded._id,
      'tokens.token': token, // this way we can get nested properties of a document
      'tokens.access': 'auth'
  })
};

// find by credentials
UserSchema.statics.findByCredentials = function (email, password) {
    var User = this;
    // first we need to verify that the user exist with the passed email
    return User.findOne({email}).then((user) => {
        if(!user){
            return Promise.reject()
        }
        // because bcrypt doesn't return promise, we make new Promise
        return new Promise((resolve, reject) => {
            // after email check above, now we compare the passwords. First argument - plain password, second - hashed password
            bcrypt.compare(password, user.password, (err, res) => {
                if(res){ // if result from the comparison is true
                    resolve(user)
                } else {
                    reject()
                }
            })
        })
    })
};

// we use mongoose middleware to hash the password before we save the user in database
// the first argument is the event(in this case 'save'), before which we want to do something
UserSchema.pre('save', function (next) {
    var user = this;
    // isModified method checks if only a certain property is modified. We don't want to hash the password again if we
    // modify the email for example
    if(user.isModified('password')){
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, hash) => {
                user.password = hash;
                next();
            })
        });
    } else {
        next();
    }
});

var User = mongoose.model('User', UserSchema);

module.exports = {User};