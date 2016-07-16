var express = require('express');
var router = express.Router();
var db = require("../db/Schema");
var Schema = require("mongoose").Schema;
var async = require("async");



router.post('/login', function (req, res, next) {
    var jobNo = req.body.jobNo;
    console.info("jobNo",jobNo)
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


router.get('/cancelLike/:id', function (req, res, next) {
    var jobNo = req.session.jobNo;
    if (jobNo) {
        var id = req.params.id;
        db.Like.update({"jobNo": jobNo}, {"$pull": {"prodectList": id}}, function (err) {
            if (err) {
                console.info(err)
            }
            res.redirect("/me");
        });
    }
})
router.use('/', function (req, res, next) {
    var jobNo = req.session.jobNo;
    if (jobNo) {
        async.parallel({
            order: function (cb) {
                var query = db.Order.find({
                    "status": {"$gt": -2},
                    "jobNo": jobNo
                }).sort({"createTime":-1}).populate('prodectList.prodectId', 'prodectName img').populate('dept', 'name').populate('sender', 'email').populate('addess', 'name');
                query.exec(function (err, data) {
                    if (!err) {
                        cb(null, data);
                    } else {
                        cb(err, null);
                    }
                })
            },

            evaluate: function (cb) {
                var query = db.Evaluate.find({"jobNo": jobNo}).populate('prodectId', 'prodectName').sort({"createTime": -1});
                query.exec(function (err, data) {
                    if (!err) {
                        cb(null, data);
                    } else {
                        cb(err, null);
                    }
                })
            },
            like: function (cb) {
                var query = db.Like.findOne({"jobNo": jobNo}).populate('prodectList', 'prodectName img');
                query.exec(function (err, data) {
                    if (!err) {
                        if (data) {
                            cb(null, data.prodectList);
                        } else {
                            cb(null, []);
                        }
                    } else {
                        cb(err, null);
                    }
                })
            }
        }, function (err, results) {
            if (!err) {
                var json = {
                    "orders": results.order,
                    "likes": results.like,
                    "jobNo": jobNo,
                    "evaluates": results.evaluate,
                }
                if (req.method == "GET") {
                    res.render('me', json);
                } else {
                    res.json(json);
                }
            } else {
                var errJson = {
                    message: err.message,
                    error: err
                };
                if (req.method == "GET") {
                    res.render('error', errJson);
                } else {
                    req.json(errJson);
                }
            }
        });
    } else {
        var json = {
            "orders": [],
            "likes": [],
            "jobNo": null,
            "evaluates": []
        };
        if (req.method == "GET") {
            res.render('me', json);
        } else {
            res.json(json);
        }

    }
})

module.exports = router;
