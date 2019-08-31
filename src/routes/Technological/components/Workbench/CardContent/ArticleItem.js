import React from 'react'
import indexstyles from '../index.less'
import { Icon } from 'antd'
import Cookies from 'js-cookie'
import { timestampToTimeNormal} from "../../../../../utils/util";

export default class ArticleItem extends React.Component {

  render() {
    const { itemValue = {} } = this.props
    const { title, thumbnail_list=[], view_count, create_time, id } = itemValue
    return (
      <div className={indexstyles.articleItem} >
        <div className={indexstyles.articleItemleft}>
          <div className={indexstyles.hoverUnderline}>{title}</div>
          <div>
            <Icon type="calendar" style={{fontSize: 14, color: '#d9d9d9', marginRight: 6}}/>
             {timestampToTimeNormal(create_time)}
            <Icon type="eye" style={{fontSize: 14, color: '#d9d9d9', margin: '0 4px 0 8px'}}/>
            {view_count}
          </div>
        </div>
        <div className={indexstyles.articleItemright}>
          {thumbnail_list.map((value, key) => {
            return (<img src={value} key={key}/>)
          })}
        </div>
      </div>
    )
  }
}
