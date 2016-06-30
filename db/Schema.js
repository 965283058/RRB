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
    createTime: {type: Number, default: Date.now()},
    lastEidtor: {type: Schema.Types.ObjectId, ref: 'Admin'},
    lastEidtTime: Number
});
exports.Prodect = db.model('Prodect', ProdectSchema);


//商品分类
var CategorySchema = new Schema({
    categoryName: String,
    categoryPrice: Number,
    status: Number, //0禁用 1正常
    creator: {type: Schema.Types.ObjectId, ref: 'Admin'},
    createTime: {type: Number, default: Date.now()},
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
    dept: {type: Schema.Types.ObjectId, ref: 'Dept'}, //物流方式
    type: Number,//0 送人 1自用
    logistical: Number,//物流方式 0 自提 1送货
    prodectList: [{
        prodectId: {type: Schema.Types.ObjectId, ref: 'Prodect'},
        price: Number,
        count: Number,
    }],
    money: Number,
    createTime: {type: Number, default: Date.now()},
    sender: {type: Schema.Types.ObjectId, ref: 'Admin'},//发货人
    sendTime: Number,
    remark: String,
    status: Number  //-2删除 -1取消 0创建 1发货 2已评价
});


exports.Order = db.model('Order', OrderSchema);


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
    createTime: {type: Number, default: Date.now()},
    status: Number,   //0禁用 1正常
});
exports.Evaluate = db.model('Evaluate', EvaluateSchema);


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
    createTime: {type: Number, default: Date.now()},
    lastLoginTime: Number
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
    createTime: {type: Number, default: Date.now()}
});
exports.Menu = db.model('Menu', MenuSchema);


//部门
var DeptSchema = new Schema({
    name: String,
    _parentId: String,
    status: Number,   //0禁用 1正常
    creator: {type: Schema.Types.ObjectId, ref: 'Admin'},
    createTime: {type: Number, default: Date.now()}
});
exports.Dept = db.model('Dept', DeptSchema);

//收藏
var LikeSchema = new Schema({
    jobNO: String,
    prodectList: [{type: Schema.Types.ObjectId, ref: 'Prodect'}]
});
exports.Like = db.model('Like', LikeSchema);
