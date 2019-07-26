const mongoose = require('mongoose')
// mongoose.connect('mongodb+srv://faizan:faizan@mydb-ba03q.mongodb.net/test?retryWrites=true&w=majority',{useNewUrlParser: true});
const User = require('./models/User');
const express =require('express');
const session = require('express-session')
const app=express();
app.use(express.json());

const bodyParser = require('body-parser');
const morgan = require('morgan');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const passportJwt = require('passport-jwt');

app.use(passport.initialize());

// Register new users
app.post('/register',(req, res)=> {
  if(!req.body.email || !req.body.password) {
    res.json({ success: false, message: 'Please enter email and password.' });
  } else {
    var user = new User({
      email: req.body.email,
      password: req.body.password
    });

    // Attempt to save the user
    user.save((err)=> {
      if (err) {
        return res.json({ success: false, message: 'That email address already exists.'});
      }
      res.json({ success: true, message: 'Successfully created new user.' });
    });
  }
});


// Authenticate the user and get a JSON Web Token to include in the header of future requests.
app.post('/authenticate',(req, res)=> {
  User.findOne({email: req.body.email},(err, user)=> {
    if (err) throw err;
    if (!user) {
      res.send({ success: false, message: 'Authentication failed. User not found.' });
    } else {
      // Check if password matches
      user.comparePassword(req.body.password,(err, isMatch)=> {
        if (isMatch || !err) {
          // Create token if the password matched and no error was thrown
          var token = jwt.sign({user}, 'secret', {
            expiresIn: 30 // in seconds
          });
          req.headers["authorization"]='Bearer '+token;
          console.log(req.headers["authorization"]);
          res.json({
           success: true, token: 'JWT ' + token });
        } else {
          res.send({ success: false, message: 'Authentication failed. Passwords did not match.' });
        }
      });
    }
  });
});

// Bring in defined Passport Strategy
require('./config/passport');

// Protect dashboard route with JWT
app.get('/dashboard', passport.authenticate('jwt', { session: false }), (req, res)=> {
  res.send('Worked! User id is: ' + req.user._id);
});

app.get('/logout',(req,res)=>{
	res.redirect('/dashboard');
});

const port = process.env.PORT||3000
app.listen(port,()=>{
	console.log(`Listening on Port: ${port}`);
});
