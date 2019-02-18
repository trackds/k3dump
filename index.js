const cheerio = require('cheerio');
const fs = require('fs');
const chalk = require('chalk');
const bluebird = require('bluebird');
const request = bluebird.promisifyAll(require('request'));
const {urlSafeEcode,urlSafeDecode} = require('./urlSafeEcode.js');
const prom = require("commander");
const afs = bluebird.promisifyAll(fs);
const package = require('./package.json');

/**
 * @typedef  {{start:Date, end:Date, isWeek:Boolean, isOvertime:Boolean, overtimeLen:Number, workTime:Number}} record
 * 
*/

prom.version(package.version)
    .option("-u, --userId [value]", "user name")
    .option("-p, --passwd [value]", "password")
    .option("-m, --month <1..12>", "month Is an optional parameter. Default is the current month", parseInt)
    .option("-s, --size <n>", "max size Is an optional parameter. Default is 200", parseInt)
    .option("-f, --file [value]", "file")
    .parse(process.argv);

const MONTH = prom.month ? ~~prom.month:new Date().getMonth() + 1;
const SIZE = prom.size ? ~~prom.size:200;
const MENU_ID = {"attendance":"17ed1c51-183e-495a-a4e0-30413d4e1d77"};
let txtUserName = prom.userId;
let UserPwd = prom.passwd;
let domFile = prom.file;

if (!domFile) {
    if (!(txtUserName && UserPwd)) {
        console.error("user name or password can't null");
        return;
    }
}

/**
 * @type {record[]}
 * 
*/
let records = [];

let opt = {
        headers:{
            Accept: 'image/gif, image/jpeg, image/pjpeg, application/x-ms-application, application/xaml+xml, application/x-ms-xbap, application/msword, application/vnd.ms-powerpoint, application/vnd.ms-excel, */*',
            Referer: 'http://10.28.100.48/KDHRMS/login.aspx',
            'Accept-Language': 'en-US,en;q=0.8,zh-Hans-CN;q=0.5,zh-Hans;q=0.3',
            'User-Agent': 'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 10.0; WOW64; Trident/7.0; .NET4.0C; .NET4.0E; .NET CLR 2.0.50727; .NET CLR 3.0.30729; .NET CLR 3.5.30729; InfoPath.2)',
            'Content-Type': 'application/x-www-form-urlencoded',
            Host: '10.28.100.48',
            Connection: 'Keep-Alive',
            'Cache-Control': 'no-cache'
        },
        "forever":true,
        body:"__EVENTTARGET=Image1&__EVENTARGUMENT=&__VIEWSTATE=%2FwEPDwUKMTMxMjEzODA0Mw8WCh4LY3VsdHVyZUluZm8oKW1TeXN0ZW0uR2xvYmFsaXphdGlvbi5DdWx0dXJlSW5mbywgbXNjb3JsaWIsIFZlcnNpb249Mi4wLjAuMCwgQ3VsdHVyZT1uZXV0cmFsLCBQdWJsaWNLZXlUb2tlbj1iNzdhNWM1NjE5MzRlMDg5FENoaW5lc2UgKFNpbXBsaWZpZWQpHg9Jc1Jlc2V0UGFzc3dvcmQFATAeDklzVmFsaWRhdGVDb2RlBQEwHhFQYXNzcG9ydExvZ2luVXNlZAUBMB4OTGljZW5zZUNvbXBhbnkFPOacrOi9r%2BS7tuS9v%2BeUqOadg%2BWxnuS6ju%2B8mua3seWcs%2BW4guWFsei%2Fm%2BeUteWtkOaciemZkOWFrOWPuBYEZg8WAh4EVGV4dGVkAgEPZBYGAggPEGQQFQQY6JOd5rW35py65qKw5pyJ6ZmQ5YWs5Y%2B4A1QmVwxUZXN0MjAxNTAxMjcMVEVTVDIwMTUwNjAzFQQBMQEyAjg5AjkwFCsDBGdnZ2dkZAIODxYCHgV2YWx1ZQUG56Gu5a6aZAIPDxYCHwYFBuehruWummRk8Ulw1%2B7i8Y%2F98KeOk4tf4RpCZ%2FQ%3D&txtWorkstation=&hdLanguageType=zh-chs&hdLoginCmpNumber=&hdLoginCmpPwd=&hdDisplayType=0&hdNTUser=&hdK3User=&hdLoginSystem=0&rbLoginMode=LOGINFROMK3USER&ddlDatabases=2&txtUserName=12390&UserPwd=19900321holo&txtBackEmail=&txtUniqueNum="
    }
