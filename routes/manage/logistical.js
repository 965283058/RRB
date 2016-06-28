var express = require('express');
var bodyParser = require("body-parser");
var router = express.Router();
var db = require("../../db/Schema");
var Schema = require("mongoose").Schema;


router.use('/list', function (req, res, next) {
    var sort = req.body.sort;
    var order = req.body.order;
    db.Logistical.count({}, function (err, count) {
        if (!err) {
            var query = db.Logistical.find();
            var a = {};
            if (sort) {
                var a = {};
                a[sort] = (order == 'desc' ? -1 : 1);
                query.sort(a);
            }
            query.exec(a, function (error, data) {
                if (!error) {
                    res.end(JSON.stringify({"rows": data || [], "total": count}));
                } else {
                    res.end(JSON.stringify({"status": 100, "message": error.errmsg}));
                }
            });
        } else {
            res.end(JSON.stringify({"status": 100, "message": err.errmsg}));
        }
    })
});
router.post('/add', function (req, res, next) {
    var name = req.body.name;
    var status = req.body.status || 1;
    var a = new db.Logistical({
        name: name,
        status: status
    })
    a.save(function (err) {
        if (!err) {
            res.end(JSON.stringify({}));
        } else {
            res.end(JSON.stringify({"message": err.errmsg}));
        }
    })
});

router.post('/changeStatus', function (req, res, next) {
    var id = req.body.id;
    db.Logistical.findOne({"_id": id}, function (err, logistical) {
        logistical.status = Math.abs(logistical.status - 1);
        logistical.save(function (err) {
            if (!err) {
                res.end(JSON.stringify({}));
            } else {
                res.end(JSON.stringify({"message": err.errmsg}));
            }
        })
    })
});

module.exports = router;