var express = require('express');
var router = express.Router();
var adminManage = require('./manage/manage');
var prodect = require('./prodect');
var cart = require('./cart');
var db = require("../db/Schema");
var Schema = require("mongoose").Schema;
var async = require("async");
var fs = require("fs");

router.use('/submitCart', function (req, res, next) {
    var prodects = req.body.prodects;
    //var type = req.body.type;
    var no = Date.now() + Math.random().toString().split(".").pop();
    req.session["prodect_" + no] = JSON.parse(prodects);
    //req.session["order_" + no] = type;
    res.json({"code": no});
});

router.get('/:id', function (req, res, next) {
    var id = req.params.id;
    getOrder(id, false, req, res);

})
router.post('/getOrder', function (req, res, next) {
    var id = req.body.id;
    getOrder(id, true, req, res);
})
function getOrder(id, isMoblie, req, res) {
    var prodects = req.session["prodect_" + id];
    if (!prodects) {
        var result = {
            message: "未找到订单,请返回购物车重新结算！",
            error: null
        }
        if (isMoblie) {
            res.json(result)
        }
        else {
            res.render('error', result);
        }
        return;
    }
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
        },
        selfAddess: function (cb) {
            fs.readFile("../uploads/selfAddess.txt", 'utf-8', function (err, data) {
                if (!err) {
                    cb(null, data);
                } else {
                    cb(err, null);
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
                "jobNo": req.session["jobNo"],
                "selfAddess": results.selfAddess
            }
            if (isMoblie) {
                res.json(json);
            } else {
                res.render('order', json);
            }

        } else {
            if (isMoblie) {
                res.json({
                    message: err.message,
                    error: err
                });
            } else {
                res.render('error', {
                    message: err.message,
                    error: err
                });
            }
        }
    });
}

router.post("/submitOrder", function (req, res, next) {
    var id = req.body.id;
    var prodects = req.session["prodect_" + id];
    if (!prodects || prodects.length == 0) {
        res.json({"errMsg": "未找到商品"});
        return;
    }
    var ids = [];
    for (var i = 0; i < prodects.length; i++) {
        ids.push(prodects[i].prodectId);
    }

    db.Prodect.find({_id: {"$in": ids}}, function (err, prods) {
        if (!err && prods.length > 0) {
            for (var i = 0; i < prods.length; i++) {
                for (var j = 0; j < prodects.length; j++) {
                    if (prods[i]._id.toString() == prodects[j].prodectId.toString()) {
                        if (prods[i].stock < prodects[j].count) {
                            res.json({
                                "errMsg": prods[i].prodectName + "库存不足，无法发货!"
                            });
                            return;
                        }
                        if (prods[i].status != 1) {
                            res.json({"errMsg": prods[i].prodectName + "已下架!"});
                            return;
                        }
                        break;
                    }
                }
            }
            //开始创建订单
            var jobNO = req.body.jobNO;
            var name = req.body.name;
            var dept = req.body.dept;
            //var type = req.body.type;
            var logistical = req.body.logistical;
            var addess = req.body.addess || null;
            var remark = req.body.remark || '';
            var order = new db.Order({
                jobNo: jobNO,
                name: name,
                dept: dept,
                //type: type,//0 送人 1自用
                logistical: logistical, //物流方式
                addess: addess,
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
            order.save(function (saveErr) {
                if (!saveErr) {
                    req.session["jobNo"] = jobNO;
                    req.session["prodect_" + id] = null;
                    req.session["order_" + id] = null;
                    res.json({});
                }
                else {
                    res.json({"errMsg": "提交失败:" + saveErr.message});
                }
            })
        } else {
            res.json({"errMsg": err.message || "未查询到订单商品！"});
        }
    })
})

router.get("/delOrder/:id", function (req, res, next) {
    var id = req.params.id;
    delOrder(id, false, res);
})
router.post("/delOrder", function (req, res, next) {
    var id = req.body.id;
    delOrder(id, true, res);
})
function delOrder(id, isMoblie, res) {
    db.Order.findOne({"_id": id}, function (err, order) {
        if (!err && order) {
            if (order.status == 0 || order.status == -2) {
                var errJosn = {
                    message: "订单不可删除",
                    error: null
                };
                if (isMoblie) {
                    res.json(errJosn);
                } else {
                    res.render('error', errJosn);
                }

            } else {
                order.status = -2;
                order.save(function (err) {
                    if (isMoblie) {
                        if (!err) {
                            res.json({});
                        } else {
                            res.json({
                                message: err.message,
                                error: err
                            });
                        }
                    } else {
                        if (!err) {
                            res.redirect("/me");
                        } else {
                            res.render('error', {
                                message: err.message,
                                error: err
                            });
                        }
                    }
                })
            }
        } else {
            var errJosn = {
                message: err.message || "未找到该订单！",
                error: err
            };
            if (isMoblie) {
                res.json(errJosn);
            } else {
                res.render('error', errJosn);
            }
        }
    })
}

router.post("/cancalOrder", function (req, res, next) {
    var id = req.body.id;
    db.Order.findOne({"_id": id}, function (err, order) {
        if (!err && order) {
            if (order.status != 0) {
                req.json({"errMsg": err.message || "订单不可取消！"});
            } else {
                order.status = -1;
                order.save(function (error) {
                    if (!error) {
                        res.json({});
                    } else {
                        console.info(error)
                        res.json({"errMsg": error.message});
                    }
                })
            }
        } else {
            res.json({"errMsg": err.message || "未找到该订单！"});
        }
    })
})

router.post("/evaluate", function (req, res, next) {
    var jobNo = req.session.jobNo;
    if (!jobNo) {
        res.json({"message": "请输入工号!"});
        return;
    }
    var prodectId = req.body.prodectId;
    var leveal = req.body.leveal;
    var content = req.body.content;
    var orderId = req.body.orderId;

    var evaluate = new db.Evaluate({
        prodectId: prodectId,
        orderId: orderId,
        jobNo: jobNo,
        level: leveal,
        content: content,
        status: 0,   //0禁用 1正常
    })
    evaluate.save(function (error) {
        if (!error) {
            db.Order.findOne({"_id": orderId}, function (orderErr, order) {
                if(!orderErr&&order){
                    for (var i = 0; i < order.prodectList.length; i++) {
                        if (order.prodectList[i].prodectId == prodectId) {
                            order.prodectList[i].evaluateId = evaluate._id;
                            break;
                        }
                    }
                    var isAll = true;
                    for (var i = 0; i < order.prodectList.length; i++) {  //查看是否还有未评分的商品
                        if (!order.prodectList[i].evaluateId) {
                            isAll = false;
                            break;
                        }
                    }
                    if (isAll) {//如果所有商品都已评分
                        order.status = 2;
                    }
                    order.save();
                }else{
                    console.info(orderErr||"没找到订单")
                }
            })
            res.json({});
        } else {
            res.json({"message": error.message});
        }
    })
})

router.post("/getOrderInfo", function (req, res, next) {
    var id = req.body.id;
    var query = db.Order.findOne({
        "_id": id
    }).populate('prodectList.prodectId', 'prodectName img').populate('dept', 'name').populate('sender', 'email name').populate('addess', 'name');
    query.exec(function (error, data) {
        if (!error) {
            res.json(data);
        } else {
            res.json({"message": error.message || "未找到改订单"});
        }
    })
})
module.exports = router;
