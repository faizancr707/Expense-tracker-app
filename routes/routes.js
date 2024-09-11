const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();
const userController = require('../controllers/user');
const expenseController = require('../controllers/expense');
const authToken  = require('../middleware/authToken');
const payment  = require('../controllers/payment');
const premium = require('../controllers/premium');

router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/forgotPassword", userController.forgotPasword);
router.post("/resetpassword/:uniqueId", userController.resetPassword);

router.post("/add-expense",authToken.authToken, expenseController.addExpense);
router.delete("/delete-expense/:id", authToken.authToken, expenseController.deleteExpense);
router.put("/edit-expense/:id",authToken.authToken, expenseController.editExpense);
router.get("/get-expenses", authToken.authToken, expenseController.getAllExpenses);

router.get("/createOrder", authToken.authToken, payment.createOrder);
router.post('/addOrder', authToken.authToken, payment.addOrder );

router.get("/getLeaderBoardDetails", authToken.authToken, premium.getLeaderBoardDetails );
router.post("/generateReport",upload.single('file'), authToken.authToken, premium.generateReport );
router.get("/reports", authToken.authToken, premium.getAllReports);
module.exports = router;