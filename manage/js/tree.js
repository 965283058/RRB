$(function () {
    $('#navTree').tree({
        url: "/manage/menu/getTreeMenu",
        animate: true,
        onClick: function (node) {
            if (node.target.childNodes[0].className.indexOf('tree-expanded') > -1) {
                $('#navTree').tree('collapse', node.target);
            } else {
                $('#navTree').tree('expand', node.target);
            }
            ;
            var tt = $('#main-center');
            if (tt.tabs('exists', node.text)) {
                tt.tabs('select', node.text);
                return;
            }
            var url = node.href;
            if (url) {
                var iHeight = (tt.height() - 40) + 'px';
                var content = '<iframe scrolling="auto" frameborder="0"  src="' + url + '" style="width:100%;height:' + iHeight + ';" ></iframe>';
                tt.tabs('add', {
                    title: node.text,
                    closable: true,
                    content: content
                });
            }
        },
        onLoadSuccess: function (node, data) {
            var rootsData = $(this).tree("getRoots");
            for (var k in rootsData) {
                $(rootsData[k].target).addClass(rootsData[k].iconCls);
            }
        }
    });
});






