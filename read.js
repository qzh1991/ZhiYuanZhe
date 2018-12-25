var address = require('./address')
var register = require('./register')
var readline = require('readline');
var xlsx = require('node-xlsx');
var fs = require('fs');
var os = require('os');
// var companies = JSON.parse(fs.readFileSync('./json.json'));
var file1 = './玉泉河/玉泉河.xls'
var list1 = xlsx.parse(file1)[0].data
main(list1, file1, address.yuquanhe)

async function main(list, file, orgName) {
    console.log(list)
    var writeData = []
    var errorData = []
    for (let i = 0; i < list.length; i++) {
        let user = list[i]
        let data = {
            name: user[0],
            zjhm: user[1] + '',
            user: typeof (user[2]) == 'string' ? Number(user[2].replace('。', '').trim()) : user[2],
            reg: user[3],
            complete: user[4],
            joined: user[5],
            id: user[6],
            token: user[7],
            message: user[8],
            pwd: orgName.pwd,
            area: orgName.area,
            org: orgName.org
        }
        try {
            data = await register(data)
            writeData.push([data.name, data.zjhm, data.user, data.reg, data.complete, data.joined, data.id, data.token, data.message])
            console.log(i + orgName.name + ':' + data.user + '成功')
        } catch (err) {
            // if (err == '密码错误') {
            //     i--
            //     continue
            // }
            errorData.push([data.name, data.zjhm, data.user, data.reg, data.complete, data.joined, data.id, data.token, data.message])
            console.log(i + orgName.name + ':' + data.user + '失败' + err)
        }
    }
    var sheet = [{
        name: 'my',
        data: writeData.concat(errorData)
    }]
    var buffer = xlsx.build(sheet);
    fs.writeFile(file, buffer, function (err) {
        if (err)
            throw err
        console.log(file + '写入成功');
    })
}
// main(list5, file5, 5)

