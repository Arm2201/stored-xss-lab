const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 3000;

const SAFE_MODE = process.env.SAFE_MODE === 'true';
const HTTPONLY = process.env.HTTPONLY === 'true';

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: 'lab-secret-not-for-production',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: HTTPONLY }
}));

const USERS = { alice: 'password123' };

let reviews = [
  { user: 'sam_k', text: 'เสียงดีมาก แบตอึดทั้งวันเลยค่ะ' },
  { user: 'nan_p', text: 'ใส่สบาย กระชับดี จะซื้อรุ่นนี้อีกแน่นอน' }
];

let capturedCookies = [];

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function requireLogin(req, res, next) {
  if (!req.session.user) return res.redirect('/login');
  next();
}

app.get('/', (req, res) => res.redirect('/login'));

app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (USERS[username] && USERS[username] === password) {
    req.session.user = username;
    return res.redirect('/labs');
  }
  res.render('login', { error: 'Invalid username or password' });
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

app.get('/labs', requireLogin, (req, res) => {
  res.render('labs', {
    user: req.session.user,
    safeMode: SAFE_MODE,
    httpOnly: HTTPONLY,
    reviewCount: reviews.length,
    lastReview: reviews.length ? reviews[reviews.length - 1] : null,
    cookieCount: capturedCookies.length,
    lastCapture: capturedCookies.length ? capturedCookies[capturedCookies.length - 1] : null
  });
});

app.get('/product', requireLogin, (req, res) => {
  const safeReviews = reviews.map(r => ({
    user: r.user,
    text: SAFE_MODE ? escapeHtml(r.text) : r.text
  }));
  res.render('product', {
    user: req.session.user,
    reviews: safeReviews,
    safeMode: SAFE_MODE
  });
});

app.post('/review', requireLogin, (req, res) => {
  const { text } = req.body;
  if (text && text.trim().length > 0) {
    reviews.push({ user: req.session.user, text });
  }
  res.redirect('/product');
});

app.get('/search', requireLogin, (req, res) => {
  const hasQuery = req.query.q !== undefined;
  const rawQuery = req.query.q || '';
  const displayQuery = SAFE_MODE ? escapeHtml(rawQuery) : rawQuery;
  res.render('search', {
    user: req.session.user,
    hasQuery,
    displayQuery,
    safeMode: SAFE_MODE
  });
});

app.get('/logger/catch', (req, res) => {
  const cookie = req.query.c || '(empty)';
  capturedCookies.push({ cookie, time: new Date().toISOString() });
  res.status(204).end();
});

app.get('/logger', (req, res) => {
  res.render('logger', { captured: capturedCookies });
});

app.listen(PORT, () => {
  console.log(`Stored XSS lab running on port ${PORT}`);
  console.log(`SAFE_MODE=${SAFE_MODE}  HTTPONLY=${HTTPONLY}`);
});