let getOpt = {
    headers:{
        Accept: 'image/gif, image/jpeg, image/pjpeg, application/x-ms-application, application/xaml+xml, application/x-ms-xbap, application/msword, application/vnd.ms-powerpoint, application/vnd.ms-excel, */*',
        Referer: 'http://10.28.100.48/KDHRMS/login.aspx',
        'Accept-Language': 'en-US,en;q=0.8,zh-Hans-CN;q=0.5,zh-Hans;q=0.3',
        'User-Agent': 'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 10.0; WOW64; Trident/7.0; .NET4.0C; .NET4.0E; .NET CLR 2.0.50727; .NET CLR 3.0.30729; .NET CLR 3.5.30729; InfoPath.2)',
        Host: '10.28.100.48',
        Connection: 'Keep-Alive',
        'Cache-Control': 'no-cache'
    },
    "forever":true
}

async function netmod () {
    let res = await request.getAsync("http://10.28.100.48/KDHRMS/login.aspx", getOpt);
    let body = "";
    let idxHTML = res.body;
    let $ = cheerio.load(idxHTML);
    let __EVENTTARGET = $("#__EVENTTARGET").val();
    let __EVENTARGUMENT = $("#__EVENTARGUMENT").val();
    let __VIEWSTATE = $("#__VIEWSTATE").val();
    let txtWorkstation = $("#txtWorkstation").val();
    let hdLanguageType = $("#hdLanguageType").val();
    let hdLoginCmpNumber = $("#hdLoginCmpNumber").val();
    let hdLoginCmpPwd = $("#hdLoginCmpPwd").val();
    let hdDisplayType = $("#hdDisplayType").val();
    let hdNTUser = $("#hdNTUser").val();
    let hdK3User = $("#hdK3User").val();
    let hdLoginSystem = $("#hdLoginSystem").val();
    let rbLoginMode = $("#rbLoginFromK3User").val();
    let ddlDatabases = $("#ddlDatabases").val();
    let txtBackEmail = $("#txtBackEmail").val();
    let txtUniqueNum = $("#txtUniqueNum").val();
    __EVENTTARGET = __EVENTTARGET ? __EVENTTARGET : "Image1";
    __EVENTARGUMENT = __EVENTARGUMENT ? __EVENTARGUMENT : "";
    __VIEWSTATE = __VIEWSTATE ? __VIEWSTATE : "";
    txtWorkstation = txtWorkstation ? txtWorkstation : "";
    hdLanguageType = hdLanguageType ? hdLanguageType : "";
    hdLoginCmpNumber = hdLoginCmpNumber ? hdLoginCmpNumber : "";
    hdLoginCmpPwd = hdLoginCmpPwd ? hdLoginCmpPwd : "";
    hdDisplayType = hdDisplayType ? hdDisplayType : "";
    hdNTUser = hdNTUser ? hdNTUser : "";
    hdK3User = hdK3User ? hdK3User : "";
    hdLoginSystem = hdLoginSystem ? hdLoginSystem : "";
    rbLoginMode = rbLoginMode ? rbLoginMode : "";
    ddlDatabases = ddlDatabases ? ddlDatabases : "";
    txtBackEmail = txtBackEmail ? txtBackEmail : "";
    txtUniqueNum = txtUniqueNum ? txtUniqueNum : "";

    ddlDatabases = 2;
    body = `__EVENTTARGET=${__EVENTTARGET}&__EVENTARGUMENT=${__EVENTARGUMENT}&__VIEWSTATE=${urlSafeEcode(__VIEWSTATE)}&txtWorkstation=${txtWorkstation}&hdLanguageType=${hdLanguageType}&hdLoginCmpNumber=${hdLoginCmpNumber}&hdLoginCmpPwd=${hdLoginCmpPwd}&hdDisplayType=${hdDisplayType}&hdNTUser=${hdNTUser}&hdK3User=${hdK3User}&hdLoginSystem=${hdLoginSystem}&rbLoginMode=${rbLoginMode}&ddlDatabases=${ddlDatabases}&txtUserName=${txtUserName}&UserPwd=${UserPwd}&txtBackEmail=${txtBackEmail}&txtUniqueNum=${txtUniqueNum}`;
    opt.body = body;

    res = await request.postAsync("http://10.28.100.48/KDHRMS/login.aspx",opt);
    let response = res;

    if (response.headers['set-cookie']) {
        /**
         * @type {[]}
        */
        let cookieSet = response.headers['set-cookie'];
        let cookie = "";
        for (let i = 0; i < cookieSet.length; i++) {
            cookie = cookie + cookieSet[i] + ' '
        }
        getOpt.headers.Cookie = cookie;
    }
    res = await request.getAsync("http://10.28.100.48/KDHRMS/HumanManage/PersonalMain.aspx?type=Attendance", getOpt);
    body = res.body;
    $ = cheerio.load(body);
    let emp_id = "fa746190-6841-4b03-b4d3-765b6f08e29a";
    emp_id = $("#treeview table a")[0].attribs.href;
    emp_id = emp_id.slice(emp_id.indexOf("EM_ID=") + 6);

    res = await request.getAsync("http://10.28.100.48/KDHRMS/ATSManage/PersonCardRecord.aspx?EM_ID=" + emp_id, getOpt);
    body = res.body;
    $ = cheerio.load(body);
    __EVENTTARGET = "dgItemList";
    __EVENTARGUMENT = "ChangePageSize%2C"+SIZE;
    __VIEWSTATE = urlSafeEcode($("#__VIEWSTATE").val());
    let dgItemList_PageIndex = urlSafeEcode($("#dgItemList_PageIndex").val());;
    let dgItemList_PageSize = SIZE;
    let condition = "";
    let buf = `__EVENTTARGET=${__EVENTTARGET}&__EVENTARGUMENT=${__EVENTARGUMENT}&__VIEWSTATE=${__VIEWSTATE}&dgItemList_PageIndex=${dgItemList_PageIndex}&dgItemList_PageSize=${dgItemList_PageSize}&condition=${condition}&emp_id=${emp_id}`;
    opt.headers.Cookie = getOpt.headers.Cookie;
    opt.body = buf;


    res = await request.postAsync("http://10.28.100.48/KDHRMS/ATSManage/PersonCardRecord.aspx?EM_ID="+emp_id, opt);
    let data = res.body;
    printK3info(data);
}

