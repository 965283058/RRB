var express = require('express');
var router = express.Router();
var fs=require("fs");
var db = require("../db/Schema");
var Schema = require("mongoose").Schema;

router.get("/",function(req, res, next){
    fs.readFile("../views/cart.html", "binary", function(err, file) {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(file, "binary");
        res.end();
    });
} )
router.post('/getProdects', function (req, res, next) {
    var ids = req.body.ids;
    if (ids) {
        ids = ids.split(";");
        var query = db.Prodect.find({"_id": {"$in": ids}});
        query.populate('categoryId', 'categoryName').exec(function (err, prodects) {
            if (!err && prodects) {
                if (!err) {
                    res.json(prodects);
                } else {
                    res.json({"errorMsg": "暂无商品"});
                }
            } else {
                res.render({"errorMsg": "查询错误"});
            }
        })
    }
})


module.exports = router;
