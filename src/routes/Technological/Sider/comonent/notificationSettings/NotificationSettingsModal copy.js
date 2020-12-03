import React, { Component } from 'react'
import { Radio, Checkbox, Row, Col, message } from 'antd'
import CustormModal from '@/components/CustormModal'
import styles from './NotificationSettingsModal.less'
import glabalStyles from '@/globalset/css/globalClassName.less'
import RenderDetail from './component/renderDetail'
import RenderSimple from './component/renderSimple'
import {
  getNoticeSettingList,
  getUsersNoticeSettingList
} from '@/services/technological/notificationSetting'
import { isApiResponseOk } from '@/utils/handleResponseData'

export default class NotificationSettingsModal extends Component {
  constructor(props) {
    super(props)
    // console.log('ssssss', props.notificationSettingsModalVisible)
    this.state = {
      radio_checked_val: 'detailed', // 选择详细提醒还是简要提醒, 默认为detail 详细提醒
      is_detail_none: 'none', // 是否显示还原 默认为none隐藏
      is_simple_none: 'none', // 是否显示还原 默认为none隐藏
      // 用户设置的接口列表中的数组
      user_setting_list: [], // 用户设置的通知列表
      is_notice_web: '', // 浏览器推送
      is_notice_mail: '', // 邮件推送
      is_notice_mp: '', // 微信公总号
      notice_model: '', // 详细提醒还是简要提醒
      // 默认设置列表的数据
      notice_setting_list: [], // 通知设置的列表
      default_options: [], // 默认列表选中的选项
      compare_options: [] // 用来做比较的数组
    }
    // this.setState({
    //     local_notificationSettingsModalVisible: props.notificationSettingsModalVisible
    // })
  }

  componentDidMount() {
    this.getInitNoticeSettingList()
  }

  componentWillReceiveProps(nextProps) {
    // console.log(nextProps, 'ssss')
    // const { local_notificationSettingsModalVisible } = this.state
    // const { notificationSettingsModalVisible } = nexProps
    // if (notificationSettingsModalVisible && local_notificationSettingsModalVisible != notificationSettingsModalVisible) {
    //     // console.log('ssssssssssssss', '进来查询啦')
    //     this.setState({
    //         local_notificationSettingsModalVisible: notificationSettingsModalVisible
    //     })
    //     // this.getInitNoticeSettingList()
    // }
  }

  // 获取初始设置列表信息
  getInitNoticeSettingList = () => {
    getNoticeSettingList().then(res => {
      if (isApiResponseOk(res)) {
        this.setState({
          notice_setting_list: res.data.notice_list_data,
          default_options: res.data.default_option,
          compare_options: { ...res.data.default_option }
        })
        // 将拿回来的数据进行操作返回
        let { notice_setting_list } = this.state
        notice_setting_list = notice_setting_list.map(item => {
          let new_item = item
          new_item = { ...item, is_show_down_arrow: true } // 1 代表开启的状态
          return new_item
        })
        this.setState({
          notice_setting_list
        })
      } else {
        message.error(res.message)
      }
    })
    getUsersNoticeSettingList().then(res => {
      if (isApiResponseOk(res)) {
        // console.log(res, 'sssss')
        this.setState({
          is_notice_web: res.data.is_notice_web,
          is_notice_mail: res.data.is_notice_mail,
          is_notice_mp: res.data.is_notice_mp,
          notice_model: res.data.notice_model,
          user_setting_list: res.data.notice_list_ids
        })
      } else {
        message.error(res.message)
      }
    })
  }

  // 关闭设置的回调
  onCancel = () => {
    this.props.setNotificationSettingsModalVisible()
  }

  /**
   * 详细提醒和简要提醒的回调
   * @param {Object} e 选中的事件对象
   */
  onChange = e => {
    // console.log('radio checked', e.target.value);
    this.setState({
      radio_checked_val: e.target.value
    })
    if (e.target.value == 'detailed') {
      this.setState({
        is_simple_none: 'none',
        notice_model: '1'
      })
    } else if (e.target.value == 'briefly') {
      this.setState({
        is_detail_none: 'none',
        notice_model: '2'
      })
    }
    this.getInitNoticeSettingList()
  }

  // 这是子组件修改父组件的数据的方法
  updateParentList = (arr, isClick) => {
    if (arr) {
      const { radio_checked_val, default_options } = this.state
      for (let val in default_options) {
        if (radio_checked_val == 'detailed') {
          default_options[radio_checked_val] = arr
        } else if (radio_checked_val == 'briefly') {
          default_options[radio_checked_val] = arr
        }
      }
    }
  }

  // 调用该方法改变state中详细提醒的还原显示
  chgDisplayBlock = (val, optionArr) => {
    const { radio_checked_val, compare_options } = this.state
    // console.log(val ,'sssss')
    // console.log(optionArr, 'sssss_2')
    // 获取来自子组件修改父组件的数据
    let childLength = optionArr && optionArr.length
    for (let val in compare_options) {
      if (radio_checked_val == 'detailed') {
        // 如果是详细提醒的组件
        let dLength = compare_options[radio_checked_val].length
        if (dLength != childLength) {
          // 如果长度不相等, 则有变化, 则显示还原
          this.setState({
            is_detail_none: 'inline-block'
          })
        } else {
          // 长度相等的情况, 还需要判断值是否相等
          let compare_flag = this.compareDiffArr(
            optionArr,
            compare_options[radio_checked_val]
          )
          if (!compare_flag) {
            // 如果值不相等, 那么要显示
            this.setState({
              is_detail_none: 'inline-block'
            })
          } else {
            this.setState({
              // 如果值相等, 那么不显示
              is_detail_none: 'none'
            })
          }
        }
      } else if (radio_checked_val == 'briefly') {
      }
    }
  }

