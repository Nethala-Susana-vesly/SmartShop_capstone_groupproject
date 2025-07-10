const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const path = require('path');
const User = require('./models/user');

const app = express();
const PORT = 3020;

// MongoDB Atlas connection
mongoose.connect('mongodb+srv://Susanna:Susana_626@cluster0.qtic7ma.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB Error:", err));

// Middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Home route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ✅ Login Page (Passes message to login.ejs)
app.get('/login', (req, res) => {
  const message = req.query.message || '';
  res.render('login', { message });
});

// Signup Page
app.get('/signup', (req, res) => {
  const message = req.query.message || '';
  res.render('signup', { message });
});

// ✅ Signup Submit
app.post('/signupsubmit', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.redirect('/login?message=User already exists. Login here');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();

    res.redirect('/login?message=Signup successful. Login now');
  } catch (err) {
    console.error(err);
    res.send("Error during signup.");
  }
});

// ✅ Login Submit
app.post('/loginsubmit', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.redirect('/login?message=No user found. Please signup.');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.redirect('/login?message=Incorrect password. Try again.');
    }

    // Password is correct, redirect to index.html
    res.redirect('/index.html');

  } catch (err) {
    console.error("Login error:", err);
    res.send("Error during login.");
  }
});

// Server Start
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
