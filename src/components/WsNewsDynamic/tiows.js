import Cookies from 'js-cookie'
import { WEBSOCKET_PATH, WEBSOCKET_PORT } from '../../globalset/js/constant'

let tio = {}
tio.ws = {}

/**
 * @param {*} ws_protocol wss or ws
 * @param {*} ip
 * @param {*} port
 * @param {*} paramStr 加在ws url后面的请求参数，形如：name=张三&id=12
 * @param {*} param 作为tio.ws对象的参数，由业务自己使用，框架不使用
 * @param {*} handler
 * @param {*} heartbeatTimeout 心跳时间 单位：毫秒
 * @param {*} reconnInterval 重连间隔时间 单位：毫秒
 * @param {*} binaryType 'blob' or 'arraybuffer';//arraybuffer是字节
 */
tio.ws = function (ws_url, ip, port, paramStr, param, handler, heartbeatTimeout, reconnInterval, binaryType, calback) {
  this.ip = ip
  this.port = port
  this.url = ws_url//ws_protocol + '://' + ip + ':' + port
  this.binaryType = binaryType || 'arraybuffer'

  if (paramStr) {
    this.url += '?' + paramStr
    this.reconnUrl = this.url + "&"
  } else {
    this.reconnUrl = this.url + "?"
  }
  this.reconnUrl += "tiows_reconnect=true";
  this.param = param

  this.handler = handler
  this.heartbeatTimeout = heartbeatTimeout
  this.reconnInterval = reconnInterval

  this.lastInteractionTime = function () {
    if (arguments.length == 1) {
      this.lastInteractionTimeValue = arguments[0]
    }
    return this.lastInteractionTimeValue
  }

  this.heartbeatSendInterval = heartbeatTimeout / 2

  this.connect = function (isReconnect) {
    let _url = this.url;
    if (isReconnect) {
      const Authorization = Cookies.get('Authorization')
      const { id } = localStorage.getItem('userInfo')?JSON.parse(localStorage.getItem('userInfo')): ''
      // _url = `ws://${WEBSOCKET_PATH}:${WEBSOCKET_PORT}/?uid=${id}&token=${Authorization}&tiows_reconnect=true`;
      _url = `${ws_url}?uid=${id}&token=${Authorization}&tiows_reconnect=true`;

    }
    let ws = new WebSocket(_url)
    this.ws = ws

    ws.binaryType = this.binaryType; // 'arraybuffer'; // 'blob' or 'arraybuffer';//arraybuffer是字节
    let self = this
    ws.onopen = function (event) {
      self.handler.onopen.call(self.handler, event, ws)
      self.lastInteractionTime(new Date().getTime())

      self.pingIntervalId = setInterval(function () {
        self.ping(self)
      }, self.heartbeatSendInterval)
    }
    ws.onmessage = function (event) {
      self.handler.onmessage.call(self.handler, event, ws)
      self.lastInteractionTime(new Date().getTime())
      calback(event)
    }
    ws.onclose = function (event) {
      clearInterval(self.pingIntervalId) // clear send heartbeat task

      try {
        self.handler.onclose.call(self.handler, event, ws)
      } catch (error) {}

      self.reconn(event)
    }
    ws.onerror = function (event) {
      self.handler.onerror.call(self.handler, event, ws)
    }

    return ws
  }

  this.reconn = function (event) {
    let self = this
    setTimeout(function () {
      let ws = self.connect(true)
      self.ws = ws
    }, self.reconnInterval)
  }

  this.ping = function () {
    let iv = new Date().getTime() - this.lastInteractionTime(); // 已经多久没发消息了
    // 单位：秒
    if ((this.heartbeatSendInterval + iv) >= this.heartbeatTimeout) {
      this.handler.ping(this.ws)
    }
  };

  this.send = function(data){
    this.ws.send(data);
  };

}

export default tio
