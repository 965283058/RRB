var express = require('express');
var router = express.Router();

var prodect = require('./prodect');
var category = require('./category');
var order = require('./order');
var addess = require('./addess');
var logistical = require('./logistical');
var menu = require('./menu');
var user = require('./user');

router.use('/prodect', prodect);
router.use('/category', category);
router.use('/order', order);
router.use('/addess', addess);
router.use('/logistical', logistical);
router.use('/menu', menu);
router.use('/user', user);




module.exports = router;