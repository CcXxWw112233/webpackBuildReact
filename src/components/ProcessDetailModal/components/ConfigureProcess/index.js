import React, { Component } from 'react'
import indexStyles from './index.less'
import globalStyles from '@/globalset/css/globalClassName.less'
import NameChangeInput from '@/components/NameChangeInput'
import { Radio, Button, Tooltip } from 'antd'
import ConfigureStepTypeOne from './component/ConfigureStepTypeOne'
import ConfigureStepTypeTwo from './component/ConfigureStepTypeTwo'
import ConfigureStepTypeThree from './component/ConfigureStepTypeThree'
import {
  processEditDatasItemOneConstant,
  processEditDatasItemTwoConstant,
  processEditDatasItemThreeConstant
} from '../../constant'
import { connect } from 'dva'
import { isObjectValueEqual } from '../../../../utils/util'
import {
  saveOnlineExcelWithProcess,
  deleteOnlineExcelWithProcess
} from '../../../../services/technological/workFlow'
import { isApiResponseOk } from '../../../../utils/handleResponseData'
@connect(mapStateToProps)
export default class ConfigureProcess extends Component {
  constructor(props) {
    super(props)
    const { processPageFlagStep, processEditDatas = [] } = props
    let currentEditNodeItem =
      (processEditDatas &&
        processEditDatas.length &&
        processEditDatas.filter(item => item.is_edit == '0')[0]) ||
      {}
    this.state = {
      localName: '', // 当前节点步骤的名称
      currentEditNodeItem:
        processPageFlagStep == '2' ? currentEditNodeItem : {},
      isDisabled: true, // 是否禁用取消按钮 false 表示不禁用 true 表示禁用 ==> 有变化才进行取消 没有变化不取消
      sheetListData: {}
    }
  }

  // 更新对应步骤下的节点内容数据, 即当前操作对象的数据
  updateCorrespondingPrcodessStepWithNodeContent = (data, value) => {
    const { processEditDatas = [], itemKey, dispatch } = this.props
    let newProcessEditDatas = [...processEditDatas]
    newProcessEditDatas[itemKey][data] = value
    dispatch({
      type: 'publicProcessDetailModal/updateDatas',
      payload: {
        processEditDatas: newProcessEditDatas
      }
    })
  }

  // 维护更新数据
  handleServiceData = props => {
    const {
      itemValue,
      templateInfo: { nodes = [] },
      itemKey,
      processPageFlagStep,
      processEditDatas = []
    } = props
    let currentEditNodeItem =
      (processEditDatas &&
        processEditDatas.length &&
        processEditDatas.filter(item => item.is_edit == '0')[0]) ||
      {}
    if (processPageFlagStep == '2' && nodes.length == processEditDatas.length) {
      // 表示是进去编辑的时候 并且节点长度相等的时候, 如果不相等 那么就不比较 表示进行了删除或者添加
      let newStateItemValue = JSON.parse(
        JSON.stringify(currentEditNodeItem || {})
      )
      let newModelItemValue = JSON.parse(JSON.stringify(nodes[itemKey] || {}))
      newStateItemValue['forms'] =
        newStateItemValue['forms'] &&
        newStateItemValue['forms'].map(item => {
          if (
            item.is_click_currentTextForm == false ||
            item.is_click_currentTextForm
          ) {
            let new_item = { ...item }
            delete new_item.is_click_currentTextForm
            return new_item
          } else {
            let new_item = { ...item }
            return new_item
          }
        })
      newModelItemValue['forms'] =
        newModelItemValue['forms'] &&
        newModelItemValue['forms'].map(item => {
          if (
            item.is_click_currentTextForm == false ||
            item.is_click_currentTextForm
          ) {
            let new_item = { ...item }
            delete new_item.is_click_currentTextForm
            return new_item
          } else {
            let new_item = { ...item }
            return new_item
          }
        })
      newStateItemValue.is_edit ? delete newStateItemValue.is_edit : ''
      newStateItemValue.is_click_node_name == false ||
      newStateItemValue.is_click_node_name
        ? delete newStateItemValue.is_click_node_name
        : ''
      newModelItemValue.is_edit ? delete newModelItemValue.is_edit : ''
      newModelItemValue.is_click_node_name == false ||
      newModelItemValue.is_click_node_name
        ? delete newModelItemValue.is_click_node_name
        : ''
      newStateItemValue.options_data
        ? delete newStateItemValue.options_data
        : ''
      newModelItemValue.options_data
        ? delete newModelItemValue.options_data
        : ''
      if (
        newStateItemValue.node_type == '3' &&
        newModelItemValue.node_type == '3'
      ) {
        if (
          isObjectValueEqual(
            newStateItemValue['score_node_set'],
            newModelItemValue['score_node_set']
          )
        ) {
          if (isObjectValueEqual(newStateItemValue, newModelItemValue)) {
            this.setState({
              isDisabled: true
            })
          } else {
            this.setState({
              isDisabled: false
            })
          }
        } else {
          this.setState({
            isDisabled: false
          })
        }
        // if (isObjectValueEqual(newStateItemValue, newModelItemValue)) { // 表示没有变化
        //   this.setState({
        //     isDisabled: true
        //   })
        // } else if (isObjectValueEqual(newStateItemValue['score_node_set'], newModelItemValue['score_node_set'])) {
        //   this.setState({
        //     isDisabled: true
        //   })
        // } else {
        //   this.setState({
        //     isDisabled: false
        //   })
        // }
      } else {
        if (isObjectValueEqual(newStateItemValue, newModelItemValue)) {
          // 表示没有变化
          this.setState({
            isDisabled: true
          })
        } else {
          this.setState({
            isDisabled: false
          })
        }
      }
    } else {
      this.setState({
        isDisabled: false
      })
    }
  }

