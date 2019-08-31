import tio from './tiows'
import { Handler } from './Handler'
import Cookies from 'js-cookie'
import { WEBSOCKET_PATH, WEBSOCKET_PORT, WEBSOCKET_URL } from '../../globalset/js/constant'

let ws_protocol = 'ws'; // ws 或 wss
let ip = WEBSOCKET_PATH
let port = WEBSOCKET_PORT
let ws_url = WEBSOCKET_URL
let heartbeatTimeout = 20000; // 心跳超时时间，单位：毫秒
let reconnInterval = 2000; // 重连间隔时间，单位：毫秒
let binaryType = 'blob'; // 'blob' or 'arraybuffer';//arraybuffer是字节
let handler = new Handler()

let tiows
const Authorization = Cookies.get('Authorization')
const { id } = localStorage.getItem('userInfo')?JSON.parse(localStorage.getItem('userInfo')): ''
const initWsFun = (calback) => {
  let queryString = `uid=${id}&token=${Authorization}`
  let param = null
  tiows = new tio.ws(ws_url, ip, port, queryString, param, handler, heartbeatTimeout, reconnInterval, binaryType, calback)
  tiows.connect()
}
export const sendWsFun =(value) => {
  tiows.send(value)
}
export const initWs = initWsFun
export const send = sendWsFun
