function createThunkMiddleware(extraArgument) {
  console.log('ssssa', extraArgument)
  return ({ dispatch, getState }) => (next) => (action) => {
    console.log('ssssa2', { dispatch, getState, next, action })
    if (typeof action === 'function') {
      return action(dispatch, getState, extraArgument)
    }
    return next(action)
  }
}
const thunk = createThunkMiddleware()
thunk.withExtraArgument = createThunkMiddleware
export default thunk
