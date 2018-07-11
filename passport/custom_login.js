const User = require('../db/models/user_schema');
const bcrypt = require('bcryptjs');

module.exports.register = (req, res, next) => {
  return new Promise((resolve, reject) => {
    const email = req.body.email;
    if(!email){
      reject('Email is required');
    }
    const errors = validatePassword(req.body.password, req.body.confPassword);
    if(errors.length !== 0) {
      let errorMsg = '';
      errors.forEach(error => {
        errorMsg += error +'.\n';
      });
      reject(errorMsg);
    }
    if(!req.session.userId){
      resolve(User.query()
        .where({email})
        .select('password', 'email', 'id')
        .first())
    } else {
      resolve(User.query()
      .findById(req.session.userId)
      .first());
    }
  })
  .then(user => {
    if(user && !req.session.userId) {
      throw new Error('Email already in use. Please Either sign in, or use a different email address.');
    }
    return Promise.all([bcrypt.hash(req.body.password, 12), Promise.resolve(user)]);
  })
  .then(result => {
    console.log(result);
    console.log('Password is hashed');
    if(!result[1]){
      return User.query()
        .insertAndFetch({
          email: req.body.email,
          password: result[0]
        })
        .select('id')
    } else {
      return User.query()
        .updateAndFetchById(req.session.userId, {
          email: req.body.email,
          password: result[0]
        })
        .select('id')
    }
  })
  .then(user => {
    req.session.userId = user.id;
    req.session.save(err => {
      if(err){
        throw err;
      }
      res.redirect('/profile');
    });
  })
  .catch(err => {
    console.error(err);
    req.flash('signupMessage', err);
    res.redirect('/local/signup');
  })
  
}

module.exports.login = (req, res, next) => {
  return new Promise((resolve, reject) => {
    if(!req.body.email){
      reject('Email is required to login');
    }
    if(!req.body.password){
      reject('Password is required to login');
    }
    resolve(User.query()
      .select('id', 'password')
      .where({email: req.body.email})
      .first())
  })
  .then(user => {
    if(!user){
      throw new Error('Username or password is incorrect')
    }
    return Promise.all([Promise.resolve(user), bcrypt.compare(req.body.password, user.password)])
  })
  .then(result => {
    if(!result[1]){
      throw new Error('Username or password is incorrect')
    }
    return Promise.resolve(result[0]);
  })
  .then(user => {
    req.session.userId = user.id;
    req.session.save(err => {
      if(err){
        throw err;
      }
      res.redirect('/profile');
    });
  })
  .catch(err => {
    console.error('ERROR:');
    console.error(err);
    req.flash('loginMessage', err);
    res.redirect('/local/login');
  })
}

module.exports.facebook = (req, res, token, fbUser) => {
  if(!req.session.userId){
    User.query()
      .select('id')
      .where({facebook_id: fbUser.id})
      .first()
      .then(user => {
        if(!user) {
          return User.query().insertAndFetch({
            facebook_id: fbUser.id,
            facebook_name: fbUser.name,
            facebook_email: fbUser.email,
            facebook_token: token
          }).select('id')
        } else {
          return Promise.resolve(user);
        }
      })
      .then(user => {
        req.session.userId = user.id;
          req.session.save(err => {
          if(err){
            throw err;
          }
          res.redirect('/profile');
        })
      })
      .catch(err => {
        console.log(err);
        res.redirect('/');
      });
  } else {
    return User.query()
      .updateAndFetchById(req.session.userId, {
        facebook_id: fbUser.id,
        facebook_email: fbUser.email,
        facebook_name: fbUser.name,
        facebook_token: fbUser.token
      })
      .then(user => {
        req.session.userId = user.id;
          req.session.save(err => {
          if(err){
            throw err;
          }
          res.redirect('/profile');
        })
      })
      .catch(err => {
        console.log(err);
        res.redirect('/');
      });
  }
}

module.exports.google = (req, res, aToken, rToken, gUser) => {
  if(!req.session.userId) {
    User.query()
      .select('id')
      .where({google_id: gUser.id})
      .first()
      .then( user => {
        if(!user) {
          return User.query()
            .insertAndFetch({
              google_id: gUser.id,
              google_name: gUser.name,
              google_email: gUser.email,
              google_token: aToken,
              google_refresh: rToken
            })
            .select('id');
        } else {
          return Promise.resolve(user);
        }
      })
      .then(user => {
        req.session.userId = user.id;
          req.session.save(err => {
          if(err){
            throw err;
          }
          res.redirect('/profile');
        })
      })
      .catch(err => {
        console.log(err);
        res.redirect('/');
      });
  } else {
    return User.query()
      .updateAndFetchById(req.session.userId, {
        google_id: gUser.id,
        google_name: gUser.name,
        google_email: gUser.email,
        google_token: aToken,
        google_refresh: rToken
      })
      .then(user => {
        req.session.userId = user.id;
          req.session.save(err => {
          if(err){
            throw err;
          }
          res.redirect('/profile');
        })
      })
      .catch(err => {
        console.log(err);
        res.redirect('/');
      });
  }
  
}

function validatePassword(password, confPassword){
  const errors = [];
  if(!password){
    errors.push('Password is required');
  }
  if(!confPassword){
    errors.push('Confirmation Password is required');
  }
  return errors;
}