const express = require('express');
const router = express.Router();
const model = require('../models');

router.get('/', (req, res) => {
   model.Topic.allTopics()
   .then(data => {
      res.render('index', {
         loggeduser: req.session.user,
         topics: data,
         message: req.query.message
      });
   });
});
// Logging out route
router.get('/logout', (req, res) => {
   req.session.destroy((err) => {
      if (err) {
         throw err
      }
      res.redirect(`/?message=` + 'You have successfully logged out!');
   });
});

// Logging in route
router.get('/login', (req,res) => {
   if (req.session.user){
      res.redirect('/?message=' + `You're already logged in!`)
   } else {
      res.render('login',{ message: req.query.message });
   }
});

router.post('/login', (req, res) => {
   const username = req.body.username
   const password = req.body.password

   db.login(username)
   .then((loggeduser) => {
      if (loggeduser) {
         bcrypt.compare(password, loggeduser.password, (err,data) => {
            if (err) {
               throw err;
            } else {
               req.session.user = loggeduser;
               res.redirect('/?message='+'You are now logged in!');
            }
         });
      } else {
         res.redirect('/login/?message=' + 'Username does not exist!')
      }
   });
});

// Sign Up
router.get('/users/new', (req,res) => {
   res.render('signup',{
      email: "",
      username: ""
   });
});

router.post('/users/new', (req, res) => {
   const users = {
      username: req.body.username,
      password: req.body.password1,
      confirmpwd: req.body.password2,
      useremail: req.body.email
   }


   db.login(users.username)
   .then(data => {
      if(!data){
         if(users.password === users.confirmpwd){
            const checkUser = User.build({
               username: users.username,
               password: users.password,
               email: users.useremail
            })

            checkUser.validate()
               .then(() => {
                  bcrypt.hash(users.password, 8, (err,hash) => {
                     if (err) {
                        throw err;
                     } else {
                        checkUser.update({
                           username: users.username,
                           email: users.useremail,
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
                     email: users.useremail,
                     username: users.username,
                     emailMessage: email[0],
                     pwdMessage: pwd[0],
                     email: users.useremail,
                     username: users.username
                  });
               });
         } else {
            res.render('signup', {
               message: 'Password does not match original password',
               email: users.useremail,
               username: users.username
            });
         }
      } else {
         res.render('signup', {
            userMessage: 'Username is taken',
            email: users.useremail,
            username: "",
         });
      }
   })
});

// Add a topic

router.get('/topic/add' , (req,res) => {
   const loggeduser = req.session.user;
   res.render('addTopic', {loggeduser:loggeduser});
});

// Add a comment

router.post('/topic/:id/add', (req,res) => {
   const comment = req.body.comment;
   const userId = req.session.user.id;
   const topic = req.params.id;

   Comment.create({
      info: comment,
      userId: userId,
      topicId: topic
   }).then(data => {
      res.redirect(`/topic/${topic}`);
   });
});

router.post('/topic/add' , (req,res) => {
   const userId = req.session.user.id;
   const title = req.body.title;
   const info = req.body.body;

   Topic.create({
      title: title,
      info: info,
      userId: userId
   }).then(data => {
      res.redirect('/');
   });
});

// View a topic
router.get('/topic/:id', (req,res) => {
   const loggeduser = req.session.user;
   const topic = req.params.id;

   Promise.all([
      Topic.findOne({
         where: {
            id: topic
         },
         include: [{
            model: User
         }]
      }),
      Comment.findAll({
         where: {
            topicId: topic
         },
         include: {
            model: User
         },
         order: [['createdAt', 'ASC']]
      })
   ])
   .then(data => {
      res.render('topic', {
         loggeduser: loggeduser,
         topic: data[0],
         comments: data[1]
      });
   })
});

// // Delete account
// router.get('/users/:id/delete', (req, res) => {
//    const loggeduser = req.session.user;
//    const username = req.params.id;
//
//    if (loggeduser.id === id || loggeduser.username === 'admin') {
//       User.destroy({
//          where: {
//             username: username
//          }
//       }).then(output => res.render('/?message='+'Profile Deleted Successfully!'), console.error);
//    } else {
//       // You are not authorized for this yet.
//    }
//
// });

// // Edit profile page (JQUERY)
// router.post('/users/:id/edit', (req, res) => {
//    const comments = req.body.Comments;
//    const topics = req.body.Topics;
//
//    Promise.all([,])
//    User.update({
//       comments: comments,
//       info: info
//    }).then((err) => {
//       res.send(err);
//    })
// });

// User profiles
router.get('/users/:id', (req, res) => {
   const loggeduser = req.session.user
   const usernameId = req.params.id
   Promise.all([
      User.findOne({
         where: {
            id: usernameId
         }
      }),
      Comment.findAll({
         where: {
            userId: usernameId
         },
         include: {
            model: Topic
         }
      }),
      Topic.findAll({
         where: {
            userId: usernameId
         }
      })
   ])
   .then(data => {
      res.render('profile', {
         loggeduser: loggeduser,
         user: data[0].dataValues,
         comments: data[1],
         topics: data[2]
      });
   });
});

module.exports = router;
