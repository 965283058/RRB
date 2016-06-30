var express = require('express');
var bodyParser = require("body-parser");
var router = express.Router();
var db = require("../../db/Schema");
var Schema = require("mongoose").Schema;

router.use('/list', function (req, res, next) {
    var name = req.body.name;
    var a = {"name": new RegExp(name), "status": 1};
    var sort = req.body.sort;
    var order = req.body.order;
    db.Dept.count(a, function (err, count) {
        if (!err) {
            var query = db.Dept.find(a);
            if (sort) {
                var s = {};
                s[sort] = (order == 'desc' ? -1 : 1);
                query.sort(s);
            }
            query.populate('creator', 'email').exec(function (error, data) {
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
    var parentId = req.body.parentId;
    var status = req.body.status || 1;
    var dept = new db.Dept({
        name: name,
        _parentId: parentId,
        status: status,  //0禁用 1正常
        creator: req.session.admin._id
    });
    dept.save(function (err) {
        if (!err) {
            res.end("{}");
        } else {
            res.end(JSON.stringify({"status": 100, "message": err.errmsg}));
        }
    });
});
router.post('/edit', function (req, res, next) {
    var id = req.body.id;
    var name = req.body.name;
    var parentId = req.body.parentId;
    var status = req.body.status || 1;
    db.Dept.findOne({_id: id}, function (err, dept) {
        if (!err) {
            if (dept) {
                dept.name = name;
                dept._parentId = parentId;
                dept.status = status;
                dept.save(function (err) {
                    if (!err) {
                        res.end(JSON.stringify({}));
                    } else {
                        res.end(JSON.stringify({"status": 12, "message": err.errmsg}));
                    }
                })
            }
            else {
                res.end(JSON.stringify({"status": 12, "message": "找不到该部门"}));
            }
        } else {
            res.end(JSON.stringify({"status": 3, "message": err.errmsg}));
        }
    })


});
router.use('/getTreeDept', function (req, res, next) {
    var a = {status: 1};
    if (req.body.parentId == "1") {
        a._parentId = "";
    }
    db.Dept.find(a, function (error, data) {
        if (!error) {
            var json = [];
            for (var i = 0; i < data.length; i++) {
                if (!data[i]._parentId) {
                    var dept = {
                        id: data[i]._id,
                        text: data[i].name,
                        children: []
                    };
                    for (var j = 0; j < data.length; j++) {
                        if (data[j]._parentId == data[i]._id) {
                            dept.children.push(
                                {
                                    id: data[j]._id,
                                    text: data[j].name
                                }
                            )
                        }
                    }
                    json.push(dept)
                }
            }
            res.json(json);
        } else {
            res.end(JSON.stringify({"status": 100, "message": error.errmsg}));
        }
    });
});
router.post('/changeStatus', function (req, res, next) {
    var id = req.body.id;
    db.Dept.findOne({"_id": id}, function (err, dept) {
        if (!err && menu) {
            dept.status = Math.abs(dept.status - 1);
            dept.save(function (err) {
                if (!err) {
                    res.end(JSON.stringify({}));
                } else {
                    res.end(JSON.stringify({"status": 22, "message": err.errmsg}));
                }
            })
        } else {
            res.end(JSON.stringify({"status": 22, "message": err ? err.errmsg : "未找到该部门"}));
        }
    })
});
module.exports = router;