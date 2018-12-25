var express = require('express');
var app = express();
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
const superagent = require('superagent')
require('superagent-charset')(superagent)
const cheerio = require('cheerio')

var regUrl = 'http://www.jsvolunteer.org/login/login/register?type=zyz'
var loginUrl = 'http://api.jsvolunteer.org/volunteer/login'
var completeUrl = 'http://www.jsvolunteer.org/login/login/personal-complete'
var csrf = ''
var cookie = ''
var data
//尝试注册
function register() {
    //获取csrf
    return new Promise((resolve, reject) => {
        superagent.get(regUrl)
            // .set('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8')
            // .set('Accept-Encoding', 'gzip, deflate')
            // .set('Accept-Language', 'zh-CN,zh;q=0.9')
            // .set('Cache-Control', 'max-age=0')
            // .set('Connection', 'keep-alive')
            // .set('Cookie', cookie)
            // .set('Host', 'www.jsvolunteer.org')
            // .set('Referer', 'http://my.jsvolunteer.org/')
            // .set('Upgrade-Insecure-Requests', '1')
            // .set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36')
            .end(function (err, res) {
                try {
                    cookie = res.header['set-cookie'][0]
                    var $ = cheerio.load(res.text);
                    csrf = $('#_csrf').val()
                    var registerData = {
                        user: data.user,
                        pwd: data.pwd,
                        regtype: 'zyz',
                        _csrf: csrf
                        // _csrf: 'n2Zz2RY31bDw1gRWSDzMybBpVDSW3Dm1Zw0-v1GdOKLKOR2tYnSj6bK7Th0dRaqIxiYDYd20e8MuSGHZB84LyA=='
                    }
                } catch (error) {
                    reject(err)
                }

                superagent.post(regUrl)
                    // .set('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8')
                    // .set('Accept-Encoding', 'gzip, deflate')
                    // .set('Accept-Language', 'zh-CN,zh;q=0.9')
                    // .set('Cache-Control', 'max-age=0')
                    // .set('Connection', 'keep-alive')
                    // .set('Content-Length', '138')
                    .set('Content-Type', 'application/x-www-form-urlencoded')
                    // .set('Cookie', '_csrf=1ae2b618ab827380039b03d8cbfc9019747abbca835fb668de0a3bff11c06ee6a%3A2%3A%7Bi%3A0%3Bs%3A5%3A%22_csrf%22%3Bi%3A1%3Bs%3A32%3A%22U_nttCvYBmJKUyfAvOWUKhBvIE_fVS3j%22%3B%7D')
                    .set('Cookie', cookie)
                    // .set('Host', 'www.jsvolunteer.org')
                    // .set('Origin', 'http://www.jsvolunteer.org')
                    // .set('Referer', 'http://www.jsvolunteer.org/login/login/register?type=zyz')
                    // .set('Upgrade-Insecure-Requests', '1')
                    // .set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36')
                    .send(registerData)
                    .end(function (err, res) {
                        if (res && res.status == 200) {
                            let $ = cheerio.load(res.text);
                            let p = $('.zyzmessage p')
                            if (p && p.text().indexOf('占用') > -1) {
                                console.log('已存在' + data.user)
                            }
                            data.reg = 1
                            resolve()
                        } else {
                            console.log('注册网络错误' + data.user + "-" + err)
                            reject(err)
                        }
                    });
            })
    })
}

