import globalStyles from '@/globalset/css/globalClassName.less'
import indexStyles from './index.less'
import { Menu, Tabs, Icon } from 'antd'
import React, { Component } from 'react'
import dva, { connect } from 'dva/index'
import { platformNouns } from '../../../../globalset/clientCustorm'
const { TabPane } = Tabs

class Guide extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  closeGuideModal = () => {
    const { dispatch } = this.props
    dispatch({
      type: 'simplemode/updateDatas',
      payload: {
        guideModalVisiable: false
      }
    })
  }

  selectionCategoryList = value => {
    this.loadGuideArticle(value)
  }

  loadGuideArticle = value => {
    const { id } = value
    const { dispatch } = this.props
    dispatch({
      type: 'simplemode/getGuideArticle',
      payload: {
        id: id
      }
    })

    dispatch({
      type: 'simplemode/updateDatas',
      payload: {
        guideCategorySelectedKeys: value
      }
    })
  }

  onClickBlowUpImage = content => {
    //匹配string中的img标签，提取src
    let imgReg = /<img.*?(?:>|\/>)/gi //匹配图片中的img标签
    let srcReg = /src=[\'\"]?([^\'\"]*)[\'\"]?/i // 匹配图片中的src
    let arr = content.match(imgReg) //筛选出所有的img
    let srcArr = []
    for (let i = 0; i < arr.length; i++) {
      let src = arr[i].match(srcReg)
      // 获取图片地址
      srcArr.push(src[1])
    }

    this.props.opGuiImage(srcArr)
  }

  render() {
    const {
      guideModalVisiable,
      guideCategoryList = [],
      guideArticleList = [],
      guideCategorySelectedKeys
    } = this.props
    const { id } = guideCategorySelectedKeys

    return (
      <div>
        {guideModalVisiable && (
          <div className={indexStyles.guideModal}>
            <div className={indexStyles.guideModalLeft}>
              <div className={indexStyles.guideModalLeftHender}>
                {platformNouns}操作指引
              </div>
              <div className={indexStyles.guideNavigationView}>
                <Menu defaultSelectedKeys={id ? [id] : []} mode="inline">
                  {guideCategoryList.map((value, key) => {
                    const { text, id } = value
                    return (
                      <Menu.Item
                        key={id}
                        onClick={this.selectionCategoryList.bind(this, value)}
                      >
                        <div className={indexStyles.menu_item_style}>
                          <div className={indexStyles.menu_item_text_style}>
                            {text}
                          </div>
                        </div>
                      </Menu.Item>
                    )
                  })}
                </Menu>
              </div>
            </div>
            <div className={indexStyles.guideModalRight}>
              <div className={indexStyles.guideModalRightHender}>
                <div
                  className={indexStyles.close}
                  onClick={this.closeGuideModal}
                >
                  <Icon type="close" style={{ fontSize: '20px' }} />
                </div>
              </div>
              <div className={indexStyles.guidenTabsView}>
                <Tabs
                  defaultActiveKey={
                    guideArticleList && guideArticleList[0]
                      ? guideArticleList[0].id
                      : ''
                  }
                >
                  {guideArticleList.map(i => {
                    const { id, title, content } = i

                    return (
                      <TabPane tab={title} key={id}>
                        <div
                          className={indexStyles.tab_content_style}
                          dangerouslySetInnerHTML={{ __html: content }}
                          onClick={this.onClickBlowUpImage.bind(this, content)}
                        ></div>
                      </TabPane>
                    )
                  })}
                </Tabs>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }
}

export default connect(
  ({
    simplemode: {
      guideCategoryList,
      guideModalVisiable,
      guideArticleList,
      guideCategorySelectedKeys
    }
  }) => ({
    guideCategoryList,
    guideModalVisiable,
    guideArticleList,
    guideCategorySelectedKeys
  })
)(Guide)
