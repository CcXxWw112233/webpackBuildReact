import React, { Component } from 'react'
import { connect } from 'dva'
import {
  Select,
  Icon,
  Tooltip,
  Button,
  DatePicker,
  Dropdown,
  message
} from 'antd'
import infoRemindStyle from '../index.less'
import moment from 'moment'
import ExecutorAvatarList from '@/components/avatarList/executorAvatarList.js'
import AddMembersExecutor from '@/components/UserSearchAndSelectMutiple/addMembersExecutor.js'
import globalStyles from '@/globalset/css/globalClassName.less'
const { Option } = Select

@connect(
  ({
    informRemind: { triggerList, diff_text_term, diff_remind_time, historyList }
  }) => ({
    triggerList,
    diff_text_term,
    diff_remind_time,
    historyList
  })
)
export default class RenderHistory extends Component {
  state = {
    is_click_button: false, // 是否正在点击确定按钮
    is_click_del: false // 是否正在点击删除按钮
  }

  /**
   *  改变选项的类型切换的方法
   * 如果 `remind_edit_type` 为1 就显示后面两项
   * 如果 `remind_edit_type` 为2 | 3  就不显示后面两项
   * 注意 `remind_edit_type` 为3 的时候,需要显示日历来选择时间 并将结果转换成时间戳
   * @param {String} id 当前对象的id
   * @param {String} type 区分type类型 为1 能显示后面两项，为2|3 不能显示 为3的时候显示日期
   * @param {String} code trigger的状态
   */
  handleTriggerChg(id, type, code) {
    // console.log(id, type, code, 'lll')
    const { dispatch, historyList = [] } = this.props
    // 想要改变historyList中的某一条信息, 所以需要将它解构出来
    let new_history_list = [...historyList]
    new_history_list = new_history_list.map(item => {
      let new_item = item
      if (id == new_item.id && code != new_item.remind_trigger) {
        new_item = {
          ...new_item,
          remind_trigger: code,
          is_edit_status: true,
          remind_edit_type: type
        }
      }
      return new_item
    })
    dispatch({
      type: 'informRemind/updateDatas',
      payload: {
        historyList: new_history_list
      }
    })
  }

  /**
   * 改变不同的时间值
   * @param {String} id 某一条记录的id
   * @param {String} value 改变时间状态的value值
   */
  onDiffRemindTime(id, value) {
    // console.log(id, value, 'lll')
    const { dispatch, historyList = [] } = this.props
    let new_history_list = [...historyList]
    new_history_list = new_history_list.map(item => {
      let new_item = item
      if (value != new_item.remind_time_value && id == new_item.id) {
        new_item = {
          ...new_item,
          is_edit_status: true,
          remind_time_value: value
        }
      }
      return new_item
    })
    dispatch({
      type: 'informRemind/updateDatas',
      payload: {
        historyList: new_history_list
      }
    })
  }

  /**
   * 改变不同时间字段的文本
   * @param {String} 某一条记录的id
   * @param {String} 改变时间的文本的类型
   */
  onDiffTextTerm(id, type) {
    const { dispatch, historyList = [] } = this.props
    let new_history_list = [...historyList]
    new_history_list = new_history_list.map(item => {
      let new_item = item
      if (type != new_item.remind_time_type && id == new_item.id) {
        new_item = { ...new_item, is_edit_status: true, remind_time_type: type }
      }
      return new_item
    })
    dispatch({
      type: 'informRemind/updateDatas',
      payload: {
        historyList: new_history_list
      }
    })
  }

