var express = require('express');
var bodyParser = require("body-parser");
var router = express.Router();
var db = require("../../db/Schema");
var Schema = require("mongoose").Schema;
var crypto = require('crypto');

router.use('/login', function (req, res, next) {
    var email = req.body.username;
    var pwd = req.body.pwd;
    db.Admin.findOne({"email": email}, function (err, user) {
        if (!err) {
            res.charset = "UTF-8";
            if (user) {
                var hasher = crypto.createHash("md5");
                hasher.update(pwd);
                var pwd_md5 = hasher.digest('hex');//hashmsg为加密之后的数据
                if (user.pwd == pwd_md5) {
                    if (user.errCount >= 5) {
                        res.end(JSON.stringify({"status": 2, "message": "账号锁定中"}));
                        return;
                    }
                    user.lastLoginTime = new Date();
                    user.errCount = 0;
                    req.session.admin = user;
                    user.save();
                    res.end(JSON.stringify({"user": user}));
                } else {
                    if (user.errCount < 5) {
                        res.end(JSON.stringify({"status": 2, "message": "用户名或密码输入错误"}));
                        user.errCount++;
                        user.save();
                    } else {
                        res.end(JSON.stringify({"status": 2, "message": "用户名密码输入错误超过5次,账号锁定半小时"}));
                        setTimeout(function () {
                            user.errCount = 0;
                            user.save();
                        }, 1000 * 60 * 30);
                    }
                }
            } else {
                res.end(JSON.stringify({"status": 1, "message": "该用户不存在"}));
            }
        }
        else {
            res.end(JSON.stringify({"status": 100, "message": err.errmsg}));
        }
    })
});

router.post('/logout', function (req, res, next) {
    req.session.adminId = null;
    res.end(JSON.stringify({}));
});


router.use('/list', function (req, res, next) {
    var val = req.body.val;
    var page = parseInt(req.body.page);
    var rows = parseInt(req.body.rows);
    var sort = req.body.sort;
    var order = req.body.order;
    var where = {"email": new RegExp(val)};
    db.Admin.count(where, function (err, count) {
        if (!err) {
            var query = db.Admin.find(where);
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
    var email = req.body.email;
    var power = req.body["power[]"];
    console.info(power)
    db.Admin.count({email: email}, function (err, count) {
        if (!err) {
            if (count == 0) {
                var hasher = crypto.createHash("md5");
                hasher.update(email);
                var pwd_md5 = hasher.digest('hex');//hashmsg为加密之后的数据
                var a = new db.Admin({
                    email: email,
                    name: name,
                    pwd: pwd_md5,
                    errCount: 0,
                    superAdmin: 0,
                    power: power,
                    status: 1,
                    creator: req.session.admin._id,
                    createTime: Date.now(),
                    lastLoginTime: null
                })
                a.save(function (err) {
                    if (!err) {
                        res.end(JSON.stringify({}));
                    } else {
                        res.end(JSON.stringify({"status": 12, "message": err.errmsg}));
                    }
                })
            }
            else {
                console.info(count)
                res.end(JSON.stringify({"status": 12, "message": "用户邮箱已存在"}));
            }
        } else {
            res.end(JSON.stringify({"status": 3, "message": err.errmsg}));
        }
    })


});

router.post('/edit', function (req, res, next) {
    var id = req.body.id;
    var name = req.body.name;
    var email = req.body.email;
    var power = req.body["power[]"];
    db.Admin.findOne({_id: id}, function (err, user) {
        if (!err) {
            if (user) {
                user.email = email;
                user.name = name;
                user.power = power;
                user.save(function (err) {
                    if (!err) {
                        res.end(JSON.stringify({}));
                    } else {
                        res.end(JSON.stringify({"status": 12, "message": err.errmsg}));
                    }
                })
            }
            else {
                res.end(JSON.stringify({"status": 12, "message": "找不到该用户"}));
            }
        } else {
            res.end(JSON.stringify({"status": 3, "message": err.errmsg}));
        }
    })


});

router.use('/resetPwd', function (req, res, next) {
    var id = req.body.id;
    db.Admin.findOne({"_id": id}, function (err, user) {
        if (!err) {
            if (user) {
                var hasher = crypto.createHash("md5");
                hasher.update(user.email);
                user.pwd = hasher.digest('hex');
                user.save(function (err) {
                    if (!err) {
                        res.json({});
                    } else {
                        res.json({"status": 100, "message": err.errmsg});
                    }
                });
            } else {
                res.json({"status": 100, "message": "未找到该用户"});
            }
        }
        else {
            res.end(JSON.stringify({"status": 100, "message": err.errmsg}));
        }
    })
});

router.use('/del', function (req, res, next) {
    var id = req.body.id;
    if (id == req.session.admin._id) {
        return res.end(JSON.stringify({"status": 22, "message": "不能删除当前登录账户"}));
    }
    db.Admin.findOne({"_id": id}, function (err, user) {
        if (!err) {
            if (user) {
                user.status = -1;
                user.save(function (err) {
                    if (!err) {
                        res.json({});
                    } else {
                        res.json({"status": 100, "message": err.errmsg});
                    }
                });
            } else {
                res.json({"status": 100, "message": "未找到该用户"});
            }
        }
        else {
            res.end(JSON.stringify({"status": 100, "message": err.errmsg}));
        }
    })
});

router.post('/changeStatus', function (req, res, next) {
    var id = req.body.id;
    if (id == req.session.admin._id) {
        return res.end(JSON.stringify({"status": 22, "message": "不能改变当前登录账户的状态"}));
    }
    db.Admin.findOne({"_id": id}, function (err, user) {
        if (!err && user) {
            user.status = Math.abs(user.status - 1);
            user.save(function (err) {
                if (!err) {
                    res.end(JSON.stringify({}));
                } else {
                    res.end(JSON.stringify({"status": 22, "message": err.errmsg}));
                }
            })
        } else {
            res.end(JSON.stringify({"status": 22, "message": err ? err.errmsg : "未找到该用户"}));
        }
    })


});
module.exports = router;