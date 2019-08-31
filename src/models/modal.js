export default {
  namespace: 'modal',
  state: {
    modalVisible: false,
    curItem: {},
  },
  reducers: {
    showModal(state, action) {
      return { ...state, modalVisible: true, ...action.payload }
    },
    hideModal(state) {
      return { ...state, modalVisible: false, curItem: {} }
    },
    setItem(state, action) {
      const { curItem } = action.payload
      return { ...state, curItem }
    },
  },
}
