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

module.exports = router;