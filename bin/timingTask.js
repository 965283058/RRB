var schedule = require('node-schedule');
var db = require("../db/Schema.js");
//定时任务
var rule = new schedule.RecurrenceRule();
rule.hour = 0;
rule.minute = 0;
rule.second = 0;
module.exports = function () {
    schedule.scheduleJob(rule, function () {
        db.Config.findOne({"key": "autoCancelOrder"}, function (configErr, data) {
            if (!configErr && data) {
                var cancelId = data.value;
                db.Order.find({"status": 0, "logistical": 0}, function (err, data) {
                    for (var i = 0; i < data.length; i++) {
                        db.cancalOrder(data[i], cancelId);
                    }
                })
            }
        })
    })
};