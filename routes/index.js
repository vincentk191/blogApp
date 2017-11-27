const express = require('express');
const router = express.Router();
const model = require('../models');
const bcrypt = require('bcrypt');

// Index route
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

   model.User.login(username)
   .then((loggeduser) => {
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
});

// Sign Up
router.get('/users/new', (req,res) => {
   res.render('signup',{
      email: "",
      username: ""
   });
});

router.post('/users/new', (req, res) => {
   const user = {
      username: req.body.username,
      password: req.body.password1,
      confirmpwd: req.body.password2,
      useremail: req.body.email
   }

   model.User.verify(user,req,res);
});

// Add a topic
router.get('/topic/add' , (req,res) => {
   const loggeduser = req.session.user;
   res.render('addTopic', {loggeduser:loggeduser});
});

router.post('/topic/add' , (req,res) => {
   const topic = {
      userId: req.session.user.id,
      title: req.body.title,
      info: req.body.body
   }

   model.Topic.createTopic(topic).then(() => {
      res.redirect('/');
   });
});

// Add a comment
router.post('/topic/:id/add', (req,res) => {
   const comment = {
      info: req.body.comment,
      userId: req.session.user.id,
      topic: req.params.id
   }

   model.Comment.createComment(comment).then(() => {
      res.redirect(`/topic/${comment.topic}`);
   });
});

// View a topic
router.get('/topic/:id', (req,res) => {
   const topic = req.params.id;

   Promise.all([
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
   })
});

// User profiles
router.get('/users/:id', (req, res) => {
   const usernameId = req.params.id

   Promise.all([
      model.User.findUser(usernameId),
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
});

module.exports = router;
