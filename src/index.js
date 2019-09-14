import '@babel/polyfill'
import 'raf/polyfill';
import 'react-dom'
import React from 'react'
import dva from 'dva';
import './index.css';
import { Modal } from 'antd'
import { createBrowserHistory as createHistory } from 'history';
// var React = require('react')

//兼容ie10及以下
Object.setPrototypeOf = require('setprototypeof');

// 1. Initialize
const app = dva({
  // history: createHistory(), //参考自https://www.jianshu.com/p/2e9e45e9a880
  // onError(e, dispatch) {
  //   console.log(e.message);
  // },
});

// 2. Plugins
// app.use({});

// 3. Model
app.model(require('./models/workspace-global').default);

// 4. Router
app.router(require('./router').default);

// 5. Start
app.start('#root');

window.addEventListener("storage", function (e) {
  const { key, newValue, oldValue } = e
  if('OrganizationId' == key) { //作为切换组织时，需要重新加载数据
    if(newValue != oldValue) {
      Modal.confirm({
        title: '您当前所属的组织已经发生变化，继续操作将有可能无法正常使用后台服务，确认重新加载数据？',
        onOk() {
          window.location.reload()
        }
      })
      
    }
  }
});