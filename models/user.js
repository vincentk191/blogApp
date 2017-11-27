const model = require('../models')
const express = require('express');
const bcrypt = require('bcrypt');

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

   User.findUser = (id) => {
      return User.findOne({
         where: {
            id: id,
         }
      });
   }

   User.login = (username) => {
      return User.findOne({
         where: {
            username: username
         }
      })
   }

   User.verify = (user,req,res) => {
      model.User.login(user.username)
      .then((data) => {
         if(!data){
            if(user.password === user.confirmpwd){
               const checkUser = User.build({
                  username: user.username,
                  password: user.password,
                  email: user.useremail
               })

               checkUser.validate()
               .then(() => {
                  bcrypt.hash(user.password, 8, (err,hash) => {
                     if (err) {
                        throw err;
                     } else {
                        checkUser.update({
                           username: user.username,
                           email: user.useremail,
                           password: hash
                        });
                     }
                  });
               })
               .then(() => {
                  checkUser.save().then(() => {
                     req.session.user = checkUser;
                     res.redirect('/?message='+'You are now logged in!');
                  })
               })
               .catch(err => {
                  console.log(err);
                  let email = err.errors.filter(msg => {
                        return msg.path === 'email';
                  })

                  let pwd = err.errors.filter(msg => {
                        return msg.path === 'password';
                  })

                  res.render('signup', {
                     email: user.useremail,
                     username: user.username,
                     emailMessage: email[0],
                     pwdMessage: pwd[0],
                     email: user.useremail,
                     username: user.username
                  });
               });
            } else {
               res.render('signup', {
                  message: 'Password does not match original password',
                  email: user.useremail,
                  username: user.username
               });
            }
         } else {
            res.render('signup', {
               userMessage: 'Username is taken',
               email: user.useremail,
               username: "",
            });
         }
      });
   }

   return User;
}
