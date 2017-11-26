const Sequelize = require('sequelize');

module.exports = {
   validate: (data,users) => {
      if(data === null){
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
   }
}
