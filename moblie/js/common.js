function is_weixin(){
    var ua = navigator.userAgent.toLowerCase();
    if(ua.match(/MicroMessenger/i)=="micromessenger") {
        return true;
    } else {
        return false;
    }
}
function getQueryStringByName(name){
    var result = location.search.match(new RegExp("[\?\&]" + name+ "=([^\&]+)","i"));
    if(result == null || result.length < 1){
        return "";
    }
    return result[1];
}


if(is_weixin()){
    mui.ready(function(){
        document.querySelector("header").style.display="none";
        document.querySelector(".mui-content").style.paddingTop="0px";
    })
}
String.prototype.trim=function(){
    return this.replace(/(^\s*)|(\s*$)/g, "");
}