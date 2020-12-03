import React, { Component } from 'react'
import { Tree, Menu, Tooltip, Input, Button, message } from 'antd'
import { MESSAGE_DURATION_TIME } from '@/globalset/js/constant'
import indexStyles from '../index.less'
import globalStyles from '@/globalset/css/globalClassName.less'
import { connect } from 'dva'
import { isApiResponseOk } from '@/utils/handleResponseData'
const { TreeNode } = Tree
@connect(mapStateToProps)
export default class TempleteSchemeTree extends Component {
  state = {}

  // 初始化的state数据
  initStateDatas = () => {
    this.setState({
      is_add_sibiling: false,
      is_add_children: false,
      is_add_rename: false,
      inputValue: ''
    })
  }

  // 卸载事件
  componentWillUnmount() {
    this.props.dispatch({
      type: 'organizationManager/updateDatas',
      payload: {
        currentTempleteListContainer: [],
        currentTempleteId: ''
      }
    })
  }

  // 展开的回调
  onExpand = expandedKeys => {
    this.setState({
      expandedKeys: expandedKeys
    })
  }

  // Tree 的选择回调
  onSelect = (selectedKeys, e) => {
    const { currentTempleteListContainer = [] } = this.props
    let new_data = [...currentTempleteListContainer]
    const { selected } = e
    const {
      is_wrapper_add_sibiling,
      is_add_sibiling,
      is_wrapper_add_children,
      is_add_children,
      is_wrapper_add_rename,
      is_add_rename,
      selectedKeys: oldSelectedKeys
    } = this.state
    // if (is_add_sibiling || is_add_children || is_add_rename) return
    if (oldSelectedKeys && oldSelectedKeys[0] != selectedKeys[0] && selected) {
      // 这步判断就是 ==> 相当于点击每一个item的切换，需要把上一个找到并恢复上一个点击的状态
      // this.updateSpliceTreeList({ datas: currentTempleteListContainer, currentId: oldSelectedKeys[0], type: 'remove' })
      if (is_wrapper_add_sibiling || is_add_sibiling) {
        // 如果是同级，就处理同级
        this.updateCancelOrDeleteSibilingTreeList({
          datas: currentTempleteListContainer,
          type: 'add_sibiling'
        })
      } else if (is_wrapper_add_children || is_add_children) {
        // 如果是子级，就处理子级
        this.updateCancelOrDeleteChildrenTreeList({
          datas: currentTempleteListContainer,
          type: 'add_children'
        })
      } else if (is_wrapper_add_rename || is_add_rename) {
        // 如果是重命名就处理重命名
        this.updateCancelOrDeleteAlreadyExistsTreeList({
          datas: currentTempleteListContainer,
          type: oldSelectedKeys && oldSelectedKeys[0]
        })
      }
      this.initStateDatas()
    } else if (!oldSelectedKeys && selected) {
      // 这里是点击每一个item上hover图标的点击事件
      this.updateCancelOrDeleteAlreadyExistsTreeList({
        datas: currentTempleteListContainer,
        type: selectedKeys[0]
      })
      this.initStateDatas()
    }
    this.setState({
      selectedKeys
    })
    // 这是在选中的时候更新一个当前点击的对象, 保存在 model 中
    let currentSelectedItemInfo = this.recursion(
      currentTempleteListContainer,
      selectedKeys[0]
    )
    this.props.dispatch({
      type: 'organizationManager/updateDatas',
      payload: {
        currentSelectedItemInfo // 需要点击的时候保存一个当前对象
      }
    })
  }

  // 判断是否禁用
  whetherDisabled = () => {
    const { selectedKeys = [], is_wrapper_add_rename } = this.state
    let flag
    // 不存在选中 或者说 重命名为 true 的时候 表示禁用
    flag = !(selectedKeys && selectedKeys.length) || is_wrapper_add_rename
    return flag
  }

  // 判断是否创建子任务
  judgeWhetherCreateChildTask = (data, nodeId) => {
    let flag
    if (data.length == 0) {
      if (!!nodeId) {
        flag = false
      }
      return flag
    }
    let rev = (data, nodeId, parent_type) => {
      for (let i = 0, length = data.length; i < length; i++) {
        let node = data[i]
        if (node.id == nodeId) {
          flag =
            node.template_data_type == '2' &&
            node.template_data_type == parent_type &&
            parent_type == '2'
          rev(data, node.parent_id)
          break
        } else {
          if (!!node.child_content) {
            rev(node.child_content, nodeId, node.template_data_type)
          }
        }
      }
      return flag
    }
    flag = rev(data, nodeId)
    return flag
  }

  // 创建初始化第一条里程碑
  handleInitTemplete = () => {
    const { dispatch } = this.props
    Promise.resolve(
      dispatch({
        type: 'organizationManager/createTempleteContainer',
        payload: {
          name: '第一阶段里程碑',
          template_data_type: '1',
          template_id: this.props.currentTempleteId,
          parent_id: '0'
        }
      })
    ).then(res => {
      if (isApiResponseOk(res)) {
        dispatch({
          type: 'organizationManager/updateDatas',
          payload: {
            currentSelectedItemInfo: res.data
          }
        })
        this.setState({
          selectedKeys: [res.data.id]
        })
      }
    })
  }

