import { combineReducers, createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import logger from 'redux-logger'
import { girlFriends } from './girlFriends/index.js'
import { calculate } from './userInfo/index.js'
import thunkTest from '../../../middleware/thunk_test'
const middleware = [
  thunkTest,
  logger,
  // thunk, logger
]
const reducers = { calculate, girlFriends }
const store = createStore(
  combineReducers(reducers),
  {},
  applyMiddleware(...middleware)
)

export default store
