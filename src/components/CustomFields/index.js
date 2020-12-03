import React, { Component } from 'react'
import { connect } from 'dva'
import { Popover, Button, Tree } from 'antd'
import indexStyles from './index.less'
import globalsetStyles from '@/globalset/css/globalClassName.less'
import { getCustomFieldList } from '../../services/organization'
import { isApiResponseOk } from '../../utils/handleResponseData'
import { removeEmptyArrayEle, isArrayEqual } from '../../utils/util'
import EmptyImg from '@/assets/projectDetail/process/Empty@2x.png'

const { TreeNode } = Tree

export default class Index extends Component {
  constructor(props) {
    super(props)
    this.state = {
      visible: false,
      checkedKeys: [],
      defaultCheckedKeys: [] // 需要一个默认的选中内容
    }
  }

  // 初始化state
  initeState = () => {
    this.setState({
      visible: false,
      checkedKeys: [],
      treeData: [],
      groupsData: []
    })
  }

  // 对数据进行操作
  setOperationOfTreeData = data => {
    const {
      relations_fields = [],
      groups = [],
      fields = [],
      original_treeData = []
    } = data
    const { groupsData = [], fieldsData = [] } = this.state
    // 获取默认选中的keys
    let defaultCheckedKeys = this.defaultCheckedKeys(relations_fields)
    // 过滤没有字段的分组
    let filter_empty_fields_group = groups.filter(
      item => !!(item.fields && item.fields.length)
    )
    // 需要一个树状data
    let treeData = !!(original_treeData && original_treeData.length)
      ? original_treeData
      : removeEmptyArrayEle([].concat(filter_empty_fields_group, fields))
    // 判断是否该分组下的字段都被引用 引用则选中并且应禁用
    treeData = treeData.map(item => {
      if (
        item.fields &&
        item.fields.every(item => defaultCheckedKeys.indexOf(item.id) != -1)
      ) {
        let new_item = { ...item }
        new_item = { ...item, disabled: true }
        defaultCheckedKeys.push(item.id)
        return new_item
      } else {
        let new_item = { ...item }
        new_item = { ...item, disabled: false }
        return new_item
      }
    })
    // 再对每一个chekbox进行禁用逻辑
    treeData = this.setDisabled(treeData, defaultCheckedKeys)
    this.setState({
      treeData,
      defaultCheckedKeys: defaultCheckedKeys,
      checkedKeys: defaultCheckedKeys
    })
  }

  //禁用
  setDisabled = (treeData = [], checkedKeys = []) => {
    let list = []
    const getIds = (treeData = [], checkedKeys = []) => {
      let list = []
      list = treeData.map(k => {
        k.disabled = false
        if (k.fields && k.fields.length > 0) {
          checkedKeys.forEach(e => {
            if (e == k.id) {
              k.disabled = true
            }
          })
          getIds(k.fields, checkedKeys)
        } else {
          checkedKeys.forEach(e => {
            if (e == k.id) {
              k.disabled = true
            }
          })
        }
        return k
      })
      return list
    }
    list = getIds(treeData, checkedKeys)
    return list
  }

  // 默认选中的keys
  defaultCheckedKeys = fields => {
    let checkedKeys = []
    fields.forEach(item => {
      checkedKeys.push(item.field_id)
    })
    return checkedKeys
  }

  getCustomFieldList = props => {
    const { org_id, relations_fields = [] } = props
    // if (!(relations_fields && relations_fields.length)) return
    getCustomFieldList({ _organization_id: org_id, field_status: '0' }).then(
      res => {
        if (isApiResponseOk(res)) {
          this.setOperationOfTreeData({
            relations_fields,
            groups: res.data.groups,
            fields: res.data.fields
          })
          this.setState({
            groupsData: res.data.groups,
            fieldsData: res.data.fields
          })
        }
      }
    )
  }

  componentDidMount() {
    this.getCustomFieldList(this.props)
  }

  componentWillReceiveProps(nextProps) {
    const { relations_fields: old_relations_fields = [] } = this.props
    const { relations_fields = [], org_id } = nextProps
    if (isArrayEqual(relations_fields, old_relations_fields)) return
    // if (relations_fields.length == 0) return
    this.getCustomFieldList({ relations_fields, org_id })
  }

  handleVisibleChange = visible => {
    this.setState({
      visible: visible
    })
    if (!visible) {
      const { relations_fields = [] } = this.props
      this.setOperationOfTreeData({
        relations_fields,
        original_treeData: this.state.treeData
      })
      // this.setState({
      //   checkedKeys: []
      // })
    }
  }

  onCheck = checkedKeys => {
    this.setState({
      checkedKeys
    })
  }

