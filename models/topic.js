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
         order: [[ 'createdAt', 'desc']],
         include: [ model.User ]
      });
   }

   return Topic;
};
