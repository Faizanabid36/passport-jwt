const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

const User =require('../models/User');


const opts = {

  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: 'secret'
};
const strategy = new JwtStrategy(opts, (payload, next) => {
  User.findOne({ id: payload.id }).exec().then(res => {
    next(null, res);
  });
});

passport.use(strategy);

module.exports = passport;