  /**
   * 递归遍历, 写来做实验的
   * @param {Array} data 当前树状结构
   * @param {String} currentId 当前点击的ID
   * @return {Array} 返回一个新的数组, 对每一个item进行塞值, 存储后续需要的数据
   */
  recursion = (data, currentId) => {
    let result = null
    if (!data) return
    for (let val = 0; val < data.length; val++) {
      if (result !== null) {
        break
      }
      let item = data[val]
      if (item.id == currentId) {
        result = { ...item, prev_index: val, is_rename: false }
        break
      } else if (item.child_content && item.child_content.length > 0) {
        result = this.recursion(item.child_content, currentId)
      }
    }
    return result
  }

  /**
   * 获取当前元素中所有父元素所在的下标 (层级)
   * @param {Array} data2 当前的树状列表结构
   * @param {String} nodeId2 当前的ID
   */
  getCurrentElementParentKey(data2, nodeId2) {
    let arrRes = []
    if (data2.length == 0) {
      if (!!nodeId2) {
        arrRes.unshift(data2)
      }
      return arrRes
    }
    let rev = (data, nodeId) => {
      for (let i = 0, length = data.length; i < length; i++) {
        let node = data[i]
        if (node.id == nodeId) {
          arrRes.unshift(i)
          rev(data2, node.parent_id)
          break
        } else {
          if (!!node.child_content) {
            rev(node.child_content, nodeId)
          }
        }
      }
      return arrRes
    }
    arrRes = rev(data2, nodeId2)
    return arrRes
  }

  /**
   * 更新添加同级树状结构
   * 逻辑: 找到当前点击对象的父元素, 然后push一个同级对象
   * @param {Array} datas 当前的树状结构
   * @param {String} currentId 当前的对象ID
   */
  updateAddSibilingTreeList = ({ datas, currentId }) => {
    let arr = [...datas]
    const { currentSelectedItemInfo = {} } = this.props
    if (
      (currentSelectedItemInfo &&
        Object.keys(currentSelectedItemInfo) &&
        Object.keys(currentSelectedItemInfo).length == '0') ||
      !currentSelectedItemInfo
    )
      return false
    let {
      template_data_type,
      template_id,
      parent_id,
      id
    } = currentSelectedItemInfo
    // let obj = { id: 'add_sibiling', name: '', template_data_type: template_data_type, template_id: template_id, parent_id: parent_id, child_content: [] }
    // 得到一个当前元素中所有父级所在的下标位置的数组
    let parentKeysArr = this.getCurrentElementParentKey(arr, currentId)
    let PARENTID = parent_id == '0' ? id : parent_id
    if (parentKeysArr.length == '1') {
      // 如果说当前点击的是最外层的元素, 那么就直接在当前追加一条
      arr.splice(parentKeysArr[0] + 1, 0, {
        id: 'add_sibiling',
        name: '',
        template_data_type: template_data_type,
        template_id: template_id,
        parent_id: PARENTID,
        child_content: []
      })
    } else {
      parentKeysArr.splice(-1, 1) // 这里为什么要截取呢, 是因为,只需要找到当前元素的父元素即可
      arr.map((item, i) => {
        if (i == parentKeysArr[0]) {
          let obj = { ...item }
          for (let n = 1; n < parentKeysArr.length; n++) {
            // 不管怎样，这里的obj永远获取到的都是当前点击的元素的父元素
            obj = item.child_content[parentKeysArr[n]]
          }
          // 想要的这个操作就是在当前点击父元素上push一个同级对象
          obj.child_content &&
            obj.child_content.push({
              id: 'add_sibiling',
              name: '',
              template_data_type: template_data_type,
              template_id: template_id,
              parent_id: PARENTID,
              child_content: []
            })
        }
        return item
      })
    }
    // return
    this.props.dispatch({
      type: 'organizationManager/updateDatas',
      payload: {
        currentTempleteListContainer: arr
      }
    })
  }

  // 去除空数组
  removeEmptyArrayEle = arr => {
    for (var i = 0; i < arr.length; i++) {
      if (arr[i] == undefined) {
        arr.splice(i, 1)
        i = i - 1 // i - 1 ,因为空元素在数组下标 2 位置，删除空之后，后面的元素要向前补位，
        // 这样才能真正去掉空元素,觉得这句可以删掉的连续为空试试，然后思考其中逻辑
      }
    }
    return arr
  }

