const sequelize = require('../util/database');
const { Sequelize, DataTypes } = require('sequelize');
const User = require('../models/user');
const Expense = require('../models/expense');
const Report = require('../models/report');
const multer = require('multer');

// Import AWS SDK v3 modules
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { fromEnv } = require('@aws-sdk/credential-provider-env');

// Initialize the S3 client with AWS SDK v3
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: fromEnv(),
});

// Function to get leaderboard details
exports.getLeaderBoardDetails = async (req, res, next) => {
  let transaction;
  try {
    transaction = await sequelize.transaction();

    const users = await User.findAll({
      attributes: ['id', 'firstName', 'lastName', 'totalExpense'],
      order: [[Sequelize.literal('totalExpense'), 'ASC']],
      transaction,
    });

    await transaction.commit();
    res.status(200).json(users);
  } catch (error) {
    if (transaction) await transaction.rollback();
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Function to generate and upload report to S3
exports.generateReport = async (req, res, next) => {
  let transaction;
  try {
    if (!req.file || Object.keys(req.file).length === 0) {
      return res.status(400).send('No files were uploaded.');
    }

    transaction = await sequelize.transaction();

    const uploadedFile = req.file;
    const params = {
      Bucket: process.env.BUCKET_NAME,
      Key: `${req.body.fileName}.csv`,
      ACL: 'public-read',
      Body: uploadedFile.buffer,
    };

    const command = new PutObjectCommand(params);
    const data = await s3.send(command);

    const report = await Report.create(
      {
        fileName: req.body.fileName,
        url: `https://${process.env.BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`,
        UserId: req.body.userId,
      },
      { transaction }
    );

    await transaction.commit();

    res.status(200).json({
      url: report.url,
      fileName: report.fileName,
      generatedDate: report.createdAt,
    });

    console.log('File uploaded successfully:', report.url);
  } catch (error) {
    if (transaction) await transaction.rollback();
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Function to get all reports for a user
exports.getAllReports = async (req, res, next) => {
  let transaction;
  try {
    transaction = await sequelize.transaction();

    const userId = req.body.userId;

    const reports = await Report.findAll({
      where: {
        UserId: userId,
      },
      transaction,
    });

    const formattedReports = reports.map((report) => ({
      fileName: report.fileName,
      generatedDate: report.createdAt,
      url: report.url,
    }));

    await transaction.commit();
    res.status(200).json(formattedReports);
  } catch (error) {
    if (transaction) await transaction.rollback();
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
