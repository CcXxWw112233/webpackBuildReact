import modelExtend from 'dva-model-extend'

export const model = {
  reducers: {
    changeState(state, { payload }) {
      return {
        ...state,
        ...payload,
      }
    },
  },
}

export const listPageModel = modelExtend(model, {
  state: {
    dataList: [],
    filter: {
      pageSize: 10,
      total: 0,
      current: 1,
      pageNum: 1,
    },
    curPowers: [],
  },
  reducers: {
    getListSuccess(state, { payload }) {
      const { data, filter } = payload
      const { pageSize, pageNum, totalSize, dataList } = data
      return {
        ...state,
        dataList,
        filter: {
          ...state.filter,
          ...filter,
          pageSize,
          total: totalSize,
          current: pageNum,
        },
      }
    },
  },

})

