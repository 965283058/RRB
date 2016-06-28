var express = require('express');
var bodyParser = require("body-parser");
var router = express.Router();
var db = require("../../db/Schema");
var Schema = require("mongoose").Schema;
var fs = require("fs");
var async = require("async");


router.use('/list', function (req, res, next) {
    var prodectId = req.body.prodectId;
    var name = req.body.name;
    var jobNo = req.body.jobNo;
    var status = req.body.status;
    var logisticalId = req.body.logisticalId;
    var beginDate = req.body.beginDate;
    var endDate = req.body.endDate;

    var page = parseInt(req.body.page);
    var rows = parseInt(req.body.rows);
    var sort = req.body.sort;
    var order = req.body.order;


    var a = {};
    if (prodectId) {
        a.prodectList = {"$elemMatch": {"prodectId": prodectId}};
    }
    if (jobNo) {
        a.jobNo = jobNo;
    }
    if (name) {
        a.name = new RegExp(name);
    }
    if (status) {
        a.status = parseInt(status);
    }
    if (logisticalId) {
        a.logisticalId = parseInt(logisticalId);
    }

    if (beginDate) {
        var bDate = new Date(beginDate);
        bDate.setHours(0, 0, 0, 0);
        a.createTime = {"$gte": bDate}
    }
    if (endDate) {
        var arr = endDate.split("-");
        var date = new Date(arr[0], parseInt(arr[1], 10) - 1, arr[2]).getTime() + 86400000;
        if (a.createTime) {
            a.createTime["$lt"] = new Date(date);
        } else {
            a.createTime = {"$lt": new Date(date)};
        }
    }
    db.Order.count(a, function (err, count) {
        if (!err) {
            var query = db.Order.find(a);
            query.limit(rows);
            query.skip((page - 1) * rows);
            if (sort) {
                var s = {};
                s[sort] = (order == 'desc' ? -1 : 1);
                query.sort(s);
            }
            query.populate('prodectList.prodectId', 'prodectName').populate('logisticalId', 'name').populate('sender', 'email').sort({"_id": -1}).exec(function (error, data) {
                if (!error) {
                    res.end(JSON.stringify({"rows": data || [], "page": page, "total": count}));
                } else {
                    res.end(JSON.stringify({"status": 100, "message": error.errmsg}));
                }
            })
        } else {
            res.end(JSON.stringify({"status": 110, "message": err.errmsg}));
        }
    });
});

router.post('/send', function (req, res, next) {
    var id = req.body.id;


    db.Order.findOne({"_id": id}, function (err, order) {
            if (!err && order) {
                if (order.status == 0) {
                    var prodects = order.prodectList;
                    var ids = [];
                    for (var i = 0; i < order.prodectList.length; i++) {
                        ids.push(order.prodectList[i].prodectId);
                    }
                    db.Prodect.find({_id: {"$in": ids}}, function (err, prods) {
                        if (!err || prods.length == 0) {
                            for (var i = 0; i < prods.length; i++) {
                                for (var j = 0; j < prodects.length; j++) {
                                    if (prods[i]._id.toString() == prodects[j].prodectId.toString()) {
                                        if (prods[i].stock < prodects[j].count) {
                                            res.end(JSON.stringify({
                                                "status": 34,
                                                "message": prods[i].prodectName + "库存不足，无法发货!"
                                            }));
                                            return;
                                        }
                                        break;
                                    }
                                }
                            }
                            //var funcs = [];
                            for (var i = 0; i < prods.length; i++) {
                                for (var j = 0; j < prodects.length; j++) {
                                    if (prods[i]._id.toString() == prodects[j].prodectId.toString()) {
                                        var target = prods[i].stock - prodects[j].count;
                                        db.Prodect.update({_id: prods[i]._id}, {$set: {stock: target}}, function (err) {
                                            if (err) {
                                                res.end(JSON.stringify({
                                                    "status": 33,
                                                    "message": err.errmsg || "订单发货失败！"
                                                }));
                                            }
                                        });
                                        break;
                                    }
                                }
                            }
                            order.status = 1;
                            order.sendTime = new Date();
                            order.sender = req.session.admin._id;
                            order.save(function (err, data) {
                                res.end(JSON.stringify({}));
                            })
                        } else {
                            res.end(JSON.stringify({"status": 33, "message": err.errmsg || "未查询到订单商品！"}));
                        }
                    })
                }
                else if (order.status > 0) {
                    res.end(JSON.stringify({"status": 33, "message": "该订单已发货"}));
                }
                else {
                    res.end(JSON.stringify({"status": 33, "message": "该订单已取消"}));
                }

            } else {
                res.end(JSON.stringify({"status": 22, "message": err ? err.errmsg : "未找到该订单"}));
            }
        }
    )
});

router.post('/getOne', function (req, res, next) {
    var id = req.body.id;
    var query = db.Prodect.findOne({"_id": id});
    query.populate('categoryId', 'categoryName').populate('creator', 'email').populate('lastEidtor', 'email').exec(function (err, prodect) {
            if (!err && prodect) {
                res.json({"prodect": prodect});
            } else {
                res.end(JSON.stringify({"status": 22, "message": err ? err.errmsg : "未找到该商品"}));
            }
        }
    )
});

module.exports = router;