  /**
   * 更新提醒消息的状态
   * @param {String} id 更新某一条状态对应的id
   */
  handleUpdateInfoRemind(id, message_consumers) {
    this.setState({
      is_click_button: true
    })
    const { is_click_button } = this.state
    if (is_click_button) {
      setTimeout(() => {
        message.warn('正在添加中,请不要重复点击哦~')
      }, 200)
      this.setState({
        is_click_button: false
      })
      return
    }
    // console.log(id, 'sss')
    const { historyList = [], dispatch, rela_id } = this.props
    let new_history_list = [...historyList]
    // console.log(new_history_list, 'sss')
    let tempId = []
    for (var i in message_consumers) {
      tempId.push(message_consumers[i].user_id)
    }
    const result = new_history_list.find(item => {
      let new_item = item
      if (new_item.is_edit_status && new_item.id == id) {
        return (new_item = {
          ...new_item,
          is_edit_status: false,
          message_consumers: [{ ...message_consumers, user_id: tempId }]
        })
      }
    })
    dispatch({
      type: 'informRemind/updateRemindInformation',
      payload: {
        result,
        rela_id
      }
    })
  }

  /**
   * 删除提醒的方法
   * @param {String} id 删除对应信息状态的id
   */
  handleDelInfoRemind(id) {
    this.setState({
      is_click_del: true
    })
    const { is_click_del } = this.state
    if (is_click_del) {
      setTimeout(() => {
        message.warn('正在删除中,请不要重复点击哦~')
      }, 200)
      this.setState({
        is_click_del: false
      })
      return
    }
    const { dispatch, rela_id } = this.props
    // console.log(rela_id, 'sss')
    dispatch({
      type: 'informRemind/delRemindInformation',
      payload: {
        id,
        rela_id
      }
    })
  }

  // 时间戳转换日期格式
  getdate(timestamp) {
    // console.log(timestamp, 'lll')
    var date = new Date(timestamp * 1000) //时间戳为10位需*1000，时间戳为13位的话不需乘1000
    var Y, M, D, H, MIN
    Y = date.getFullYear()
    M =
      date.getMonth() + 1 < 10
        ? '0' + (date.getMonth() + 1)
        : date.getMonth() + 1
    D = date.getDate() + 1 < 10 ? '0' + date.getDate() : date.getDate()
    H = date.getHours() < 10 ? '0' + date.getHours() : date.getHours()
    MIN = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()
    return Y + '-' + M + '-' + D + ' ' + H + ':' + MIN
  }

  /**
   * 自定义时间的方法
   * @param {String} dateString 选中的当前时间
   * @param {String} id 当前这一条任务的id
   * @param {String} type 可编辑的类型
   */
  handleDatePicker(date, dateString, id, type) {
    const { dispatch, historyList = [] } = this.props
    // console.log(dateString, 'sss')
    let new_history_list = [...historyList]
    let userDefindDate = new Date(dateString)
    let time = userDefindDate.valueOf() / 1000 // 转换成时间戳
    // console.log(time, 'llll')
    new_history_list = new_history_list.map(item => {
      let new_item = item
      if (id == new_item.id) {
        new_item = {
          ...new_item,
          remind_time_value: time,
          remind_time_type: 'datetime',
          remind_edit_type: type,
          is_edit_status: true
        }
      }
      return new_item
    })
    dispatch({
      type: 'informRemind/updateDatas',
      payload: {
        historyList: new_history_list
      }
    })
  }

  /**
   * 成功确定的回调
   * @param {String} date 时间日期 moment对象
   * @param {String} id 当前对象对应的id
   * @param {String} type 可编辑的类型
   */
  handleDatePickerOk(date, value, id, type) {
    // console.log(date, value, 'ssss')
    const { dispatch, historyList = [] } = this.props
    let new_history_list = [...historyList]
    // let time = moment(date.format('YYYY-MM-DD HH:MM')).valueOf() / 1000
    // console.log(time, 'sss')
    new_history_list = new_history_list.map(item => {
      let new_item = item
      if (id == new_item.id) {
        new_item = {
          ...new_item,
          remind_time_value: value,
          remind_time_type: 'datetime',
          remind_edit_type: type,
          is_edit_status: true
        }
      }
      return new_item
    })
    dispatch({
      type: 'informRemind/updateDatas',
      payload: {
        historyList: new_history_list
      }
    })
  }