  componentWillReceiveProps(nextProps) {
    this.handleServiceData(nextProps)
  }

  // 外部点击事件是否取消节点名称输入框
  handleCancelNodeName = e => {
    e && e.stopPropagation()
    const { itemValue } = this.props
    const { name } = itemValue
    const { localName } = this.state
    if (localName == name) {
      // 表示如果当前的名称没有修改的话就不出现输入框
      this.updateCorrespondingPrcodessStepWithNodeContent(
        'is_click_node_name',
        false
      )
    }
  }

  // 节点名称点击事件
  handleChangeNodeName = e => {
    e && e.stopPropagation()
    this.updateCorrespondingPrcodessStepWithNodeContent(
      'is_click_node_name',
      true
    )
  }

  titleTextAreaChange = e => {
    e && e.stopPropagation()
    let val = e.target.value.trimLR()
    if (val == '' || val == ' ' || !val) {
      this.updateCorrespondingPrcodessStepWithNodeContent('name', '')
      return
    }
  }

  // 当前节点的步骤名称
  titleTextAreaChangeBlur = e => {
    e && e.stopPropagation()
    let val = e.target.value.trimLR()
    if (val == '' || val == ' ' || !val) {
      this.updateCorrespondingPrcodessStepWithNodeContent('name', '')
      return
    }
    this.setState({
      localName: val
    })
    this.updateCorrespondingPrcodessStepWithNodeContent('name', val)
    this.updateCorrespondingPrcodessStepWithNodeContent(
      'is_click_node_name',
      false
    )
  }
  titleTextAreaChangeClick = e => {
    e && e.stopPropagation()
  }

  // ----------------------------------- 表格相关操作 -------------------------------------

  // 保存表格数据
  saveSheetData = id => {
    let { sheetListData = [] } = this.state
    // if(!id) return ;
    let keys = Object.keys(sheetListData)
    // return console.log(sheetListData)
    if (keys.length) {
      let promise = keys.map(item => {
        if (!item) return void 0
        let data = sheetListData[item] || []
        // return saveOnlineExcelWithProcess({ excel_id: item, sheet_data: data })
        return new Promise(resolve => {
          saveOnlineExcelWithProcess({ excel_id: item, sheet_data: data }).then(
            res => {
              if (isApiResponseOk(res)) {
                resolve(res.data)
              }
            }
          )
        })
      })
      promise = promise.filter(n => n)
      Promise.all(promise).then(resp => {
        // console.info(resp);
      })
    }
  }

  // 更新表格列表数据
  updateSheetList = ({ id, sheetData }) => {
    let obj = { ...this.state.sheetListData }
    obj[id] = sheetData
    this.setState(
      {
        sheetListData: obj
      }
      // () =>{
      //   this.saveSheetData()
      // }
    )
  }

  // ----------------------------------- 表格相关操作 -------------------------------------

  // 确认的点击事件
  handleConfirmButton = e => {
    e && e.stopPropagation()
    const { itemKey, processEditDatas = [], dispatch } = this.props
    this.updateCorrespondingPrcodessStepWithNodeContent('is_edit', '1')
    // 如果找到表格 那么就保存获取表格数据
    // let curr_excel = processEditDatas[itemKey]['forms'] && processEditDatas[itemKey]['forms'].find(i => i.field_type == '6')
    // if (!(curr_excel && Object.keys(curr_excel).length)) return
    // let excel_id = curr_excel.online_excel_id
    this.saveSheetData()
  }

  // 删除的点击事件
  handleDeleteButton = e => {
    e && e.stopPropagation()
    const {
      processEditDatas = [],
      processCurrentEditStep,
      dispatch,
      itemKey
    } = this.props
    let newProcessEditDatas = null
    if (processEditDatas.length) {
      newProcessEditDatas = JSON.parse(JSON.stringify(processEditDatas || []))
      newProcessEditDatas.splice(itemKey, 1)
    }
    dispatch({
      type: 'publicProcessDetailModal/updateDatas',
      payload: {
        processEditDatas: newProcessEditDatas,
        processCurrentEditStep:
          processCurrentEditStep >= 1 ? processCurrentEditStep - 1 : 0
      }
    })
  }

  // 编辑中的删除icon点击事件
  handleEditDeleteButton = e => {
    e && e.stopPropagation()
    const {
      templateInfo = {},
      templateInfo: { nodes = [] },
      itemKey,
      processEditDatas = [],
      dispatch,
      processCurrentEditStep
    } = this.props
    let newNodes = [...nodes]
    let newProcessEditDatas = null
    if (processEditDatas.length) {
      newProcessEditDatas = JSON.parse(JSON.stringify(processEditDatas || []))
      newProcessEditDatas.splice(itemKey, 1)
    }
    if (
      newProcessEditDatas[0].node_type == '2' ||
      newProcessEditDatas[0].node_type == '3'
    )
      return
    dispatch({
      type: 'publicProcessDetailModal/updateDatas',
      payload: {
        templateInfo: {
          ...templateInfo,
          nodes: JSON.parse(JSON.stringify(newProcessEditDatas || []))
        },
        processEditDatas: JSON.parse(JSON.stringify(newProcessEditDatas || [])),
        processCurrentEditStep:
          processCurrentEditStep >= 1 ? processCurrentEditStep - 1 : 0
      }
    })
  }

