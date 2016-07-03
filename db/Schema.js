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

exports.Category = db.model('Category', CategorySchema);

//订单
var OrderSchema = new Schema({
    jobNo: String,
    name: String,
    dept: {type: Schema.Types.ObjectId, ref: 'Dept'}, //部门
    type: Number,//0 送人 1自用
    logistical: Number,//物流方式 0 自提 1送货
    addess: {type: Schema.Types.ObjectId, ref: 'Addess'}, //部门
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

OrderSchema.set('toJSON', {virtuals: true})
OrderSchema.set('toObject', {virtuals: true})
OrderSchema.virtual('createTimeCN').get(function () {
    return converToCNDate(this.createTime);
});

function converToCNDate(ms, format) {
    if (!ms && ms !== 0) {
        return '';
    }
    var date = new Date(ms);
    var year = date.getFullYear(),
        month = date.getMonth() + 1,
        day = date.getDate(),
        hh = date.getHours(),
        mm = date.getMinutes(),
        ss = date.getSeconds();

    format = format || "datetime";
    switch (format) {
        case "datetime":
            return year + "-" + padLeft(month) + "-" + padLeft(day) + " " + padLeft(hh) + ":" + padLeft(mm) + ":" + padLeft(ss);
        case "date":
            return year + "-" + padLeft(month) + "-" + padLeft(day);
        case "time":
            return padLeft(hh) + ":" + padLeft(mm) + ":" + padLeft(ss);
        default :
            return "";
    }

    function padLeft(number) {
        if (parseInt(number) < 10) {
            return '0' + number;
        }
        return number;
    }
};

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