  /**
   * 添加子级更新树状结构
   * 逻辑: 获取当前对象自己所在的位置,然后在child_content中push一个对象
   * 同时也要更新父级的展开关闭状态
   * @param {Array} datas 当前的树状结构
   * @param {String} currentId 当前的对象ID
   */
  updateAddChildrenTreeList = ({ datas, currentId }) => {
    let arr = [...datas]
    const { expandedKeys = [] } = this.state
    const { currentSelectedItemInfo = {} } = this.props
    let {
      template_data_type,
      template_id,
      parent_id,
      prev_index,
      id
    } = currentSelectedItemInfo
    let tempExpandedKeys = [...expandedKeys]
    // let obj = { id: 'add_sibiling', name: '', template_data_type: template_data_type, template_id: template_id, parent_id: parent_id, child_content: [] }
    let PARENTID = parent_id == '0' ? id : parent_id
    // 得到一个当前元素中所有父级所在的下标位置的数组
    let parentKeysArr = this.getCurrentElementParentKey(arr, currentId)
    let temp = [].concat(currentSelectedItemInfo.child_content, [
      {
        id: 'add_children',
        name: '',
        template_data_type: '2',
        template_id: template_id,
        parent_id: PARENTID,
        child_content: []
      }
    ])
    // currentSelectedItemInfo.child_content.push()
    if (parentKeysArr.length == '1') {
      // 如果说当前点击的是最外层的元素, 那么就直接在当前追加一条
      arr.splice(parentKeysArr[0], 1, {
        ...currentSelectedItemInfo,
        child_content: this.removeEmptyArrayEle(temp)
      })
      tempExpandedKeys.push(PARENTID)
    } else {
      parentKeysArr.splice(-1, 1) // 这里为什么要截取呢, 是因为,只需要找到当前元素的父元素即可
      arr.map((item, i) => {
        if (i == parentKeysArr[0]) {
          let obj = { ...item }
          for (let n = 1; n < parentKeysArr.length; n++) {
            obj = item.child_content[parentKeysArr[n]]
          }
          // obj.child_content && obj.child_content.splice(prev_index, 0, {...currentSelectedItemInfo, child_content:[{ id: 'add_children', name: '', template_data_type: template_data_type, template_id: template_id, parent_id: parent_id, child_content: [] }]});
          let recentlyParent =
            obj.child_content && obj.child_content[prev_index]
          recentlyParent.child_content &&
            recentlyParent.child_content.push({
              id: 'add_children',
              name: '',
              template_data_type: '2',
              template_id: template_id,
              parent_id: recentlyParent.id,
              child_content: []
            })
          tempExpandedKeys.push(recentlyParent.id)
        }
        return item
      })
    }
    this.props.dispatch({
      type: 'organizationManager/updateDatas',
      payload: {
        currentTempleteListContainer: arr
      }
    })
    this.setState({
      expandedKeys: tempExpandedKeys
    })
  }

  // 根据不同的类型来进行取消或者删除
  accordingToDifferenceTypeUpdateTreeList = ({ datas, type }) => {
    switch (type) {
      case 'add_sibiling': // 添加同级
        this.updateCancelOrDeleteSibilingTreeList({ datas, type })
        break
      case 'add_children': // 添加子级
        this.updateCancelOrDeleteChildrenTreeList({ datas, type })
        break
      default:
        // 表示已存在的元素
        this.updateCancelOrDeleteAlreadyExistsTreeList({ datas, type })
        break
    }
  }

  /**
   * 新增加的结构的取消删除更新树状结构
   * 同级操作更新
   * 逻辑: 找到当前操作的并截取
   * @param {Array} datas 当前的树状结构
   * @param {String} type 当前添加该结构的ID,利用type类型来进行区分
   */
  updateCancelOrDeleteSibilingTreeList = ({
    datas,
    type,
    oldId,
    whetherUpdate
  }) => {
    if (!datas) return
    let arr = [...datas]
    // 定义一个判断是否在列表中存在一个其他的Type类型
    const whetherExistenceOthersType = content => {
      content = content.filter(item => item.id == type)
      return content
    }
    const { currentSelectedItemInfo = {}, dispatch } = this.props
    if (
      (currentSelectedItemInfo &&
        Object.keys(currentSelectedItemInfo) &&
        Object.keys(currentSelectedItemInfo).length == '0') ||
      !currentSelectedItemInfo
    )
      return false
    let { id, prev_index } = currentSelectedItemInfo
    // let obj = { id: 'add_sibiling', name: '', template_data_type: template_data_type, template_id: template_id, parent_id: parent_id, child_content: [] }
    // 得到一个当前元素中所有父级所在的下标位置的数组
    let parentKeysArr = oldId
      ? this.getCurrentElementParentKey(arr, oldId)
      : this.getCurrentElementParentKey(arr, id)

    if (parentKeysArr.length == '1') {
      // 如果说当前点击的是最外层的元素, 那么就直接在当前追加一条
      let flag = whetherExistenceOthersType(arr)
      if (flag && flag.length) {
        arr.splice(parentKeysArr[0] + 1, 1)
        dispatch({
          type: 'organizationManager/updateDatas',
          payload: {
            currentTempleteListContainer: arr
            // currentSelectedItemInfo: {}
          }
        })
      }
      if (oldId && whetherUpdate) {
        this.updateAddSibilingTreeList({ datas: arr, currentId: id })
      } else {
        this.setState({
          is_add_sibiling: false
        })
      }
      this.setState({
        is_wrapper_add_sibiling: false
      })
      return
    } else {
      parentKeysArr.splice(-1, 1) // 这里为什么要截取呢, 是因为,只需要找到当前元素的父元素即可
      arr.map((item, i) => {
        if (i == parentKeysArr[0]) {
          let obj = { ...item }
          for (let n = 1; n < parentKeysArr.length; n++) {
            obj = item.child_content[parentKeysArr[n]]
          }
          let flag = whetherExistenceOthersType(
            obj.child_content && obj.child_content
          )
          if (flag && flag.length) {
            // 如果是点击了添加同级的操作
            obj.child_content && obj.child_content.splice(-1, 1)
          }
        }
        return item
      })

      if (oldId && whetherUpdate) {
        this.updateAddSibilingTreeList({ datas: arr, currentId: id })
      } else {
        this.setState({
          is_add_sibiling: false
        })
      }
      dispatch({
        type: 'organizationManager/updateDatas',
        payload: {
          currentTempleteListContainer: arr
          // currentSelectedItemInfo: {}
        }
      })
      this.setState({
        is_wrapper_add_sibiling: false
      })
    }
  }

