import React from 'react'
import indexStyles from './index.less'
import { Icon } from 'antd'

export default class TeamListTypeOne extends React.Component {
  gotoLook(id) {
    this.props.routingJump(`/technological/teamShow/teamInfo?id=${id}`)
  }

  render() {
    const { cover_img, name, summary, id } = this.props.itemValue
    return (
      <div
        className={indexStyles.teamList_list_1_item}
        onClick={this.gotoLook.bind(this, id)}
      >
        {/*<div  className={indexStyles.edit}>*/}
        {/*<Icon type="edit" style={{marginRight: 4}}/>编辑*/}
        {/*</div>*/}
        <div className={indexStyles.logo}>
          <img
            src={cover_img}
            style={{ height: '80px', width: 'auto', marginTop: 45 }}
          />
        </div>
        <div className={indexStyles.title}>{name}</div>
        <div
          className={indexStyles.description}
          dangerouslySetInnerHTML={{ __html: summary }}
        ></div>
      </div>
    )
  }
}
