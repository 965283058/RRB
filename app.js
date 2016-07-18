var express = require('express');
var session = require('express-session');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var routes = require('./routes/index');
var fs = require("fs");
var domain = require('domain');

var app = express();
// 使用 domain 来捕获大部分异常
app.use(function (req, res, next) {
    var reqDomain = domain.create();
    reqDomain.on('error', function () {
        try {
            var killTimer = setTimeout(function () {
                process.exit(1);
            }, 30000);
            killTimer.unref();
            res.status(500);
            res.render('error', {
                message: "服务器错误，/(ㄒoㄒ)/~~",
                error: {}
            });
        } catch (e) {
            console.log('error when exit', e.stack);
        }
    });

    reqDomain.run(next);
});

process.on('uncaughtException', function (err) {
    //打印出错误的调用栈方便调试
    var msg = "\n" + Date.now() + "\n" + err.message;
    fs.writeFile("errLog.txt", msg, {encoding: "utf8", flag: "a"});
});



app.use(session({
    secret: 'RRB app', //secret的值建议使用随机字符串
    cookie: {maxAge: 60 * 1000 * 30} // 过期时间（毫秒）
}));

// view engine setu
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(__dirname));

app.use(function (req, res, next) {
    var url = req.originalUrl;
    if (url.indexOf("/manage") == 0 && url !== "/manage/user/login") {
        if (!req.session.admin) {
            res.end(JSON.stringify({"status": -1, "message": "timeOut"}));
        } else {
            next();
        }
    } else {
        next();
    }
});

app.use('/', routes);

app.use(function (req, res, next) {
    var url = req.originalUrl;
    if (url.indexOf("/moblie/") == 0) {
        return res.redirect("/moblie/index.html");
    }
    var err = new Error('没有找到该页面,/(ㄒoㄒ)/~~');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
