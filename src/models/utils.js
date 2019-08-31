//yield select获取不同命名空间的model的state
export const getModelSelectState = (modelName, stateName) => {
  return (state) => state[(modelName)][stateName]
}

export const getModelSelectDatasState = (modelName, stateName) => {
  return (state) => state[(modelName)]['datas'][stateName]
}
