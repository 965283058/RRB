var express = require('express');
var router = express.Router();
var adminManage = require('./manage/manage');
var prodect = require('./prodect');
var cart = require('./cart');
var db = require("../db/Schema");
var Schema = require("mongoose").Schema;

router.use('/submitCart', function (req, res, next) {
    var prodects = req.body.prodects;
    var no = Date.now() + Math.random().toString().split(".").pop();
    req.session["prodect_" + no] = prodects;
    res.json({"code": no});
});

router.get('/:id', function (req, res, next) {
    var id=req.params.id;
    var prodects = req.session["prodect_"+id]
    db.Addess.find({"status": 1}, function (addessErr, addessData) {
        if (!addessErr && addessData.length > 0) {
            db.Logistical.find({"status": 1}, function (logisticalErr, logisticalData) {
                if (!logisticalErr && logisticalData.length > 0) {
                    res.render('order', {
                        "prodects": prodects,
                        "addessList": addessData,
                        "logisticalList": logisticalData
                    });
                } else {
                    res.render('error', {
                        message: logisticalErr.message || "暂无物流方式",
                        error: logisticalErr
                    });
                }
            })
        } else {
            res.render('error', {
                message: addessErr.message || "暂无收货地址",
                error: addessErr
            });
        }
    })

})


module.exports = router;
