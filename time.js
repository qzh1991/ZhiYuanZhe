const superagent = require('superagent')
require('superagent-charset')(superagent)
const cheerio = require('cheerio')
var fs = require('fs');
var file1 = './tongchang1.json'
var text = fs.readFileSync(file1)
var address = require('./address')

var json = {}
if (!text) {
    json = JSON.parse(text);
}
var count = 0
var pages = 10000
var pageSize = 20
var cookie = address.wumingshan.jsvol_token
function activityList(href) {
    href = href || 'http://www.jsvolunteer.org/org/default/index?tab=5'
    superagent.get(href)
        .set('Cookie', cookie)
        .end(async function (err, res) {
            if (err) {
                console.log(err)
                return
            }
            if (res && res.status == 200) {
                let $ = cheerio.load(res.text);
                let tbody = $('.activemange-tab5 tbody')
                // for (let i = 2; i < tbody.length; i++) {
                let id = $(tbody).eq(1).find('tr td span.timelengthaudit-bg-color').attr('data-value');
                pages = Math.ceil(5000 / pageSize)
                // let pages = 5
                let i = 1
                let timer = setInterval(() => {
                    if (!json[i]) {
                        doActivity(id, i)
                    }
                    if (i == pages) {
                        clearInterval(timer)
                    }
                    i++
                }, 2000);
                // }
            }
        })
}
function doActivity(id, i) {
    var data =
    {
        activityId: id,
        state: 1,
        pageIndex: i,
        pageSize: pageSize
    }
    superagent.post('http://www.jsvolunteer.org/org/default/activity-users')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .set('Cookie', cookie)
        .send(data)
        .end(function (err, res) {
            if (err) {
                count++
                console.log(i + ':' + err)
                return
            }
            var text = JSON.parse(res.text)
            total = text.total
            let uid = "";
            let items = text.items
            if (items.length != pageSize) {
                debugger
            }
            for (const v of items) {
                if (v.logsertime == 0) {
                    var uidlist = v.relid + ",";
                    uid += uidlist;
                }
            }
            if (!uid) {
                json[i] = 1
                count++
                console.log(i + ':' + '已录取')
                write()
                return
            }
            uid = uid.substring(0, uid.lastIndexOf(','))

            let adata = {
                id: uid,
                aid: id,
                service_time: 6,
                star: 5
            }
            superagent.post('http://www.jsvolunteer.org/org/default/batch-entry')
                // .set('Accept', '*/*')
                // .set('Accept-Encoding', 'gzip, deflate')
                // .set('Accept-Language', 'zh-CN,zh;q=0.9')
                // .set('Connection', 'keep-alive')
                // .set('Content-Length', '288')
                .set('Content-Type', 'application/x-www-form-urlencoded')
                // .set('Content-Type', header)
                // .set('Host', 'www.jsvolunteer.org')
                // .set('Origin', 'http://www.jsvolunteer.org')
                // .set('Referer', 'http://www.jsvolunteer.org/org/default/index?tab=4')
                .set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36')
                // .set('X-Requested-With', 'XMLHttpRequest')
                .set('Cookie', cookie)
                .send(adata)
                .end(function (err, res) {
                    count++
                    if (err) {
                        console.log(i + ':' + err)
                        return
                    }
                    json[i] = 1
                    var text = JSON.parse(res.text)
                    console.log(i + ':' + text.state + text.message)
                    write()
                })
        })
}
function write() {
    if (count % 10 == 0 || count == pages) {
        fs.writeFile(file1, JSON.stringify(json), function (err) {
            if (err)
                throw err
            console.log(file1 + '写入成功');
        })
    }
}
activityList()
// doActivity('4028018259877d6f0159af83c2106871', 2485)