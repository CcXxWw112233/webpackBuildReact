import React, { Component } from 'react'
import { Tooltip, message, Modal } from 'antd'
import { connect } from 'dva'
import headerStyles from './HeaderContent.less'
import VisitControl from '../../routes/Technological/components/VisitControl/index'
import ShareAndInvite from '../../routes/Technological/components/ShareAndInvite/index'
import { setContentPrivilege, toggleContentPrivilege, removeContentPrivilege } from '../../services/technological/project'
import { createMeeting, createShareLink, modifOrStopShareLink } from '../../services/technological/workbench'
import globalStyles from '@/globalset/css/globalClassName.less'
import { currentNounPlanFilterName } from "@/utils/businessFunction";
import {
  MESSAGE_DURATION_TIME, TASKS,
} from "@/globalset/js/constant";
@connect(mapStateToProps)
export default class HeaderContentRightMenu extends Component {

  state = {
    onlyReadingShareModalVisible: false, //只读分享modal
    onlyReadingShareData: {},
  }

  // 访问控制的操作 S
  /**
   * 访问控制的开关切换
   * @param {Boolean} flag 开关切换
   */
  handleVisitControlChange = (flag) => {
    const { drawContent = {} } = this.props
    const { is_privilege = '0', card_id } = drawContent
    const toBool = str => !!Number(str)
    const is_privilege_bool = toBool(is_privilege)
    if (flag === is_privilege_bool) {
      return
    }
    //toggle权限
    const data = {
      content_id: card_id,
      content_type: 'card',
      is_open: flag ? 1 : 0
    }
    toggleContentPrivilege(data).then(res => {
      if (res && res.code === '0') {
        // message.success('设置成功', MESSAGE_DURATION_TIME)
        setTimeout(() => {
          message.success('设置成功')
        }, 500)
        let temp_arr = res && res.data
        this.visitControlUpdateCurrentModalData({ is_privilege: flag ? '1' : '0', type: 'privilege', privileges: temp_arr }, flag)
      } else {
        message.warning(res.message)
      }
    })
  }

  // 数组去重
  arrayNonRepeatfy = arr => {
    let temp_arr = []
    let temp_id = []
    for (let i = 0; i < arr.length; i++) {
      if (!temp_id.includes(arr[i]['id'])) {//includes 检测数组是否有某个值
        temp_arr.push(arr[i]);
        temp_id.push(arr[i]['id'])
      }
    }
    return temp_arr
  }

