const Comment = require('../models').Comment;
const model = require('../models');

module.exports = (sequelize, DataTypes) => {
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

   Comment.addComment = (req,res) => {
      const comment = {
         info: req.body.comment,
         userId: req.session.user.id,
         topic: req.params.id
      }

      return Comment.create({
         info: comment.info,
         userId: comment.userId,
         topicId: comment.topic
      }).then(() => {
         res.redirect(`/topic/${comment.topic}`);
      });
   }

   return Comment;
}
