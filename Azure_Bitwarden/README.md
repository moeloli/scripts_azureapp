# Description说明
本脚本和YML配置文件用于使用Azure的免费Web应用程序搭建自己的[开源密码管理程序Vaultwarden（原Bitwarden_rs）](https://github.com/dani-garcia/vaultwarden/)服务端，并定时备份到Web应用自带的存储空间，也可以备份到远程FTP、WevDAV服务器，且程序启动自动还原数据，方便使用。

#### YML的相关说明
前一部分为Vaultwarden自带的环境变量，后一部分为自动备份脚本所需的变量。需要实现Vaultwarden的其他个性化设置可以参考官方[ENV列表](https://github.com/dani-garcia/vaultwarden/blob/main/.env.template)

* Attention注意：VaultWarden请使用1.31.0及以上版本，旧版所需环境变量已删除。
```
* I_REALLY_WANT_VOLATILE_STORAGE=true        # 从1.25.1版本开始需要加上此环境变量，否则无法启动
* SIGNUPS_ALLOWED=true                       # 允许注册新用户，设置为false则禁止新注册
* WEB_VAULT_ENABLED=true                     # 用户web页面，设置为false则关闭
* ADMIN_TOKEN=your_web_admin_panel_password  # web管理员页面的密码，不设置则关闭管理面板，详细请阅读README.md
* DOMAIN=https://your_domain                 # 域名设置，免费F1计划域名格式为http://xxx.azurewebsites.net
* PUSH_ENABLED=true                          # 启用移动端实时推送，密码变化后实时自动同步。禁用请删除本行。详细请阅读README.md
* PUSH_INSTALLATION_ID=your_id               # 移动端实时推送API的ID。禁用请删除本行。
* PUSH_INSTALLATION_KEY=your_key             # 移动端实时推送API的KEY。禁用请删除本行。

* REALTIME_BAK_CYCLE=10                      # 定时备份间隔分钟数，需要能被60整除，设置为0则关闭所有备份（包括FTP/WebDAV备份）
* REALTIME_BAK_COUNTS=30                     # 定时备份的最大保留份数，设置为0则保留24小时内不限制数量的备份
* DAILY_BAK_COUNTS=5                         # FTP/WebDAV每日备份的保留份数，每天北京时间0时备份
* FTP_URL=ftp://your_ftp_url/your_folder/    # FTP备份地址，必须以/结尾，否则会出现错误。禁用远程FTP备份须删除本行。
* FTP_USER=your_ftp_username                 # FTP用户名。禁用远程FTP备份请删除本行。
* FTP_PASS=your_ftp_password                 # FTP密码。禁用远程FTP备份请删除本行。
* WEBDAV_URL=http://webdav_url/your_folder/  # WebDAV备份地址，必须以/结尾，否则会出现错误。禁用远程WebDAV备份须删除本行。
* WEBDAV_USER=your_webdav_username           # WebDAV用户名。禁用远程WebDAV备份请删除本行。
* WEBDAV_PASS=your_webdav_password           # WebDAV密码。禁用远程WebDAV备份请删除本行。
```

#### Backup & Restore备份与还原
* 环境变量`REALTIME_BAK_CYCLE`为定时备份周期，该项必须设置成60的因数，否则可能会有BUG。若为0，则关闭所有备份功能。(eg. 若设置为12，则每小时的第12/24/36/48/60分钟进行备份)
* 定时备份的目录为`/home/site/wwwroot/bitwarden/backup_realtime`，可通过环境变量`REALTIME_BAK_COUNTS`设置保留最新备份的份数，设置为0则不限制数量保留24小时内的备份，考虑到免费的F1计划空间配额是1G，在使用Send或附件等需要存储文件的功能时，需要格外注意。备份文件通过[Usage使用](#Usage使用)中步骤5的Bash或Azure Web Service提供的FTP链接，都可以查看。
* 环境变量`DAILY_BAK_COUNTS`为FTP/WebDAV远程备份的保留份数，远程FTP/WebDAV备份每天北京时间0点进行，同时也可以在`/home/site/wwwroot/bitwarden/backup_daily`中看到
* 启动容器时会进行自动还原操作，优先还原`/home/site/wwwroot/bitwarden/backup_realtime`目录下的最新备份，若没有则检索`/home/site/wwwroot/bitwarden/backup_daily`目录下的最新备份进行还原
* 手动还原： 将备份文件放置到`/home/site/wwwroot/bitwarden/backup_daily`目录下并清空`backup_realtime`和`backup_daily`目录下其他所有备份，重新启动容器即可还原

#### Attention注意
* 移动端实时推送在[Bitwarden原版官网自托管页面](https://bitwarden.com/host/)申请ID和KEY，数据区域选美国。区域选欧洲需要在yml中添加其他环境变量，具体可以查看[VaultWarden官方Wiki](https://github.com/dani-garcia/vaultwarden/wiki/Enabling-Mobile-Client-push-notification)
* 当前免费的F1计划websocket支持最多5个连接，BUG已经解决，参考[Azure官方文档](https://docs.microsoft.com/zh-cn/azure/app-service/containers/app-service-linux-faq#web-sockets)、[Github Issue](https://github.com/MicrosoftDocs/azure-docs/issues/49245)
* 如果需要自己注册完成后，禁止新用户注册，需要在`backup_realtime`中发现注册完成后的新备份之后，才能修改`SIGNUPS_ALLOWED`为false并重启容器
* 用户Web页面登录页面完整打开一次需要流量为6MB左右，而免费的F1计划日限额为165MB，当日流量用完后会导致服务不可访问（403错误），且APP端可以进行绝大部分日常必须的功能（包括注册），所以可以根据自身需求考虑是否需要关闭用户Web界面
* web管理员页面的网站为https://your_domain/admin，[VaultWarden官方文档](https://github.com/dani-garcia/vaultwarden/wiki/Enabling-admin-page)推荐生成随机TOKEN的命令为`openssl rand -base64 48`
* 若绑定了多个域名，为保证最大兼容性环境变量`DOMAIN`可以不设置。域名不设置只会影响部分个人认为不常用的功能，具体可以查看[VaultWarden官方wiki](https://github.com/dani-garcia/vaultwarden/wiki)和[环境变量说明](https://github.com/dani-garcia/vaultwarden/blob/main/.env.template)。但不设置域名会导致登录web管理员页面后自动跳转到localhost，可以通过手动把localhost改成域名解决，也可以直接网页后退然后再刷新页面。
* Azure免费的F1计划不能开启Always On功能，没有流量程序就会自动停止。请保持应用活跃。若使用付费计划，可以按照[Usage使用](#Usage使用)第四步启用始终可用(Always On)功能。

# Usage使用
1. 登录Azure，https://portal.azure.com/
2. 应用程序服务 - 创建 - Web应用。新建或选择已有资源组，输入名称（同时也是二级域名），取消勾选“尝试唯一默认主机名(预览版)”，发布选择容器，操作系统选Linux，区域按需选择，新建或选择已有的Linux计划，定价计划选择免费的F1计划，直接查看并创建，再点击创建
3. 稍等几分钟部署完成后点击转入资源
4. 修改一些环境配置
    * 侧边栏 设置 -> 环境变量 -> 应用设置 -> *WEBSITES_ENABLE_APP_SERVICE_STORAGE* -> 值改为true，部署槽位设置不要勾选，应用-应用-保存。
    * 若使用付费计划，侧边栏 设置 -> 配置 -> 常规设置 -> 始终可用改为开On
5. 侧边栏 开发工具 -> 高级工具 -> 转到 -> 跳转到新标签页，导航栏点击Bash，执行如下命令，可以右键粘贴
```bash
mkdir /home/site/wwwroot/bitwarden
wget -P /home/site/wwwroot/bitwarden/ https://raw.githubusercontent.com/hjh142857/scripts/master/Azure_Bitwarden/bitwarden.sh
```
6. 回到Azure控制台标签页，侧边栏 部署 -> 部署中心，容器类型【Docker Compose (预览版)】，注册表源【Docker Hub】，存储库访问【公开】，持续部署【关】 -> 配置文本框中粘贴自己修改后的yml配置，点击保存
    * 参考[Description说明](#Description说明)，按自己需求修改好docker-compose.yml中的环境变量配置，粘贴完yml配置后点击保存，**环境变量配置完成必须删除所有中文注释，否则无法保存**
7. 侧边栏 概述 -> 重新启动
8. 如需更新镜像，保证两倍定时备份周期内没有提交密码更新或注册新用户，之后按照步骤7重新启动即可。正常情况Azure会自动拉取最新的镜像，如果发现没有自动拉取最新镜像，可以在YML配置文件中修改image项目，指定引用的镜像版本，如把`image: vaultwarden/server:alpine`改成`image: vaultwarden/server:1.32.0-alpine`。建议选择alpine打包的系列以节省免费计划有限的资源配额。

# Tree目录结构
```
[Azure应用服务存储空间/home]/site/wwwroot/bitwarden
    |-----bitwarden.sh         辅助脚本，用于实现Nginx配置生成、定时备份、启动时自动还原等功能
    |-----backup_realtime/     定时备份目录
    |-----backup_daily/        FTP/WebDAV远程备份/日备份的本地目录
```

# ChangeLog更新记录
* 20240831
   * 新增定时备份保留份数选项，防止超出免费空间配额
* 20240829
   * 修复Webdav无法上传的问题
   * 适配基于Debian的vaultwarden镜像，即tag为latest或仅版本号的镜像
* 20240828
   * 修复Vaultwarden容器在Azure中DNS无法解析的问题。参考[Discussions 3941](https://github.com/dani-garcia/vaultwarden/discussions/3941)、[Discussions 3945](https://github.com/dani-garcia/vaultwarden/discussions/3945)、[Discussions 3967](https://github.com/dani-garcia/vaultwarden/discussions/3967)
* 20240827
   * 新增Webdav备份方式
   * 新增支持vaultwarden新特性——移动端实时推送
   * 适配1.31.0版本开始[新的websocket实现方式](https://github.com/dani-garcia/vaultwarden/issues/4024)所需的相关Nginx配置
   * 删除vaultwarden 1.31.0之前版本的相关参数
   * 更新[Usage使用](#Usage使用)中Azure的操作指南
* 20230414
   * 修复1.25.1后版本无法启动的问题，已测试从1.25.1至1.28.1可以正常启动
* 20210508
   * 修复由于原Bitwarden_rs更名为vaultwarden导致的部署失败的问题
* 20200719
   * 修复FTP无法同步的BUG
* 20200616
   * 新增YML配置中`DOMAIN`环境变量，以解决Web Admin登录后自动跳转localhost的问题
   * 新增应用升级后更新镜像的相关说明
   * 新增目录结构说明
