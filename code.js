// ==UserScript==
// @name         WordNotes
// @namespace    jumao
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://*/*
// @icon         https://www.google.com/s2/favicons?domain=csdn.net
// @grant none
// @require https://cdnjs.cloudflare.com/ajax/libs/jquery/3.5.1/jquery.min.js
// @require https://cdn.bootcdn.net/ajax/libs/crypto-js/4.0.0/crypto-js.js
// @require https://www.layuicdn.com/layer-v3.0/layer.js

// ==/UserScript==


(function () {
    var appKey = '08e02e4db9be72b4'; // 应用ID（需申请）
    var appSecret = 'MK3CXV5iwNLX4xQrADVD23CcFGupNGFr'; // 应用密钥（需申请）
    // var from = 'en';
    // var to = 'zh-CHS';
    var from = 'auto';
    var to = 'auto';
    var db;

    debugRequires();
    loadLayerCSS();
    regEvent();
    startTips();

    function debugRequires() {
        console.log($)
        console.log(crypto)
        console.log(layer)
    }
    function startTips() {
        layer.msg("使用Q+E键进行翻译")
    }
    function regEvent() { //注册事件
        var qdown; // q键盘keyCode:81
        var edown; // e键盘keyCode:69
        $('html').keydown(function (item) {
            var keyCode = item.keyCode
            if (keyCode == 81) qdown = true;
            if (keyCode == 69) edown = true;
        })
        $('html').keyup(function (item) {

            var keyCode = item.keyCode
            if (qdown && edown) {
                var text = window.getSelection().toString();
                if (text != '') {
                    translate(text);
                }
            }
            if (keyCode == 81) qdown = false;
            if (keyCode == 69) edown = false;
        })

    }

    function translate(query) {//调用翻译接口
        var salt = (new Date).getTime();
        var curtime = Math.round(new Date().getTime() / 1000);
        var str1 = appKey + truncate(query) + salt + curtime + appSecret;
        var sign = CryptoJS.SHA256(str1).toString(CryptoJS.enc.Hex);
        window.successCallback = function successCallback(data) { //把回调函数注册在全局对象中，提升作用域
            console.log(data)
            data.translation.forEach(element => {
                layer.open({
                    type: 1,
                    title: 'WordNotes (一个可以翻译的单词本)',
                    area: ['360px', '360px'],
                    shadeClose: true, //点击遮罩关闭
                    content:
                        `
                    <div style="padding:20px;">
                        <p style="font-size:20px;font-wight:blob;margin-bottom:10px">原文:</p>
                        <audio controls>
                        <source src="http://dict.youdao.com/dictvoice?type=0&audio=${query}" type="audio/ogg">
                        <source src="http://dict.youdao.com/dictvoice?type=0&audio=${query}" type="audio/mpeg">
                      </audio>
                        <div>
                            ${query}
                        </div>
                    </div>
                    <div style="margin:0 auto;width:95%;border-bottom:1px solid #393D49"></div>
                    <div style="padding:20px;">
                        <p style="font-size:20px;font-wight:blob;margin-bottom:10px">译文:</p>
                        <audio controls>
                        <source src="http://dict.youdao.com/dictvoice?type=0&audio=${element}" type="audio/ogg">
                        <source src="http://dict.youdao.com/dictvoice?type=0&audio=${element}" type="audio/mpeg">
                      </audio>
                        <div>
                            ${element}
                        </div>
                    </div>
                `
                });
                console.log(element)
            });
            console.log("翻译成功")
        }
        $.ajax({
            url: 'https://openapi.youdao.com/api',
            type: 'post',
            dataType: 'jsonp',		// jsonp 类型解决跨域
            jsonpCallback: 'successCallback',
            data: {
                q: query,
                appKey: appKey,
                salt: salt,
                from: from,
                to: to,
                sign: sign,
                signType: "v3",
                curtime: curtime,
            }
        });
        function truncate(q) {//生成api参数
            var len = q.length;
            if (len <= 20) return q;
            return q.substring(0, 10) + len + q.substring(len - 10, len);
        }
    }

    function loadLayerCSS() {//引入layer的css组件，仅有layer.js完全不够
        $(document.body).append(`<link href="https://cdn.bootcdn.net/ajax/libs/layer/3.1.1/theme/default/layer.min.css" rel="stylesheet">`)
    }
})();