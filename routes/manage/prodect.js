var express = require('express');
var bodyParser = require("body-parser");
var router = express.Router();
var db = require("../../db/Schema");
var Schema = require("mongoose").Schema;
var multer = require("multer");
var fs = require("fs");


var storage = multer.diskStorage({
    //设置上传后文件路径，uploads文件夹会自动创建。
    destination: function (req, file, cb) {
        cb(null, '../uploads/prodects')
    },
    //给上传文件重命名，获取添加后缀名
    filename: function (req, file, cb) {
        var fileFormat = '_' + Math.random().toString().split(".").pop() + "." + (file.originalname).split(".").pop();
        cb(null, 'prodect_' + Date.now() + fileFormat);
    }
});
//添加配置文件到muler对象。

var upload = multer({
    storage: storage,
    limits: {
        fileSize: 10240000
    },
    onFileSizeLimit: function (file) {
        if (file.size > 10240000) { //如果大于10M,删除它
            fs.unlink('./' + file.path)
        }
    }
});

router.post('/add', upload.array('imgFile', 30), function (req, res, next) {
    var name = req.body.name;
    var category = req.body.category;
    var price = parseFloat(req.body.price);
    var stock = parseInt(req.body.stock);
    var remark = req.body.remark;
    var status = req.body.status;
    var prodect = new db.Prodect({
        prodectName: name,
        categoryId: category,
        price: price,
        stock: stock,
        img: [],
        remark: remark,
        status: 1,  //0下架 1正常,
        creator: req.session.admin._id,
        createTime: new Date()
    });
    if (req.files.length > 0) {
        for (var i = 0; i < req.files.length; i++) {
            prodect.img.push(req.files[i].path.replace("..", ""));
        }
    }
    prodect.save(function (err) {
        if (!err) {
            res.end("{}");
        } else {
            res.end(JSON.stringify({"status": 100, "message": err.errmsg}));
        }
    });
});

router.post('/edit', upload.array('imgFile', 30), function (req, res, next) {
    var id = req.body.id;
    var name = req.body.name;
    var category = req.body.category;
    var price = parseFloat(req.body.price);
    var remark = req.body.remark;
    var imgStr = req.body.imgs;
    var img = [];
    if (imgStr) {
        img = imgStr.split("^");
    }

    db.Prodect.findOne({"_id": id}, function (err, prodect) {
        if (!err && prodect) {
            prodect.prodectName = name;
            prodect.categoryId = category;
            prodect.price = price;
            prodect.remark = remark;
            prodect.img = img;
            prodect.lastEidtor = req.session.admin._id;
            prodect.lastEidtTime = new Date();
            if (req.files.length > 0) {
                for (var i = 0; i < req.files.length; i++) {
                    prodect.img.push(req.files[i].path.replace("..", ""));
                }
            }
            prodect.save(function (err) {
                if (!err) {
                    res.end("{}");
                } else {
                    res.end(JSON.stringify({"status": 100, "message": err.errmsg}));
                }
            });
        } else {
            res.end(JSON.stringify({"status": 22, "message": err ? err.errmsg : "未找到该商品"}));
        }
    });

});

