const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const dotenv = require('dotenv');
const config = dotenv.config();
const RazorPay = require('razorpay');
const SibApiV3Sdk = require('sib-api-v3-sdk');
const uuid = require('uuid');
const multer = require('multer');
const helmet = require('helmet');
const morgan = require('morgan');


const sequelize = require('./util/database');
const razorPayInstance = require('./util/razorPay');
const routes = require('./routes/routes');
const User = require('./models/user');
const Expense = require('./models/expense');
const Orders = require('./models/orders');
const ResetPassword = require('./models/resetPassword');
const Report = require('./models/report');

app.use(helmet());
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {flags:'a'});
app.use(morgan('combined', {stream:accessLogStream}));
app.use(cors());
app.use(bodyParser.urlencoded( { extended:false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

Expense.belongsTo(User);
User.hasMany(Expense);

User.hasMany(Orders);
Orders.belongsTo(User);

User.hasMany(ResetPassword);
ResetPassword.belongsTo(User);

User.hasMany(Report);
Report.belongsTo(User);


app.use((req, res, next) => {
    res.setHeader(
      'Content-Security-Policy',
      "script-src 'self' https://checkout.razorpay.com; " +
      "script-src-elem 'self' https://checkout.razorpay.com;"
    );
    next();
});

app.use("/homepage", routes);
app.use("/homepage", (req, res, next) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});
app.use("/user", routes );
app.use("/payment", routes);
app.use('/premium', routes);
app.get("/password/resetPassword/:uniqueId", (req, res, next)=> {
    res.sendFile(path.join(__dirname, 'views', 'resetPassword.html'));
} );

app.use("/", (req, res, next) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});


app.use('', async (request, response) => {
    response.redirect('http://localhost:3000/expense');
});


async function initiate() {
    try {
        await sequelize.sync();
        app.listen(3000, () => {
            console.log("Server is running at 3000");
        });
    } catch (error) {
        console.error(error);
    }
}

initiate();

//token = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImZhaXphbmFsYTAwMDAwN0BnbWFpbC5jb20iLCJpYXQiOjE3MjU4NjAwNzUsImV4cCI6MTcyNTg2MzY3NX0.MVxqpt9LxVZHgPuSQ8JeUuZAKuIlF9p3st4Py8DnVzQ