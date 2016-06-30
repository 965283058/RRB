var express = require('express');
var router = express.Router();

var prodect = require('./prodect');
var category = require('./category');
var order = require('./order');
var addess = require('./addess');
var menu = require('./menu');
var user = require('./user');
var dept=require("./dept");

router.use('/prodect', prodect);
router.use('/category', category);
router.use('/order', order);
router.use('/addess', addess);
router.use('/menu', menu);
router.use('/user', user);
router.use('/dept', dept);



module.exports = router;