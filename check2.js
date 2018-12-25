const superagent = require('superagent')
require('superagent-charset')(superagent)
const cheerio = require('cheerio')

var tongchang = 'jsvol-token=c152052ad566bed326e83cf0052afc20; type=org' //完成
var wumingshan = 'jsvol-token=920fb90f1ab3f57b9fe6c9406499ccbd; type=org' //完成
var gelou = 'jsvol-token=48f303a82c8192451221756c07967ef6; type=org' //完成
var qiaocun = 'jsvol-token=4f8af34d1e0d58a6c853c68c14d9a375; type=org' //完成
var xueyuan = 'jsvol-token=921ffb20e8427d4a1138b3e8b3d78b41; type=org'
var longyaoshan = 'jsvol-token=b4a0cd3e6a8afcb24bbcd77edcd7f1dd; type=org'
var wenwo = 'jsvol-token=e305187d981b9dd81c26df6808170c50; type=org'
var yuquanhe = 'jsvol-token=4a7c2db435dc45aaefe73bd27daf6aec; type=org'
var hangou = 'jsvol-token=2fc0505adb2838c2db1e141a0a5442a7; type=org'



var cookie = tongchang
function checkList(href) {
    href = href || 'http://www.jsvolunteer.org/org/member/index?tab=1&page=1'
    superagent.get(href)
        .set('Cookie', cookie)
        .end(function (err, res) {
            if (res && res.status == 200) {
                let $ = cheerio.load(res.text);
                let rows = $('.timelengthaudit-bg-color')
                var total = $('.fl').text().trim()
                console.log(total);
                if (total == '共计0条') {
                    return
                }
                let promises = rows.map((i, row) => {
                    let key = row.attribs['data-value']
                    superagent.get('http://www.jsvolunteer.org/org/member/check-user?state=1&key=' + key)
                        .set('Cookie', cookie)
                        .end(function (err, res) {
                            var text = JSON.parse(res.text)
                            if (text.state == 1) {
                                console.log(text.message);
                            }
                        })
                });
                let href
                try {
                    href = 'http://www.jsvolunteer.org' + $('.next a')[0].attribs.href
                } catch (error) {
                    console.log(error)
                }
                checkList(href)
            }
        })
}
function doCheck(key) {
    superagent.get('http://www.jsvolunteer.org/org/member/check-user?state=1&key=' + key)
        .set('Cookie', cookie)
        .end(function (err, res) {
            if (res.state == 1) {
                console.log(res.message);
            }
        })
}
checkList()