
import { isApiResponseOk } from '../../../utils/handleResponseData'
import { message } from 'antd'
import { currentNounPlanFilterName } from "../../../utils/businessFunction";
import { MESSAGE_DURATION_TIME, FILES } from "../../../globalset/js/constant";
import { getSubfixName } from '../../../utils/businessFunction'
import {
  fileInfoByUrl, fileConvertPdfAlsoUpdateVersion
} from '../../../services/technological/file'

let board_id = null
let appsSelectKey = null
let card_id = null

export default {
  namespace: 'publicFileDetailModal',
  state: {
    filePreviewCurrentFileId: '',
    fileType: '',
    isInOpenFile: false,
    // isOpenAttachmentFile: false
  },
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen((location) => {
      })
    },
  },
  effects: {
    // 工作台中点击路由跳转进来
    * previewFileByUrl({ payload }, { select, call, put }) {
      const { file_id, file_name } = payload
      // let res = yield call(fileInfoByUrl, { id: file_id })
      yield put({
        type: 'updateDatas',
        payload: {
         filePreviewCurrentFileId: file_id,
         fileType: getSubfixName(file_name),
         isInOpenFile: true,
         currentPreviewFileName: file_name
        }
      })
    },
  },
  reducers: {
    updateDatas(state, action) {
      return {
        ...state, ...action.payload
      }
    }
  }
}