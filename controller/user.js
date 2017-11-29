const User = require('../models').User;
const model = require('../models');
const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
   User.renderLogin = (req,res) => {
      if (req.session.user){
         return res.redirect('/?message=' + `You're already logged in!`)
      } else {
         return res.render('login',{ message: req.query.message });
      }
   }

   User.login = (req,res) => {
      const username = req.body.username
      const password = req.body.password

      console.log(username);

      return User
         .findOne({
            where: {
               username: username
            }
         }).then((loggeduser) => {
            if (loggeduser) {
               bcrypt.compare(password, loggeduser.password, (err,data) => {
                  if (err) {
                     throw err;
                  }
                  if (data) {
                     req.session.user = loggeduser;
                     res.redirect('/?message='+'You are now logged in!');
                  } else {
                     res.redirect('/login/?message=' + 'Incorrect password!')
                  }
               });
            } else {
               res.redirect('/login/?message=' + 'Username does not exist!')
            }
         });
   }

   User.logout = (req, res) => {
      return req.session.destroy((err) => {
         if (err) {
            throw err
         }
         res.redirect(`/?message=` + 'You have successfully logged out!');
      });
   }

   User.signup = (req,res) => {
      res.render('signup',{
         email: "",
         username: ""
      });
   }


   User.view = (req, res) => {
      const usernameId = req.params.id

      return Promise
         .all([
            User.findOne({
               where:{
                  id: usernameId
               }
            }),
            model.Comment.findUser(usernameId),
            model.Topic.findUser(usernameId)
         ])
         .then(data => {
            res.render('profile', {
               loggeduser: req.session.user,
               user: data[0],
               comments: data[1],
               topics: data[2]
            });
         }).catch(err => {
            console.log(err);
         })
   };

   User.verify = (req,res) => {
      const user = {
         username: req.body.username,
         password: req.body.password1,
         confirmpwd: req.body.password2,
         useremail: req.body.email
      }

      return User
         .findOne({
            where: {
               username: user.username
            }
         })
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
