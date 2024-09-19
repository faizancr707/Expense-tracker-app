const sequelize = require('../util/database');
const {Sequelize, Datatypes} = require('sequelize');
const queryInterface = sequelize.getQueryInterface();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const uuid = require('uuid');

const User = require('../models/user');
const ResetPassword =  require('../models/resetPassword');

const secretKey = process.env.SECRET_KEY;
const dotenv = require('dotenv');
const config = dotenv.config();

const SibApiV3Sdk = require('sib-api-v3-sdk'); 
let defaultClient = SibApiV3Sdk.ApiClient.instance;
let apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.SIB_KEY;

exports.register = async (req, res, next) => {
    let transaction = await sequelize.transaction();
    try {
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(req.body.password, salt);

        req.body.id = req.body.email;
        req.body.password = hashPassword;
        const isExistingUser = await User.findByPk(req.body.email, {transaction});

        if(!isExistingUser) {
            const user = await User.create(req.body, {transaction});
            console.log("New User Added")
            transaction.commit();
            return res.status(201).json(req.body);
        } else {
            transaction.rollback();
            console.log("User Already Exits");
            return res.status(200).json(req.body);
        }
    } catch (error) {
        console.error(error);
        transaction.rollback();
        res.status(500).json('Internal Server Error');
    }
}

exports.login = async (req, res, next) =>  {
    let transaction = await sequelize.transaction();
    try {
        const isExistingUser = await User.findByPk(req.body.email);
        if(isExistingUser) {
            const validPassword = await bcrypt.compare(req.body.password, isExistingUser.password);
            if(!validPassword) {
                console.log("Incorrect Password");
                return res.status(401).json({message: 'Incorrect Password'});
            };
            
            const token = jwt.sign({ email: req.body.email }, secretKey);
            const responsePayLoad = {
                isPremiumUser : isExistingUser.isPremiumUser,
                email : isExistingUser.email,
                token: token
            }
            console.log("User Logged In");
            return res.status(200).json(responsePayLoad);
        } else {
            console.log("No user found");
            return res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json('Internal Server Error');
    }
};

exports.forgotPasword = async (req, res, next) => {
    let transaction = await sequelize.transaction();
    try {
        const uniqueId = uuid.v4();
        const isExistingUser = await User.findOne({ where: { email: req.body.email } }, {transaction});
        if(!isExistingUser) {
            transaction.rollback();
            return res.status(404).json({message: "User not found"});
        }
        const options = {
            id: uniqueId,
            isActive: true,
            email: req.body.email,
            UserId: isExistingUser.id
        };
        
        const insertQuery = ResetPassword.create({id, isActive, email, UserId} = options, {transaction} );
        transaction.commit();
        const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
        const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
        sendSmtpEmail.sender = { email: 'faizanala000007@gmail.com', name: 'Faizan Alam' }; 
        sendSmtpEmail.to = [{ email:req.body.email }];
        sendSmtpEmail.htmlContent = `
            <html>
                <body>
                    <h1>Password Reset</h1>
                    <p>Hello User,</p>
                    <p>Click the link below to reset your password:</p>
                    <a href="http://localhost:3000/password/resetPassword/${uniqueId}"> Click Here </a>
                </body>
            </html>
        `;
        sendSmtpEmail.subject = 'Password Reset'; 
        const sendSmtpEmailResponse = await apiInstance.sendTransacEmail(sendSmtpEmail, apiKey);
        console.log('Email sent successfully:', sendSmtpEmailResponse);
        res.status(200).json(options);
    } catch (error) {
        transaction.rollback();
        console.log(error);
    }
};

exports.resetPassword = async (req, res, next) => {
    let transaction = await sequelize.transaction();
    try {
        const resetEntry = await ResetPassword.findOne({ where: { id: req.body.uniqueId, isActive: true } },{transaction});

        if (resetEntry) {
            const salt = await bcrypt.genSalt(10);
            const hashPassword = await bcrypt.hash(req.body.resetPassword, salt);
            const userId = resetEntry.UserId;
            const user = await User.findByPk(userId, {transaction});
            if (user) {
                await user.update({ password: hashPassword } , {transaction});
                await resetEntry.update({ isActive: false }, {transaction});
                res.status(200).json({ message: "Password reset successful" });
            } else {
                transaction.rollback();
                res.status(404).json({ message: "User not found" });
            }
        } else {
            transaction.rollback();
            res.status(404).json({ message: "Invalid or expired reset link" });
        }
    } catch (error) {
        console.log(error);
        transaction.rollback();
        res.status(500).json({ message: "Internal Server Error" });
    }
};