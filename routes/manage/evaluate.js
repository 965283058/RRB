var express = require('express');
var bodyParser = require("body-parser");
var router = express.Router();
var db = require("../../db/Schema");
var Schema = require("mongoose").Schema;
var fs = require("fs");


router.use('/list', function (req, res, next) {
    var prodectId = req.body.prodectId;
    var status = req.body.status;
    var beginDate = req.body.beginDate;
    var endDate = req.body.endDate;

    var page = parseInt(req.body.page);
    var rows = parseInt(req.body.rows);
    var sort = req.body.sort;
    var order = req.body.order;


    var a = {};
    if (prodectId) {
        a.prodectId = prodectId;
    }
    if (status) {
        a.status = parseInt(status);
    }
    if (beginDate) {
        var bDate = new Date(beginDate);
        bDate.setHours(0, 0, 0, 0);
        a.createTime = {"$gte": bDate.getTime()}
    }
    if (endDate) {
        var arr = endDate.split("-");
        var date = new Date(arr[0], parseInt(arr[1], 10) - 1, arr[2]).getTime() + 86400000;
        if (a.createTime) {
            a.createTime["$lt"] = date;
        } else {
            a.createTime = {"$lt": date};
        }
    }
    db.Evaluate.count(a, function (err, count) {
        if (!err) {
            var query = db.Evaluate.find(a);
            query.limit(rows);
            query.skip((page - 1) * rows);
            if (sort) {
                var s = {};
                s[sort] = (order == 'desc' ? -1 : 1);
                query.sort(s);
            }
            query.populate('prodectId', 'prodectName').populate('orderId', 'name').exec(function (error, data) {
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

router.post('/changeStatus', function (req, res, next) {
    var id = req.body.id;
    db.Evaluate.findOne({"_id": id}, function (err, evaluate) {
        if (!err && evaluate) {
            evaluate.status = Math.abs(evaluate.status - 1);
            evaluate.save(function (err) {
                if (!err) {
                    res.end(JSON.stringify({}));
                } else {
                    res.end(JSON.stringify({"status": 22, "message": err.errmsg}));
                }
            })
        } else {
            res.end(JSON.stringify({"status": 22, "message": err ? err.errmsg : "未找到该条评论"}));
        }
    })
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

router.post('/addStock', function (req, res, next) {
    var id = req.body.id;
    var addStock = parseInt(req.body.addStock);
    if (isNaN(addStock) || addStock <= 0) {
        return res.end(JSON.stringify({"status": 22, "message": "增加库存数量错误!"}));
    }
    db.Prodect.findOne({"_id": id}, function (err, prodect) {
        if (!err && prodect) {
            prodect.stock += addStock;
            prodect.lastEidtor = req.session.admin._id;
            prodect.lastEidtTime = new Date();
            prodect.save(function (err) {
                if (!err) {
                    res.end(JSON.stringify({}));
                } else {
                    res.end(JSON.stringify({"status": 22, "message": err.errmsg}));
                }
            })
        } else {
            res.end(JSON.stringify({"status": 22, "message": err ? err.errmsg : "未找到该商品"}));
        }
    })
});

router.post('/changeStock', function (req, res, next) {
    var id = req.body.id;
    var stock = parseInt(req.body.stock);
    if (isNaN(stock) || stock <= 0) {
        return res.end(JSON.stringify({"status": 22, "message": "库存数量错误!"}));
    }
    db.Prodect.findOne({"_id": id}, function (err, prodect) {
        if (!err && prodect) {
            prodect.stock = stock;
            prodect.lastEidtor = req.session.admin._id;
            prodect.lastEidtTime = new Date();
            prodect.save(function (err) {
                if (!err) {
                    res.end(JSON.stringify({}));
                } else {
                    res.end(JSON.stringify({"status": 22, "message": err.errmsg}));
                }
            })
        } else {
            res.end(JSON.stringify({"status": 22, "message": err ? err.errmsg : "未找到该商品"}));
        }
    })
});


module.exports = router;