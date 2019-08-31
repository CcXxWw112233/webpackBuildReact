import React from 'react'
import indexStyles from './index.less'
import { Icon } from 'antd'

export default class TeamListTypeOne extends React.Component{
  gotoLook (id) {
    this.props.routingJump(`/technological/teamShow/teamInfo?id=${id}`)
  }
  render(){
    const { cover_img, name, summary, id } = this.props.itemValue

    return(
      <div>
        <div className={indexStyles.teamList_list_2_item} onClick={this.gotoLook.bind(this, id)}>
          <div className={indexStyles.teamList_list_2_item_left}>
            <img src={cover_img} style={{height: '80px', width: 'auto', margin: '0 auto', marginTop: 45}}/>
          </div>
          <div className={indexStyles.teamList_list_2_item_right}>
            <div className={indexStyles.teamList_list_2_item_right_title}>
              <div className={indexStyles.title}>
                {name}
              </div>
              <div className={indexStyles.edit}>
                {/*<Icon type="edit" style={{marginRight: 4}}/>编辑*/}
              </div>
            </div>

            <div className={indexStyles.description} dangerouslySetInnerHTML={{__html: summary}}></div>
            </div>
        </div>
        <div className={indexStyles.teamList_list_2_item_line}></div>
      </div>

    )
  }

}