  /**
   * 用户信息的方法
   * @param {Object} e 用户列表的对象信息
   * @param {*} id 当前对象的id
   * @param {*} message 传递进来的用户信息列表
   */
  multipleUserSelectUserChange(e, id, message) {
    const { dispatch, historyList = [], user_remind_info = [] } = this.props
    let new_user_remind_info = [...user_remind_info] // 用户列表的信息
    let new_message = [] // 传递过来的用户信息
    // console.log('sss', e)
    const { selectedKeys = [], key, type } = e
    // 去除空数组
    const removeEmptyArrayEle = arr => {
      for (var i = 0; i < arr.length; i++) {
        if (arr[i] == undefined) {
          arr.splice(i, 1)
          i = i - 1 // i - 1 ,因为空元素在数组下标 2 位置，删除空之后，后面的元素要向前补位，
          // 这样才能真正去掉空元素,觉得这句可以删掉的连续为空试试，然后思考其中逻辑
        }
      }
      return arr
    }

    if (key == '0' && type == 'add') {
      // 如果是全体成员并且是添加的操作
      new_message = new_user_remind_info.filter(item => {
        if (item['user_id'] == '0') {
          return item
        }
      })
    } else {
      new_message = selectedKeys.map(item => {
        for (let val of new_user_remind_info) {
          if (item == val['user_id'] && item != '0') {
            return val
          }
        }
      })
    }
    // 更新成员的信息
    let new_history_list = [...historyList]
    new_history_list = new_history_list.map(item => {
      let new_item = item
      if (id == new_item.id) {
        new_item = {
          ...new_item,
          is_edit_status: true,
          message_consumers: removeEmptyArrayEle(new_message)
        }
      }
      return new_item
    })
    dispatch({
      type: 'informRemind/updateDatas',
      payload: {
        historyList: new_history_list
      }
    })
  }

