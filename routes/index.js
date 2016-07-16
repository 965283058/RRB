var express = require('express');
var router = express.Router();
var async=require("async");
var adminManage = require('./manage/manage');
var prodect = require('./prodect');
var order = require('./order');
var cart = require('./cart');
var me = require('./me')

var db = require("../db/Schema");
var Schema = require("mongoose").Schema;

router.use('/manage', adminManage);
router.use('/prodect', prodect);
router.use('/order', order);
router.use('/cart', cart);
router.use('/me', me);

router.get('/', function (req, res, next) {
    getProdectData(null, null, res)
});
router.get('/search', function (req, res, next) {
    var name = req.query.val.trim();
    getProdectData(null, name, res)
});

router.get('/:categoryId', function (req, res, next) {
    var categoryId = req.params.categoryId;
    if (categoryId) {
        getProdectData(categoryId, null, res)
    }
});

function getProdectData1(categoryId, name, res, isMoblie) {
    db.Category.find({"status": 1}, '', {sort: {"categoryPrice": 1}}, function (err, categorys) {
        if (!err) {
            var where = {"status": 1};
            if (categoryId) {
                where.categoryId = categoryId;
            }
            if (name) {
                where.prodectName = new RegExp(name);
            }
            var json = [];
            for (var i = 0; i < categorys.length; i++) {
                var c = {
                    "_id": categorys[i]._id,
                    "categoryName": categorys[i].categoryName,
                    "categoryPrice": categorys[i].categoryPrice,
                    "prodects": []
                };
                json.push(c);
            }
            db.Prodect.find(where, '', {sort: {"price": 1}}, function (err, prodects) {
                if (!err && prodects.length > 0) {
                    for (var i = 0; i < json.length; i++) {
                        for (var j = 0; j < prodects.length; j++) {
                            if (json[i]._id.toString() == prodects[j].categoryId.toString()) {
                                json[i].prodects.push(prodects[j]);
                            }
                        }
                    }
                    var obj = {"categorys": json, "categoryId": categoryId}
                    if (!isMoblie) {
                        res.render('index', obj);
                    } else {
                        res.json(obj);
                    }
                } else {
                    if (!isMoblie) {
                        res.render('index', {"errorMsg": "暂无商品", "categorys": categorys, "categoryId": categoryId});
                    } else {
                        res.json({"errorMsg": "暂无商品", "categorys": json, "categoryId": categoryId});
                    }

                }
            })
        } else {
            if (!isMoblie) {
                res.render('index', {"errorMsg": "查询错误"});
            } else {
                res.json({"errorMsg": "查询错误"});
            }
        }
    })
}

function getProdectData(categoryId, name, res, isMoblie) {

    async.parallel({
        count: function (cb) {
            var query = db.Prodect.count({"status": 1}, function (err, count) {
                if (!err) {
                    cb(null, count);
                } else {
                    cb(err, null);
                }
            });
        },
        category: function (cb) {
            db.Category.find({"status": 1}, '', {sort: {"categoryPrice": 1}}, function (err, data) {
                if (!err) {
                    cb(null, data);
                } else {
                    cb(err, null);
                }
            });
        },
        prodect: function (cb) {
            var where = {"status": 1};
            if (categoryId) {
                where.categoryId = categoryId;
            }
            if (name) {
                where.prodectName = new RegExp(name);
            }
            db.Prodect.find(where, '', {sort: {"price": 1}}, function (err, data) {
                if (!err) {
                    cb(null, data);
                } else {
                    cb(err, null);
                }
            })
        }
    }, function (err, results) {
        if (!err) {
            var json = [];
            for (var i = 0; i < results.category.length; i++) {
                var c = {
                    "_id": results.category[i]._id,
                    "categoryName": results.category[i].categoryName,
                    "categoryPrice": results.category[i].categoryPrice,
                    "prodects": []
                };
                json.push(c);
            }

            for (var i = 0; i < json.length; i++) {
                for (var j = 0; j < results.prodect.length; j++) {
                    if (json[i]._id.toString() == results.prodect[j].categoryId.toString()) {
                        json[i].prodects.push(results.prodect[j]);
                    }
                }
            }
            var obj = {"categorys": json, "categoryId": categoryId,"count":results.count}
            if (!isMoblie) {
                res.render('index', obj);
            } else {
                res.json(obj);
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
}

router.post('/', function (req, res, next) {
    var categoryId = req.body.categoryId;
    var name = req.body.name;
    getProdectData(categoryId, name, res, true);
});

module.exports = router;
