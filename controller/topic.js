const Topic = require('../models').Topic;
const model = require('../models');

module.exports = (sequelize, DataTypes) => {
   Topic.allTopics = (req,res) => {
      const result = Topic
         .findAll({
            order: [[ 'createdAt', 'asc']],
            include: [ model.User, model.Comment ]
         }).then(data => {
            res.render('index', {
               loggeduser: req.session.user,
               topics: data,
               message: req.query.message
            });
         });

      console.log(result);
      return result;
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

   Topic.renderTopic = (req,res) => {
      const loggeduser = req.session.user;
      if(loggeduser) { return res.render('addTopic', {loggeduser:loggeduser}) }
         else { return res.redirect('/?message=' + `You need to be logged in!`) }
   }

   Topic.addTopic = (req,res) => {
      const topic = {
         userId: req.session.user.id,
         title: req.body.title,
         info: req.body.body
      }

      return Topic
         .createTopic(topic)
         .then(() => {
            res.redirect('/');
         });
   }

   Topic.view = (req,res) => {
      const topic = req.params.id;

      return Promise
         .all([
            model.Topic.findTopic(topic),
            model.Comment.findTopic(topic)
         ])
         .then(data => {
            res.render('topic', {
               loggeduser: req.session.user,
               topic: data[0],
               comments: data[1]
            });
         }).catch(err => {
            console.log(err);
         });
   }

   return Topic;
}
