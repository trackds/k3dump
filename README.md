# k3dump
    抓取k3数据的命令行脚本。基于nodejs。需要安装nodejs v7.6.0以上版本。
    该模块为特定环境下内部使用。脱离环境无法使用

## 安装
    npm install -g https://github.com/trackds/k3dump.git

## 使用
    k3dump -u userId -p passwd
###### or
    k3dump -f filename
### 指定月份
    k3dump -u userId -p passwd -m month
###### or
    k3dump -f filename -m month
## 选项
    k3dump --help

    Usage: k3dump [options]

    Options:

    -h, --help            output usage information
    -V, --version         output the version number
    -u, --userId [value]  user name
    -p, --passwd [value]  password
    -m, --month <1..12>   month Is an optional parameter. Default is the current month
    -s, --size <n>        max size Is an optional parameter. Default is 200
    -f, --file [value]    file

### -u, --userId
    一个有效的用户名
### -p, --passwd
    用户名对应的密码
### -m, --month
    需要统计的月份，默认为当前月份
### -s, --size
    解析数据的最大长度，通常不需要设置
### -f, --file
    通过本地文件解析数据，如果设置了该选项可以忽略-u和-p选项。
