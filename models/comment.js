const model = require('../models');

module.exports = (sequelize, DataTypes) => {
   const Comment = sequelize.define('comments', {
      info: {
         type: DataTypes.TEXT,
         allowNull: false
      }
   });

   return Comment;
}
