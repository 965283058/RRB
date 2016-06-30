var express = require('express');
var router = express.Router();
var adminManage = require('./manage/manage');
var prodect = require('./prodect');
var cart = require('./cart');
var db = require("../db/Schema");
var Schema = require("mongoose").Schema;
var async = require("async");

router.use('/submitCart', function (req, res, next) {
    var prodects = req.body.prodects;
    var type = req.body.type;
    var no = Date.now() + Math.random().toString().split(".").pop();
    req.session["prodect_" + no] = JSON.parse(prodects);
    req.session["order_" + no] = type;
    res.json({"code": no});
});

router.get('/:id', function (req, res, next) {
    var id = req.params.id;
    var prodects = req.session["prodect_" + id];
    var type = req.session["order_" + id];
    async.parallel({
        addess: function (cb) {
            db.Addess.find({"status": 1}, function (err, data) {
                if (!err) {
                    cb(null, data);
                } else {
                    cb(err, null);
                }
            })
        },
        dept: function (cb) {
            db.Dept.find({"status": 1}, function (error, data) {

                if (!error) {
                    var json = [];
                    for (var i = 0; i < data.length; i++) {
                        if (!data[i]._parentId) {
                            var dept = {
                                id: data[i]._id,
                                name: data[i].name,
                                children: []
                            };
                            for (var j = 0; j < data.length; j++) {
                                if (data[j]._parentId == data[i]._id) {
                                    dept.children.push(
                                        {
                                            id: data[j]._id,
                                            name: data[j].name
                                        }
                                    )
                                }
                            }
                            json.push(dept)
                        }
                    }
                    cb(null, json);
                } else {
                    cb(error, null);
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
                "prodects": prodects,
                "addessList": results.addess,
                "deptList": results.dept,
                "total": total,
                "id": id.toString(),
                "type": type
            }
            res.render('order', json);
        } else {
            res.render('error', {
                message: err.message,
                error: err
            });
        }
    });


})

router.post("/submitOrder", function (req, res, next) {
    var id = req.body.id;
    var prodects = req.session["prodect_" + id];
    if (!prodects || prodects.length == 0) {
        res.json({"errMsg": "未找到商品"});
        return;
    }
    var jobNO = req.body.jobNO;
    var name = req.body.name;
    var dept = req.body.dept;
    var type = req.body.type;
    var logistical = req.body.logistical;
    var addess = req.body.addess;
    var remark = req.body.remark || '';
    var order = new db.Order({
        jobNo: jobNO,
        name: name,
        dept: dept,
        type: type,//0 送人 1自用
        logistical: logistical, //物流方式
        createTime: Date.now(),
        remark: remark,
        status: 0
    });
    var total = 0;
    var ps = [];
    for (var k in prodects) {
        ps.push({
            prodectId: prodects[k].prodectId,
            price: prodects[k].price,
            count: prodects[k].count
        })
        total += prodects[k].price * prodects[k].count;
    }
    order.prodectList = ps;
    order.money = total;
    order.save(function (err) {
        if (!err) {
            req.session["prodect_" + id] = null;
            req.session["order_" + id] = null;
            res.json({});
        }
        else {
            res.json({"errMsg": "提交失败:" + err.errMsg});
        }
    })

})

module.exports = router;
