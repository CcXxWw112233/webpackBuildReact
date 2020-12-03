import { isApiResponseOk } from '../../../utils/handleResponseData'
import { message } from 'antd'
import { currentNounPlanFilterName } from '../../../utils/businessFunction'
import { MESSAGE_DURATION_TIME, FILES } from '../../../globalset/js/constant'
import { getSubfixName } from '../../../utils/businessFunction'
import { fileDownload } from '../../../services/technological/file'

let board_id = null
let appsSelectKey = null
let card_id = null

export default {
  namespace: 'publicFileDetailModal',
  state: {
    filePreviewCurrentFileId: '',
    fileType: '',
    isInOpenFile: false,
    isOpenAttachmentFile: false // 是否打开附件或其他文件
  },
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(location => {})
    }
  },
  effects: {
    // 工作台中点击路由跳转进来
    *previewFileByUrl({ payload }, { select, call, put }) {
      const { file_id, file_name } = payload
      // let res = yield call(fileInfoByUrl, { id: file_id })
      yield put({
        type: 'updateDatas',
        payload: {
          filePreviewCurrentFileId: file_id,
          fileType: getSubfixName(file_name),
          isInOpenFile: true,
          filePreviewCurrentName: file_name
        }
      })
    },

    *fileDownload({ payload }, { select, call, put }) {
      function openWin(url) {
        var element1 = document.createElement('a')
        element1.href = url
        element1.download = url // 需要加上download属性
        element1.id = 'openWin'
        document.querySelector('body').appendChild(element1)
        document.getElementById('openWin').click() //点击事件
        document
          .getElementById('openWin')
          .parentNode.removeChild(document.getElementById('openWin'))
      }

      let res = yield call(fileDownload, payload)
      if (isApiResponseOk(res)) {
        const data = res.data
        if (data && data.length) {
          // 循环延时控制
          for (let i = 0; i < data.length; i++) {
            setTimeout(() => openWin(data[i]), i * 500)
          }
        }
      } else {
        message.warn(res.message, MESSAGE_DURATION_TIME)
      }
    }
  },
  reducers: {
    updateDatas(state, action) {
      return {
        ...state,
        ...action.payload
      }
    }
  }
}
