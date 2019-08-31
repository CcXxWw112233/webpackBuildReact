import React from 'react';
import {connect} from "dva/index";
import CreateTask from './CreateTask'
import { Route, Router, Switch, Link } from 'dva/router'
import { Drawer } from 'antd'

const Task = (props) => {

  return(
   <div>
     <CreateTask {...props} />
   </div>
  )
};

export default Task