  // 重置
  handleReSetting = e => {
    e && e.stopPropagation()
    const { relations_fields = [] } = this.props
    const { groupsData = [], fieldsData = [] } = this.state
    // this.setOperationOfTreeData({relations_fields, original_treeData: this.state.treeData})
    this.setState({
      // checkedKeys: []
    })
    // 获取默认选中的keys
    let defaultCheckedKeys = this.defaultCheckedKeys(relations_fields)
    // 过滤没有字段的分组
    let filter_empty_fields_group = groupsData.filter(
      item => !!(item.fields && item.fields.length)
    )
    // 需要一个树状data
    let treeData = removeEmptyArrayEle(
      [].concat(filter_empty_fields_group, fieldsData)
    )
    // 判断是否该分组下的字段都被引用 引用则选中并且应禁用
    treeData = treeData.map(item => {
      if (
        item.fields &&
        item.fields.every(item => defaultCheckedKeys.indexOf(item.id) != -1)
      ) {
        let new_item = { ...item }
        new_item = { ...item, disabled: true }
        defaultCheckedKeys.push(item.id)
        return new_item
      } else {
        return item
      }
    })
    this.setState({
      checkedKeys: defaultCheckedKeys
    })
  }

  // 添加字段
  handleAddCustomField = e => {
    e && e.stopPropagation()
    this.setState({
      isOnConfirmAddField: true
    })
    if (this.state.isOnConfirmAddField) return
    const {
      checkedKeys = [],
      groupsData = [],
      defaultCheckedKeys = []
    } = this.state
    let need_checkedKeys = [...checkedKeys]
    // 过滤一遍分组ID
    groupsData.forEach(item => {
      need_checkedKeys = need_checkedKeys.filter(n => n != item.id)
    })
    // 过滤一遍已选择的ID
    need_checkedKeys = need_checkedKeys.filter(
      n => defaultCheckedKeys.indexOf(n) == -1
    )
    const calback = () => {
      this.setState({
        visible: false,
        // checkedKeys: [],
        isOnConfirmAddField: false
      })
    }
    this.props.handleAddCustomField &&
      this.props.handleAddCustomField(need_checkedKeys, calback)
  }

  renderTreeNodes = data => {
    if (!data) return
    return data.map(item => {
      if (item.fields && item.fields.length) {
        return (
          <TreeNode
            disabled={item.disabled}
            title={item.name}
            key={item.id}
            dataRef={item}
          >
            {this.renderTreeNodes(item.fields)}
          </TreeNode>
        )
      }
      return (
        <TreeNode
          disabled={item.disabled}
          title={item.name}
          key={item.id}
          dataRef={item}
        />
      )
    })
  }

  renderSelectedTree = () => {
    const {
      treeData = [],
      checkedKeys = [],
      defaultCheckedKeys = []
    } = this.state
    const { onlyShowPopoverContent } = this.props
    let local_tree_height =
      document.getElementById('gantt_card_out') &&
      document.getElementById('gantt_card_out').clientHeight - 160 + 'px'
    return (
      <div
        className={`${indexStyles.treeWrapper} ${globalsetStyles.global_vertical_scrollbar}`}
        style={{
          height: onlyShowPopoverContent && local_tree_height,
          maxHeight: onlyShowPopoverContent && local_tree_height,
          width: onlyShowPopoverContent && '260px'
        }}
      >
        {treeData && treeData.length ? (
          <Tree
            checkable
            onCheck={this.onCheck}
            checkedKeys={checkedKeys}
            defaultCheckedKeys={defaultCheckedKeys}
          >
            {this.renderTreeNodes(treeData)}
          </Tree>
        ) : (
          <div
            style={{
              height: '230px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column'
            }}
          >
            <div>
              <img
                style={{ width: '94px', height: '62px' }}
                src={EmptyImg}
                alt=""
              />
            </div>
            <div style={{ color: 'rgba(0,0,0,0.45)' }}>暂无数据</div>
          </div>
        )}
      </div>
    )
  }

  renderButton = () => {
    const { checkedKeys = [], defaultCheckedKeys = [] } = this.state
    return (
      <div className={indexStyles.fileds_button}>
        <Button onClick={this.handleReSetting}>重置</Button>
        <Button
          onClick={this.handleAddCustomField}
          disabled={isArrayEqual(checkedKeys, defaultCheckedKeys)}
          type="primary"
        >
          确定
        </Button>
      </div>
    )
  }

  renderContent = () => {
    const { treeData = [] } = this.state
    return (
      <div>
        <div>{this.renderSelectedTree()}</div>
        {!!(treeData && treeData.length) && <div>{this.renderButton()}</div>}
      </div>
    )
  }

  componentWillUnmount() {
    this.initeState()
  }

  render() {
    const {
      children,
      style,
      placement,
      getPopupContainer,
      onlyShowPopoverContent
    } = this.props
    return (
      <div style={{ ...style }}>
        <>
          {!onlyShowPopoverContent && (
            <Popover
              getPopupContainer={
                getPopupContainer
                  ? () => getPopupContainer
                  : triggerNode => triggerNode.parentNode
              }
              placement={placement ? placement : 'bottom'}
              title={<div className={indexStyles.popover_title}>添加字段</div>}
              trigger="click"
              visible={this.state.visible}
              onVisibleChange={this.handleVisibleChange}
              content={this.renderContent()}
            >
              {children}
            </Popover>
          )}
        </>
        {onlyShowPopoverContent && (
          <div>
            <div>{this.renderContent()}</div>
          </div>
        )}
      </div>
    )
  }
}

Index.defaultProps = {
  org_id: '', // 需要一个组织ID获取树状列表
  relations_fields: [], // 需要一个关联字段（即引用的字段）
  handleAddCustomField: function() {} // 添加自定义字段回调，由外部决定
}
