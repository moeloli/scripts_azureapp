addEventListener("fetch", (event) => {
  event.respondWith(postWeChatUrl(event.request));
});

async function gatherResponse(response) {
  const { headers } = response;
  const contentType = headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return JSON.stringify(await response.json());
  } else if (contentType.includes("application/text")) {
    return await response.text();
  } else if (contentType.includes("text/html")) {
    return await response.text();
  } else {
    return await response.text();
  }
}

async function postWeChatUrl(request) {
  // -----------以下为需要修改区域-----------

  // 企业id，企业秘钥，应用id
  var corpid = "your_corpid";
  var corpsecret = "your_corpsecret";
  var agentid = "your_agentid";

  // 设置推送用户，"@all"为全部人，多个用户用|链接，比如"A|B|C"
  var touser = "@all";

  // -----------以上为需要修改区域-----------

  const init = {
    headers: {
      "content-type": "application/json;charset=UTF-8",
    },
  };
  // 发出get请求获得token
  const response = await fetch("https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=" + corpid + "&corpsecret=" + corpsecret, init);
  const results = await gatherResponse(response);
  var jsonObj = JSON.parse(results);
  // 从cf worker请求提取发送内容
  // Get请求
  const req_get = new URL(request.url);
  var type = req_get.searchParams.get("type");
  var title = req_get.searchParams.get("title");
  var msg = req_get.searchParams.get("msg");
  var msg_url = req_get.searchParams.get("url");
  if (!msg) {
    const requestBody = await request.text();
    try {
      //POST请求，JSON格式
      const req_post = JSON.parse(requestBody);
      type = req_post.type;
      title = req_post.title;
      msg = req_post.msg;
      msg_url = req_post.url;
    } catch (error) {
      //POST请求，FormData格式
      const req_post = new URLSearchParams(requestBody);
      type = req_post.get("type");
      title = req_post.get("title");
      msg = req_post.get("msg");
      msg_url = req_post.get("url");
    }
  }

  var key = jsonObj["access_token"];
  var wechat_work_url = "https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=" + key;
  switch (type) {
    // 测试通过
    case "textcard":
      var template = {
        "touser": touser,
        "toall": 0,
        "msgtype": "textcard",
        "agentid": agentid,
        "textcard": {
          "title": title,
          //描述内容支持html
          "description": msg,
          "url": msg_url,
          // 微信端无用，直接删除
          // "btntxt":"更多"
        },
      };

      const init_textcard = {
        body: JSON.stringify(template),
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      };

      // 发送post请求
      const response_textcard = await fetch(wechat_work_url, init_textcard);
      return response_textcard;
      break;

    case "markdown":
      var template = {
        "touser": touser,
        "toall": 0,
        "msgtype": "markdown",
        "agentid": agentid,
        "markdown": {
          "content": msg,
        },
      };

      const init_markdown = {
        body: JSON.stringify(template),
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      };

      // 发送post请求
      const response_markdown = await fetch(wechat_work_url, init_markdown);
      return response_markdown;
      break;
    default:
      var template = {
        "touser": touser,
        "msgtype": "text",
        "agentid": agentid,
        "text": {
          "content": msg,
        },
        "safe": 0,
        "enable_id_trans": 0,
        "enable_duplicate_check": 0,
        "duplicate_check_interval": 1800,
      };

      const init_text = {
        body: JSON.stringify(template),
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      };

      // 发送post请求
      const response_text = await fetch(wechat_work_url, init_text);
      return response_text;
      break;
  }
}