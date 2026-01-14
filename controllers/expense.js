const Expense = require('../models/expense');
const User = require('../models/user');
const mongoose = require('mongoose');

exports.addExpense = async (req, res) => {
  try {
    const { amount, desc, category } = req.body;
    const userId = req.user.userId; // from JWT

    const expense = await Expense.create({
      amount,
      desc,
      category,
      userId
    });

    res.status(201).json({
      expenseId: expense._id,
      userId
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const expenseId = req.params.id;
    const userId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(expenseId)) {
      return res.status(400).json({ message: 'Invalid Expense ID' });
    }

    const expense = await Expense.findOneAndDelete({
      _id: expenseId,
      userId
    });

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.status(200).json({ message: 'Expense deleted successfully' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.editExpense = async (req, res) => {
  try {
    const expenseId = req.params.id;
    const userId = req.user.userId;
    const { amount, desc, category } = req.body;

    const expense = await Expense.findOne({
      _id: expenseId,
      userId
    });

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    expense.amount = amount;
    expense.desc = desc;
    expense.category = category;

    await expense.save();

    res.status(200).json(expense);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getAllExpenses = async (req, res) => {
  try {
    const userId = req.user.userId;

    const expenses = await Expense.find({ userId })
      .sort({ updatedAt: -1 });

    res.status(200).json(expenses);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};
