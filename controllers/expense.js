const sequelize = require('../util/database');
const {Sequelize, Datatypes} = require('sequelize');
const queryInterface = sequelize.getQueryInterface();
const Expense = require('../models/expense');
const User = require('../models/user');

exports.addExpense = async (req, res, next) => {
    try {
        let transaction = await sequelize.transaction();
        const expense = await Expense.create ( {
            amount:req.body.amount,
            desc: req.body.desc,
            category: req.body.category,
            UserId: req.body.userId
        }, {transaction} );

        const responseData = {
            expensesId: expense.id,
            userId: expense.UserId
        }
        
        const totalExpense = await(Expense.sum('amount', {where : {UserId: req.body.userId}, transaction}));
        const user = await User.findByPk(req.body.userId, {transaction});
        if (user) {
            user.totalExpense = totalExpense || 0;
            await user.save({transaction});
        }

        await transaction.commit();
        res.status(201).json(responseData);
        //res.redirect('/');
    } catch (error) {
        console.error(error);
        if (transaction) await transaction.rollback();
        res.status(500).send('Server Error');
    }
};

exports.deleteExpense = async (req, res, next) => {
    try {
        let transaction = await sequelize.transaction();
        const deleteID = req.params.id;
        const expenseToDelete = await Expense.findByPk(deleteID,  {transaction});
        if(!deleteID) {
            await transaction.rollback();
            return res.status(404).send("Expense not Found");
        }
        await expenseToDelete.destroy( {transaction});

        const totalExpense = await(Expense.sum('amount', {where : {UserId: req.body.userId}, transaction}));
        const user = await User.findByPk(req.body.userId, {transaction});
        if (user) {
            user.totalExpense = totalExpense || 0; 
            await user.save({transaction});
        }

        await transaction.commit(); 
        res.status(200).send("Expense deleted successfully");
    } catch (error) {
        if (transaction) await transaction.rollback(); 
        res.status(500).send('Server Error');
    }
};

exports.editExpense = async (req, res, next) => {
    try {
        let transaction = await sequelize.transaction();
        const editId = req.params.id;
        const expenseToEdit = await Expense.findByPk(editId, {transaction});

        if (!expenseToEdit) {
            await transaction.rollback(); 
            return res.status(404).send("Expense not found");
        }

        const previousAmount = expenseToEdit.amount;
        const newAmount = req.body.amount;

        await expenseToEdit.update( {
            amount:req.body.amount,
            desc: req.body.desc,
            category: req.body.category,
        },  {transaction} );

        const amountDifference = newAmount - previousAmount;
        expenseToEdit.totalExpense += amountDifference;
        
        const totalExpense = await(Expense.sum('amount', {where : {UserId: req.body.userId}, transaction}));
        const user = await User.findByPk(req.body.userId, {transaction});
        if (user) {
            user.totalExpense = totalExpense || 0; 
            await user.save({transaction});
        }

        await expenseToEdit.save({transaction});
        await transaction.commit(); 
        res.status(201).json(expenseToEdit);
    } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
    }
};

exports.getAllExpenses = async (req, res, next) =>{
    try {
        const expenses = await Expense.findAll({
            where: {UserId:req.body.email},
            order: [['updatedAt', 'DESC']]
        });
        if (!expenses || expenses.length === 0) {
            return res.status(204).json({ message: 'No expenses found for the provided email' });
        }
        console.log("Fetched User All Expenses SuccessFuly ");
        res.status(200).json(expenses);
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
}