  /**
   * 新增加的结构的取消删除更新树状结构
   * 子级操作更新
   * @param {Array} datas 当前的树状结构
   * @param {String} type 当前添加该结构的ID,利用type类型来进行区分
   */
  updateCancelOrDeleteChildrenTreeList = ({
    datas,
    type,
    oldId,
    whetherUpdate
  }) => {
    let arr = [...datas]
    const { is_add_children } = this.state
    // 定义一个判断是否在列表中存在一个其他的Type类型
    const whetherExistenceOthersType = content => {
      content = content.filter(item => item.id == type)
      return content
    }
    const { expandedKeys = [] } = this.state
    const { currentSelectedItemInfo = {}, dispatch } = this.props
    if (
      (currentSelectedItemInfo &&
        Object.keys(currentSelectedItemInfo) &&
        Object.keys(currentSelectedItemInfo).length == '0') ||
      !currentSelectedItemInfo
    )
      return false
    let { id, prev_index, parent_id } = currentSelectedItemInfo
    // let obj = { id: 'add_sibiling', name: '', template_data_type: template_data_type, template_id: template_id, parent_id: parent_id, child_content: [] }
    // 得到一个当前元素中所有父级所在的下标位置的数组
    let parentKeysArr = oldId
      ? this.getCurrentElementParentKey(arr, oldId)
      : this.getCurrentElementParentKey(arr, id)

    if (parentKeysArr.length == '1') {
      // 如果说当前点击的是最外层的元素, 那么就直接在当前追加一条
      let flag = whetherExistenceOthersType(arr[parentKeysArr[0]].child_content)

      if (flag && flag.length) {
        arr[parentKeysArr[0]].child_content.splice(-1, 1)
        dispatch({
          type: 'organizationManager/updateDatas',
          payload: {
            currentTempleteListContainer: arr
            // currentSelectedItemInfo: {}
          }
        })
        let PARENTID = parent_id == '0' ? id : parent_id
        if (expandedKeys.indexOf(PARENTID) != -1) {
          let tempExpandedKeys = [...expandedKeys]
          tempExpandedKeys = tempExpandedKeys.filter(item => item != PARENTID)
          this.setState({
            expandedKeys: tempExpandedKeys
          })
        }
        if (oldId && whetherUpdate) {
          this.updateAddChildrenTreeList({ datas: arr, currentId: id })
        } else {
          this.setState({
            is_add_children: false
          })
        }
        this.setState({
          is_wrapper_add_children: false
        })
      }
      return
    } else {
      parentKeysArr.splice(-1, 1) // 这里为什么要截取呢, 是因为,只需要找到当前元素的父元素即可
      arr.map((item, i) => {
        if (i == parentKeysArr[0]) {
          let obj = { ...item }
          for (let n = 1; n < parentKeysArr.length; n++) {
            obj = item.child_content[parentKeysArr[n]]
          }
          let flag = whetherExistenceOthersType(
            obj.child_content && obj.child_content[prev_index].child_content
          )
          if (flag && flag.length) {
            let recentlyParent =
              obj.child_content && obj.child_content[prev_index]
            recentlyParent.child_content.splice(-1, 1)
            if (expandedKeys.indexOf(recentlyParent.id) != -1) {
              let tempExpandedKeys = [...expandedKeys]
              tempExpandedKeys = tempExpandedKeys.filter(
                item => item != recentlyParent.id
              )
              this.setState({
                expandedKeys: tempExpandedKeys
              })
            }
          }
        }
        return item
      })
      if (oldId && whetherUpdate) {
        this.updateAddChildrenTreeList({ datas: arr, currentId: id })
      } else {
        this.setState({
          is_add_children: false
        })
      }
      this.setState({
        is_wrapper_add_children: false
      })
      dispatch({
        type: 'organizationManager/updateDatas',
        payload: {
          currentTempleteListContainer: arr
          // currentSelectedItemInfo: {}
        }
      })
    }
  }

  /**
   * 对已经存在的 元素进行取消删除等操作
   */
  updateCancelOrDeleteAlreadyExistsTreeList = ({ datas, type }) => {
    let arr = [...datas]
    const { currentSelectedItemInfo = {}, dispatch } = this.props
    if (
      (currentSelectedItemInfo &&
        Object.keys(currentSelectedItemInfo) &&
        Object.keys(currentSelectedItemInfo).length == '0') ||
      !currentSelectedItemInfo
    )
      return false
    let { id, prev_index, template_id } = currentSelectedItemInfo
    if (type == 'DELETE') {
      Promise.resolve(
        dispatch({
          type: 'organizationManager/deleteTempleteContainer',
          payload: {
            id: id,
            template_id
          }
        })
      ).then(res => {
        if (isApiResponseOk(res)) {
          dispatch({
            type: 'organizationManager/updateDatas',
            payload: {
              currentSelectedItemInfo: {}
            }
          })
          this.setState({
            selectedKeys: [],
            is_wrapper_add_rename: false
            // expandedKeys: [],
          })
          this.initStateDatas()
        }
      })
      return
    }
    // let obj = { id: 'add_sibiling', name: '', template_data_type: template_data_type, template_id: template_id, parent_id: parent_id, child_content: [] }
    // 得到一个当前元素中所有父级所在的下标位置的数组
    let parentKeysArr = this.getCurrentElementParentKey(arr, id)
    if (parentKeysArr.length == '1') {
      // 如果说当前点击的是最外层的元素, 那么就直接在当前追加一条
      // arr = this.rename({datas: arr, id, flag: false})
      arr.splice(parentKeysArr[0], 1, {
        ...currentSelectedItemInfo,
        is_rename: false
      })
    } else {
      parentKeysArr.splice(-1, 1) // 这里为什么要截取呢, 是因为,只需要找到当前元素的父元素即可
      arr.map((item, i) => {
        if (i == parentKeysArr[0]) {
          let obj = { ...item }
          for (let n = 1; n < parentKeysArr.length; n++) {
            obj = item.child_content[parentKeysArr[n]]
          }
          obj.child_content &&
            obj.child_content.splice(prev_index, 1, {
              ...currentSelectedItemInfo,
              is_rename: false
            })
        }
        return item
      })
    }
    this.initStateDatas()
    this.setState({
      selectedKeys: [],
      is_wrapper_add_rename: false
      // expandedKeys: [],
    })
    dispatch({
      type: 'organizationManager/updateDatas',
      payload: {
        currentTempleteListContainer: arr
        // currentSelectedItemInfo: {}
      }
    })
  }

