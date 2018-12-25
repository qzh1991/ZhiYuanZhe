const superagent = require('superagent')
require('superagent-charset')(superagent)
const cheerio = require('cheerio')

var tongchang = 'jsvol-token=c152052ad566bed326e83cf0052afc20; type=org' //1 2 3
var wumingshan = 'jsvol-token=920fb90f1ab3f57b9fe6c9406499ccbd; type=org' //1 3
var gelou = 'jsvol-token=48f303a82c8192451221756c07967ef6; type=org' //1 2 3
var qiaocun = 'jsvol-token=4f8af34d1e0d58a6c853c68c14d9a375; type=org' //1 2 3
var xueyuan = 'jsvol-token=921ffb20e8427d4a1138b3e8b3d78b41; type=org' //1 2 3
var longyaoshan = 'jsvol-token=b4a0cd3e6a8afcb24bbcd77edcd7f1dd; type=org' //1 2 3
var wenwo = 'jsvol-token=e305187d981b9dd81c26df6808170c50; type=org' //1 2 3
var yuquanhe = 'jsvol-token=4a7c2db435dc45aaefe73bd27daf6aec; type=org' //1 3
var hangou = 'jsvol-token=2fc0505adb2838c2db1e141a0a5442a7; type=org' //1 3



var cookie = tongchang
function checkList(page) {
    page = page || 1
    let href = 'http://www.jsvolunteer.org/org/member/index?tab=1&page=' + page
    superagent.get(href)
        .set('Cookie', cookie)
        .retry(5)
        .end(function (err, res) {
            try {
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
                                if (res && res.status != 200) return
                                var text = JSON.parse(res.text)
                                if (text.state == 1) {
                                    console.log(text.message);
                                }
                            })
                    });
                    let page = 'http://www.jsvolunteer.org' + $('.next a')[0].attribs.href.substr(29)
                    //let href2 = 'http://www.jsvolunteer.org' + $('.last a')[0].attribs.href
                    checkList(page)
                    //checkList(href2)
                }
            } catch (error) {
                checkList()
                console.log(error)
            }
        })
}
function main() {
    superagent.get('http://www.jsvolunteer.org/org/member/index?tab=1&page=1')
        .set('Cookie', cookie)
        .end(function (err, res) {
            try {
                if (res && res.status == 200) {
                    let $ = cheerio.load(res.text);
                    var pages = $('.last a')[0].attribs.href.substr(29)
                    console.log(pages)

                    for (let i = 1; i <= pages; i += 10) {
                        checkList(null, i)
                    }
                }
            } catch (error) {
                console.log(error)
            }
        })
}
main()
// checkList()