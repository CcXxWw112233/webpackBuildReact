export const selectTopTabs = state => state[`xczNews`].topTabs //头部导航
export const selectList = state => state[`xczNews`].searchList //全局搜索的列表
export const selectInputValue = state => state[`xczNews`].inputValue //全局搜索的列表

export const getSelectState = (state, stateName) => state['xczNews'][stateName]