  /**
   * 取消逻辑维护
   * 1. 如果是配置 那么取消就直接是删除
   * 2. 如果是编辑 ==> 如果是取消的已经有ID 的元素 那么就是修改当前的这个
   *  ==> 如果说两份数据长度一样 那么取消也是修改当前的
   *  ==> 如果说长度不一样 表示进行了添加节点, 那么就应该是截取
   */
  handleCancleEditContent = e => {
    e && e.stopPropagation()
    const {
      templateInfo: { nodes = [] },
      itemKey,
      processEditDatas = [],
      dispatch,
      processCurrentEditStep,
      processPageFlagStep
    } = this.props
    let newProcessEditDatas = [...processEditDatas]
    if (processPageFlagStep == '1') {
      newProcessEditDatas.splice(itemKey, 1)
    } else if (processPageFlagStep == '2') {
      if (newProcessEditDatas[itemKey] && newProcessEditDatas[itemKey].id) {
        newProcessEditDatas[itemKey] = { ...nodes[itemKey], is_edit: '1' }
      } else {
        if (
          nodes &&
          nodes.length &&
          nodes.length == (newProcessEditDatas && newProcessEditDatas.length) &&
          newProcessEditDatas.length
        ) {
          newProcessEditDatas[itemKey] = { ...nodes[itemKey], is_edit: '1' }
        } else {
          newProcessEditDatas.splice(itemKey, 1)
        }
      }
    }

    dispatch({
      type: 'publicProcessDetailModal/updateDatas',
      payload: {
        processEditDatas: newProcessEditDatas,
        processCurrentEditStep:
          processCurrentEditStep >= 1 ? processCurrentEditStep - 1 : 0
      }
    })
  }

  /**
   * 判断是否删除表格
   * 思路：- 在编辑的时候 1.点击确认的时候, 如果forms中找不到对应的表格, 那么就需要删除
   * PS： 现在只能做到如果 templeteInfo 中有表格 但是 processEditDatas 中没有 的删除
   * 其他时候不知道什么时候删除表格 因为可以删除表格表项之后点击取消
   * - 在配置的时候 2. 只有删除按钮, 那么点击删除icon就是删除表格, 以及删除节点的删除 就是删除表格
   */
  // whetherIsDeleteOnlineExcel = () => {
  //   const { templateInfo = {}, templateInfo: { nodes = [] }, itemKey, processEditDatas = [], dispatch } = this.props
  //   let newNodes = [...nodes]
  //   let curr_excel = newNodes[itemKey]['forms'].find(i => i.field_type == '6')
  //   if (!(curr_excel && Object.keys(curr_excel).length)) return
  //   let excel_id = curr_excel.online_excel_id
  //   deleteOnlineExcelWithProcess({id: excel_id}).then(res => {

  //   })
  // }

  // 确认修改的编辑内容点击事件
  handleConfirmEditContent = e => {
    e && e.stopPropagation()
    const {
      templateInfo = {},
      templateInfo: { nodes = [] },
      itemKey,
      processEditDatas = [],
      dispatch
    } = this.props
    let newNodes = [...nodes]
    let node_type = processEditDatas[itemKey]['node_type']
    if (node_type == '1') {
      // 对应清空选择指定人员后的数据
      if (processEditDatas[itemKey]['assignee_type'] == '1') {
        // 表示是任何人
        processEditDatas[itemKey]['assignees'] = ''
      }
    }
    newNodes[itemKey] = { ...processEditDatas[itemKey] }
    dispatch({
      type: 'publicProcessDetailModal/updateDatas',
      payload: {
        templateInfo: {
          ...templateInfo,
          nodes: JSON.parse(JSON.stringify(newNodes || []))
        }
      }
    })
    this.updateCorrespondingPrcodessStepWithNodeContent('is_edit', '1')
    // this.whetherIsDeleteOnlineExcel()
    // 如果找到表格 那么就保存获取表格数据
    if (node_type == '1') {
      this.saveSheetData()
    }
  }

  // 当先选择的节点类型
  handleChangeStepType = e => {
    e && e.stopPropagation()
    e && e.nativeEvent && e.nativeEvent.stopImmediatePropagation()
    const { itemKey, itemValue, processEditDatas = [], dispatch } = this.props
    let key = e.target.value
    let newProcessEditDatas = [...processEditDatas]
    let name = { ...newProcessEditDatas[itemKey] }.name || ''
    let nodeObj
    switch (key) {
      case '1':
        nodeObj = Object.assign(
          {},
          JSON.parse(JSON.stringify(processEditDatasItemOneConstant)),
          { name: name }
        )
        break
      case '2':
        nodeObj = Object.assign(
          {},
          JSON.parse(JSON.stringify(processEditDatasItemTwoConstant)),
          { name: name }
        )
        break
      case '3':
        nodeObj = Object.assign(
          {},
          JSON.parse(JSON.stringify(processEditDatasItemThreeConstant)),
          { name: name }
        )
        break
      default:
        break
    }
    newProcessEditDatas[itemKey] = nodeObj
    dispatch({
      type: 'publicProcessDetailModal/updateDatas',
      payload: {
        processEditDatas: newProcessEditDatas
      }
    })
  }

