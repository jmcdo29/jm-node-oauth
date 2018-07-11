const router = require('express').Router();
const googleConf = require('../config/google_config');
const rp = require('request-promise');
const googleLogin = require('../passport/custom_login').google;

router
  .get('/auth', (req, res) => {
    res.redirect(`${googleConf.authURL}client_id=${googleConf.clientID}&redirect_uri=${googleConf.callbackURL}&scope=${googleConf.scope}&state=${googleConf.state}&response_type=code&prompt=consent`);
  })
  .get('/auth/callback', (req, res) => {
    return new Promise((resolve, reject)=> {
      if(req.query.error){
        reject(req.query.error);
      }
      resolve(rp.post(`${googleConf.tokenURL}code=${req.query.code}&client_id=${googleConf.clientID}&client_secret=${googleConf.clientSecret}&redirect_uri=${googleConf.callbackURL}&grant_type=authorization_code`));
    })
    .then( response => {
      const aToken = JSON.parse(response).access_token;
      const rToken = JSON.parse(response).refresh_token;
      const options = {
        uri: 'https://www.googleapis.com/oauth2/v2/userinfo',
        headers: {
          'Authorization': `Bearer ${aToken}`
        }
      }
      return Promise.all([Promise.resolve(aToken), Promise.resolve(rToken), rp.get(options)]);
    })
    .then( result => {
      googleLogin(req, res, result[0], result[1], JSON.parse(result[2]));
    })
    .catch(err => {
      //console.error(err);
      req.flash('errorMsg', JSON.stringify(err));
      res.redirect('/');
    })
    
  })
  .get('/connect', (req, res, next) => {
    res.redirect('/google/auth');
  })

module.exports = router;