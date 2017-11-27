const model = require('./');

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

   Topic.allTopics = () => {
      console.log(model);
      return Topic.findAll({
         order: [[ 'createdAt', 'asc']],
         include: [ model.User, model.Comment ]
      });
   }

   Topic.findUser = (userId) => {
      return Topic.findAll({
         where: {
            userId: userId
         },
         include: [ model.User ]
      })
   }

   Topic.findTopic = (topicId) => {
      return Topic.findOne({
         where: {
            id: topicId
         },
         include: [ model.User ]
      })
   }

   Topic.createTopic = (topic) => {
      return Topic.create({
         title: topic.title,
         info: topic.info,
         userId: topic.userId
      })
   }

   return Topic;
};
