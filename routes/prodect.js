var express = require('express');
var router = express.Router();

var db = require("../db/Schema");
var Schema = require("mongoose").Schema;

router.get('/:prodectId', function (req, res, next) {
    var prodectId = req.params.prodectId;
    if (prodectId) {
        var query = db.Prodect.findOne({"_id": prodectId});
        query.populate('categoryId', 'categoryName').exec(function (err, prodect) {
            if (!err && prodect) {
                db.Evaluate.find({
                    "status": 1,
                    "prodectId": prodectId
                }, '', {sort: {"createTime": -1}}, function (error, evaluates) {
                    if (!error) {
                        db.Prodect.find({"status": 1, "_id": {"$ne": prodectId}}, null, { //查询10个不等于本身的大库存商品
                            sort: {'stock': -1},
                            limit: 10
                        }, function (error, proposal) {
                            res.render('prodect', {"prodect": prodect, "evaluates": evaluates, "proposal": proposal});
                        })
                    } else {
                        res.render('prodect', {"errorMsg": "暂无商品", "prodect": null, "evaluates": null});
                    }
                })
            } else {
                res.render('prodect', {"errorMsg": "查询错误"});
            }
        })
    }
});





module.exports = router;
