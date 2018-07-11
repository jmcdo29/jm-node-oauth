const router = require('express').Router();
const facebookConf = require('../config/facebook_config');
const rp = require('request-promise');
const facebookLogin = require('../passport/custom_login').facebook;

router
  .get('/auth', (req, res, next) => {
    res.redirect(`https://www.facebook.com/v3.0/dialog/oauth?client_id=${facebookConf.clientID}&redirect_uri=${facebookConf.callbackURL}&state={"{state:${facebookConf.state}}"}&scope=email`);
  })
  .get('/auth/callback', (req, res, next) => {
    return new Promise((resolve, reject) => {
      if(req.query.error){ 
        reject('That was a problem.');
      }
      resolve(rp.get(`https://graph.facebook.com/v3.0/oauth/access_token?client_id=${facebookConf.clientID}&redirect_uri=${facebookConf.callbackURL}&client_secret=${facebookConf.clientSecret}&code=${req.query.code}`));
    })
    .then(response => {
      console.log(JSON.parse(response));
      const token = JSON.parse(response).access_token;
      return Promise.all([Promise.resolve(token), rp.get(`https://graph.facebook.com/v3.0/me?fields=id,name,email&access_token=${token}`)])
    .then(result => {
      facebookLogin(req, res, result[0], JSON.parse(result[1]));
    })
    .catch(err => {
      req.flash('errorMsg', err);
      res.redirect('/');
    })
    });
  });


module.exports = router;