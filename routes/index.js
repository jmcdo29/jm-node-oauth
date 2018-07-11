const User = require('../db/models/user_schema');
module.exports = function(app) {
  
  app.use('/local', require('./local'));
  app.use('/facebook', require('./facebook'));
  app.use('/google', require('./google'));

  app
    .get('/', (req, res) => {
      res.render('index.ejs', {error: req.flash('errorMsg')});
    })
    .get('/login', (req, res) => {
      res.render('login.ej', {message: req.flash('loginMessage')});
    })
    .get('/signup', (req, res) => {
      res.render('signup.ejs', {message: req.flash('signupMessage')});
    })
    .get('/profile', isLoggedIn, (req, res) => {
      User.query()
        .where({id: req.session.userId})
        .first()
        .then(user => {
          res.render('profile.ejs', {user: user})
        })
        .catch(err => {
          res.render('index.ejs', {error: err});
        });
    })
    .get('/logout', (req, res) => {
      req.session.destroy(err => {
        res.redirect('/');
      });
    });
};

function isLoggedIn(req, res, next) {
  if(req.session.userId){
    return next();
  }else {
    req.flash('errorMsg', 'Please log in to view your profile.');
    res.redirect('/');
  }
};
