/*
 * 重写适合人人币系统后台的Ajax
 *
 * */
(function ($) {
    //备份jquery的ajax方法
    var _ajax = $.ajax;

    //重写jquery的ajax方法
    $.ajax = function (opt) {
        //备份opt中error和success方法
        var fn = {
            error: function (XMLHttpRequest, textStatus, errorThrown) {
            },
            success: function (data, textStatus) {
            }
        }
        if (opt.error) {
            fn.error = opt.error;
        }
        if (opt.success) {
            fn.success = opt.success;
        }

        //扩展增强处理
        var _opt = $.extend(opt, {
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                if (textStatus == '404') {
                    $.messager.alert("警告", "请检查网络", "error");
                } else {
                    $.messager.alert("错误", XMLHttpRequest.responseText, "error");
                }
            },
            success: function (data, textStatus) {
                if (data.status) {
                    if (data.status == -1) {
                        $.messager.clear();
                        $.messager.alert("提示", "您已登录超时,请重新登录!", "error", function () {
                            window.top.location.href = '/manage/login.html';
                        })
                    } else {
                        if (opt.fail) {
                            opt.fail(data);
                        } else {
                            $.messager.alert("警告", data.message, "error");
                        }
                    }
                } else {
                    opt.succ && opt.succ(data);
                }
            },
            dataType: opt.dataType || "json"
        });
        _ajax(_opt);
    };
})(jQuery);

$.extend($.fn.combobox.defaults, {
    loader: function (param, success, error) {
        var opts = $(this).combobox("options");
        if (opts.url) {
            $.ajax({
                url: opts.url,
                data: param,
                type: opts.method,
                dataType: "json",
                succ: function (data) {
                    success(data)
                }
            })
        }
    }
})

$.extend($.fn.combogrid.defaults, {
    loader: function (param, success, error) {
        var opts = $(this).datagrid("options");
        if (opts.url) {
            $.ajax({
                url: opts.url,
                data: param,
                type: opts.method,
                dataType: "json",
                succ: function (data) {
                    success(data)
                }
            })
        }
    }
})


$.extend($.fn.tree.defaults, {
    loader: function (param, success, error) {
        var opts = $(this).tree("options");
        if (opts.url) {
            $.ajax({
                url: opts.url,
                data: param,
                type: opts.method,
                dataType: "json",
                succ: function (data) {
                    success(data)
                }
            })
        }
    }
})

$.extend($.fn.combotree.defaults, {
    loader: function (param, success, error) {
        var opts = $(this).tree("options");
        if (opts.url) {
            $.ajax({
                url: opts.url,
                data: param,
                type: opts.method,
                dataType: "json",
                succ: function (data) {
                    success(data)
                }
            })
        }
    }
})
$.extend($.fn.treegrid.defaults, {
    loader: function (param, success, error) {
        var opts = $(this).treegrid("options");
        if (opts.url) {
            $.ajax({
                url: opts.url,
                data: param,
                type: opts.method,
                dataType: "json",
                succ: function (data) {
                    success(data)
                }
            })
        }
    }
})

$.extend($.fn.datagrid.defaults, {
    loader: function (param, gridSuccess, error) {
        var that = $(this);
        var opts = that.datagrid("options");
        if (!opts.url) {
            return false;
        }
        $.ajax({
            type: opts.method,
            url: opts.url,
            data: param,
            dataType: "json",
            succ: function (data) {
                gridSuccess(data);
            },
            fail: function (res) {
                $.messager.alert('警告', res.message + "\n错误代码：" + res.status, "error");
                gridSuccess([])
            },
            error: function () {
                $.messager.alert('警告', "请检查网络", "error");
                gridSuccess([])
            }
        });
    },
    loadFilter: function (resText) {
        var options = $(this).datagrid("options");
        if (!options.url) {
            if (typeof resText.length == "number" && typeof resText.splice == "function") {
                return {total: resText.length, rows: resText};
            } else {
                return resText;
            }
        }
        if (typeof resText === 'object' && resText.rows) {
            var _data = {};
            if (typeof resText.rows === 'object') {
                for (var i = 0; i < resText.rows.length; i++) {
                    resText.rows [i].number = i + 1;
                }
            }
            return resText;
        } else {
            if (options.pagination) {
                var total = $(this).datagrid("getPager").pagination("options").total;
                return {"page": options.pageNumber, "total": total, "rows": []}
            }
            return [];
        }
    },
    onLoadSuccess: function (data) {
        var emptyMessage = $(this).datagrid('options').emptyMessage;
        if (emptyMessage) {
            var body = $(this).datagrid("getPanel").find('.datagrid-body');
            body.find('div[dataGridEmpty]').remove();
            if (data.rows.length == 0) {
                var height = Math.max(body.height() - 50, 150);
                body.append('<div dataGridEmpty="true" style="text-align: center;font-size: 14px;color: #a4aeb9;line-height:' + height + 'px">' + emptyMessage + '</div>')
            }
            $(this).datagrid("resize");
        }
        var loadSuccessAfter = $(this).datagrid('options').onLoadSuccessAfter;
        if (typeof loadSuccessAfter == "function") {
            loadSuccessAfter.call(this, data);
        }
    }
})

