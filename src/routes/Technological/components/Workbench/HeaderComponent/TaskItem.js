import React from 'react'
import indexstyles from './index.less'
import { Icon } from 'antd'
import Cookies from 'js-cookie'

export default class TaskItem extends React.Component {

  render() {

    return (
      <div>
        <div className={indexstyles.taskItem}>
          <div className={indexstyles.nomalCheckBox}>
            <Icon type="check" style={{color: '#FFFFFF', fontSize: 12, fontWeight: 'bold'}}/>
          </div>
          <div><span style={{textDecoration: 'none'}}>{'这是一条任务'}</span><span style={{marginLeft: 6, color: '#8c8c8c', cursor: 'pointer', }} >#{'项目A'}</span></div>
        </div>
        <div className={indexstyles.taskItem}>
          <div className={indexstyles.nomalCheckBox}>
            <Icon type="check" style={{color: '#FFFFFF', fontSize: 12, fontWeight: 'bold'}}/>
          </div>
          <div><span style={{textDecoration: 'none'}}>{'这是一条任务'}</span><span style={{marginLeft: 6, color: '#8c8c8c', cursor: 'pointer', }} >#{'项目A'}</span></div>
        </div>
        <div className={indexstyles.taskItem}>
          <div className={indexstyles.nomalCheckBoxActive} >
            <Icon type="check" style={{color: '#FFFFFF', fontSize: 12, fontWeight: 'bold'}}/>
          </div>
          <div><span style={{textDecoration: 'line-through'}}>这是一条任务</span><span style={{marginLeft: 6, color: '#8c8c8c', cursor: 'pointer', }} >#{'项目B'}</span></div>
        </div>
        <div className={indexstyles.taskItem}>
          <div className={indexstyles.nomalCheckBoxActive} >
            <Icon type="check" style={{color: '#FFFFFF', fontSize: 12, fontWeight: 'bold'}}/>
          </div>
          <div><span style={{textDecoration: 'line-through'}}>这是一条任务</span><span style={{marginLeft: 6, color: '#8c8c8c', cursor: 'pointer', }} >#{'项目C'}</span></div>
        </div>
      </div>

    )
  }
}
