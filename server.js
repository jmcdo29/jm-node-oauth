require('dotenv').config();
const express = require('express');
const flash = require('express-flash');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const logger = require('morgan');

const app = express();

app.use(helmet());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

app.use(require('./utils/sessionConf'));
app.use(flash());

require('./routes/index')(app);

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}!`);
})