  // 访问控制的更新model中的数据
  visitControlUpdateCurrentModalData = (obj = {}) => {
    // console.log(obj, 'sssss_obj')
    const { drawContent = {} } = this.props
    const { dispatch } = this.props
    const { privileges = [], board_id, card_id } = drawContent
    // 这是移除的操作
    if (obj && obj.type && obj.type == 'remove') {
      let new_privileges = [...privileges]
      new_privileges.map((item, index) => {
        if (item.id == obj.removeId) {
          new_privileges.splice(index, 1)
        }
      })
      let new_drawContent = { ...drawContent, privileges: new_privileges }
      dispatch({
        type: 'publicTaskDetailModal/updateDatas',
        payload: {
          drawContent: new_drawContent
        }
      })
      this.props.handleTaskDetailChange && this.props.handleTaskDetailChange({ drawContent: new_drawContent, card_id })
    }
    // 这是添加成员的操作
    // 这是更新弹窗中的priveleges
    if (obj && obj.type && obj.type == 'add') {
      let new_privileges = []
      for (let item in obj) {
        if (item == 'privileges') {
          obj[item].map(val => {
            let temp_arr = this.arrayNonRepeatfy([].concat(...privileges, val))
            return new_privileges = [...temp_arr]
          })
        }
      }
      let new_drawContent = { ...drawContent, privileges: new_privileges }
      dispatch({
        type: 'publicTaskDetailModal/updateDatas',
        payload: {
          drawContent: new_drawContent
        }
      })
      this.props.handleTaskDetailChange && this.props.handleTaskDetailChange({ drawContent: new_drawContent, card_id })
    }

    // 这是更新type类型
    if (obj && obj.type && obj.type == 'change') {
      let { id } = obj.temp_arr
      let new_privileges = [...privileges]
      new_privileges = new_privileges.map((item) => {
        let new_item = item
        if (item.id == id) {
          new_item = { ...item, content_privilege_code: obj.code }
        } else {
          new_item = { ...item }
        }
        return new_item
      })
      let new_drawContent = { ...drawContent, privileges: new_privileges }
      dispatch({
        type: 'publicTaskDetailModal/updateDatas',
        payload: {
          drawContent: new_drawContent
        }
      })
      this.props.handleTaskDetailChange && this.props.handleTaskDetailChange({ drawContent: new_drawContent, card_id })
    }

    // 访问控制的切换
    if (obj && obj.type == 'privilege') {
      let new_privileges = [...privileges]
      for (let item in obj) {
        if (item == 'privileges') {
          obj[item].map(val => {
            let temp_arr = this.arrayNonRepeatfy([].concat(...privileges, val))
            if (temp_arr && !temp_arr.length) return false
            return new_privileges = [...temp_arr]
          })
        }
      }
      let new_drawContent = { ...drawContent, is_privilege: obj.is_privilege, privileges: new_privileges }
      dispatch({
        type: 'publicTaskDetailModal/updateDatas',
        payload: {
          drawContent: new_drawContent
        }
      })
      this.props.handleTaskDetailChange && this.props.handleTaskDetailChange({ drawContent: new_drawContent, card_id, name: 'is_privilege', value: obj.is_privilege })
      this.props.updateParentTaskList && this.props.updateParentTaskList()
    }

    // 需要调用父级的列表
    // this.props.handleTaskDetailChange && this.props.handleTaskDetailChange({ drawContent: new_drawContent, card_id })

    // 调用更新项目列表
    dispatch({
      type: 'projectDetail/projectDetailInfo',
      payload: {
        id: board_id
      }
    })

  }

  /**
   * 添加成员的回调
   * @param {Array} users_arr 添加成员的数组
   */
  handleVisitControlAddNewMember = (users_arr = []) => {
    if (!users_arr.length) return
    const { user_set = {} } = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : {};
    const { user_id } = user_set
    const { drawContent = {} } = this.props
    const { card_id, privileges = [] } = drawContent
    const content_id = card_id
    const content_type = 'card'
    let temp_ids = [] // 用来保存添加用户的id
    let new_ids = [] // 用来保存权限列表中用户id
    let new_privileges = [...privileges]

    // 这是所有添加成员的id列表
    users_arr && users_arr.map(item => {
      temp_ids.push(item.id)
    })
    let flag
    // 权限列表中的id
    new_privileges = new_privileges && new_privileges.map(item => {
      let { id } = (item && item.user_info) && item.user_info
      if (user_id == id) { // 从权限列表中找到自己
        if (temp_ids.indexOf(id) != -1) { // 判断自己是否在添加的列表中
          flag = true
        }
      }
      new_ids.push(id)
    })

    // 这里是需要做一个只添加了自己的一条提示
    if (flag && temp_ids.length == '1') { // 表示只选择了自己, 而不是全选
      message.warn('该成员已存在, 请不要重复添加', MESSAGE_DURATION_TIME)
      return false
    } else { // 否则表示进行了全选, 那么就过滤
      temp_ids = temp_ids && temp_ids.filter(item => {
        if (new_ids.indexOf(item) == -1) {
          return item
        }
      })
    }

    setContentPrivilege({
      content_id,
      content_type,
      privilege_code: 'read',
      user_ids: temp_ids,
    }).then(res => {
      if (res && res.code === '0') {
        setTimeout(() => {
          message.success('添加用户成功')
        }, 500)
        let temp_arr = []
        temp_arr.push(res.data)
        this.visitControlUpdateCurrentModalData({ privileges: temp_arr, type: 'add' })
      } else {
        message.warn(res.message)
      }
    })
  }

