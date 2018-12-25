var address = require('./address')
const superagent = require('superagent')
require('superagent-charset')(superagent)
const cheerio = require('cheerio')

var tongchang = 'http://api.jsvolunteer.org/organization/ordinfo?id=4ae6ee4b5692b94f0156964bdacc415c'
var wumingshan = 'jsvol-token=920fb90f1ab3f57b9fe6c9406499ccbd; type=org' //1 3
var gelou = 'jsvol-token=48f303a82c8192451221756c07967ef6; type=org' //1 2 3
var qiaocun = 'jsvol-token=4f8af34d1e0d58a6c853c68c14d9a375; type=org' //1 2 3
var xueyuan = 'jsvol-token=921ffb20e8427d4a1138b3e8b3d78b41; type=org' //1 2 3
var longyaoshan = 'jsvol-token=b4a0cd3e6a8afcb24bbcd77edcd7f1dd; type=org' //1 2 3
var wenwo = 'jsvol-token=e305187d981b9dd81c26df6808170c50; type=org' //1 2 3
var yuquanhe = 'jsvol-token=4a7c2db435dc45aaefe73bd27daf6aec; type=org' //1 3
var hangou = 'jsvol-token=2fc0505adb2838c2db1e141a0a5442a7; type=org' //1 3



var cookie = yuquanhe
function status(org) {
    if(!org){
        return
    }
    href = 'http://api.jsvolunteer.org/organization/ordinfo?id=' + org
    superagent.get(href)
        .set('Accept', 'application/json, text/plain, */*')
        .set('Referer', 'http://manager.jsvolunteer.org/volunteer_management/org_management/org-message/org-message?id=4ae6ee4b56b2d33c0156b649600072f5&stateVal=%E6%AD%A3%E5%B8%B8')
        .set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36')
        .set('api-token', '8063caa743b3c6fe59d6169efd1b4599')
        .end(function (err, res) {
            try {
                var text = JSON.parse(res.text)
                if (text && text.data) {
                    let name = text.data.org_cname
                    let num = text.data.membernum
                    console.log(name + ':' + num);
                }else{
                    console.log(text.message);

                }
            } catch (error) {
                console.log(error)
            }
        })
}
status(address.tongchang.org)
status(address.wumingshan.org)
status(address.xueyuan.org)
status(address.wenwo.org)
status(address.qiaocun.org)
status(address.jiaoshan.org)
status(address.longyaoshan.org)
status(address.wangcheng.org)
status(address.hangou.org)
status(address.yuquanhe.org)
status(address.qiaoshang.org)
status(address.gelou.org)