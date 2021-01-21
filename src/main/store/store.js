import { combineReducers, createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import logger from 'redux-logger'
import { girlFriends } from './girlFriends/index.js'
import { calculate } from './userInfo/index.js'

const middleware = [thunk, logger]
const reducers = { calculate, girlFriends }
const store = createStore(
  combineReducers(reducers),
  {},
  applyMiddleware(...middleware)
)

export default store
