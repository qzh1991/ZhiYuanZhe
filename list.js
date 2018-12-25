var xlsx = require('node-xlsx');
var file = './无名山导出.xlsx'
var address = require('./address')
var fs = require('fs');

const superagent = require('superagent')
require('superagent-charset')(superagent)

var array = []
var count = 0
var pages = 800
var address = address.wumingshan.area
//尝试登录
function list() {
    for (let i = 1; i <= pages; i++) {
        getData(i)
    }
}
function getData(page) {
    superagent.get('http://api.jsvolunteer.org/volunteer/search?regionid=' + address + '&state=3&name=&number=&accountstate=5&page=' + page + '&pagesize=5')
        .set('api-token', '96e9b6de65fc3aeae2481293769d1206')
        .end(function (err, res) {
            try {
                if (res.status != 200) {
                    console.log(res.status);
                    if (res.status == 500) {
                        count++
                        return
                    }
                    getData(page)
                    return
                }
                var text = JSON.parse(res.text)
                if (text.state == 1) {
                    text.data.forEach(d => {
                        if (d.createtime > '2018-12-01') {
                            array.push([d.name, '', d.phone, 1, 1, 0, d.id, d.token, 'ok'])
                        }
                    })
                    console.log('成功' + page);
                    count++
                    newRequest()
                } else {
                    console.log('读取失败' + page);
                }
            } catch (error) {
                console.log(error + '：' + page);
            }
        })
}
function newRequest() {
    if (count == pages) {
        var sheet = [{
            name: 'my',
            data: array
        }]
        var buffer = xlsx.build(sheet);
        fs.writeFile(file, buffer, function (err) {
            console.log('写入成功');
        })
    }
}
list()
