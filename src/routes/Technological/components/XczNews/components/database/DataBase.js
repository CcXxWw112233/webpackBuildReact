// 资料库页面

import React, { Component } from 'react'
import { connect } from 'dva'
import dataBaseStyles from './dataBase.less'
import imgSrc1 from '@/assets/xczNews/laws.png'
import imgSrc2 from '@/assets/xczNews/planning.png'
import imgSrc3 from '@/assets/xczNews/standard.png'
import SearchArticlesList from '../../common/SearchArticlesList'

@connect(({ xczNews = [] }) => ({
  xczNews
}))
export default class DataBase extends Component {
  state = {
    img: [
      { id: 'imgSrc1', src: imgSrc1 },
      { id: 'imgSrc2', src: imgSrc2 },
      { id: 'imgSrc3', src: imgSrc3 }
    ]
  }

  // 点击操作
  handleClick(id, name) {
    const { dispatch } = this.props
    dispatch({
      type: 'xczNews/updateDatas',
      payload: {
        dataBaseFlag: false,
        hotFlag: false,
        highRiseFlag: false,
        authorityFlag: false,
        areaFlag: false
      }
    })
    dispatch({
      type: 'xczNews/getHeaderSearch',
      payload: {
        category_ids: id
      }
    })
  }

  render() {
    const { xczNews, location } = this.props
    const { dataBase, dataBaseFlag } = xczNews
    const { img } = this.state
    // console.log(dataBase)
    // console.log(imgSrc)

    if (dataBaseFlag) {
      return (
        <div className={dataBaseStyles.material}>
          {dataBase.map((item, index) => {
            return (
              <div
                onClick={() => {
                  this.handleClick(item.id, item.name)
                }}
                className={dataBaseStyles.libraries}
              >
                <div className={dataBaseStyles.img}>
                  {index == 0 ? (
                    <img src={imgSrc1} />
                  ) : index == 1 ? (
                    <img src={imgSrc2} />
                  ) : (
                    <img src={imgSrc3} />
                  )}
                </div>
                <p>{item.name}</p>
              </div>
            )
          })}
        </div>
      )
    } else {
      return <SearchArticlesList {...{ location }} />
    }
  }
}
