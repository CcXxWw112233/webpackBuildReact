import { create } from 'dva-core';
import { createLogger } from 'redux-logger';
import createLoading from 'dva-loading';
import { NODE_ENV } from '../globalset/js/constant'


let app;
let store;
let dispatch;
function createApp(opt) {
  // redux日志
  if('development' == NODE_ENV) {
    // redux日志
    // opt.onAction = [createLogger()];
    //opt.onAction = [createLogger()];
  }
  app = create(opt);
  app.use(createLoading({}));

  if (!global.registered) opt.models.forEach(model => app.model(model));
  global.registered = true;
  app.start();

  store = app._store;
  app.getStore = () => store;
  dispatch = store.dispatch;

  app.dispatch = dispatch;
  return app;
}

export default {
  createApp,
}
