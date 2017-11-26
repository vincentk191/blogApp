const model = require('../models')

module.exports = (sequelize, DataTypes) => {
   const User = sequelize.define('users', {
      username: {
         type: DataTypes.TEXT,
         allowNull: false,
         unique: true
      },
      email: {
         type: DataTypes.TEXT,
         allowNull: false,
         unique: true,
         validate: {
            isEmail: {
               msg: "Please enter a valid email address"
            }
         }
      },
      password: {
         type: DataTypes.TEXT,
         allowNull: false,
         validate: {
            len: {
               args: 8,
               msg: "Password must be 8 characters in length"
            }
         }
      }

   }, {
      timestamps: false
   });

   User.find = (name) => {
      return User.findOne({
         where: {
            username: name,
         }
      });
   }

   return User;
}
