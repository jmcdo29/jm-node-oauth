const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../db/models/user_schema');
const bcrypt = require('bcryptjs');
const facebookConfig = require('../config/facebook_config.js');

module.exports = function(passport) {

  passport.use('local-signup', new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true
    },
    (req, email, password, done) => {
      console.log(`querying for ${email}.`);
      User.query().select('email')
        .where({ email: email})
        .limit(1)
        .then(user => {
          console.log(`${JSON.stringify(user)} found after query.`);
          return new Promise((resolve, reject) => {
            if(user[0]){
              reject('Email is already taken. Please use a differnt email, or sign in.');
            } else {
              console.log('hashing password.');
              resolve(bcrypt.hash(password, 12));
            }
          });
        })
        .then(hashPass => {
          console.log('inserting new user');
          return User.query()
            .insert({email, password: hashPass})
            .select('id')
        })
        .then(newUser => {
          console.log('returning new user via done');
          done(null, newUser);
        })
        .catch(err => {
          console.error(err);
          done(null, null, req.flash('signupMessage', err.message ? err.message : err));
        });
    })
  ),

  passport.use('local-login', new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true
    },
    (req, email, password, done) => {
      User.query()
      .select('password', 'id')
      .where({email})
      .limit(1)
      .then(user => {
        return new Promise((resolve, reject) => {
          if(!user[0]){
            reject('No user found. Please check the email, or sign up.');
          } else {
            bcrypt.compare(password, user[0].password)
              .then(result => {
                if(result){
                  resolve(user[0]);
                } else {
                  reject('Email or password is incorrect.');
                }
              })
          }
        })
      })
      .then(user => {
        done(null, user);
      })
      .catch(err => {
        console.error(err);
        done(null, null, req.flash('loginMessage', err.mesage ? err.message : err));
      })
    })
  ),

  passport.use(new FacebookStrategy(
    {
      clientID: facebookConfig.clientID,
      clientSecret: facebookConfig.clientSecret,
      callbackURL: facebookConfig.callbackURL
    },
    (token, refreshToken, profile, done) => {
      console.log(profile);
      User.query()
        .where({'facebook_id': profile.id})
        .limit(1)
        .then(users => {
          const user = users[0];
          if(user) {
            console.log('found user, resolving with user');
            Promise.resolve(user);
          } else {
            console.log('didn\'t find user. making one.');
            return User.query()
              .insertAndFetch({
                facebook_id: profile.id,
                facebook_token: token,
                facebook_name: profile.name.givenName + ' ' + profile.name.familyName,
                facebook_email: profile.emails ? profile.emails[0].value : null
              });
          }
        })
        .then(user => {
          console.log('Finishing Facebook Log in.');
          done(null, user);
        })
        .catch(err => {
          console.error('ERROR:');
          console.error(err);
          done(err, null, err.message ? err.message : err);
        });
    }
  )),

  passport.serializeUser((user, done) => {
    console.log('serializing');
    console.log(user);
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    console.log('deserializing');
    User.query()
      .findById(id)
      .then(user => {
        done(null, user);
      })
      .catch(err => {
        console.log('There was an error');
        console.error(err);
        done(err, null);
      });
  });
}