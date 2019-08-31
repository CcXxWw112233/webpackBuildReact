import React from 'react';
import {connect} from "dva/index";
import FileIndex from './FileModule'
import { Route, Router, Switch, Link } from 'dva/router'
import { Drawer } from 'antd'

const getEffectOrReducerByName = name => `projectDetail/${name}`
const getEffectOrReducerByNameFile = name => `projectDetailFile/${name}`

const FileModuleIndex = (props) => {

  return(
   <div>
     <FileIndex {...props} />
   </div>
  )
};

export default FileModuleIndex


