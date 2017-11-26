const model = require('../models');

module.exports = (sequelize, DataTypes) => {
   const Comment = sequelize.define('comments', {
      info: {
         type: DataTypes.TEXT,
         allowNull: false,
      }
   });

   Comment.allComments = () => {
      Comment.findAll({
         order: [['createdAt' ,'desc']],
         include: [{
            model: Topic,
            model: User,
         }]
      })
   }


   return Comment;
}
