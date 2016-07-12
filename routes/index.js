var express = require('express');
var router = express.Router();
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
    getProdectData(null,null, res)
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

function getProdectData(categoryId, name, res,isMoblie) {
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
                var c = {"_id":categorys[i]._id,"categoryName":categorys[i].categoryName,"categoryPrice":categorys[i].categoryPrice,"prodects":[]};
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
                   if(!isMoblie){
                       res.render('index', {"categorys": json, "categoryId": categoryId});
                   }else{
                       res.json({"categorys": json, "categoryId": categoryId});
                   }
                } else {
                    if(!isMoblie){
                        res.render('index', {"errorMsg": "暂无商品", "categorys": categorys, "categoryId": categoryId});
                    }else{
                        res.json({"errorMsg": "暂无商品","categorys": json, "categoryId": categoryId});
                    }

                }
            })
        } else {
            if(!isMoblie){
                res.render('index', {"errorMsg": "查询错误"});
            }else{
                res.json({"errorMsg": "查询错误"});
            }
        }
    })
}


router.post('/', function (req, res, next) {
    var categoryId = req.body.categoryId;
    var name = req.body.name;
    getProdectData(categoryId, name, res,true);
});

module.exports = router;
