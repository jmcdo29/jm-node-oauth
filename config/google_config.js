module.exports = googleAuth = {
  'clientID' : process.env.GOOGLE_APP_ID,
  'clientSecret': process.env.GOOGLE_APP_SECRET,
  'callbackURL' : 'https%3A%2F%2Fjm-node-auth.herokuapp.com%2Fgoogle%2Fauth%2Fcallback',
  'scope': 'https%3A%2F%2fwww.googleapis.com%2Fauth%2Fuserinfo.profile+https%3A%2F%2fwww.googleapis.com%2Fauth%2Fuserinfo.email+https%3A%2F%2fwww.googleapis.com%2Fauth%2Fplus.me',
  'state': process.env.GOOGLE_STATE,
  'authURL': 'https://accounts.google.com/o/oauth2/v2/auth?',
  'tokenURL': 'https://www.googleapis.com/oauth2/v4/token?'
}