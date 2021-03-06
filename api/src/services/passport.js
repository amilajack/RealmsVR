const { unauthorized } = require('boom');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const config = require('../config');
const { User } = require('../models');

const authenticate = (req, state, next) => {
  let token;
  if (req.headers.authorization) {
    const [type, value] = req.headers.authorization.split(' ');
    if (type === 'Bearer') {
      token = value;
    }
  } else if (req.headers['sec-websocket-protocol']) {
    token = req.headers['sec-websocket-protocol'];
  } else if (req.query.auth) {
    token = req.query.auth;
  }
  if (!token) {
    next();
    return;
  }
  User
    .fromToken(token)
    .then((user) => {
      if (user) {
        state.user = user;
      }
      next();
    })
    .catch(next);
};

module.exports.authenticate = (req, res, next) => (
  authenticate(req, req, next)
);

module.exports.requireAuth = (req, res, next) => (
  authenticate(req, req, (err) => {
    if (err || !req.user) {
      next(unauthorized(err));
      return;
    }
    next();
  })
);

module.exports.setup = () => {
  // Setup GoogleStrategy
  passport.use(new GoogleStrategy(config.googleAuth, (accessToken, refreshToken, profile, done) => {
    const {
      displayName: name,
      emails,
      photos,
    } = profile;
    const [email] = emails
      .map(({ value }) => (value));
    const [photo] = photos
      .map(({ value }) => (value));
    User
      .findOrCreate(
        { email },
        {
          email,
          name,
          photo,
        }
      )
      .then(user => done(null, user))
      .catch(done);
  }));
};