$.extend($.fn.pagination.defaults, {
    layout: ['first', 'prev', 'sep', 'manual', 'sep', 'next', 'last', 'refresh', 'list'],
    displayMsg: '当前显示从{from}到{to}，共{total}条记录',
})

$.fn.datebox.defaults.buttons = (function () {
    var buttons = $.extend([], $.fn.datebox.defaults.buttons);
    buttons.splice(0, 0, {
        text: '清空',
        handler: function (target) {
            $(target).datebox("clear");
        }
    });
    return buttons;
})();

$.messager.clear = function (type) {
    switch (type) {
        case"alert":
            return $(".panel.window.messager-window").find("a.l-btn").click();
        case"confirm":
            return $(".panel.window.messager-window").find("a.l-btn").last().click();
        default :
            return $(".panel.window.messager-window").find("a.l-btn").last().click();
    }
};

/*创建一个DIV*/
$.createOnlyDiv = function (id, parentId) {
    if ($("#" + id).length > 0) {
        $("#" + id).remove();
    }
    var parent = parentId ? $("#" + parentId) : $("body");
    parent.append('<div id="' + id + '"></div>')
    return $("#" + id);
}

$.converToCNDate = function (str, format) {
    if (!str) {
        return "";
    }
    format = format || "datetime";
    switch (format) {
        case "datetime":
            return str.substring(0, 19).replace("T", " ");
        case "date":
            return str.substring(0, 10);
        case "time":
            return str.substring(11, 19);
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

//在页面显示蒙层等待效果
$.modalWait = function (options, param) {
    var modalWaitPanel = $("div.JP-modalWaitPanel");

    if (modalWaitPanel.length == 0) {
        modalWaitPanel = $("<div class='JP-modalWaitPanel' style='display:none'></div>");
        $("body").append(modalWaitPanel);
    }

    if (typeof options == 'string') {
        switch (options) {
            case 'open':
                $("div.JP-modalWaitPanel-info").remove();
                var defaults = {msg: '', src: ''}
                var params = $.extend({}, defaults, param);
                var w = $(document).width();
                var h = $(document).height();
                var background = '';
                if (params.src) {
                    var background = "#fff url('" + params.src + "') no-repeat 5px center";
                }
                var time = new Date().getTime();

                var $msg = $('<div class="JP-modalWaitPanel-info">' + params.msg + '</div>').
                    css({
                        "display": "inline-block",
                        "line-height": "16px",
                        "padding": "10px 5px 10px 30px",
                        "width": "auto",
                        "border": "2px solid #D4D4D4",
                        "color": "#000",
                        "font-size": "14px",
                        "position": "absolute",
                        "z-index": "100001",
                        "top": $("body").scrollTop() + $(window).height() / 2,
                        "background": background,
                        "font-size": "12px"
                    })
                if (!params.src) {
                    $msg.addClass("hk-modalWait");
                }
                modalWaitPanel.css('display', 'block').width(w).height(h).css({
                    "background-color": "#ccc",
                    "filter": "alpha(opacity=30)",
                    "-moz-opacity": "0.3",
                    "opacity": "0.3",
                    "position": "absolute",
                    "z-index": "100000",
                    "text-align": "center",
                    "padding-top": "420px",
                    "top": "0px",
                    "left": "0px"
                }).after($msg);
                return $msg.css("left", (w - $msg.outerWidth(true)) / 2);
            case 'close' :
                $("div.JP-modalWaitPanel-info").remove();
                return modalWaitPanel.css('display', 'none');
        }
    }
}

$.getQueryString = function (name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return (r[2]);
    return null;
}

//序列化为json
$.fn.serializeJson = function () {
    var serializeObj = {};
    var array = this.serializeArray();
    var str = this.serialize();
    $(array).each(function () {
        if (serializeObj[this.name]) {
            if ($.isArray(serializeObj[this.name])) {
                serializeObj[this.name].push(this.value);
            } else {
                serializeObj[this.name] = [serializeObj[this.name], this.value];
            }
        } else {
            serializeObj[this.name] = this.value;
        }
    });
    return serializeObj;
};