  render() {
    const {
      triggerList = [],
      diff_text_term = [],
      diff_remind_time = [],
      itemValue = {},
      user_remind_info = [],
      rela_type
    } = this.props
    const {
      remind_trigger,
      id,
      remind_time_type,
      remind_time_value,
      remind_edit_type,
      status,
      is_edit_status,
      message_consumers
    } = itemValue
    // console.log(remind_trigger, 'sss')

    return (
      <>
        <div className={infoRemindStyle.slip}>
          <div className={infoRemindStyle.select}>
            {/* 显示某种事件类型的列表--选择框 */}
            <Select
              className={`${infoRemindStyle.trigger_select}`}
              disabled={status == 2 ? true : false}
              defaultValue={remind_trigger}
              style={{ width: 122, height: 32, marginRight: 16 }}
            >
              {triggerList &&
                triggerList.length &&
                triggerList.map(chileItrem => {
                  return (
                    <Option
                      onClick={this.handleTriggerChg.bind(
                        this,
                        id,
                        chileItrem.remind_edit_type,
                        chileItrem.type_code
                      )}
                      value={chileItrem.type_code}
                    >
                      {chileItrem.type_name}
                    </Option>
                  )
                })}
            </Select>
            {/* 显示自定义时间 */}
            {remind_edit_type == 3 && (
              <DatePicker
                allowClear={false}
                disabled={status == 2 ? true : false}
                showTime={{ format: 'HH:mm' }}
                defaultValue={
                  remind_time_value.length <= 2
                    ? ''
                    : moment(this.getdate(remind_time_value))
                }
                placeholder="请选择日期"
                format="YYYY-MM-DD HH:mm"
                onOk={value => {
                  this.handleDatePickerOk(
                    value,
                    remind_time_value,
                    id,
                    remind_edit_type
                  )
                }}
                onChange={(date, dateString) => {
                  this.handleDatePicker(date, dateString, id, remind_edit_type)
                }}
              />
            )}
            {/* 显示1-60不同的时间段--选择框 */}
            {remind_edit_type == 1 && (
              <Select
                disabled={status == 2 ? true : false}
                defaultValue={
                  remind_time_value.length <= 2 ? remind_time_value : 1
                }
                style={{ width: 122, height: 32, marginRight: 16 }}
              >
                {diff_remind_time.map(childItem => {
                  return (
                    <Option
                      onClick={value => {
                        this.onDiffRemindTime(id, childItem.remind_time_value)
                      }}
                      value={childItem.remind_time_value}
                    >
                      {childItem.remind_time_value}
                    </Option>
                  )
                })}
              </Select>
            )}
            {/* 显示 分钟 小时 天数 的列表--选择框 */}
            {remind_edit_type == 1 && (
              <Select
                disabled={status == 2 ? true : false}
                defaultValue={
                  remind_time_type == 'datetime' ? 'd' : remind_time_type
                }
                style={{ width: 122, height: 32, marginRight: 16 }}
              >
                {diff_text_term.map(childItem => {
                  return (
                    <Option
                      onClick={() => {
                        this.onDiffTextTerm(id, childItem.remind_time_type)
                      }}
                      value={childItem.remind_time_type}
                    >
                      {childItem.txtVal}
                    </Option>
                  )
                })}
              </Select>
            )}
            {/* 显示用户信息头像 */}
            <div className={infoRemindStyle.user_info}>
              <Dropdown
                disabled={status == 2 ? true : false}
                overlay={
                  <AddMembersExecutor
                    rela_type={rela_type}
                    listData={user_remind_info} //users为全部用户列表[{user_id: '', name: '',...}, ]
                    keyCode={'user_id'} //值关键字
                    searchName={'name'} //搜索关键字
                    currentSelect={message_consumers} //selectedUsers为已选择用户列表[{user_id: '', name: '',...}, ]
                    multipleSelectUserChange={e =>
                      this.multipleUserSelectUserChange(
                        e,
                        id,
                        message_consumers
                      )
                    } //选择了某一项
                  />
                }
              >
                {message_consumers && message_consumers.length > 0 ? (
                  <div style={{ maxWidth: 60, width: 'auto' }}>
                    <ExecutorAvatarList
                      size={'small'}
                      users={message_consumers}
                    />
                  </div>
                ) : (
                  <div
                    className={`${globalStyles.authTheme} ${infoRemindStyle.plus}`}
                  >
                    &#xe70b;
                  </div>
                )}
              </Dropdown>
            </div>
          </div>

          {/* 鼠标的hover事件 控制删除小图标的显示隐藏 */}
          {is_edit_status ? (
            <Button
              disabled={
                message_consumers && message_consumers.length ? false : true
              }
              onClick={() => {
                this.handleUpdateInfoRemind(id, message_consumers)
              }}
              className={infoRemindStyle.icon}
              type="primary"
            >
              确定
            </Button>
          ) : (
            <div
              onClick={() => {
                this.handleDelInfoRemind(id)
              }}
              className={`${infoRemindStyle.slip_hover} ${infoRemindStyle.icon}`}
            >
              <Tooltip placement="top" title="删除" arrowPointAtCenter>
                <Icon type="delete" className={infoRemindStyle.del} />
              </Tooltip>
            </div>
          )}
          {/* 显示不同状态的小图标 */}
          {!is_edit_status && status == 3 ? (
            <div>
              <Tooltip placement="top" title="已失效" arrowPointAtCenter>
                <Icon
                  type="exclamation-circle"
                  className={`${infoRemindStyle.overdue} ${infoRemindStyle.icon}`}
                />
              </Tooltip>
            </div>
          ) : !is_edit_status && status == 2 ? (
            <div>
              <Tooltip placement="top" title="已提醒" arrowPointAtCenter>
                <Icon
                  type="check-circle"
                  className={`${infoRemindStyle.checked} ${infoRemindStyle.icon}`}
                />
              </Tooltip>
            </div>
          ) : null}
        </div>
      </>
    )
  }
}