async function filemod() {
    try {
        let data = await afs.readFileAsync(domFile);
        printK3info(data);
    } catch (e) {
        console.error("打开文件出错");
    }

}

function printK3info(data) {
    let $ = cheerio.load(data.toString('utf-8'));
    let tr = $('#dgItemList tr');

    let next = tr;
    let currDay = null;
    let count = 0;
    while (next) {
        let itemid = next.attr("itemid");
        
        if (itemid) {
            count = 0;
            let aday = new Date(itemid);
            let isWeek = (aday.getDay() === 6) || (aday.getDay() === 0);
            let isOvertime = isWeek;

            if (aday.getHours() < 9) {
                aday.setHours(9);
                aday.setMinutes(0);
                aday.setSeconds(0);
            }
            if ( (aday.getFullYear() == new Date().getFullYear()) &&  (aday.getMonth() + 1 > MONTH)) {
                next = next.next();
                continue;
            }
            if (currDay === null) {
                currDay = aday;
                records.push({start:currDay,end:currDay, isWeek:isWeek, isOvertime:false, overtimeLen:0, workTime:0});
            } else {
                if (currDay.getDate() != aday.getDate()) {
                    let tmp = records[records.length - 1];
                    let len = tmp.end.getHours() - currDay.getHours() + ((tmp.end.getMinutes() - currDay.getMinutes()) / 60);
                    if (/*!tmp.isWeek && */currDay.getHours() < 13) {
                        len --;//减去午休时间
                    }
                    tmp.start = currDay;
                    tmp.isOvertime = tmp.isWeek ? true : (len > (8 + 1));
                    tmp.overtimeLen = tmp.isOvertime ? (tmp.isWeek ? len : (len - 8.5)) : 0;
                    tmp.workTime = len < 0 ? 0 : len;

                    if ((aday.getMonth() + 1 < MONTH) || (currDay.getFullYear() > aday.getFullYear())) {
                        break;
                    }
                    currDay = aday;
                    records.push({start:currDay, end:currDay, isWeek:isWeek, isOvertime:false, overtimeLen:0, workTime:0});
                } else {
                    currDay =  aday;
                }
            }

        } else {
            if (count > 10) break;
            count++;
        }

        next = next.next();
    }

    let workTimeLenSum = 0;
    let overTimeDays = 0;
    let overTimeSum = 0;
    let dailyOverTimeDays = 0;
    let dailyOverTimeSum = 0;
    let weekOverTimeDays = 0;
    let weekOverTimeSum = 0;
    let weekOverTimeGe4Days= 0;
    let weekOverTimeGe8Days = 0;
    let weekOverTimeLt4Days = 0;

    console.log("日期\t\t\t\t工作时长\t\t\t\t加班时间\t\t\t\t是否周末");
    console.log("------------------------------------------------------------------------------------------------------------------------------------");

    for(let i = 0; i < records.length; i++) {
        if (records[i].isOvertime) {
            overTimeDays++;
            overTimeSum += records[i].overtimeLen;
            if (records[i].isWeek) {
                weekOverTimeDays ++;
                weekOverTimeSum += records[i].overtimeLen;
                if (records[i].overtimeLen >= 4 && records[i].overtimeLen < 8) {
                    weekOverTimeGe4Days++;
                } else if (records[i].overtimeLen >= 8) {
                    weekOverTimeGe8Days++;
                } else {
                    weekOverTimeLt4Days++;
                }
                
            } else {
                dailyOverTimeDays ++;
                dailyOverTimeSum += records[i].overtimeLen;
            }
        }
        workTimeLenSum +=records[i].workTime;
        let str = `${records[i].start.toLocaleString()}-${records[i].end.toLocaleTimeString()}\t${records[i].workTime.toFixed(2)}\t\t\t\t\t${records[i].overtimeLen.toFixed(2)}\t\t\t\t\t${records[i].isWeek ? `√`:""}`;
        if (records[i].isOvertime) {
            str = chalk.green(str);
        } else if(records[i].workTime < 8) {
            str = chalk.yellow(str);
        } else {
            str = chalk.white(str);
        }
        console.log(str);
    }
    let overTimeSumStr = overTimeSum >= 50 ? chalk.green(overTimeSum.toFixed(2)) : chalk.bold.red(overTimeSum.toFixed(2));
    console.log("------------------------------------------------------------------------------------------------------------------------------------");
    console.log(`工作天数:${records.length}`);
    console.log(`工作总时长:${workTimeLenSum.toFixed(2)}`);

    console.log(`加班总天数:${overTimeDays}`);
    console.log(`加班总时长:${overTimeSumStr}`);

    console.log(`平时加班总天数:${dailyOverTimeDays}`);
    console.log(`平时加班时长:${dailyOverTimeSum.toFixed(2)}`);

    console.log(`周末加班总天数:${weekOverTimeDays}`);
    console.log(`周末加班总时长:${weekOverTimeSum.toFixed(2)}`);
    console.log(`周末加班>4小时天数:${weekOverTimeGe4Days}`);
    console.log(`周末加班>8小时天数:${weekOverTimeGe8Days}`);
    console.log(`周末加班无效天数:${weekOverTimeLt4Days}`);
}


if (domFile) {
    filemod()
} else {
    netmod();
}