  // ---------------------------- 头部导航点击事件 S ---------------------------------------------------

  // 添加同级
  handleWrapperAddSibiling = e => {
    e && e.stopPropagation()
    const { selectedKeys = [] } = this.state
    if (this.whetherDisabled()) return
    const { currentTempleteListContainer = [], dispatch } = this.props
    let currentId = selectedKeys[0]
    this.setState({
      is_wrapper_add_sibiling: true,
      selectedKeys: []
    })
    this.updateAddSibilingTreeList({
      datas: currentTempleteListContainer,
      currentId
    })
  }

  // 添加子级
  handleWrapperAddChildren = e => {
    e && e.stopPropagation()
    const { selectedKeys = [], expandedKeys = [] } = this.state
    const { currentTempleteListContainer = [] } = this.props
    let flag = this.judgeWhetherCreateChildTask(
      currentTempleteListContainer,
      selectedKeys[0]
    )
    if (this.whetherDisabled()) return
    if (flag) {
      message.warn('子任务不能创建子任务哦~', MESSAGE_DURATION_TIME)
      return
    }
    let currentId = selectedKeys[0]
    this.setState({
      is_wrapper_add_children: true,
      selectedKeys: []
    })
    this.updateAddChildrenTreeList({
      datas: currentTempleteListContainer,
      currentId
    })
  }

  /**
   * 重命名更新
   * @param {Array} datas 当前的树状结构列表
   * @param {String} currentId 当前选择的ID
   * @param {Boolean} flag true/false 表示重命名/不重命名
   */
  rename = ({ datas, currentId, flag }) => {
    let arr = [...datas]
    const { currentSelectedItemInfo = {} } = this.props
    let {
      template_data_type,
      template_id,
      parent_id,
      id,
      prev_index
    } = currentSelectedItemInfo
    // let obj = { id: 'add_sibiling', name: '', template_data_type: template_data_type, template_id: template_id, parent_id: parent_id, child_content: [] }
    // 得到一个当前元素中所有父级所在的下标位置的数组
    let parentKeysArr = this.getCurrentElementParentKey(arr, currentId)
    if (parentKeysArr.length == '1') {
      // 如果说当前点击的是最外层的元素, 那么就直接在当前追加一条
      // debugger
      arr.splice(parentKeysArr[0], 1, {
        ...currentSelectedItemInfo,
        is_rename: flag
      })
    } else {
      parentKeysArr.splice(-1, 1) // 这里为什么要截取呢, 是因为,只需要找到当前元素的父元素即可
      arr.map((item, i) => {
        if (i == parentKeysArr[0]) {
          let obj = { ...item }
          for (let n = 1; n < parentKeysArr.length; n++) {
            obj = item.child_content[parentKeysArr[n]]
            // obj = item.child_content[prev_index];
          }
          obj.child_content &&
            obj.child_content.splice(prev_index, 1, {
              ...currentSelectedItemInfo,
              is_rename: flag
            })
        }
        return item
      })
    }
    return arr
  }

  // 重命名
  handleWrapperRename = e => {
    e && e.stopPropagation()
    const { selectedKeys = [] } = this.state
    if (this.whetherDisabled()) return
    const { currentTempleteListContainer = [], dispatch } = this.props
    let currentId = selectedKeys[0]
    let newArr = this.rename({
      datas: currentTempleteListContainer,
      currentId,
      flag: true
    })
    this.props.dispatch({
      type: 'organizationManager/updateDatas',
      payload: {
        currentTempleteListContainer: newArr
      }
    })
    this.setState({
      is_wrapper_add_rename: true
    })
  }

  // 点击删除
  handleWrapperDeleteItem = e => {
    e && e.stopPropagation()
    if (this.whetherDisabled()) return
    const { selectedKeys = [] } = this.state
    const { currentTempleteListContainer = [], dispatch } = this.props
    let currentId = selectedKeys[0]
    // this.updateSpliceTreeList({ datas: currentTempleteListContainer, currentId, type: 'remove' })
    this.updateCancelOrDeleteAlreadyExistsTreeList({
      datas: currentTempleteListContainer,
      currentId,
      type: 'DELETE'
    })
  }

  // ---------------------------- 头部导航点击事件 E ---------------------------------------------------

