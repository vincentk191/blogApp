const express = require('express');
const router = express.Router();
const userControl = require('../controller').user;
const topicControl = require('../controller').topic;
const commentControl = require('../controller').comment;

// Index route
router.get('/', topicControl.allTopics);

// Logging out route
router.get('/logout', userControl.logout);

// Logging in route
router.get('/login', userControl.renderLogin);
router.post('/login', userControl.login);

// Sign Up
router.get('/users/new', userControl.signup);
router.post('/users/new', userControl.verify);

// Add a topic
router.get('/topic/add' , topicControl.renderTopic);
router.post('/topic/add' , topicControl.addTopic);

// Add a comment
router.post('/topic/:id/add', commentControl.addComment);

// View a topic
router.get('/topic/:id', topicControl.view);

// User profiles
router.get('/users/:id', userControl.view);

module.exports = router;