  // 判断是否只有一个资料收集节点 如果有多个可以删除 true 表示可以删除 false 表示不可以
  whetherIsDeleteNodes = () => {
    const { processEditDatas = [], itemKey } = this.props
    let arr = []
    let flag = true
    let newProcessEditDatas = [...processEditDatas]

    const node_second_ = newProcessEditDatas[1]
    if (itemKey == 0 && node_second_) {
      if (
        node_second_['node_type'] == '2' ||
        node_second_['node_type'] == '3'
      ) {
        flag = false
      }
    }
    if (!node_second_) {
      flag = false
    }
    return flag
  }

  // 渲染不同种Button确认按钮的提示文案
  renderDiffButtonTooltipsText = () => {
    let confirmButtonText = ''
    let confirmButtonDisabled
    const { itemValue } = this.props
    const {
      node_type,
      name,
      forms = [],
      assignee_type,
      assignees,
      cc_type,
      recipients,
      approve_value,
      approve_type,
      score_node_set = {},
      deadline_type,
      deadline_value
    } = itemValue
    let result_value =
      score_node_set && Object.keys(score_node_set).length
        ? score_node_set.result_value
        : ''
    let newAssignees
    let newRecipients
    if (!assignees || assignees == '') {
      newAssignees = []
    } else if (assignees instanceof Array) {
      newAssignees = [...assignees]
    } else {
      newAssignees = assignees.split(',')
    }
    if (!recipients || recipients == '') {
      newRecipients = []
    } else if (recipients instanceof Array) {
      newRecipients = [...recipients]
    } else {
      newRecipients = recipients.split(',')
    }
    // let newAssignees = assignees != 'undefined' && (assignees && assignees != '') ? assignees.split(',') : []
    // let newRecipients = recipients != 'undefined' && (recipients && recipients != '') ? recipients.split(',') : []
    switch (node_type) {
      case '1':
        if (cc_type == '0' || cc_type == '') {
          // 没有选择抄送人的时候
          if (assignee_type == '1') {
            // 表示的是任何人
            if (!name && !(forms && forms.length)) {
              confirmButtonText = '请输入步骤名称和至少添加一个表项'
              confirmButtonDisabled = true
            } else if (!name && forms && forms.length) {
              confirmButtonText = '请输入步骤名称'
              confirmButtonDisabled = true
            } else if (name && !(forms && forms.length)) {
              confirmButtonText = '至少添加一个表项'
              confirmButtonDisabled = true
            }
          } else if (assignee_type == '2') {
            // 表示的是指定人员
            if (
              !name &&
              !(forms && forms.length) &&
              !(newAssignees && newAssignees.length)
            ) {
              confirmButtonText =
                '请输入步骤名称、至少添加一个表项以及至少添加一位填写人'
              confirmButtonDisabled = true
            } else if (
              !name &&
              forms &&
              forms.length &&
              newAssignees &&
              newAssignees.length
            ) {
              confirmButtonText = '请输入步骤名称'
              confirmButtonDisabled = true
            } else if (
              name &&
              !(forms && forms.length) &&
              newAssignees &&
              newAssignees.length
            ) {
              confirmButtonText = '至少添加一个表项'
              confirmButtonDisabled = true
            } else if (
              name &&
              forms &&
              forms.length &&
              !(newAssignees && newAssignees.length)
            ) {
              confirmButtonText = '至少添加一位填写人'
              confirmButtonDisabled = true
            } else if (
              !name &&
              !(forms && forms.length) &&
              newAssignees &&
              newAssignees.length
            ) {
              confirmButtonText = '请输入步骤名称和至少添加一个表项'
              confirmButtonDisabled = true
            } else if (
              !name &&
              forms &&
              forms.length &&
              !(newAssignees && newAssignees.length)
            ) {
              confirmButtonText = '请输入步骤名称和至少添加一位填写人'
              confirmButtonDisabled = true
            } else if (
              name &&
              !(forms && forms.length) &&
              !(newAssignees && newAssignees.length)
            ) {
              confirmButtonText = '至少添加一个表项以及至少添加一位填写人'
              confirmButtonDisabled = true
            }
          }
        } else if (cc_type == '1') {
          // 表示选择了抄送人
          if (assignee_type == '1') {
            // 表示的是任何人
            if (
              !name &&
              !(forms && forms.length) &&
              !(newRecipients && newRecipients.length)
            ) {
              confirmButtonText =
                '请输入步骤名称、至少添加一个表项和至少选择一位抄送人'
              confirmButtonDisabled = true
            } else if (
              !name &&
              forms &&
              forms.length &&
              newRecipients &&
              newRecipients.length
            ) {
              confirmButtonText = '请输入步骤名称'
              confirmButtonDisabled = true
            } else if (
              name &&
              !(forms && forms.length) &&
              newRecipients &&
              newRecipients.length
            ) {
              confirmButtonText = '至少添加一个表项'
              confirmButtonDisabled = true
            } else if (
              name &&
              forms &&
              forms.length &&
              !(newRecipients && newRecipients.length)
            ) {
              confirmButtonText = '至少添加一位抄送人'
              confirmButtonDisabled = true
            } else if (
              !name &&
              !(forms && forms.length) &&
              newRecipients &&
              newRecipients.length
            ) {
              confirmButtonText = '请输入步骤名称和至少添加一个表项'
              confirmButtonDisabled = true
            } else if (
              !name &&
              forms &&
              forms.length &&
              !(newRecipients && newRecipients.length)
            ) {
              confirmButtonText = '请输入步骤名称和至少添加一位抄送人'
              confirmButtonDisabled = true
            } else if (
              name &&
              !(forms && forms.length) &&
              !(newRecipients && newRecipients.length)
            ) {
              confirmButtonText = '至少添加一个表项以及至少添加一位抄送人'
              confirmButtonDisabled = true
            }
          } else if (assignee_type == '2') {
            if (
              !name &&
              !(forms && forms.length) &&
              !(newAssignees && newAssignees.length) &&
              !(newRecipients && newRecipients.length)
            ) {
              confirmButtonText =
                '请输入步骤名称、至少添加一个表项以及至少添加一位填写人和至少一位抄送人'
              confirmButtonDisabled = true
            } else if (
              !name &&
              forms &&
              forms.length &&
              newAssignees &&
              newAssignees.length &&
              newRecipients &&
              newRecipients.length
            ) {
              confirmButtonText = '请输入步骤名称'
              confirmButtonDisabled = true
            } else if (
              name &&
              !(forms && forms.length) &&
              !(newAssignees && newAssignees.length) &&
              !(newRecipients && newRecipients.length)
            ) {
              confirmButtonText =
                '请至少添加一个表项以及至少添加一位填写人和至少一位抄送人'
              confirmButtonDisabled = true
            } else if (
              name &&
              forms &&
              forms.length &&
              !(newAssignees && newAssignees.length) &&
              !(newRecipients && newRecipients.length)
            ) {
              confirmButtonText = '至少添加一位填写人和至少一位抄送人'
              confirmButtonDisabled = true
            } else if (
              name &&
              !(forms && forms.length) &&
              newAssignees &&
              newAssignees.length &&
              !(newRecipients && newRecipients.length)
            ) {
              confirmButtonText = '至少添加一个表项和至少一位抄送人'
              confirmButtonDisabled = true
            } else if (
              name &&
              forms &&
              forms.length &&
              newAssignees &&
              newAssignees.length &&
              !(newRecipients && newRecipients.length)
            ) {
              confirmButtonText = '至少添加一位抄送人'
              confirmButtonDisabled = true
            } else if (
              name &&
              !(forms && forms.length) &&
              newAssignees &&
              newAssignees.length &&
              newRecipients &&
              newRecipients.length
            ) {
              confirmButtonText = '至少添加一个表项'
              confirmButtonDisabled = true
            } else if (
              name &&
              forms &&
              forms.length &&
              !(newAssignees && newAssignees.length) &&
              newRecipients &&
              newRecipients.length
            ) {
              confirmButtonText = '至少添加一位填写人'
              confirmButtonDisabled = true
            } else if (
              !name &&
              forms &&
              forms.length &&
              !(newAssignees && newAssignees.length) &&
              !(newRecipients && newRecipients.length)
            ) {
              confirmButtonText =
                '请输入步骤名称、至少添加一位填写人以及至少一位抄送人'
              confirmButtonDisabled = true
            } else if (
              !name &&
              forms &&
              forms.length &&
              newAssignees &&
              newAssignees.length &&
              !(newRecipients && newRecipients.length)
            ) {
              confirmButtonText = '请输入步骤名称以及至少添加一位抄送人'
              confirmButtonDisabled = true
            } else if (
              !name &&
              forms &&
              forms.length &&
              !(newAssignees && newAssignees.length) &&
              newRecipients &&
              newRecipients.length
            ) {
              confirmButtonText = '请输入步骤名称以及至少添加一位填写人'
              confirmButtonDisabled = true
            } else if (
              !name &&
              !(forms && forms.length) &&
              newAssignees &&
              newAssignees.length &&
              !(newRecipients && newRecipients.length)
            ) {
              confirmButtonText =
                '请输入步骤名称、至少添加一个表项以及至少一位抄送人'
              confirmButtonDisabled = true
            } else if (
              !name &&
              !(forms && forms.length) &&
              !(newAssignees && newAssignees.length) &&
              newRecipients &&
              newRecipients.length
            ) {
              confirmButtonText =
                '请输入步骤名称、至少添加一个表项以及至少一位填写人'
              confirmButtonDisabled = true
            } else if (
              !name &&
              !(forms && forms.length) &&
              newAssignees &&
              newAssignees.length &&
              newRecipients &&
              newRecipients.length
            ) {
              confirmButtonText = '请输入步骤名称和至少添加一个表项'
              confirmButtonDisabled = true
            } else if (
              !name &&
              forms &&
              forms.length &&
              newAssignees &&
              newAssignees.length &&
              newRecipients &&
              newRecipients.length
            ) {
              confirmButtonText = '请输入步骤名称'
              confirmButtonDisabled = true
            } else if (
              name &&
              !(forms && forms.length) &&
              !(newAssignees && newAssignees.length) &&
              newRecipients &&
              newRecipients.length
            ) {
              confirmButtonText = '至少添加一个表项以及至少一位填写人'
              confirmButtonDisabled = true
            }
          }
        }
        if (deadline_type == '2') {
          if (isNaN(deadline_value)) {
            confirmButtonDisabled = true
          }
        }
        break
      case '2':
        if (cc_type == '0' || cc_type == '') {
          // 表示没有选择抄送人
          if (!name && !(newAssignees && newAssignees.length)) {
            confirmButtonText = '请输入步骤名称和至少添加一位审批人'
            confirmButtonDisabled = true
          } else if (!name && newAssignees && newAssignees.length) {
            confirmButtonText = '请输入步骤名称'
            confirmButtonDisabled = true
          } else if (name && !(newAssignees && newAssignees.length)) {
            confirmButtonText = '至少添加一位审批人'
            confirmButtonDisabled = true
          }
        } else if (cc_type == '1') {
          // 表示选择了抄送人
          if (
            !name &&
            !(newAssignees && newAssignees.length) &&
            !(newRecipients && newRecipients.length)
          ) {
            confirmButtonText =
              '请输入步骤名称、至少添加一位审批人以及至少添加一位抄送人'
            confirmButtonDisabled = true
          } else if (
            name &&
            !(newAssignees && newAssignees.length) &&
            !(newRecipients && newRecipients.length)
          ) {
            confirmButtonText = '至少添加一位审批人和至少添加一位抄送人'
            confirmButtonDisabled = true
          } else if (
            !name &&
            newAssignees &&
            newAssignees.length &&
            !(newRecipients && newRecipients.length)
          ) {
            confirmButtonText = '请输入步骤名称以及至少添加一位抄送人'
            confirmButtonDisabled = true
          } else if (
            !name &&
            !(newAssignees && newAssignees.length) &&
            newRecipients &&
            newRecipients.length
          ) {
            confirmButtonText = '请输入步骤名称以及至少添加一位审批人'
            confirmButtonDisabled = true
          } else if (
            !name &&
            newAssignees &&
            newAssignees.length &&
            newRecipients &&
            newRecipients.length
          ) {
            confirmButtonText = '请输入步骤名称'
            confirmButtonDisabled = true
          } else if (
            name &&
            !(newAssignees && newAssignees.length) &&
            newRecipients &&
            newRecipients.length
          ) {
            confirmButtonText = '至少添加一位审批人'
            confirmButtonDisabled = true
          } else if (
            name &&
            newAssignees &&
            newAssignees.length &&
            !(newRecipients && newRecipients.length)
          ) {
            confirmButtonText = '至少添加一位抄送人'
            confirmButtonDisabled = true
          }
        }
        if (approve_type == '3') {
          if (approve_value == '') {
            confirmButtonText = '请输入汇签值'
            confirmButtonDisabled = true
          }
        }
        if (deadline_type == '2') {
          if (isNaN(deadline_value)) {
            confirmButtonDisabled = true
          }
        }
        break
      case '3':
        const reg = /^([0-9]\d{0,3}(\.\d{1,2})?|10000)$/
        if (cc_type == '0' || cc_type == '') {
          // 表示没有选择抄送人
          if (!name && !(newAssignees && newAssignees.length)) {
            confirmButtonText = '请输入步骤名称以及至少添加一位评分人'
            confirmButtonDisabled = true
          } else if (!name && newAssignees && newAssignees.length) {
            confirmButtonText = '请输入步骤名称'
            confirmButtonDisabled = true
          } else if (name && !(newAssignees && newAssignees.length)) {
            confirmButtonText = '至少添加一位评分人'
            confirmButtonDisabled = true
          }
          if (!reg.test(result_value)) {
            confirmButtonText = '请输入正确的结果分数值(小于10000的数字)'
            confirmButtonDisabled = true
          }
        } else if (cc_type == '1') {
          if (
            !name &&
            !(newAssignees && newAssignees.length) &&
            !(newRecipients && newRecipients.length)
          ) {
            confirmButtonText =
              '请输入步骤名称、至少添加一位评分人以及至少添加一位抄送人'
            confirmButtonDisabled = true
          } else if (
            name &&
            !(newAssignees && newAssignees.length) &&
            !(newRecipients && newRecipients.length)
          ) {
            confirmButtonText = '至少添加一位评分人以及至少添加一位抄送人'
            confirmButtonDisabled = true
          } else if (
            !name &&
            newAssignees &&
            newAssignees.length &&
            !(newRecipients && newRecipients.length)
          ) {
            confirmButtonText = '请输入步骤名称以及至少添加一位抄送人'
            confirmButtonDisabled = true
          } else if (
            !name &&
            !(newAssignees && newAssignees.length) &&
            newRecipients &&
            newRecipients.length
          ) {
            confirmButtonText = '请输入步骤名称以及至少添加一位评分人'
            confirmButtonDisabled = true
          } else if (
            !name &&
            newAssignees &&
            newAssignees.length &&
            newRecipients &&
            newRecipients.length
          ) {
            confirmButtonText = '请输入步骤名称'
            confirmButtonDisabled = true
          } else if (
            name &&
            !(newAssignees && newAssignees.length) &&
            newRecipients &&
            newRecipients.length
          ) {
            confirmButtonText = '至少添加一位评分人'
            confirmButtonDisabled = true
          } else if (
            name &&
            newAssignees &&
            newAssignees.length &&
            !(newRecipients && newRecipients.length)
          ) {
            confirmButtonText = '至少添加一位抄送人'
            confirmButtonDisabled = true
          }
          if (!reg.test(result_value)) {
            confirmButtonText = '请输入正确的结果分数值(小于10000的数字)'
            confirmButtonDisabled = true
          }
        }
        if (deadline_type == '2') {
          if (isNaN(deadline_value)) {
            confirmButtonDisabled = true
          }
        }
        break
      default:
        // confirmButtonText = '确认'
        confirmButtonDisabled = true
        break
    }
    return { confirmButtonText, confirmButtonDisabled }
  }