  // ---------------------------  每一个hoverIcon 的点击事件 S -----------------------------------------

  /**
   * 每一个Icon图标的事件
   * @param {String} key 当前操作的字段名称
   * @param {Object} e 当前事件对象
   */
  handleOperator = (key, e, id) => {
    e && e.stopPropagation()
    const { currentTempleteListContainer = [] } = this.props
    const {
      is_add_sibiling,
      is_add_children,
      is_add_rename,
      is_wrapper_add_sibiling,
      is_wrapper_add_children,
      is_wrapper_add_rename
    } = this.state
    if (
      is_add_sibiling ||
      is_add_children ||
      is_add_rename ||
      is_wrapper_add_sibiling ||
      is_wrapper_add_children ||
      is_wrapper_add_rename
    )
      return
    if (id) {
      let currentSelectedItemInfo = this.recursion(
        currentTempleteListContainer,
        id
      )
      this.props.dispatch({
        type: 'organizationManager/updateDatas',
        payload: {
          currentSelectedItemInfo // 需要点击的时候保存一个当前对象
        }
      })
    }
    const cond = {
      add_sibiling: e => this.handleAddSibiling(e, id),
      add_children: e => this.handleAddChildren(e, id),
      rename: e => this.handleRename(e, id),
      delete_item: e => this.handleDeleteItem(e, id)
    }
    setTimeout(() => {
      cond[key](e)
    }, 200)
  }

  // 添加同级 S
  handleAddSibiling = (e, id) => {
    e && e.stopPropagation()
    const { is_add_sibiling, is_add_children, itemIconArr = [] } = this.state
    var { currentTempleteListContainer = [] } = this.props
    itemIconArr.push(id)
    // if (is_add_children) {
    //   return
    //   // this.updateCancelOrDeleteChildrenTreeList({ datas: currentTempleteListContainer, type: 'add_children', oldId: itemIconArr[0], whetherUpdate: false })
    // }
    // if (is_add_sibiling) {
    //   this.updateCancelOrDeleteSibilingTreeList({ datas: currentTempleteListContainer, type: 'add_sibiling', oldId: itemIconArr[0], whetherUpdate: true })
    //   itemIconArr.shift(0, 1)
    //   this.setState({
    //     itemIconArr: itemIconArr
    //   })
    //   return
    // }
    this.setState({
      is_add_sibiling: true,
      selectedKeys: [],
      itemIconArr: itemIconArr
    })
    this.updateAddSibilingTreeList({
      datas: currentTempleteListContainer,
      currentId: id
    })
    // this.updateAddSibilingTreeList({ datas: currentTempleteListContainer, currentId: id })
  }
  // 添加同级 E

  // 添加子级 S
  handleAddChildren = (e, id) => {
    e && e.stopPropagation()
    const { is_add_sibiling, is_add_children, itemIconArr = [] } = this.state
    let { currentTempleteListContainer = [] } = this.props
    itemIconArr.push(id)
    let flag = this.judgeWhetherCreateChildTask(
      currentTempleteListContainer,
      id
    )
    if (flag) {
      message.warn('子任务不能创建子任务哦~', MESSAGE_DURATION_TIME)
      return
    }
    // if (is_add_sibiling) {
    //   debugger
    //   return
    //   // this.updateCancelOrDeleteSibilingTreeList({ datas: currentTempleteListContainer, type: 'add_sibiling', oldId: itemIconArr[0], whetherUpdate: false })
    //   // 数据跟不上视图的变化
    // }
    // if (is_add_children) {
    //   console.log(itemIconArr, 'ssssssssssss_itemIconArr')
    //   this.updateCancelOrDeleteChildrenTreeList({ datas: currentTempleteListContainer, type: 'add_children', oldId: itemIconArr[0], whetherUpdate: true })
    //   itemIconArr.shift(0, 1)
    //   this.setState({
    //     itemIconArr: itemIconArr
    //   })
    //   return
    // }

    this.setState({
      is_add_children: true,
      selectedKeys: [],
      itemIconArr: itemIconArr
    })
    this.updateAddChildrenTreeList({
      datas: currentTempleteListContainer,
      currentId: id
    })
  }
  // 添加子级 E

  // 重命名 S
  handleRename = (e, id) => {
    e && e.stopPropagation()
    const { is_add_rename } = this.state
    if (is_add_rename) {
      return false
    }
    const { currentTempleteListContainer = [], dispatch } = this.props
    let newArr = this.rename({
      datas: currentTempleteListContainer,
      currentId: id,
      flag: true
    })
    this.props.dispatch({
      type: 'organizationManager/updateDatas',
      payload: {
        currentTempleteListContainer: newArr
      }
    })
    this.setState({
      is_add_rename: true,
      selectedKeys: []
    })
  }
  // 重命名 E

  // 删除 S
  handleDeleteItem = (e, id) => {
    e && e.stopPropagation()
    const { currentTempleteListContainer = [] } = this.props
    this.updateCancelOrDeleteAlreadyExistsTreeList({
      datas: currentTempleteListContainer,
      id,
      type: 'DELETE'
    })
  }
  // 删除 E

  // ---------------------------  每一个hoverIcon 的点击事件 E -----------------------------------------

