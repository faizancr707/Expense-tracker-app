const Expense = require('../models/expense');
const Report = require('../models/report');

// AWS SDK v3
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { fromEnv } = require('@aws-sdk/credential-provider-env');

// S3 client
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: fromEnv(),
});

/**
 * LEADERBOARD
 */
exports.getLeaderBoardDetails = async (req, res) => {
  try {
    const leaderboard = await Expense.aggregate([
      {
        $group: {
          _id: '$userId',
          totalExpense: { $sum: '$amount' }
        }
      },
      { $sort: { totalExpense: -1 } },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 0,
          userId: '$user._id',
          name: '$user.name',
          totalExpense: 1
        }
      }
    ]);

    res.status(200).json(leaderboard);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * GENERATE REPORT
 */
exports.generateReport = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileKey = `${req.body.fileName}.csv`;

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.BUCKET_NAME,
        Key: fileKey,
        Body: req.file.buffer,
        ContentType: 'text/csv',
      })
    );

    const report = await Report.create({
      fileName: req.body.fileName,
      url: `https://${process.env.BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`,
      userId: req.user.userId   // from auth middleware
    });

    res.status(200).json({
      fileName: report.fileName,
      generatedDate: report.createdAt,
      url: report.url
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * GET ALL REPORTS
 */
exports.getAllReports = async (req, res) => {
  try {
    const reports = await Report.find({ userId: req.user.userId })
      .sort({ createdAt: -1 });

    const formatted = reports.map(r => ({
      fileName: r.fileName,
      generatedDate: r.createdAt,
      url: r.url
    }));

    res.status(200).json(formatted);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
