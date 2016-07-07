var express = require('express');
var router = express.Router();

var db = require("../db/Schema");
var Schema = require("mongoose").Schema;

router.get('/:prodectId', function (req, res, next) {
    var prodectId = req.params.prodectId;
    if (prodectId) {
        var query = db.Prodect.findOne({"_id": prodectId});
        query.populate('categoryId', 'categoryName').exec(function (err, prodect) {
            if (!err && prodect) {
                db.Evaluate.find({
                    "status": 1,
                    "prodectId": prodectId
                }, '', {sort: {"createTime": -1}}, function (error, evaluates) {
                    if (!error) {
                        db.Prodect.find({"status": 1, "_id": {"$ne": prodectId}}, null, { //查询10个不等于本身的大库存商品
                            sort: {'stock': -1},
                            limit: 10
                        }, function (error, proposal) {
                            res.render('prodect', {
                                "prodect": prodect,
                                "evaluates": evaluates,
                                "proposal": proposal,
                                "jobNo": req.session.jobNo
                            });
                        })
                    } else {
                        res.render('prodect', {"errorMsg": "暂无商品", "prodect": null, "evaluates": null,
                            "jobNo": req.session.jobNo});
                    }
                })
            } else {
                res.render('prodect', {"errorMsg": "查询错误"});
            }
        })
    }
});

router.post('/like', function (req, res, next) {
    var jobNo = req.session.jobNo;
    if (!jobNo) {
        jobNo = req.body.jobNo;
        req.session.jobNo = jobNo;
    }
    if (jobNo) {
        var prodectId = req.body.prodectId;
        db.Like.findOne({"jobNo": jobNo}, function (findErr,like) {
            if(!findErr){
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
            }else{
                res.json({"errMsg":findErr.message});
            }
        })
    } else {
        res.json({"errMsg": "请输入工号!"});
    }
});


module.exports = router;