//尝试登录
function login() {
    var loginData = {
        user: data.user,
        pwd: data.pwd,
        role: 'volunteer',
        callback: 'http://www.jsvolunteer.org',
    }
    return new Promise((resolve, reject) => {
        superagent.post(loginUrl)
            .send(loginData)
            .end(function (err, res) {
                try {
                    if (!err) {
                        if (typeof (res) == 'string') {
                            res = JSON.parse(res)
                        }
                        var text = JSON.parse(res.text)
                        if (text.state == 1) {
                            let token = text.data.token;
                            let cookie = writeCookie("jsvol-token", token, 168, 'jsvolunteer.org');
                            data.token = token
                            data.cookie = cookie
                            data.id = text.data.info.id
                            data.complete = text.data.info.completion
                            if (text.data.info.certificates_number) {
                                data.zjhm = text.data.info.certificates_number
                            }
                        } else {
                            reject(text.message)
                        }
                    }
                } catch (error) {
                    reject(error + res.message)
                }
                resolve(res)
            })
    })
}


async function doComplete() {
    return new Promise((resolve, reject) => {
        var getCompleteUrl = 'http://www.jsvolunteer.org/login/login/complete?type=zyz&uid=' + data.id
        superagent.get(getCompleteUrl)
            .end(function (err, res) {
                try {
                    if (err) {
                        return reject(err)
                    }
                    var $ = cheerio.load(res.text);
                    var header = res.header['set-cookie']
                    var cookie

                    if (header) {
                        cookie = header[0]
                    } else {
                        return reject(err)
                    }
                    var csrf = $('#_csrf').val()
                } catch (err) {
                    return reject(err)
                }
                // var csrf = 'HYUPTb1kLjWeyrRmJt5zgT_lD8GlM9FLFLXPlyTuODZMxz009xNcf8uIxwJFrEvbXdxHgNdWq3ld3onjc8N3Ww=='
                // var cookie = '_csrf=9976046834a2104ec59a96d91e6350320d1d1b2245f5b60fc8136fcf7c6a5f92a%3A2%3A%7Bi%3A0%3Bs%3A5%3A%22_csrf%22%3Bi%3A1%3Bs%3A32%3A%22QB2yJwrJUBsdcr8Zb9HArez2IkFtW-Om%22%3B%7D; _bl_uid=qyjRmp1Rtndfhg6kdjk1xwgcIkee'
                completeData = {
                    uid: data.id,
                    zhengjian: '1',
                    zjhm: data.zjhm,
                    name: data.name,
                    sex: '1',
                    datetimepicker: getBirthday(data.zjhm),
                    Native_place: '',
                    country: '25',
                    political_status: '8ad881c94d9e8cc8014d9e8deae1017e',
                    edu: '8ad881c94d9e8cc8014d9e8ded640180',
                    nation: '34',
                    email: '',
                    Zip_code: '',
                    area: data.area,
                    school: '',
                    Study_major: '',
                    Work_unit: '',
                    Unit_address: '',
                    positional_titles: '',
                    post: '',
                    zyzskills: '',
                    zyztype: '',
                    servicetime: '',
                    serviceobj: '',
                    servicearea: '',
                    _csrf: csrf
                }
                superagent.post(completeUrl)
                    // .set('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8')
                    // .set('Accept-Encoding', 'gzip, deflate')
                    // .set('Accept-Language', 'zh-CN,zh;q=0.9')
                    // .set('Cache-Control', 'max-age=0')
                    // .set('Connection', 'keep-alive')
                    // .set('Content-Length', '138')
                    .set('Content-Type', 'application/x-www-form-urlencoded')
                    // .set('Cookie', '_csrf=1ae2b618ab827380039b03d8cbfc9019747abbca835fb668de0a3bff11c06ee6a%3A2%3A%7Bi%3A0%3Bs%3A5%3A%22_csrf%22%3Bi%3A1%3Bs%3A32%3A%22U_nttCvYBmJKUyfAvOWUKhBvIE_fVS3j%22%3B%7D')
                    .set('Cookie', cookie)
                    // .set('Host', 'www.jsvolunteer.org')
                    // .set('Origin', 'http://www.jsvolunteer.org')
                    // .set('Referer', 'http://www.jsvolunteer.org/login/login/register?type=zyz')
                    // .set('Upgrade-Insecure-Requests', '1')
                    // .set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36')
                    .send(completeData)
                    .end(function (err, res) {
                        try {
                            if (!err) {
                                if (res && res.status == 200 && JSON.parse(res.text).data.state == 1) {
                                    data.complete = 1
                                    data.message = 'ok'
                                    resolve();
                                } else {
                                    reject(JSON.parse(res.text).data.errors)
                                }
                            } else {
                                reject(err)
                            }
                        } catch (err) {
                            reject(err)
                        }
                    })
            })
    })
}