  /**
   * 访问控制移除成员
   * @param {String} id 移除成员对应的id
   */
  handleVisitControlRemoveContentPrivilege = id => {
    let temp_id = []
    temp_id.push(id)
    removeContentPrivilege({ id: id }).then(res => {
      const isResOk = res => res && res.code === '0'
      if (isResOk(res)) {
        setTimeout(() => {
          message.success('移除用户成功')
        }, 500)
        this.visitControlUpdateCurrentModalData({ removeId: id, type: 'remove' })
      } else {
        message.warn(res.message)
      }
    })
  }

  /**
   * 访问控制设置更新成员
   * @param {String} id 设置成员对应的id
   * @param {String} type 设置成员对应的字段
   */
  handleVisitControlChangeContentPrivilege = (id, type) => {
    const { drawContent = {} } = this.props
    const { card_id } = drawContent
    let temp_id = []
    temp_id.push(id)
    const obj = {
      content_id: card_id,
      content_type: 'card',
      privilege_code: type,
      user_ids: temp_id
    }
    setContentPrivilege(obj).then(res => {
      const isResOk = res => res && res.code === '0'
      if (isResOk(res)) {
        setTimeout(() => {
          message.success('设置成功')
        }, 500)
        let temp_arr = []
        temp_arr = res && res.data[0]
        this.visitControlUpdateCurrentModalData({ temp_arr: temp_arr, type: 'change', code: type })
      } else {
        message.warn(res.message)
      }
    })
  }

  /**
   * 其他成员的下拉回调
   * @param {String} id 这是用户的user_id
   * @param {String} type 这是对应的用户字段
   * @param {String} removeId 这是对应移除用户的id
   */
  handleClickedOtherPersonListOperatorItem = (id, type, removeId) => {
    if (type === 'remove') {
      this.handleVisitControlRemoveContentPrivilege(removeId)
    } else {
      this.handleVisitControlChangeContentPrivilege(id, type)
    }
  }

  // 访问控制操作 E

  // 分享操作 S
  handleOnlyReadingShareExpChangeOrStopShare = (obj) => {
    const isStopShare = obj && obj['status'] && obj['status'] === '0'
    return modifOrStopShareLink(obj).then(res => {
      if (res && res.code === '0') {
        if (isStopShare) {
          message.success('停止分享成功')
        } else {
          message.success('修改成功')
          const { dispatch, drawContent = {}, drawContent: { card_id } } = this.props
          const isShared = obj && obj['status'] && obj['status']
          if (isShared) {
            let new_drawContent = { ...drawContent, is_shared: obj['status'] }
            dispatch({
              type: 'publicTaskDetailModal/updateDatas',
              payload: {
                drawContent: new_drawContent,
              }
            })
            this.props.handleTaskDetailChange && this.props.handleTaskDetailChange({ drawContent: new_drawContent, card_id })
          }
        }
        this.setState((state) => {
          const { onlyReadingShareData } = state
          return {
            onlyReadingShareData: Object.assign({}, onlyReadingShareData, obj)
          }
        })
      } else {
        message.error('操作失败')
      }
    })
  }

  handleChangeOnlyReadingShareModalVisible = () => {
    const { onlyReadingShareModalVisible } = this.state
    //打开之前确保获取到数据
    if (!onlyReadingShareModalVisible) {
      Promise.resolve(this.createOnlyReadingShareLink()).then(() => {
        this.setState({
          onlyReadingShareModalVisible: true
        })
      }).catch(() => message.error('获取分享信息失败'))
    } else {
      this.setState({
        onlyReadingShareModalVisible: false
      })
    }
  }

  createOnlyReadingShareLink = () => {
    // const { location } = this.props
    //获取参数
    // const { board_id = '', appsSelectKey = '', card_id = '' } = this.getSearchFromLocation(location)

    const { drawContent = {} } = this.props
    const { board_id, card_id, } = drawContent

    const payload = {
      board_id,
      rela_id: card_id,
      rela_type: '1'
    }
    return createShareLink(payload).then(({ code, data }) => {
      if (code === '0') {
        this.setState(() => {
          return {
            onlyReadingShareData: data
          }
        })
      } else {
        message.error('获取分享信息失败')
        return new Error('can not create share link.')
      }
    })
  }
  // 分享操作 E

