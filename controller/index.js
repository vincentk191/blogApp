const sequelize = require('../models').sequelize;
const user = sequelize.import('./user');
const topic = sequelize.import('./topic');
const comment = sequelize.import('./comment');

module.exports = {
   user,
   topic,
   comment
}
