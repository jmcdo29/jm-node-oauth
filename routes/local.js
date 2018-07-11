const router = require('express').Router();
const customRegister = require('../passport/custom_login').register;
const customLogin = require('../passport/custom_login').login;

router
  .get('/login', (req, res) => {
    res.render('login.ejs', {message: req.flash('loginMessage')});
  })
  .post('/login', customLogin)
  .get('/signup', (req, res) => {
    res.render('signup.ejs', {message: req.flash('signupMessage')});
  })
  .post('/signup', customRegister)
  .get('/connect', (req, res, next)=> {
    res.redirect('/local/signup');
  })

  module.exports = router;