  // 删除任务的操作 S
  handleDelCard = () => {
    const { card_id } = this.props
    if (!card_id) return false
    this.confirm(card_id)
  }

  confirm(card_id) {
    const that = this
    const { dispatch } = that.props
    Modal.confirm({
      title: `确认删除该${currentNounPlanFilterName(TASKS)}吗？`,
      okText: '确认',
      cancelText: '取消',
      zIndex: 2000,
      onOk() {
        dispatch({
          type: 'publicTaskDetailModal/deleteTask',
          payload: {
            id: card_id,
            calback: function () {
              dispatch({
                type: 'publicTaskDetailModal/updateDatas',
                payload: {
                  drawerVisible: false,
                  drawContent: {},
                  card_id: '',
                  is_edit_title: false,
                }
              })
              // 删除卡片也需要调用圈子关闭联动
              setTimeout(() => global.constants.lx_utils && global.constants.lx_utils.setCommentData(card_id || null) , 200)
              that.props.handleDeleteCard && that.props.handleDeleteCard({ card_id: card_id })
            }
          }
        })
      }
    });
  }

  // 删除任务的操作 E


  render() {
    const { drawContent = {} } = this.props
    const { board_id, card_id, is_privilege, privileges = [], executors = [], is_shared } = drawContent
    const { onlyReadingShareData, onlyReadingShareModalVisible } = this.state
    return (

      <div className={headerStyles.detail_action_list}>

        {/* 访问控制 */}
        <span className={`${headerStyles.action} ${headerStyles.visit_wrap}`}>
          {
            board_id && (
<VisitControl
              board_id={board_id}
              isPropVisitControl={is_privilege === '0' ? false : true}
              handleVisitControlChange={this.handleVisitControlChange}
              principalList={executors}
              otherPrivilege={privileges}
              handleClickedOtherPersonListOperatorItem={this.handleClickedOtherPersonListOperatorItem}
              handleAddNewMember={this.handleVisitControlAddNewMember}
            />
)
          }

        </span>
        {/* 分享协作 */}
        <span className={`${headerStyles.action} `}>

          {is_shared === '1' ? (
            <span className={headerStyles.right__shareIndicator} onClick={this.handleChangeOnlyReadingShareModalVisible}>
              <span className={`${globalStyles.authTheme} ${headerStyles.right__shareIndicator_icon}`}>&#xe7e7;</span>
              <span className={headerStyles.right__shareIndicator_text}>正在分享</span>
            </span>
          ) : (
<span className={`${headerStyles.right_menu} ${headerStyles.share_icon}`} >
              <Tooltip title="分享协作" placement="top">
                <span onClick={this.handleChangeOnlyReadingShareModalVisible} className={`${globalStyles.authTheme} ${headerStyles.right__share}`} style={{ fontSize: '20px' }}>&#xe7e7;</span>
              </Tooltip>
            </span>
)}

          <ShareAndInvite
           
            onlyReadingShareModalVisible={onlyReadingShareModalVisible} handleChangeOnlyReadingShareModalVisible={this.handleChangeOnlyReadingShareModalVisible}
            data={onlyReadingShareData}
            handleOnlyReadingShareExpChangeOrStopShare={this.handleOnlyReadingShareExpChangeOrStopShare}
          />
        </span>
        {/* 删除 */}
        <span className={`${headerStyles.action}`}>
          <Tooltip title="删除">
            <span className={headerStyles.dele_icon} onClick={this.handleDelCard}>
              <span className={`${globalStyles.authTheme} ${headerStyles.dele}`}>&#xe7c3;</span>
            </span>
          </Tooltip>
        </span>


      </div>

    )
  }
}

// 只关联public弹窗内的数据
function mapStateToProps({ publicTaskDetailModal: { drawContent = {}, is_edit_title, card_id }, projectDetail: { datas: { projectDetailInfoData = {} } } }) {
  return { drawContent, is_edit_title, card_id, projectDetailInfoData }
}
