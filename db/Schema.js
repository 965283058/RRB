var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var db = mongoose.createConnection('localhost', 'RRB'); //创建一个数据库连接

var MongoClient = require('mongodb').MongoClient;
var DB_CONN_STR = 'mongodb://localhost:27017/RRB';


//商品
var ProdectSchema = new Schema({
    prodectName: String,
    categoryId: {type: Schema.Types.ObjectId, ref: 'Category'},
    price: Number,
    stock: Number,
    img: [String],
    remark: String,
    status: Number,  //0下架 1正常
    creator: {type: Schema.Types.ObjectId, ref: 'Admin'},
    createTime: Date,
    lastEidtor: {type: Schema.Types.ObjectId, ref: 'Admin'},
    lastEidtTime: Date
});
exports.Prodect = db.model('Prodect', ProdectSchema);


//商品分类
var CategorySchema = new Schema({
    categoryName: String,
    categoryPrice: Number,
    status: Number, //0禁用 1正常
    creator: Number,
    createTime: Date
});
/*CategorySchema.set('toJSON', {virtuals: true})
 CategorySchema.set('toObject', {virtuals: true})
 CategorySchema.virtual('createTime_timestamp').get(function () {
 if (!this.createTime) {
 return;
 }
 return this.createTime.getTime();
 });*/

exports.Category = db.model('Category', CategorySchema);

//订单
var OrderSchema = new Schema({
    jobNo: String,
    name: String,
    type: Number,//0 送人 1自用
    logisticalId: {type: Schema.Types.ObjectId, ref: 'Logistical'}, //物流方式
    prodectList: [{
        prodectId: {type: Schema.Types.ObjectId, ref: 'Prodect'},
        price: Number,
        count: Number,
    }],
    money: Number,
    createTime: Date,
    sender: {type: Schema.Types.ObjectId, ref: 'Admin'},//发货人
    sendTime: Date,
    remark: String,
    status: Number  //-2删除 -1取消 0创建 1发货 2已评价
});

OrderSchema.statics.sendProdect = function (id, callback) {
    MongoClient.connect(DB_CONN_STR, function (err, db) {
        if (!err) {
            db.eval('SendProdect(' + id + ')', function (err, result) {
                if (err) {
                    callback(err, null)
                } else {
                    callback(null, result);
                }
                db.close();
            });
        } else {
            callback(err, null)
        }
    });
}

exports.Order = db.model('Order', OrderSchema);

//物流
var LogisticalSchema = new Schema({
    name: String,
    status: Number   //0禁用 1正常
});
exports.Logistical = db.model('Logistical', LogisticalSchema);

//地址
var AddessSchema = new Schema({
    name: String,
    status: Number   //0禁用 1正常
});
exports.Addess = db.model('Addess', AddessSchema);

//评价
var EvaluateSchema = new Schema({
    prodectId: {type: Schema.Types.ObjectId, ref: 'Prodect'},
    jobNo: String,
    level: Number,
    content: String,
    createTime: Date,
    status: Number   //0禁用 1正常
});
exports.Evaluate = db.model('Evaluate', EvaluateSchema);


//购物车
var CartSchoema = new Schema({
    jobNo: String,
    prodectList: [{prodectId: {type: Schema.Types.ObjectId, ref: 'Prodect'}, count: Number}],
});
exports.Cart = db.model('Cart', CartSchoema);

//管理员
var AdminSchema = new Schema({
    email: {type: String, unique: true},
    name: String,
    pwd: String,
    errCount: Number,
    superAdmin: Number,
    power: [String],
    status: Number,
    creator: {type: Schema.Types.ObjectId, ref: 'Admin'},
    createTime: {type: Date, default: Date.now()},
    lastLoginTime: {type: Date}
});
exports.Admin = db.model('Admin', AdminSchema);

//菜单
var MenuSchema = new Schema({
    text: String,
    href: String,
    iconCls: String,
    _parentId: String,
    status: Number,
    creator: {type: Schema.Types.ObjectId, ref: 'Admin'},
    createTime: {type: Date, default: Date.now()}
});
exports.Menu = db.model('Menu', MenuSchema);


//部门
var DeptSchema = new Schema({
    name: String,
    _parentId: String,
    status: Number   //0禁用 1正常
});
exports.Dept = db.model('Dept', DeptSchema);