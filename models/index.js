const Sequelize = require('sequelize');
const sequelize = new Sequelize('blogapp', process.env.POSTGRES_USER, null, {
   host: 'localhost',
   dialect: 'postgres',
   storage: './session.postgres'
});

const User = sequelize.import('./user.js');
const Topic = sequelize.import('./topic.js');
const Comment = sequelize.import('./comment.js');

//-----------------RELATIONSHIPS------------------

User.hasMany(Comment, {onDelete: 'CASCADE' });
Comment.belongsTo(User, {onDelete: 'CASCADE' });

User.hasMany(Topic, {onDelete: 'CASCADE' });
Topic.belongsTo(User, {onDelete: 'CASCADE' });

Topic.hasMany(Comment, {onDelete: 'CASCADE' });
Comment.belongsTo(Topic, {onDelete: 'CASCADE' });

// module.exports = {
//    sequelize: sequelize,
//    User: User,
//    Topic: Topic,
//    Comment: Comment
// }

exports.sequelize = sequelize;
exports.Topic = Topic;
exports.Comment = Comment;
exports.User = User;
