# Blog-App

A website that allows people to post comments and topics to a page.

> _Commented out lines are left due to some additional functionalities I would like to work on._

### Added Features:
   - BCrypt
   - Data validation:
      - Username field cannot be empty and must be unique  

      - Password field cannot be empty and must contain at least 8 characters

      - For registration, the 'confirm password' and 'password' fields must match each other

## Prerequisites

Requires your environment variables to be set to a default value of your USER and PASSWORD (if you have one).

You may do so by opening either ~/.bash_profile for OSX or ~/.bashrc for Linux and adding the line:

```
export POSTGRES_USER=name
export POSTGRES_PASSWORD=mypassword
```

## Installing

You will require this step to allow the modules used in the app to function.

```
npm install
```
And this to run the app.
```
node index.js
```


## Prior to coding..

 1. There are 3 tables made, one for:
      * Users
      * Topics
      * Comments
      - To simplify the structure the comments will act as a joint table however
         no many-many relationship will be used.
         In this case we will be using a one to many in a triangle like format.
         - Comment <-(One user)- User
         - Comment <-(One topic)- Topic
         - Topic <-(One user)- User
         - Topic <-(Many comments)- Comment
 ![banner](https://github.com/vincentk191/blogApp/blob/master/public/images/screenshot.png?raw=true)

 2. Routes:
      -  Two Routes will be required for each form page, one to direct the user to the page
      and the other for the post request. This would include:

         * Signing up
         * Logging in
         * Adding a topic

      -  Viewing profiles
      -  Viewing topics
## Libraries
- Node.js
- jQuery.js
- AJAX
- SQL
- Postgres

## Authors

- [VincentK](https://github.com/vincentk191)
