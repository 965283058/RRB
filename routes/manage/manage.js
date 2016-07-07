var express = require('express');
var router = express.Router();
var fs=require("fs");

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


router.post('/selfAddess', function(req,res,next){
    fs.readFile("../uploads/selfAddess.txt", function (err, data) {
        if (err) {
            res.json({"errCode":78,"message":err.message});
        }else{
            res.json({"text":data.toString()});
        }
    });
});
router.post('/saveSelfAddess', function(req,res,next){
    var text=req.body.text;
    fs.writeFile("../uploads/selfAddess.txt",text, function (err, data) {
        if (!err) {
            res.json({});
        }else{
            console.info(err)
            res.json({"status":332,"message":err.message});
        }
    });
});




module.exports = router;