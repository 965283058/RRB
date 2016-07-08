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
                       if(data){
                           cb(null, data.prodectList);
                       }else{
                           cb(null,[]);
                       }
                    } else {
                        cb(err, null);
                    }
                })
            }
        }, function (err, results) {
            if (!err) {
                var json = {
                    "orders":results.order,
                    "likes": results.like,
                    "jobNo": jobNo,
                    "evaluates": results.evaluate,
                }
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
            "jobNo": null,
            "evaluates":[]
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
router.use('/cancelLike/:id', function (req, res, next) {
    var jobNo=req.session.jobNo;
    if(jobNo){
        var id=req.params.id;
        db.Like.update({"jobNo":jobNo}, {"$pull":{"prodectList":id}},function(err){
            if(err){
                console.info(err)
            }
            res.redirect("/me");
        });

    }

})



module.exports = router;
