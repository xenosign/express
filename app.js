// @ts-check
const express = require('express');

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT;

// 바디파서
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// 쿠키파서
app.use(cookieParser('tetz'));
// 세션
app.use(
  session({
    secret: 'tetz',
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60,
    },
  })
);
// 패스포트
app.use(passport.initialize());
app.use(passport.session());

const router = require('./routes/index');
const boardRouter = require('./routes/board');
const registerRouter = require('./routes/register');
const loginRouter = require('./routes/login');
const passportRouter = require('./routes/passport');
const chatRouter = require('./routes/chat');

passportRouter();

app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

app.use('/', router);
app.use('/board', boardRouter);
app.use('/register', registerRouter.router);
app.use('/login', loginRouter.router);
app.use('/chat', chatRouter);

app.use((err, req, res, next) => {
  console.log(err.stack);
  res.status(err.statusCode || 500);
  res.end(err.message);
});

app.listen(PORT, () => {
  console.log(`The express server is running at ${PORT}`);
});
