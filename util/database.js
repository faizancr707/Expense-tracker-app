
const dotenv = require('dotenv');
const { Sequelize } = require('sequelize');


dotenv.config();


const sequelize = new Sequelize(
  process.env.DATABASE_DEFAULT, 
  process.env.DATABASE_USER,    
  process.env.DATABASE_PASSWORD, 
  {
    host: process.env.DATABASE_HOST, 
    dialect: 'mysql'                 
  }
);


sequelize.authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });


sequelize.sync({ force: false })  // Set to 'true' to drop and recreate tables every time
  .then(() => {
    console.log('Database & tables created!');
  })
  .catch(err => {
    console.error('Error syncing database:', err);
  });

module.exports = sequelize;

