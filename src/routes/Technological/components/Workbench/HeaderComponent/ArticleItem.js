import React from 'react'
import indexstyles from './index.less'
import { Icon } from 'antd'
import Cookies from 'js-cookie'
import { timestampToTimeNormal} from "../../../../../utils/util";

export default class ArticleItem extends React.Component {

  render() {

    return (
      <div>
        {[1, 2].map((value, key) => {
          return (
            <div className={indexstyles.articleItem} key={key}>
              <div className={indexstyles.articleItemleft}>
                <div className={indexstyles.hoverUnderline}>{'这是一篇文章'}</div>
                <div>
                  <Icon type="calendar" style={{fontSize: 14, color: '#d9d9d9', marginRight: 6}}/>
                  {`2018/08/08 12:00`}
                  <Icon type="eye" style={{fontSize: 14, color: '#d9d9d9', margin: '0 4px 0 8px'}}/>
                  {999}
                </div>
              </div>
              <div className={indexstyles.articleItemright}>
                {/*{thumbnail_list.map((value, key) => {*/}
                {/*return (<img src={value} key={key}/>)*/}
                {/*})}*/}
              </div>
            </div>
          )
        })}
      </div>

    )
  }
}
