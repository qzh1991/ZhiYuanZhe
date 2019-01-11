const superagent = require('superagent')
require('superagent-charset')(superagent)
const cheerio = require('cheerio')
var fs = require('fs');
var address = require('./address')

var act = {
    '4': {
        tab: 4,
        tbodyClass: '.activemange-tab4 tbody',
        spanClass: 'tr td span.addmember-bg-color'
    },
    '5': {
        tab: 5,
        tbodyClass: '.activemange-tab5 tbody',
        spanClass: 'tr td span.timelengthaudit-bg-color'
    }
}

var state = act[5]
var cookie = address.qiaocun.jsvol_token



function activityList(href) {
    href = href || 'http://www.jsvolunteer.org/org/default/index?tab=' + state.tab
    superagent.get(href)
        .set('Cookie', cookie)
        .retry(10)
        .end(async function (err, res) {
            if (err) {
                console.log(err)
                return
            }
            if (res && res.status == 200) {
                let $ = cheerio.load(res.text);
                let tbody = $(state.tbodyClass)
                if (1) {
                    for (let i = 1; i < tbody.length; i++) {
                        actID = $(tbody).eq(i).find(state.spanClass).attr('data-value');
                        check(i, actID)
                    }
                } else {
                    let i = 5
                    actID = $(tbody).eq(i).find(state.spanClass).attr('data-value');
                    check(i, actID)
                }
            }
        })
}

function check(i, actID) {
    superagent.get('http://www.jsvolunteer.org/query/query/volunteer_activities_detail?id=' + actID)
        .set('Cookie', cookie)
        .retry(10)
        .end(async function (err, res) {
            if (err) {
                console.log(err)
                return
            }
            if (res && res.status == 200) {
                let $ = cheerio.load(res.text);
                let title = $('.zi.text_ellipsis.fl').text()
                let text = $('.baoming.clx').text().replace(/\s+/g, "")
                console.log([i, title, text].join('-'))

            }
        })
}
activityList()