  // --------------------------  新增元素的输入框等事件 S -------------------------------------
  // Input输入框事件
  handleChangeTempleteContainerValue = e => {
    e && e.stopPropagation()
    if (e.target.value.trimLR() == '') {
      // message.warn('名称不能为空哦~', MESSAGE_DURATION_TIME)
      this.setState({
        inputValue: ''
      })
      return false
    }
    if (e.target.value.length > 19) {
      message.warn('最多只能输入20个字符哦~')
      // return
    }
    this.setState({
      inputValue: e.target.value
    })
  }

  // 添加同级 或 子级 的确定点击事件
  handleCreateTempContainer = ({ e, is_rename }) => {
    e && e.stopPropagation()
    const { currentSelectedItemInfo = {} } = this.props
    if (
      (currentSelectedItemInfo &&
        Object.keys(currentSelectedItemInfo) &&
        Object.keys(currentSelectedItemInfo).length == '0') ||
      !currentSelectedItemInfo
    )
      return false
    const {
      template_data_type,
      template_id,
      parent_id,
      id,
      name,
      child_content
    } = currentSelectedItemInfo
    const { inputValue, is_add_children, is_wrapper_add_children } = this.state
    // 如果是template_data_type == '2' 子任务, 就取parent_id , 否则为 id ==> 判断是否 创建添加的是什么
    // 如果是创建添加子任务，那么就取该 对象中的 id 否则为parent_id
    let PARENTID =
      template_data_type == '2'
        ? is_add_children || is_wrapper_add_children
          ? id
          : parent_id
        : parent_id
    if (is_rename) {
      this.props.dispatch({
        type: 'organizationManager/updateTempleteContainer',
        payload: {
          name: inputValue,
          id: id,
          template_id: template_id
        }
      })
    } else {
      this.props.dispatch({
        type: 'organizationManager/createTempleteContainer',
        payload: {
          name: inputValue,
          parent_id: parent_id == '0' ? id : PARENTID,
          template_data_type:
            is_add_children || is_wrapper_add_children
              ? '2'
              : template_data_type,
          template_id: template_id
        }
      })
    }

    this.initStateDatas()
    this.setState({
      is_wrapper_add_sibiling: false,
      is_wrapper_add_children: false,
      is_wrapper_add_rename: false
    })
  }

  // 添加 同级 或 子级 的取消点击事件
  handleCancelTempContainer = ({ e, id: type }) => {
    e && e.stopPropagation()
    const { currentTempleteListContainer = [] } = this.props
    // this.updateCancelOrDeleteTreeList({ datas: currentTempleteListContainer, type })
    this.accordingToDifferenceTypeUpdateTreeList({
      datas: currentTempleteListContainer,
      type
    })
  }

  // --------------------------  新增元素的输入框等事件 E -------------------------------------

  // 每一个Icon小图标的操作
  renderOperatorIconList = id => {
    const operatorIconList = [
      {
        toolTipText: '添加同级',
        key: 'add_sibiling',
        icon: <span>&#xe6f1;</span>,
        onClick: e => this.handleOperator('add_sibiling', e, id)
      },
      {
        toolTipText: '添加子级',
        key: 'add_children',
        icon: <span>&#xe6f2;</span>,
        onClick: e => this.handleOperator('add_children', e, id)
      },
      {
        toolTipText: '重命名',
        key: 'rename',
        icon: <span>&#xe602;</span>,
        onClick: e => this.handleOperator('rename', e, id)
      },
      {
        toolTipText: '删除',
        key: 'delete_item',
        icon: <span>&#xe7c3;</span>,
        onClick: e => this.handleOperator('delete_item', e, id)
      }
    ]
    return operatorIconList
  }

  // 渲染树状列表的title
  renderPlanTreeTitle = ({ type, name, is_rename, id }) => {
    const {
      is_add_sibiling,
      is_add_children,
      is_add_rename,
      is_wrapper_add_sibiling,
      is_wrapper_add_children,
      is_wrapper_add_rename
    } = this.state
    const {
      currentSelectedItemInfo = {},
      currentTempleteListContainer = []
    } = this.props
    let firstEleId =
      currentTempleteListContainer &&
      currentTempleteListContainer.length > 0 &&
      currentTempleteListContainer[0].id
    let icon = ''
    let flag = this.judgeWhetherCreateChildTask(
      this.props.currentTempleteListContainer,
      id
    )
    if (type == '1') {
      icon = (
        <span
          className={globalStyles.authTheme}
          style={{ color: '#FAAD14', fontSize: '18px', marginRight: '6px' }}
        >
          &#xe6ef;
        </span>
      )
    } else if (type == '2') {
      icon = (
        <span
          className={globalStyles.authTheme}
          style={{ color: '#18B2FF', fontSize: '18px', marginRight: '6px' }}
        >
          &#xe6f0;
        </span>
      )
    }
    let operatorIconList = this.renderOperatorIconList(id)
    let disabledAll =
      is_add_sibiling ||
      is_add_children ||
      is_add_rename ||
      is_wrapper_add_sibiling ||
      is_wrapper_add_children ||
      is_wrapper_add_rename
    return (
      <div
        id={`show_icon-${id}`}
        className={indexStyles.show_icon}
        style={{ display: 'flex', alignItems: 'center' }}
      >
        {!name || is_rename ? (
          <>
            {icon}
            <span style={{ flex: 1, marginRight: '12px' }}>
              <Input
                maxLength={20}
                autoFocus={true}
                onClick={this.handleChangeTempleteContainerValue}
                onChange={this.handleChangeTempleteContainerValue}
              />
            </span>
            <span>
              <Button
                onClick={e => {
                  this.handleCreateTempContainer({ e, is_rename })
                }}
                type="primary"
                style={{ marginRight: '8px' }}
                disabled={
                  this.state.inputValue && this.state.inputValue.length <= 20
                    ? false
                    : true
                }
              >
                确定
              </Button>
              <Button
                onClick={e => {
                  this.handleCancelTempContainer({ e, id })
                }}
              >
                取消
              </Button>
            </span>
          </>
        ) : (
          <>
            {icon}
            <span>{name}</span>
            {/* <div className={indexStyles.icon_list}>
                  {
                    operatorIconList.map(item => (
                      <Tooltip autoAdjustOverflow={false} placement={firstEleId == id ? 'bottom' : 'top'} title={item.toolTipText} getPopupContainer={triggerNode => triggerNode.parentNode}>
                        <span onClick={item.onClick} key={item.key} className={`${globalStyles.authTheme} ${indexStyles.icon_item} ${item.key == 'add_children' && flag && indexStyles.is_add_children} ${item.key == 'delete_item' && indexStyles.delete_item} ${disabledAll && indexStyles.disabledAll}`}>{item.icon}</span>
                      </Tooltip>
                    ))
                  }
                </div> */}
          </>
        )}
      </div>
    )
  }

