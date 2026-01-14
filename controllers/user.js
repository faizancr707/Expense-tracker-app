const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const dotenv = require('dotenv');

dotenv.config();

const User = require('../models/user');
const ResetPassword = require('../models/resetPassword');

const SibApiV3Sdk = require('sib-api-v3-sdk');

const secretKey = process.env.SECRET_KEY;

// Brevo (SendinBlue) setup
let defaultClient = SibApiV3Sdk.ApiClient.instance;
let apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.SIB_KEY;


exports.register = async (req, res) => {
    try {
        const {  firstname,lastname,email, password } = req.body;
        if(!firstname || !lastname || !email || !password){
            return res.status(400).json({message:'All fields are required'});
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(200).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            firstname,lastname,
            email,
            password: hashPassword
        });

        console.log('New User Added');
        res.status(201).json({ message: 'User registered successfully' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ message: 'Incorrect password' });
        }

        const token = jwt.sign(
            { userId: user._id, email: user.email },
            secretKey,
            { expiresIn: '1d' }
        );

        res.status(200).json({
            email: user.email,
            isPremiumUser: user.isPremiumUser,
            token
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const uniqueId = uuid.v4();

        await ResetPassword.create({
            uuid: uniqueId,
            isActive: true,
            userId: user._id
        });

        const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
        const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

        sendSmtpEmail.sender = {
            email: 'faizanala000007@gmail.com',
            name: 'Faizan Alam'
        };

        sendSmtpEmail.to = [{ email }];
        sendSmtpEmail.subject = 'Password Reset';
        sendSmtpEmail.htmlContent = `
            <html>
                <body>
                    <h2>Password Reset</h2>
                    <p>Click below to reset your password:</p>
                    <a href="http://localhost:3000/password/resetPassword/${uniqueId}">
                        Reset Password
                    </a>
                </body>
            </html>
        `;

        await apiInstance.sendTransacEmail(sendSmtpEmail);

        res.status(200).json({ message: 'Reset link sent to email' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


exports.resetPassword = async (req, res) => {
    try {
        const { uniqueId, newPassword } = req.body;

        const resetEntry = await ResetPassword.findOne({
            uuid: uniqueId,
            isActive: true
        });

        if (!resetEntry) {
            return res.status(404).json({ message: 'Invalid or expired link' });
        }

        const user = await User.findById(resetEntry.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashPassword;
        await user.save();

        resetEntry.isActive = false;
        await resetEntry.save();

        res.status(200).json({ message: 'Password reset successful' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

