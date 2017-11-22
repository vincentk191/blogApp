//-----------------DEPENDENCIES------------------
const express = require('express');
const bodyParser = require('body-parser');
const Sequelize = require('sequelize');
const session = require('express-session');
const bcrypt = require('bcrypt');
const SequelizeStore = require('connect-session-sequelize')(session.Store);


//-----------------CONFIGURATION------------------
const sequelize = new Sequelize('blogapp', process.env.POSTGRES_USER, null, {
   host: 'localhost',
   dialect: 'postgres',
   storage: './session.postgres'
});

const app = express();

app.use(express.static('public'));
app.use(bodyParser.urlencoded({
   extended: false
}));

app.set('view engine', 'pug');

//-----------------SESSION STORE-------------------
app.use(session({
   store: new SequelizeStore({
      db: sequelize,
      checkExpirationInterval: 15 * 60 * 1000, // The interval at which to cleanup expired sessions in milliseconds.
      expiration: 60 * 60 * 1000 // The maximum age (in milliseconds) of a valid session.
   }),
   secret: "safe",
   saveUnitialized: false,
   resave: false
}))
//-----------------TABLES------------------
const Topic = sequelize.define('topics', {
   title: Sequelize.TEXT,
   info: Sequelize.TEXT,
})

const Comment = sequelize.define('comments', {
   info: Sequelize.TEXT,
})

const User = sequelize.define('users', {
   username: {
      type: Sequelize.TEXT,
      unique: true
   },
   email: {
      type: Sequelize.TEXT,
      unique: true
   },
   password: Sequelize.TEXT,

}, {
   timestamps: false
})

//-----------------PRE-DEFINED ENTRIES------------------

//-----------------RELATIONSHIPS------------------

User.hasMany(Comment, {onDelete: 'CASCADE' });
Comment.belongsTo(User, {onDelete: 'CASCADE' });

User.hasMany(Topic, {onDelete: 'CASCADE' });
Topic.belongsTo(User, {onDelete: 'CASCADE' });

Topic.hasMany(Comment, {onDelete: 'CASCADE' });
Comment.belongsTo(Topic, {onDelete: 'CASCADE' });

sequelize.sync();

//---------------------ROUTES---------------------

// Index route
app.get('/', (req, res) => {
   console.log(req.session.user);

   const loggeduser = req.session.user;

   Promise.all([
      Comment.findAll({
            include: [{
               model: Topic,
               model: User,
            }]
         }),
      Topic.findAll({
         include: [{
            model: User
         }]
      })
   ])
   .then(data => {
      res.render('index', {
         loggeduser: loggeduser,
         topics: data[1],
         comments: data[0],
         message: req.query.message
      });
   });
});
// Logging out route
app.get('/logout', (req, res) => {

   req.session.destroy((err) => {
      if (err) {
         throw err
      }
      res.redirect(`/?message=` + 'You have successfully logged out!');
   });

});

// Logging in route
app.get('/login', (req,res) => {
   if (req.session.user){
      res.redirect('/?message=' + `You're already logged in!`)
   } else {
      res.render('login',{ message: req.query.message });
   }
});

app.post('/login', (req, res) => {
   const username = req.body.username
   const password = req.body.password

   User.findOne({
      where: {
         username: username,
      }
   }).then((loggeduser) => {
      if (loggeduser != null) {
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
app.get('/users/new', (req,res) => {
   res.render('signup',{
      page: 'Sign up',

   })
});
app.post('/users/new', (req, res) => {
   const username = req.body.username;
   const password = req.body.password1;
   const email = req.body.email;

   bcrypt.hash(password, 8, (err,hash) => {
      if (err) {
         throw err;
      } else {
         User.create({
            username: username,
            password: hash,
            email: email
         }).then((loggeduser) => {
            req.session.user = loggeduser;
            res.redirect(`/`);
         }).catch(console.error());
      }
   });
});

// Add a topic

app.get('/topic/add' , (req,res) => {
   const loggeduser = req.session.user;
   res.render('addTopic', {loggeduser:loggeduser});
});

// Add a comment

app.post('/topic/:id/add', (req,res) => {
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

app.post('/topic/add' , (req,res) => {
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
app.get('/topic/:id', (req,res) => {
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
// app.get('/users/:id/delete', (req, res) => {
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
// app.post('/users/:id/edit', (req, res) => {
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
app.get('/users/:id', (req, res) => {
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


var server = app.listen(3000, () => {
   console.log(`Server's working just fine on port 3000!`);
});
