import React from 'react'
import indexstyles from './index.less'
import { Icon } from 'antd'
import globalStyles from '../../../../../globalset/css/globalClassName.less'
import { timestampToTimeNormal } from '../../../../../utils/util'
import Cookies from 'js-cookie'

export default class MeetingItem extends React.Component {
  render() {

    return (
      <div>
        {[1, 2, 3, 4].map((value, key) =>{
          return(
            <div className={indexstyles.meetingItem} key={key}>
              <div>
                <Icon type="calendar" style={{fontSize: 16, color: '#8c8c8c'}}/>
              </div>
              <div>这是一条会议<span style={{marginLeft: 6, color: '#8c8c8c', cursor: 'pointer'}}>{`2018/08/08 12:00`}</span></div>
            </div>
          )
        })}

      </div>

    )
  }
}
