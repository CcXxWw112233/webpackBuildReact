import React from 'react'
import indexstyles from './index.less'
import { Icon } from 'antd'
import Cookies from 'js-cookie'

export default class ProcessItem extends React.Component {
  gotoBoardDetail(board_id) {
    Cookies.set('board_id', board_id, {expires: 30, path: ''})
    this.props.routingJump('/technological/projectDetail')
  }
  render() {
    const filterColor = (status)=> {
      let color = '#f2f2f2'
      if('1' ===status){
        color='#40A9FF'
      }else if('2' === status) {
        color='#FF4D4F'
      }else if('3'===status) {
        color='#73D13D'
      }else {

      }
      return color
    }
    return (
      <div>
        {[1, 2, 3, 4].map((value, key) => {
          return(
            <div className={indexstyles.processItem} key={key}>
              <div>这是一条流程<span style={{marginLeft: 6, color: '#8c8c8c', cursor: 'pointer'}} >#{`项目A`}</span></div><div>
              <div style={{backgroundColor: filterColor(`${key}`)}}></div></div>
            </div>
          )})
        }
      </div>

    )
  }
}