  // 递归渲染树状结构
  renderPlanTreeNode = data => {
    return (
      data &&
      data.map(item => {
        let { template_data_type, name, id, is_rename } = item
        // let is_child_card = parent_type == '2'
        // this.judgeWhetherCreateChildTask(id)
        if (item.child_content && item.child_content.length > 0) {
          return (
            <TreeNode
              title={this.renderPlanTreeTitle({
                type: template_data_type,
                name,
                id,
                is_rename
              })}
              key={item.id}
              dataRef={item}
            >
              {this.renderPlanTreeNode(item.child_content)}
            </TreeNode>
          )
        } else {
          return (
            <TreeNode
              title={this.renderPlanTreeTitle({
                type: template_data_type,
                name,
                id,
                is_rename
              })}
              key={item.id}
              dataRef={item}
            />
          )
        }
      })
    )
  }

  // 渲染数组为空的时候结构
  renderEmptyTreeData = () => {
    return (
      <div>
        {/* <div onClick={this.handleInitTemplete} className={indexStyles.empty_data}><span className={globalStyles.authTheme}>&#xe6e9;</span> 添加项目第一阶段里程碑</div> */}
      </div>
    )
  }

  // 渲染有数据时的树状结构
  renderNotEmptyTreeData = () => {
    const { expandedKeys = [], selectedKeys = [], is_add_rename } = this.state
    const { currentTempleteListContainer = [] } = this.props
    return (
      <div
        className={`${indexStyles.treeNodeWrapper} ${globalStyles.global_vertical_scrollbar}`}
      >
        <Tree
          blockNode={true}
          selectedKeys={selectedKeys}
          expandedKeys={expandedKeys}
          onSelect={this.onSelect}
          onExpand={this.onExpand}
        >
          {this.renderPlanTreeNode(currentTempleteListContainer)}
        </Tree>
      </div>
    )
  }

  render() {
    const {
      planningData = [],
      expandedKeys = [],
      selectedKeys = [],
      is_add_rename,
      is_wrapper_add_rename
    } = this.state
    const { currentTempleteListContainer = [] } = this.props
    let flag = selectedKeys && selectedKeys.length && !is_wrapper_add_rename
    let whetherCreateChildTask =
      selectedKeys &&
      selectedKeys.length &&
      this.judgeWhetherCreateChildTask(
        currentTempleteListContainer,
        selectedKeys[0]
      )
    return (
      <div className={indexStyles.planningSchemeItemWrapper}>
        {/* 顶部工具栏 */}
        {/* <div className={indexStyles.planningSchemeItem_top}>
          <div>
            <span onClick={this.handleWrapperAddSibiling} className={`${globalStyles.authTheme} ${flag ? indexStyles.pub_hover : indexStyles.disabled}`}>&#xe6f1; 添加同级</span>
            <span onClick={this.handleWrapperAddChildren} style={{ marginLeft: '18px' }} className={`${globalStyles.authTheme} ${flag ? indexStyles.pub_hover : indexStyles.disabled} ${whetherCreateChildTask && indexStyles.is_add_children}`}>&#xe6f2; 添加子级</span>
          </div>
          <div>
            <span onClick={this.handleWrapperRename} style={{ marginRight: '18px' }} className={`${globalStyles.authTheme} ${flag ? indexStyles.pub_hover : indexStyles.disabled}`}>&#xe602; 重命名</span>
            <span onClick={this.handleWrapperDeleteItem} className={`${globalStyles.authTheme} ${flag ? indexStyles.del_hover : indexStyles.disabled}`}>&#xe7c3; 删除</span>
          </div>
        </div> */}
        {currentTempleteListContainer && currentTempleteListContainer.length
          ? this.renderNotEmptyTreeData()
          : this.renderEmptyTreeData()}
      </div>
    )
  }
}

function mapStateToProps({
  organizationManager: {
    datas: {
      currentTempleteListContainer = [],
      currentSelectedItemInfo = {},
      currentTempleteId
    }
  }
}) {
  return {
    currentTempleteListContainer,
    currentSelectedItemInfo,
    currentTempleteId
  }
}
