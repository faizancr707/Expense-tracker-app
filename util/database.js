
const dotenv = require('dotenv');
const { Sequelize } = require('sequelize');

// Load environment variables from .env file
dotenv.config();

// Initialize Sequelize instance
const sequelize = new Sequelize(
  process.env.DATABASE_DEFAULT,  // Database name
  process.env.DATABASE_USER,     // Database username
  process.env.DATABASE_PASSWORD, // Database password
  {
    host: process.env.DATABASE_HOST, // Database host
    dialect: 'mysql'                 // Dialect (MySQL in this case)
  }
);

// Test the database connection
sequelize.authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

// Sync the models with the database
sequelize.sync({ force: false })  // Set to 'true' to drop and recreate tables every time
  .then(() => {
    console.log('Database & tables created!');
  })
  .catch(err => {
    console.error('Error syncing database:', err);
  });

module.exports = sequelize;

