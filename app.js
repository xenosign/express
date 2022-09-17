// @ts-check
const express = require('express');

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const mongoClient = require('./routes/mongo');

const app = express();
const PORT = 4000;

// 바디파서
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// 쿠키파서
app.use(cookieParser());
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

passport.use(
  new LocalStrategy(
    {
      usernameField: 'id',
      passwordField: 'password',
    },
    async (id, password, cb) => {
      const client = await mongoClient.connect();
      const userCursor = client.db('kdt1').collection('users');
      const idResult = await userCursor.findOne({ id });
      if (idResult !== null) {
        if (idResult.password === password) {
          cb(null, idResult);
        } else {
          cb(null, false, { message: '비밀번호가 틀렸습니다.' });
        }
      } else {
        cb(null, false, { message: '해당 id가 없습니다' });
      }
    }
  )
);

passport.serializeUser((user, cb) => {
  cb(null, user.id);
});

passport.deserializeUser(async (id, cb) => {
  const client = await mongoClient.connect();
  const userCursor = client.db('kdt1').collection('users');
  const result = await userCursor.findOne({ id });
  if (result !== null) cb(null, result);
});

const router = require('./routes/index');
const boardRouter = require('./routes/board');
const registerRouter = require('./routes/register');
const loginRouter = require('./routes/login');

app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(express.static('public'));

app.use('/', router);
app.use('/board', boardRouter);
app.use('/register', registerRouter);
app.use('/login', loginRouter);

app.use((err, req, res, next) => {
  console.log(err.stack);
  res.status(err.statusCode || 500);
  res.end(err.message);
});

app.listen(PORT, () => {
  console.log(`The express server is running at ${PORT}`);
});
