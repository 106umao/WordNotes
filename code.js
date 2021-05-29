// ==UserScript==
// @name         可以翻译的单词本
// @namespace    jumao
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://*/*
// @icon         https://www.google.com/s2/favicons?domain=csdn.net
// @grant none
// @require https://cdnjs.cloudflare.com/ajax/libs/jquery/3.5.1/jquery.min.js
// @require https://cdn.bootcdn.net/ajax/libs/crypto-js/4.0.0/crypto-js.js
// ==/UserScript==

var appKey = '08e02e4db9be72b4'; // 应用ID（需申请）
var appSecret = 'MK3CXV5iwNLX4xQrADVD23CcFGupNGFr'; // 应用密钥（需申请）
var from = 'en';
var to = 'zh-CHS';
var db;

(function () {
    regEvent();
    openDB();
})();

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
    window.successCallback = function successCallback(data){ //把回调函数注册在全局对象中，提升作用域
        data.translation.forEach(element => {
            window.alert(element)
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

function openDB() {
    var request = window.indexedDB.open('WordNotes', 1);
    request.onerror = function (event) {
        console.log('数据库打开报错');
    };

    request.onsuccess = function (event) {
        db = request.result;
        console.log('数据库打开成功');
    };

    request.onupgradeneeded = function (event) {
        db = event.target.result;
        var objectStore = db.createObjectStore('words', { keyPath: 'word' });
        objectStore.createIndex('name', 'word', { unique: false });
    }
}


