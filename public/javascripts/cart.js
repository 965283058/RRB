function cart() {
    this.get();
    this.setTip();
}
cart.prototype.addProdect = function (id, count, price) {
    this.get();
    if (this.existsProdect(id)) {
        for (var i = 0; i < this.cart.length; i++) {
            if (this.cart[i].prodectId == id) {
                this.cart[i].count += count;
                this.save();
                break;
            }
        }
    } else {
        this.cart.push({"prodectId": id, "count": count, "price": price});
        this.save();
    }
}
cart.prototype.existsProdect = function (id) {
    for (var i = 0; i < this.cart.length; i++) {
        if (this.cart[i].prodectId == id) {
            return true;
        }
    }
    return false;
}
cart.prototype.getProdect = function (id) {
    for (var i = 0; i < this.cart.length; i++) {
        if (this.cart[i].prodectId == id) {
            return this.cart[i];
        }
    }
    return null;
}
cart.prototype.update = function (id, count) {
    for (var i = 0; i < this.cart.length; i++) {
        if (this.cart[i].prodectId == id) {
            this.cart[i].count = count;
            this.save();
            break;
        }
    }
}
cart.prototype.subtractProdect = function (id, count) {
    for (var i = 0; i < this.cart.length; i++) {
        if (this.cart[i].prodectId == id) {
            var result = this.cart[i].count -= count;
            if (result > 0) {
                this.cart[i].count = result;
            } else {
                this.delProdect(id);
            }
            break;
        }
    }
}
cart.prototype.delProdect = function (id, save) {
    if (typeof save == "undefined") {
        save = true;
    }
    for (var i = 0; i < this.cart.length; i++) {
        if (this.cart[i].prodectId == id) {
            this.cart.splice(i, 1);
            if (save) {
                this.save();
            }
            break;
        }
    }
}
cart.prototype.getTotal = function () {
    var total = 0;
    for (var i = 0; i < this.cart.length; i++) {
        total += this.cart[i].count * this.cart[i].price;
    }
    return total;
}
cart.prototype.getTotalCount = function () {
    var total = 0;
    for (var i = 0; i < this.cart.length; i++) {
        total += this.cart[i].count;
    }
    return total;
}
cart.prototype.save = function () {
    var str = JSON.stringify(this.cart);
    if (window.localStorage) {
        localStorage.RRB_Cart = str;
    } else {
        document.cookie = "RRB_Cart=" + encodeURIComponent(str) + ";";
    }
    this.setTip();
}
cart.prototype.get = function () {
    try {
        if (window.localStorage) {
            this.cart = JSON.parse(localStorage.RRB_Cart);
        } else {
            var arrCookie = document.cookie.split(";");
            for (var i = 0; i < arrCookie.length; i++) {
                var arr = arrCookie[i].split("=");
                if (arr[0] == "RRB_Cart") {
                    this.cart = JSON.parse(decodeURIComponent(arr[1]));
                }
            }
            this.cart = [];
        }
    } catch (err) {
        this.cart = [];
    }
}

cart.prototype.setTip = function () {
    var cartEle = $("#cart");
    if (cartEle.length > 0) {
        var count = this.getTotalCount();
        if (count > 0) {
            if (cartEle.find(".cartTip").length == 0) {
                cartEle.append('<i class="cartTip">' + count + '</i>');
            } else {
                cartEle.find(".cartTip").html(count)
            }
        } else {
            cartEle.find(".cartTip").remove();
        }
    }
}