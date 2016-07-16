var express = require('express');
var bodyParser = require("body-parser");
var router = express.Router();
var db = require("../../db/Schema");
var Schema = require("mongoose").Schema;


router.use('/list', function (req, res, next) {
    var val = req.body.val;
    var page = parseInt(req.body.page);
    var rows = parseInt(req.body.rows);
    var sort = req.body.sort;
    var order = req.body.order;
    var where = {"categoryName": new RegExp(val)};
    db.Category.count(where, function (err, count) {
        if (!err) {
            var query = db.Category.find(where);
            if (page && rows) {
                query.limit(rows);
                query.skip((page - 1) * rows);
            }
            if (sort) {
                var a = {};
                a[sort] = (order == 'desc' ? -1 : 1);
                query.sort(a);
            }
            query.exec(function (error, data) {
                if (!error) {
                    res.end(JSON.stringify({"rows": data || [], "page": page, "total": count}));
                } else {
                    res.end(JSON.stringify({"status": 100, "message": error.errmsg}));
                }
            })
        } else {
            res.end(JSON.stringify({"status": 100, "message": err.errmsg}));
        }
    })
});
router.post('/add', function (req, res, next) {
    var name = req.body.name;
    var price = req.body.price;
    var status = req.body.status || 1;
    var c = new db.Category({
        categoryName: name,
        categoryPrice: price,
        status: status,
        creator: req.session.admin._id
    })
    c.save(function (err) {
        if (!err) {
            res.end(JSON.stringify({}));
        } else {
            res.end(JSON.stringify({"message": err.errmsg}));
        }
    })
});


router.use('/getCategory', function (req, res, next) {
    db.Category.find({"status": 1}, 'categoryName categoryPrice', {sort: {"categoryPrice":1}},function (error, data) {
        if (!error) {
            res.end(JSON.stringify(data));
        } else {
            res.end(JSON.stringify({"status": 100, "message": error.errmsg}));
        }
    })
});

router.post('/changeStatus', function (req, res, next) {
    var id = req.body.id;
    db.Category.findOne({"_id": id}, function (err, cate) {
        if (!err && cate) {
            if(cate.status==1) {
                db.Prodect.count({"categoryId": id, "status": 1}, function (err, count) {
                    if (!err) {
                        if (count > 0) {
                            res.json({"status": 32, "message": "该类别下有未下架的商品,无法禁用该类别！"});
                        } else {
                            cate.status = Math.abs(cate.status - 1);
                            cate.save(function (err) {
                                if (!err) {
                                    res.json({});
                                } else {
                                    res.json({"status": 21, "message": err.message});
                                }
                            })
                        }
                    } else {
                        res.json({"status": 23, "message": err.message});
                    }
                })
            }else{
                cate.status = Math.abs(cate.status - 1);
                cate.save(function (err) {
                    if (!err) {
                        res.json({});
                    } else {
                        res.json({"status": 21, "message": err.message});
                    }
                })
            }

        } else {
            res.json({"status": 22, "message": err ? err.message : "未找到该分类！"});
        }
    })



});

module.exports = router;