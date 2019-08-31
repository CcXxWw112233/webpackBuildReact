import { message } from 'antd'
import { MESSAGE_DURATION_TIME, INT_REQUEST_OK } from "../globalset/js/constant";

//用来处理返回的数据
export function handleErrorResponse(data) {
  const { errorCode, message } = data
  if(errorCode != 0){
    message(message, MESSAGE_DURATION_TIME)
  }
}
//判断是否返回正常
export const isApiResponseOk = (response) => {
  return response && Number(response.code) === INT_REQUEST_OK
}
