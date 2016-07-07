var express = require('express');
var bodyParser = require("body-parser");
var router = express.Router();
var db = require("../../db/Schema");
var Schema = require("mongoose").Schema;


router.post('/add', function (req, res, next) {
    var text = req.body.text;
    var href = req.body.href;
    var iconCls = req.body.icon;
    var parentId = req.body.parentId;
    var status = req.body.status;
    var menu = new db.Menu({
        text: text,
        href: href,
        iconCls: iconCls,
        _parentId: parentId,
        status: 1,  //0下架 1正常,
        creator: req.session.admin._id
    });
    menu.save(function (err) {
        if (!err) {
            res.end("{}");
        } else {
            res.end(JSON.stringify({"status": 100, "message": err.errmsg}));
        }
    });
});

router.post('/edit', function (req, res, next) {
    var id = req.body.id;
    var text = req.body.text;
    var href = req.body.href;
    var iconCls = req.body.icon;
    var parentId = req.body.parentId;
    var status = parseInt(req.body.status) || 0;
    db.Menu.findOne({_id: id}, function (err, menu) {
        if (!err) {
            if (menu) {
                menu.text = text;
                menu.href = href;
                menu.iconCls = iconCls;
                menu._parentId = parentId;
                menu.status = status;
                menu.createTime=Date.now();
                menu.save(function (err) {
                    if (!err) {
                        res.end(JSON.stringify({}));
                    } else {
                        console.info(err)
                        res.end(JSON.stringify({"status": 11, "message": err.errmsg}));
                    }
                })
            }
            else {
                res.end(JSON.stringify({"status": 12, "message": "找不到该菜单"}));
            }
        } else {
            res.end(JSON.stringify({"status": 3, "message": err.errmsg}));
        }
    })


});

router.use('/list', function (req, res, next) {
    var text = req.body.name;
    var a = {"text": new RegExp(text)};
    var sort = req.body.sort;
    var order = req.body.order;
    db.Menu.count(a, function (err, count) {
        if (!err) {
            var query = db.Menu.find(a);
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

router.use('/getTreeMenu', function (req, res, next) {
    var a = {status: 1};
    if (req.body.parentId == "1") {
        a._parentId = "";
    }
    if (!req.session.admin.superAdmin) {
        a._id = {$in: req.session.admin.power};
    }
    db.Menu.find(a, '_id text iconCls _parentId href', function (error, data) {
        if (!error) {
            var json = [];
            for (var i = 0; i < data.length; i++) {
                if (!data[i]._parentId) {
                    var menu = {
                        id: data[i]._id,
                        text: data[i].text,
                        iconCls: data[i].iconCls,
                        children: []
                    };
                    for (var j = 0; j < data.length; j++) {
                        if (data[j]._parentId == data[i]._id) {
                            menu.children.push(
                                {
                                    id: data[j]._id,
                                    text: data[j].text,
                                    iconCls: data[j].iconCls,
                                    href: data[j].href,
                                }
                            )
                        }
                    }
                    json.push(menu)
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
    db.Menu.findOne({"_id": id}, function (err, menu) {
        if (!err && menu) {
            menu.status = Math.abs(menu.status - 1);
            menu.save(function (err) {
                if (!err) {
                    res.end(JSON.stringify({}));
                } else {
                    res.end(JSON.stringify({"status": 22, "message": err.errmsg}));
                }
            })
        } else {
            res.end(JSON.stringify({"status": 22, "message": err ? err.errmsg : "未找到该菜单"}));
        }
    })
});

module.exports = router;