async function doJoin() {
    return new Promise((resolve, reject) => {
        superagent.get('http://www.jsvolunteer.org/query/query/joinorg?key=' + data.org)
            .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
            .set('Cookie', data.cookie)
            .set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36')
            .end(function (err, res) {
                data.joined = 1
                data.message = 'ok'
                resolve(res)
            })
    })
}

function doUpdatePwd() {
    var oldPwd = 'tc123456'
    var newPwd = 'wms123'
    var loginData = {
        user: data.user,
        pwd: oldPwd,
        role: 'volunteer',
        callback: 'http://www.jsvolunteer.org',
    }
    return new Promise((resolve, reject) => {
        superagent.post(loginUrl)
            .set('Accept', '*/*')
            .set('Accept-Encoding', 'gzip, deflate')
            .set('Accept-Language', 'zh-CN,zh;q=0.9')
            .set('Connection', 'keep-alive')
            .set('Content-Length', '74')
            .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
            .set('Host', 'api.jsvolunteer.org')
            .set('Origin', 'http://my.jsvolunteer.org')
            .set('Referer', 'http://my.jsvolunteer.org/')
            .set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36')
            .send(loginData)
            .end(function (err, res) {
                try {
                    var text = JSON.parse(res.text)
                    var token = ''
                    if (text.state == 1) {
                        token = text.data.token
                    } else {
                        if (text.message == '账号不存在') {
                            register()
                        }
                        return reject(text.message)
                    }
                } catch (error) {
                    return reject(error)
                }

                var domain = 'jsvolunteer.org'
                cookie = writeCookie("jsvol-token", token, 168, domain);
                var pwdData = {
                    pwd: oldPwd,
                    newpwd: newPwd,
                }
                superagent.post('http://www.jsvolunteer.org/user/user/pwd-update')
                    .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
                    .set('Cookie', cookie)
                    .set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36')
                    .send(pwdData)
                    .end(function (err, res) {
                        data.joined = 1
                        data.message = 'ok'
                        resolve()
                    })
            })
    })
}
function getBirthday(idCard) {
    var birthday = "";
    if (idCard != null && idCard != "") {
        if (idCard.length == 15) {
            birthday = "19" + idCard.substr(6, 6);
        } else if (idCard.length == 18) {
            birthday = idCard.substr(6, 8);
        }
        birthday = birthday.replace(/(.{4})(.{2})/, "$1-$2-");
    }
    return birthday;
}
function writeCookie(name, value, hours, url) {
    var expire = "";
    if (hours != null) {
        expire = new Date((new Date()).getTime() + hours * 3600000);
        expire = "; expires=" + expire.toGMTString();
    }
    var domain = '; path=/; domain=' + url
    return name + "=" + value + expire + domain + '; type=zyz';
}
function main(one, pwd) {
    return new Promise(async (resolve, reject) => {
        data = one
        try {
            if (pwd) {
                await doUpdatePwd()
                return resolve(data)
            } else {
                if (!data.joined || !data.token) {
                    if (!data.reg) {
                        //注册
                        await register()
                    }
                    if (data.reg) {
                        //登录
                        await login()
                        if (!data.complete) {
                            //完善个人信息
                            await doComplete()
                        }
                        if (!data.joined) {
                            await doJoin()
                        }
                    }
                }
            }
            resolve(data)
        } catch (error) {
            data.message = error
            reject(error)
        }
    })

}
module.exports = main
