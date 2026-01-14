const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');

 //Load environment variables 
dotenv.config();

// Connect DB AFTER dotenv
const connectDB = require('./util/database');

// Middlewares
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(helmet());

//  code is used for request logging and serving static files in an Express application
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, 'access.log'),
  { flags: 'a' }
);
app.use(morgan('combined', { stream: accessLogStream }));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

//  CSP improve application security
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "script-src 'self' https://checkout.razorpay.com; " +
    "script-src-elem 'self' https://checkout.razorpay.com;"
  );
  next();
});

//  Routes
const routes = require('./routes/routes');
app.use('/homepage', routes);
app.use('/user', routes);
app.use('/payment', routes);
app.use('/premium', routes);

// Pages
app.get('/password/resetPassword/:uuid', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'resetPassword.html'));
});

app.use('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Start server AFTER DB connects
const startServer = async () => {
  try {
    await connectDB();
    app.listen(3000, () => {
      console.log('Server running on port 3000');
    });
  } catch (err) {
    console.error('Failed to start server:', err);
  }
};

startServer();
