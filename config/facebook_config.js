module.exports = facebookAuth = {
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: 'https://jm-node-auth.herokuapp.com/facebook/auth/callback',
  profileURL: 'https://graph.facebook.com/v3.0/me?fields=first_name,last_name,email',
  profileFields: ['id', 'email', 'name'],
  state: process.env.FACEBOOK_STATE
};
