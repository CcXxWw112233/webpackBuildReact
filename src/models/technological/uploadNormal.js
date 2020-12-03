export default {
  namespace: 'uploadNormal',
  state: {
    uploading_file_list: [],
    swich_render_upload: true, //是否显示上传开关
    show_upload_notification: false
  },
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(location => {})
    }
  },
  effects: {
    *getUserInfo({ payload = {} }, { select, call, put }) {}
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
