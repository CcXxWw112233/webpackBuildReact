import React from 'react'
import { Avatar, Icon } from 'antd'
import indexStyles from '../index.less'

export default class GroupChat extends React.Component {
  state = {
    isShowBottDetail: false //是否显示底部详情
  }
  componentWillMount(nextProps) {
    const { itemValue = {} } = this.props
    const { id } = itemValue
    //设置底部可伸缩部分id
    this.setState({
      ConfirmInfoOut_1_bott_Id: `Group_chat_bott_${id * 100 + 1}`
    })
  }
  setIsShowBottDetail() {
    this.setState(
      {
        isShowBottDetail: !this.state.isShowBottDetail
      },
      function() {
        this.funTransitionHeight(element, 200, this.state.isShowBottDetail)
      }
    )
    const { ConfirmInfoOut_1_bott_Id } = this.state
    const element = document.getElementById(ConfirmInfoOut_1_bott_Id)
  }
  funTransitionHeight = function(element, time, type) {
    // time, 数值，可缺省
    if (typeof window.getComputedStyle == 'undefined') return
    const height = window.getComputedStyle(element).height
    element.style.transition = 'none' // 本行2015-05-20新增，mac Safari下，貌似auto也会触发transition, 故要none下~
    element.style.height = 'auto'
    const targetHeight = window.getComputedStyle(element).height
    element.style.height = height
    element.offsetWidth
    if (time) element.style.transition = 'height ' + time + 'ms'
    element.style.height = type ? targetHeight : 0
  }
  render() {
    const avatar =
      'http://dian-lingxi-public.oss-cn-beijing.aliyuncs.com/2018-11-13/172f2c924443a267cea532150e76d344.jpg'
    const { collapsed, itemValue = {} } = this.props
    const { id, type } = itemValue // type 0组织 1 人
    const { isShowBottDetail, ConfirmInfoOut_1_bott_Id } = this.state

    return (
      <div className={indexStyles.contain_3_item}>
        <div className={indexStyles.contain_3_item_top}>
          <div className={indexStyles.contain_3_item_top_left}>
            <Avatar size={48} src={avatar}>
              u
            </Avatar>
            <div className={indexStyles.badge}></div>
          </div>
          <div className={indexStyles.contain_3_item_top_middle}>
            <div className={indexStyles.contain_3_item_top_middle_top}>
              这是组织或者项目或者成员
            </div>
            <div className={indexStyles.contain_3_item_top_middle_bott}>
              最新的一条消息最新的一条消息
            </div>
          </div>
          {type == '0' ? (
            <div
              className={`${indexStyles.contain_3_item_top_right} ${
                isShowBottDetail
                  ? indexStyles.upDown_up
                  : indexStyles.upDown_down
              }`}
            >
              <Icon
                onClick={this.setIsShowBottDetail.bind(this)}
                type="down"
                theme="outlined"
                style={{ color: '#595959' }}
              />
            </div>
          ) : (
            ''
          )}
        </div>
        {type == '0' ? (
          <div
            id={ConfirmInfoOut_1_bott_Id}
            className={`${
              isShowBottDetail
                ? indexStyles.contain_3_item_bott
                : indexStyles.contain_3_item_bott_bottNormal
            }`}
          >
            <div className={indexStyles.contain_3_item_bott_item}>
              <div className={indexStyles.contain_3_item_bott_item_left}>
                <Avatar src={avatar}></Avatar>
              </div>
              <div className={indexStyles.contain_3_item_bott_item_right}>
                Davidssdsdsd
              </div>
            </div>
            <div className={indexStyles.contain_3_item_bott_item}>
              <div className={indexStyles.contain_3_item_bott_item_left}>
                <Avatar src={avatar}></Avatar>
              </div>
              <div className={indexStyles.contain_3_item_bott_item_right}>
                Davidssdsdsd
              </div>
            </div>
            <div className={indexStyles.contain_3_item_bott_item}>
              <div className={indexStyles.contain_3_item_bott_item_left}>
                <Avatar src={avatar}></Avatar>
              </div>
              <div className={indexStyles.contain_3_item_bott_item_right}>
                Davidssdsdsd
              </div>
            </div>
            <div className={indexStyles.contain_3_item_bott_item}>
              <div className={indexStyles.contain_3_item_bott_item_left}>
                <Avatar src={avatar}></Avatar>
              </div>
              <div className={indexStyles.contain_3_item_bott_item_right}>
                Davidssdsdsd
              </div>
            </div>
          </div>
        ) : (
          ''
        )}
      </div>
    )
  }
}
