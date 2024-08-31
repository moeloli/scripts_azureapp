# 自建企业微信推送服务
部署：支持PHP和Cloudflare Workers两种部署方式
功能：支持文字推送，卡片推送，和markdown推送（markdown仅支持在企业微信客户端内使用，普通微信仅支持文字和卡片推送）

## Ⅰ 使用方法

### 一、 注册企业微信
注册一个企业微信，很简单，参考大佬教程 `https://github.com/kaixin1995/InformationPush`，然后开通微信插件方便直接在微信查看消息

### 二、 PHP版使用
1. 编辑index.php中corpid、agentid、corpsecret、touser等参数，将修改后的index.php上传至服务器
2. 发送消息，支持GET、 POST FormData两种格式，以下为GET格式参考
	* 普通文字：`http://域名/index.php?msg=测试提交`
	* 卡片消息：`http://域名/index.php?type=textcard&msg=测试提交`
		* 支持自定义卡片URL和btntxt，`http://域名/index.php?type=textcard&msg=测试提交&url=https://www.hostloc.com&btntxt=更多`
	* markdown：`http://域名/index.php?type=markdown&msg=markdown内容`，需urlencode后提交

### 三、 Cloudflare Workers版使用
1. 编辑index.js中corpid、agentid、corpsecret、touser等参数，将修改后的内容复制到Workers中
2. 发送消息，支持GET、 POST JSON、 POST FormData三种格式，以下为GET格式参考
	* 普通文字：`https://*.*.workers.dev/msg=测试提交`
	* 卡片消息：`https://*.*.workers.dev/?type=textcard&msg=测试提交`
		* 支持自定义卡片URL，`https://*.*.workers.dev/?type=textcard&msg=测试提交&url=https://www.hostloc.com`
	* markdown：`https://*.*.workers.dev/?type=markdown&msg=markdown内容`，需urlencode后提交

## Ⅱ 来源
* PHP版来源：
> [通过企业微信发送提醒消息 支持markdown - Hostloc论坛](https://hostloc.com/thread-671986-1-1.html) 
>   
> [kaixin1995/InformationPush - Github](https://github.com/kaixin1995/InformationPush)
* Cloudflare Workers版参考以下内容修改：
> [w2r/cfworker_WeCom](https://github.com/w2r/cfworker_WeCom)，支持如图片、视频、语音等更多格式推送
>
> [thun888/WeChatWork_Push](https://github.com/thun888/WeChatWork_Push)，支持自动判断长文本存入KV
>
> [#教程#cloudflare workers/CF版Server酱，by企业微信通道](https://www.locmjj.com/438.html)