const model = require('../models');

module.exports = (sequelize, DataTypes) => {
   const Comment = sequelize.define('comments', {
      info: {
         type: DataTypes.TEXT,
         allowNull: false
      }
   });

   Comment.allComments = () => {
      Comment.findAll({
         order: [['createdAt' ,'asc']],
         include: [{
            model: Topic,
            model: User,
         }]
      })
   }

   Comment.findUser = (userId) => {
      return Comment.findAll({
         where: {
            userId: userId
         },
         include: [ model.Topic ]
      });
   }

   Comment.findTopic = (topicId) => {
      return Comment.findAll({
         where: {
            topicId: topicId
         },
         include: [ model.User ],
         order: [['createdAt', 'ASC']]
      })
   }

   Comment.createComment = (comment) => {
      return Comment.create({
         info: comment.info,
         userId: comment.userId,
         topicId: comment.topic
      })
   }

   return Comment;
}
