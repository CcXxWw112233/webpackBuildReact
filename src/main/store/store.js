import { combineReducers, createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import logger from 'redux-logger'
import rootReducers from './reducers'

const middleware = [thunk, logger]

const store = createStore(
  combineReducers(rootReducers),
  {},
  applyMiddleware(...middleware)
)

export default store