router.use('/list', function (req, res, next) {
    var name = req.body.name;
    var categoryId = req.body.categoryId;
    var status = req.body.status;
    var beginDate = req.body.beginDate;
    var endDate = req.body.endDate;

    var page = parseInt(req.body.page);
    var rows = parseInt(req.body.rows);
    var sort = req.body.sort;
    var order = req.body.order;


    var a = {};
    if(a){
        a.prodectName = new RegExp(name);
    }
    if (categoryId) {
        a.categoryId = categoryId;
    }
    if (status) {
        a.status = parseInt(status);
    }
    if (beginDate) {
        var bDate = new Date(beginDate);
        bDate.setHours(0, 0, 0, 0);
        a.createTime = {"$gte":bDate}
    }
    if (endDate) {
        var arr = endDate.split("-");
        var date = new Date(arr[0], parseInt(arr[1], 10) - 1, arr[2]).getTime() + 86400000;
        if (a.createTime) {
            a.createTime["$lt"] = new Date(date);
        } else {
            a.createTime = {"$lt": new Date(date)};
        }
    }
    db.Prodect.count(a, function (err, count) {
        if (!err) {
            var query = db.Prodect.find(a);
            query.limit(rows);
            query.skip((page - 1) * rows);
            if (sort) {
                var s = {};
                s[sort] = (order == 'desc' ? -1 : 1);
                query.sort(s);
            }
            query.populate('categoryId', 'categoryName').populate('creator', 'email').populate('lastEidtor', 'email').exec(function (error, data) {
                if (!error) {
                    res.end(JSON.stringify({"rows": data || [], "page": page, "total": count}));
                } else {
                    res.end(JSON.stringify({"status": 100, "message": error.errmsg}));
                }
            })
        } else {
            res.end(JSON.stringify({"status": 110, "message": err.errmsg}));
        }
    });
});

router.post('/changeStatus', function (req, res, next) {
    var id = req.body.id;
    db.Prodect.findOne({"_id": id}, function (err, prodect) {
        if (!err && prodect) {
            prodect.status = Math.abs(prodect.status - 1);
            prodect.lastEidtor = req.session.admin._id;
            prodect.lastEidtTime = new Date();
            prodect.save(function (err) {
                if (!err) {
                    res.end(JSON.stringify({}));
                } else {
                    res.end(JSON.stringify({"status": 22, "message": err.errmsg}));
                }
            })
        } else {
            res.end(JSON.stringify({"status": 22, "message": err ? err.errmsg : "未找到该商品"}));
        }
    })
});

router.post('/getOne', function (req, res, next) {
    var id = req.body.id;
    var query = db.Prodect.findOne({"_id": id});
    query.populate('categoryId', 'categoryName').populate('creator', 'email').populate('lastEidtor', 'email').exec(function (err, prodect) {
            if (!err && prodect) {
                res.json({"prodect": prodect});
            } else {
                res.end(JSON.stringify({"status": 22, "message": err ? err.errmsg : "未找到该商品"}));
            }
        }
    )
});

router.post('/addStock', function (req, res, next) {
    var id = req.body.id;
    var addStock = parseInt(req.body.addStock);
    if (isNaN(addStock) || addStock <= 0) {
        return res.end(JSON.stringify({"status": 22, "message": "增加库存数量错误!"}));
    }
    db.Prodect.findOne({"_id": id}, function (err, prodect) {
        if (!err && prodect) {
            prodect.stock += addStock;
            prodect.lastEidtor = req.session.admin._id;
            prodect.lastEidtTime = new Date();
            prodect.save(function (err) {
                if (!err) {
                    res.end(JSON.stringify({}));
                } else {
                    res.end(JSON.stringify({"status": 22, "message": err.errmsg}));
                }
            })
        } else {
            res.end(JSON.stringify({"status": 22, "message": err ? err.errmsg : "未找到该商品"}));
        }
    })
});

router.post('/changeStock', function (req, res, next) {
    var id = req.body.id;
    var stock = parseInt(req.body.stock);
    if (isNaN(stock) || stock <= 0) {
        return res.end(JSON.stringify({"status": 22, "message": "库存数量错误!"}));
    }
    db.Prodect.findOne({"_id": id}, function (err, prodect) {
        if (!err && prodect) {
            prodect.stock = stock;
            prodect.lastEidtor = req.session.admin._id;
            prodect.lastEidtTime = new Date();
            prodect.save(function (err) {
                if (!err) {
                    res.end(JSON.stringify({}));
                } else {
                    res.end(JSON.stringify({"status": 22, "message": err.errmsg}));
                }
            })
        } else {
            res.end(JSON.stringify({"status": 22, "message": err ? err.errmsg : "未找到该商品"}));
        }
    })
});


module.exports = router;