  renderDiffStepTypeContent = () => {
    const { itemValue, itemKey } = this.props
    const { node_type } = itemValue
    let container = <div></div>
    switch (node_type) {
      case '1': // 表示资料收集
        container = (
          <ConfigureStepTypeOne
            updateSheetList={this.updateSheetList}
            itemValue={itemValue}
            itemKey={itemKey}
          />
        )
        break
      case '2': // 表示审批
        container = (
          <ConfigureStepTypeTwo itemValue={itemValue} itemKey={itemKey} />
        )
        break
      case '3': // 表示评分
        container = (
          <ConfigureStepTypeThree itemValue={itemValue} itemKey={itemKey} />
        )
        break
      default:
        container = <div></div>
        break
    }
    return container
  }

  renderContent = () => {
    const {
      itemKey,
      itemValue,
      processEditDatasRecords = [],
      processCurrentEditStep,
      processEditDatas = [],
      processPageFlagStep
    } = this.props
    const {
      name,
      node_type,
      description,
      is_click_node_name,
      forms = []
    } = itemValue
    let deleteBtn = this.whetherIsDeleteNodes()
    let isExcel = forms.find(i => i.field_type == '6')
    let editConfirmBtn = this.state.isDisabled
      ? true
      : this.renderDiffButtonTooltipsText().confirmButtonDisabled
      ? true
      : false
    let gold_index =
      processEditDatas &&
      processEditDatas.length &&
      processEditDatas.findIndex(item => item.is_edit == '0')
    // let editConfirmBtn = this.renderDiffButtonTooltipsText().confirmButtonDisabled ? this.state.isDisabled ? true : false : this.state.isDisabled ? true : false
    // let node_amount = this.props && this.props.processInfo && this.props.processInfo.node_amount
    let stylLine, stylCircle
    // if (this.props.processInfo.completed_amount >= itemKey + 1) { //0 1    1  2 | 1 3 | 1 4
    //   stylLine = indexStyles.line
    //   stylCircle = indexStyles.circle
    // } else if (this.props.processInfo.completed_amount == itemKey) {
    //   stylLine = indexStyles.doingLine
    //   stylCircle = indexStyles.doingCircle
    // } else {
    //   stylLine = indexStyles.hasnotCompetedLine
    //   stylCircle = indexStyles.hasnotCompetedCircle
    // }

    let check_line
    if (node_type == '1') {
      check_line = indexStyles.data_collection
    } else if (node_type == '2') {
      check_line = indexStyles.examine_approve
    } else if (node_type == '3') {
      check_line = indexStyles.make_grade
    } else {
      check_line = indexStyles.normal_check
    }
    let gold_item =
      (processEditDatas &&
        processEditDatas.length &&
        processEditDatas.find(item => item.is_edit == '0')) ||
      {}
    let lineFlag =
      itemKey == processEditDatas.length - 1
        ? gold_item && Object.keys(gold_item).length
          ? true
          : false
        : false
    return (
      <div
        key={itemKey}
        style={{ display: 'flex', marginBottom: '48px' }}
        onClick={e => {
          this.handleCancelNodeName(e)
        }}
      >
        <div
          className={
            lineFlag ? indexStyles.doingLine : indexStyles.hasnotCompetedLine
          }
        ></div>
        <div className={indexStyles.doingCircle}> {itemKey + 1}</div>
        <div
          id={`popover_card-${itemKey}-${node_type}`}
          className={`${
            itemKey == gold_index
              ? indexStyles.popover_card
              : indexStyles.default_popover_card
          }`}
        >
          <div className={`${globalStyles.global_vertical_scrollbar}`}>
            {/* 步骤名称 */}
            <div style={{ marginBottom: '16px' }}>
              {name && !is_click_node_name ? (
                <div
                  onClick={e => {
                    this.handleChangeNodeName(e)
                  }}
                  className={`${indexStyles.node_name} ${indexStyles.pub_hover}`}
                >
                  {name}
                </div>
              ) : (
                <NameChangeInput
                  autosize
                  onChange={this.titleTextAreaChange}
                  onBlur={this.titleTextAreaChangeBlur}
                  onPressEnter={this.titleTextAreaChangeBlur}
                  onClick={this.titleTextAreaChangeClick}
                  setIsEdit={this.titleTextAreaChangeBlur}
                  autoFocus={true}
                  goldName={name}
                  placeholder={'步骤名称(必填)'}
                  maxLength={50}
                  nodeName={'input'}
                  style={{
                    display: 'block',
                    fontSize: 16,
                    color: '#262626',
                    resize: 'none',
                    height: '44px',
                    background: 'rgba(255,255,255,1)',
                    boxShadow: '0px 0px 8px 0px rgba(0,0,0,0.15)',
                    borderRadius: '4px',
                    border: 'none'
                  }}
                />
              )}
            </div>
            <div
              style={{
                paddingLeft: '14px',
                paddingRight: '14px',
                position: 'relative'
              }}
            >
              {/* 步骤类型 */}
              <div
                style={{
                  paddingBottom: '14px',
                  borderBottom: '1px #e8e8e8',
                  position: 'relative'
                }}
                onClick={e => {
                  e && e.stopPropagation()
                }}
              >
                <span
                  style={{ color: 'rgba(0,0,0,0.45)' }}
                  className={globalStyles.authTheme}
                >
                  &#xe7f4; &nbsp;步骤类型 :&nbsp;&nbsp;&nbsp;
                </span>
                <Radio.Group
                  onChange={this.handleChangeStepType}
                  value={node_type}
                >
                  <Radio value="1">资料收集</Radio>
                  {itemKey != '0' && (
                    <>
                      <Radio value="2">审批</Radio>
                      {/* <Radio value="3">抄送</Radio> */}
                    </>
                  )}
                  {itemKey != '0' && (
                    <>
                      <Radio value="3">评分</Radio>
                      <Tooltip
                        getPopupContainer={triggerNode =>
                          triggerNode.parentNode
                        }
                        title="指定评分人进行评分，最终分值会导向某一结果"
                        placement="top"
                      >
                        <span
                          style={{ color: '#D9D9D9', cursor: 'pointer' }}
                          className={globalStyles.authTheme}
                        >
                          &#xe845;
                        </span>
                      </Tooltip>
                    </>
                  )}
                </Radio.Group>
              </div>
              <div className={`${check_line} ${indexStyles.check_line}`}></div>
              {/* 根据点击的不同步骤类型显示的不同配置内容 */}
              {this.renderDiffStepTypeContent()}
            </div>
            {/* 删除 | 确认 */}
            {processPageFlagStep == '1' ? (
              <div className={indexStyles.step_btn}>
                <Button
                  onClick={this.handleDeleteButton}
                  style={{
                    color: itemKey == '0' && !deleteBtn ? '' : '#FF7875',
                    border:
                      itemKey == '0' && !deleteBtn
                        ? ''
                        : '1px solid rgba(255,120,117,1)'
                  }}
                  disabled={itemKey == '0' && !deleteBtn ? true : false}
                >
                  删除
                </Button>
                <Tooltip
                  placement="top"
                  title={this.renderDiffButtonTooltipsText().confirmButtonText}
                >
                  <Button
                    key={itemValue}
                    disabled={
                      this.renderDiffButtonTooltipsText().confirmButtonDisabled
                    }
                    onClick={this.handleConfirmButton}
                    type="primary"
                  >
                    确认
                  </Button>
                </Tooltip>
              </div>
            ) : (
              ''
            )}
            {processPageFlagStep == '2' ? (
              <div className={indexStyles.step_btn}>
                <Button
                  onClick={this.handleCancleEditContent}
                  style={{
                    color: '#1890FF',
                    border: '1px solid rgba(24,144,255,1)'
                  }}
                >
                  取消
                </Button>
                <Tooltip
                  placement="top"
                  title={this.renderDiffButtonTooltipsText().confirmButtonText}
                >
                  <Button
                    key={itemValue}
                    disabled={editConfirmBtn ? (isExcel ? false : true) : false}
                    onClick={this.handleConfirmEditContent}
                    type="primary"
                  >
                    确认
                  </Button>
                </Tooltip>
              </div>
            ) : (
              ''
            )}
            {processPageFlagStep == '2' && (
              <Tooltip
                overlayStyle={{ minWidth: '76px' }}
                title="删除步骤"
                placement="top"
                getPopupContainer={() =>
                  document.getElementById(
                    `popover_card-${itemKey}-${node_type}`
                  )
                }
              >
                {itemKey == '0' && !deleteBtn ? (
                  <span
                    className={`${indexStyles.delet_node_icon} ${indexStyles.disabled_node_icon}`}
                  >
                    <span className={globalStyles.authTheme}>&#xe68d;</span>
                  </span>
                ) : (
                  <span
                    onClick={this.handleEditDeleteButton}
                    disabled={itemKey == '0' && !deleteBtn ? true : false}
                    className={indexStyles.delet_node_icon}
                  >
                    <span className={globalStyles.authTheme}>&#xe68d;</span>
                  </span>
                )}
              </Tooltip>
            )}
          </div>
        </div>
      </div>
    )
  }

  render() {
    return (
      <div className={indexStyles.configureProcessOut_1}>
        {this.renderContent()}
      </div>
    )
  }
}

function mapStateToProps({
  publicProcessDetailModal: {
    processEditDatas = [],
    processPageFlagStep,
    templateInfo = {}
  }
}) {
  return { processEditDatas, processPageFlagStep, templateInfo }
}