  // 对比两个数组的值是否相等的方法
  compareDiffArr(arr, brr) {
    if (!(arr instanceof Array) || !(brr instanceof Array)) return false
    if (arr.length != brr.length) return false
    for (var i = 0, len = brr.length; i < len; i++) {
      if (arr.indexOf(brr[i]) == -1 && brr.indexOf(arr[i]) == -1) {
        return false
      } else {
        return true
      }
    }
  }

  // 点击详细提醒的还原
  handleRecover = val => {
    // console.log(this.refs, 'sss')
    //    this.refs.renderDetail.recoverDefault()
    this.setState({
      is_detail_none: 'none'
    })
  }

  // 改变选项的状态
  chgParentSelectState = id => {
    // console.log(current_id, 'ssss')
    let { notice_setting_list } = this.state

    notice_setting_list =
      notice_setting_list &&
      notice_setting_list.map(item => {
        let new_item = item
        if (item.id == id) {
          new_item = { ...item, is_show_down_arrow: !item.is_show_down_arrow }
        }
        return new_item
      })
    this.setState({
      notice_setting_list: notice_setting_list
    })
  }

  // 展示设置的内容
  renderSetOptions() {
    const {
      radio_checked_val,
      is_detail_none,
      is_simple_none,
      notice_setting_list,
      default_options
    } = this.state
    let new_notice_list = [...notice_setting_list] // 将数据中的列表重新解构出来进行数据操作 任务日程与我相关
    let new_all_options = { ...default_options } // 将数据中的默认选中的列表重新解构出来进行数据操作
    let new_default_options = [] // 定义一个空数组来保存详细还是简要选中的选项

    // 进行区分详细还是简要
    for (let val in new_all_options) {
      if (radio_checked_val == 'detailed') {
        new_default_options = new_all_options[radio_checked_val]
      } else if (radio_checked_val == 'briefly') {
        new_default_options = new_all_options[radio_checked_val]
      }
    }
    let temp_options = [...new_default_options]

    const datas = {
      new_notice_list,
      new_default_options,
      temp_options,
      is_detail_none,
      radio_checked_val
    }
    if (radio_checked_val == 'detailed') {
      return (
        <RenderDetail
          {...datas}
          ref="renderDetail"
          updateParentList={this.updateParentList}
          chgDetailDisplayBlock={this.chgDisplayBlock}
          handleDetailRecover={() => {
            this.handleRecover()
          }}
          chgParentSelectState={this.chgParentSelectState}
        />
      )
    } else {
      return <RenderSimple {...datas} />
    }
  }

  render() {
    const { notificationSettingsModalVisible } = this.props
    const {
      radio_checked_val,
      is_detail_none,
      is_simple_none,
      notice_model,
      is_notice_web,
      is_notice_mail,
      is_notice_mp
    } = this.state
    const userInfo = localStorage.getItem('userInfo')
      ? JSON.parse(localStorage.getItem('userInfo'))
      : {}
    const { wechat } = userInfo

    const options = [
      { label: '浏览器推送', value: 'is_notice_web' },
      { label: '邮件', value: 'is_notice_mail' },
      { label: '微信', value: 'is_notice_mp' }
    ]

    const temp_val = [
      is_notice_web == '1' ? 'is_notice_web' : '',
      is_notice_mail == '1' ? 'is_notice_mail' : '',
      is_notice_mp == '1' ? 'is_notice_mp' : ''
    ]

    // console.log(temp_val, 'ssssss')

    const settingContain = (
      <div className={styles.wrapper}>
        <div className={styles.top}>
          <p>提醒方式</p>
          <div className={styles.checkbox}>
            <Checkbox.Group style={{ width: '100%' }} defaultValue={temp_val}>
              <Row>
                {options &&
                  options.map(item => {
                    return (
                      <Col span={8}>
                        <Checkbox value={item.value}>{item.label}</Checkbox>
                      </Col>
                    )
                  })}
              </Row>
            </Checkbox.Group>
          </div>
        </div>
        <div className={styles.contant}>
          <p>提醒内容</p>
          <div className={styles.radio}>
            <Radio.Group
              onChange={this.onChange}
              defaultValue={radio_checked_val}
            >
              <Radio value="detailed">
                详细提醒
                <span style={{ display: is_detail_none }}>
                  &nbsp;(
                  <span
                    onClick={this.handleDetailRecover}
                    className={styles.detail_recover}
                  >
                    还原
                  </span>
                  )
                </span>
              </Radio>
              <Radio value="briefly">
                简要提醒
                <span style={{ display: is_simple_none }}>
                  &nbsp;(<span className={styles.simple_recover}>还原</span>)
                </span>
              </Radio>
            </Radio.Group>
          </div>
          <div className={styles.set_options}>{this.renderSetOptions()}</div>
        </div>
      </div>
    )

    return (
      <div>
        <CustormModal
          title={
            <div
              style={{
                textAlign: 'center',
                fontSize: 16,
                fontWeight: 500,
                color: '#000'
              }}
            >
              通知设置
            </div>
          }
          visible={notificationSettingsModalVisible}
          width={596}
          zIndex={1006}
          maskClosable={false}
          destroyOnClose={true}
          style={{ textAlign: 'center' }}
          onCancel={this.onCancel}
          overInner={settingContain}
        ></CustormModal>
      </div>
    )
  }
}
