//该组件用来作为message组件全局配置
import React from 'react';
import { message, notification } from 'antd'

message.config({
  top: 50,
  duration: 3,
  maxCount: 1,
  getContainer: () => document.getElementById('message_mout_parent'),
});

notification.config({
  duration: 3,
});
