var express = require('express');
var router = express.Router();
var adminManage = require('./manage/manage');
var prodect = require('./prodect');
var cart = require('./cart');
var db = require("../db/Schema");
var Schema = require("mongoose").Schema;
var async = require("async");

router.get('/', function (req, res, next) {
    var jobNO = req.session.jobNO;
    if (jobNO) {
        async.parallel({
            order: function (cb) {
                db.Order.find({"status": {"gt": -2}}, function (err, data) {
                    if (!err) {
                        cb(null, data);
                    } else {
                        cb(err, null);
                    }
                })
            },
            like: function (cb) {
                db.Like.find({"jobNO": jobNO}, function (err, data) {
                    if (!err) {
                        cb(null, data);
                    } else {
                        cb(err, null);
                    }
                });
            }
        }, function (err, results) {
            if (!err) {
                var total = 0;
                for (var k in prodects) {
                    total += prodects[k].price * prodects[k].count;
                }
                var json = {
                    "order": results.order,
                    "Like": results.like,
                    "jobNO": jobNO
                }
                res.render('me', json);
            } else {
                res.render('error', {
                    message: err.message,
                    error: err
                });
            }
        });
    } else {
        res.render('me', {
            "order": [],
            "Like": [],
            "jobNO": 0
        });
    }
})

module.exports = router;
