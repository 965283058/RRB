var express = require('express');
var async = require("async");
var router = express.Router();
var db = require("../db/Schema");
var Schema = require("mongoose").Schema;

router.get('/:prodectId', function (req, res, next) {
    var prodectId = req.params.prodectId;
    if (prodectId) {
        getProdect(prodectId, false, req, res);
    }
});
router.post('/', function (req, res, next) {
    var prodectId = req.body.prodectId;
    if (prodectId) {
        getProdect(prodectId, true, req, res);
    }
});

function getProdect(prodectId, isMoblie, req, res) {
    async.parallel({
        prodect: function (cb) {
            var query = db.Prodect.findOne({"_id": prodectId}).populate('categoryId', 'categoryName');
            query.exec(function (err, data) {
                if (!err && data) {
                    cb(null, data);
                } else {
                    cb(err, null);
                }
            })
        },
        evaluates: function (cb) {
            db.Evaluate.find({
                "status": 1,
                "prodectId": prodectId
            }, '', {sort: {"createTime": -1}}, function (error, data) {
                if (!error && data) {
                    cb(null, data);
                } else {
                    cb(error, null);
                }
            })

        },
        proposal: function (cb) {
            db.Prodect.find({"status": 1, "_id": {"$ne": prodectId}}, null, { //查询10个不等于本身的大库存商品
                sort: {'stock': -1},
                limit: 10
            }, function (error, data) {
                if (!error && data) {
                    cb(null, data);
                } else {
                    cb(error, null);
                }
            })
        },
        like: function (cb) {
            if (req.session.jobNo) {
                db.Like.count({
                    "jobNo": req.session.jobNo,
                    "prodectList": {"$all": [prodectId]}
                }, function (error, num) {
                    if (!error) {
                        cb(null, num > 0);
                    } else {
                        cb(error, null);
                    }
                })
            } else {
                cb(null, false);
            }
        }
    }, function (err, results) {
        if (!err) {
            var result = {
                "prodect": results.prodect,
                "evaluates": results.evaluates,
                "proposal": results.proposal,
                "jobNo": req.session.jobNo,
                "like": results.like
            };
            if (!isMoblie) {
                res.render('prodect', result);
            } else {
                res.json(result);
            }
        } else {
            var errResult = {
                message: err.message,
                error: err
            };
            if (isMoblie) {
                res.json(errResult);
            } else {
                res.render('error', errResult);
            }
        }
    });
    /*


     }
     )
     }
     else
     {
     if (isMoblie) {
     res.json({
     "errorMsg": "暂无商品", "prodect": null, "evaluates": null,
     "jobNo": req.session.jobNo
     });
     } else {
     res.render('prodect', {
     "errorMsg": "暂无商品", "prodect": null, "evaluates": null,
     "jobNo": req.session.jobNo
     });
     }
     }
     })
     }
     else
     {
     if (isMoblie) {
     res.json({"errorMsg": "查询错误"})
     } else {
     res.render('prodect', {"errorMsg": "查询错误"});
     }

     }
     })*/
}

router.post('/like', function (req, res, next) {
    var jobNo = req.session.jobNo;
    if (!jobNo) {
        jobNo = req.body.jobNo;
        req.session.jobNo = jobNo;
    }
    if (jobNo) {
        var prodectId = req.body.prodectId;
        db.Like.findOne({"jobNo": jobNo}, function (findErr, like) {
            if (!findErr) {
                if (like) {
                    var exists = false;
                    for (var i = 0; i < like.prodectList.length; i++) {
                        if (like.prodectList[i] == prodectId) {
                            exists = true;
                            break;
                        }
                    }
                    if (!exists) {
                        like.prodectList.push(prodectId);
                    }
                } else {
                    like = new db.Like({
                        jobNo: jobNo,
                        prodectList: [prodectId]
                    })
                }
                like.save(function (err) {
                    if (!err) {
                        res.json({});
                    } else {
                        res.json({"errMsg": err.message});
                    }
                })
            } else {
                res.json({"errMsg": findErr.message});
            }
        })
    } else {
        res.json({"errMsg": "请输入工号!"});
    }
});
router.post('/cancelLike', function (req, res, next) {
    var jobNo = req.session.jobNo;
    jobNo=jobNo||req.body.jobNo;
    if (jobNo) {
        var id=req.body.prodectId;
        db.Like.update({"jobNo": jobNo}, {"$pull": {"prodectList": id}}, function (err) {
            if (err) {
                res.json({"message":err.message})
            }
            res.json({})
        });
    }
})

module.exports = router;
