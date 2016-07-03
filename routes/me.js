var express = require('express');
var router = express.Router();
var db = require("../db/Schema");
var Schema = require("mongoose").Schema;
var async = require("async");

router.get('/', function (req, res, next) {
    var jobNo = req.session.jobNo;
    if (jobNo) {
        async.parallel({
            order: function (cb) {
               var query= db.Order.find({"status": {"$gt": -2}, "jobNo": jobNo}).populate('prodectList.prodectId', 'prodectName img').populate('dept', 'name').populate('sender', 'email').populate('addess', 'name');
                    query.exec(function(err, data){
                        if (!err) {
                            cb(null, data);
                        } else {
                            cb(err, null);
                        }
                    })
            },
            like: function (cb) {
                db.Like.find({"jobNo": jobNo}, function (err, data) {
                    if (!err) {
                        cb(null, data);
                    } else {
                        cb(err, null);
                    }
                });
            }
        }, function (err, results) {
            if (!err) {
                var json = {
                    "orders":results.order,
                    "likes": results.like,
                    "jobNo": jobNo
                }
                console.info(json)
                res.render('me', json);
            } else {
                console.info(err)
                res.render('error', {
                    message: err.message,
                    error: err
                });
            }
        });
    } else {
        res.render('me', {
            "orders": [],
            "likes": [],
            "jobNo": null
        });
    }
})

router.post('/login', function (req, res, next) {
    var jobNo = req.body.jobNo;
    if (jobNo) {
        req.session.jobNo = jobNo;
        res.json({})
    } else {
        res.json({"errMsg": "请输入您的工号!"})
    }
})

router.post('/logout', function (req, res, next) {
    req.session.jobNo = null;
    res.json({});
})


module.exports = router;
