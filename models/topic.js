const model = require('../models');

module.exports = (sequelize, DataTypes) => {
   const Topic = sequelize.define('topics', {
      title: {
         type: DataTypes.TEXT,
         allowNull: false,
      },
      info: {
         type: DataTypes.TEXT,
         allowNull: false,
      }
   });

   return Topic;
};
