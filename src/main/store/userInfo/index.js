import { INCREMENT, REDUCE } from './action'
const initData = {
  money: 20,
  name: 'cxw',
}

const calculate = (state = initData, { type, payload }) => {
  switch (type) {
    case INCREMENT:
      return { ...state, money: state.money + payload.count }
    case REDUCE:
      return { ...state, money: state.money - payload.count }
    default:
      return state
  }
}

export { calculate }
