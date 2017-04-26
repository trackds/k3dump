
/**
 * @typedef {{a:String, b:String}} smap
*/

/**
 * @type {smap[]}
*/
let strLit = [
    {a:";", b:"%3B"},
    {a:"/", b:"%2F"},
    {a:"?", b:"%3F"},
    {a:":", b:"%3A"},
    {a:"@", b:"%40"},
    {a:"=", b:"%3D"},
    {a:"&", b:"%26"},
    {a:"<", b:"%3C"},
    {a:">", b:"%3E"},
    {a:"\"", b:"%22"},
    {a:"#", b:"%23"},
    // {a:"%", b:"%25"},
    {a:"{", b:"%7B"},
    {a:"}", b:"%7D"},
    {a:"|", b:"%7C"},
    {a:"\\", b:"%5C"},
    {a:"^", b:"%5E"},
    {a:"~", b:"%7E"},
    {a:"[", b:"%5B"},
    {a:"]", b:"%5D"},
    {a:"`", b:"%60"},
    {a:" ", b:"%20"},
    {a:"+", b:"%2B"},
    {a:",", b:"%2C"}
];

/**
 * 将字符转为URL安全编码
 * @param str {String}
 * @return {String}
*/
function urlSafeEcode(str) {
    if (!str) {
        return str;
    }
    let retStr = str;

    strLit.forEach((val, idx, arr) => {
        let r = "";
        if (val.a === "?") {
            r = /\?/;
        } else if (val.a === "+") {
            r = /\+/;
        } else if (val.a === "|") {
            r = /\|/;
        } else if (val.a === "\\") {
            r = /\\/;
        } else if (val.a === "[") {
            r = /\[/;
        } else if (val.a === "]") {
            r = /\]/;
        } else if (val.a === "^") {
            r = /\^/;
        } else {
            r = val.a;
        }
        let reg = new RegExp(r,"g");

        retStr = retStr.replace(reg, val.b);
    });
    return retStr;
}

/**
 * 将URL安全编码转为普通字符
 * @param str {String}
 * @return {String}
*/
function urlSafeDecode(str) {
    if (str) {
        return str;
    }
    let retStr = str;

    strLit.forEach((val, idx, arr) => {
        let reg = new RegExp(val.b,"g");
        retStr = retStr.replace(reg, val.a);
    });

    return retStr;
}

module.exports.urlSafeEcode = urlSafeEcode;
module.exports.urlSafeDecode = urlSafeDecode;