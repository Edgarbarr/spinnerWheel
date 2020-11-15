const mongoose = require('mongoose');
const express = require('express');
const xss = require('xss');
const helmet = require('helmet');
const session = require('express-session');
const { auth } = require('express-openid-connect');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { User } = require('../database/schema.js');
const { db } = require('../database/index.js');
const { validateWheelValue } = require('./validate.js');
const { store } = require('./session.js');
const { createUser, sessionChecker } = require('./util.js');

const app = express();
const port = 80;

app.set('trust proxy', 1);
app.use('../public/', express.static());
app.use(cookieParser);
app.use(bodyParser.JSON());
app.use(helmet());
app.use(session({
    key: 'user_sid',
    secret: 'supersecret',
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7 * 4, // 4 weeks
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true
    },
    store: store,
    resave: false,
    saveUninitialized: true
  }));
  app.use(
    auth({
      required: req => req.originalUrl !== "/"
    })
  );

app.use((req, res, next) => {
    if (req.cookies.user_sid && !req.session.user) {
        res.clearCookie('user_sid');        
    }
    next();
});

/********************************************************************************************
 * HOME PAGE
 * ******************************************************************************************/
app.get('/', sessionChecker, (req, res) => {
    res.redirect('/login');
});

/********************************************************************************************
 * REGISTER A NEW USER
 * ******************************************************************************************/
app.route('/register')
    .get(sessionChecker, (req, res) => {
        res.sendFile(__dirname + '/public/register.html');
    })
    .post((req, res) => {
       createUser(req, res);
    })
        .then(user => {
            req.session.user = user.dataValues;
            res.redirect('/dashboard');
        })
        .catch(error => {
            res.redirect('/register');
        });


/********************************************************************************************
 * LOGIN
 * ******************************************************************************************/
app.route('/login')
    .post((req, res) => {
        const username = xss(req.body.username);
        const password = xss(req.body.password);
            User.findOne({username: username}, function(err, user) {
                if (!user.validPassword(password)) {
      
                } else {
                    // password matched. proceed forward
                }
  });

  /******************************************************************************************
   * MAKE NEW LIST/UPDATE
   ******************************************************************************************/
  app.post('/update', function(req, res) {
    const ListId = xss(req.body.listId);
    const list = req.body.list;
    for(let value of list){
        if(validateWheelValue(value) !== undefined){
            res.status(500).send(validateWheelValue(value));
            return;
        }
    }


  });


  app.listen(port, () => {
      console.log("Server listening on port: ", port);
  })
});