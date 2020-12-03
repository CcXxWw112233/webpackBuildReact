import React, { Component } from 'react'
import commonStyles from '../common.less'
import globalsetStyles from '@/globalset/css/globalClassName.less'
import { Select, Dropdown, Menu, Icon } from 'antd'
import { categoryIcon } from '../../../routes/organizationManager/CustomFields/handleOperateModal'
import { connect } from 'dva'
import { isApiResponseOk } from '../../../utils/handleResponseData'
import { isObjectValueEqual } from '../../../utils/util'

@connect()
export default class CheckboxFieldContent extends Component {
  constructor(props) {
    super(props)
    this.state = {
      itemValue: props.itemValue,
      itemKey: props.itemKey
    }
  }

  componentWillReceiveProps(nextProps) {
    if (isObjectValueEqual(this.props.itemValue, nextProps.itemValue)) return
    this.setState({
      itemValue: nextProps.itemValue,
      itemKey: nextProps.itemKey
    })
  }

  onSelect = (e, relation_id) => {
    const { domEvent, key, selectedKeys = [] } = e
    domEvent && domEvent.stopPropagation()
    this.props
      .dispatch({
        type: 'organizationManager/setRelationCustomField',
        payload: {
          id: relation_id,
          field_value: selectedKeys.join(',')
        }
      })
      .then(res => {
        if (isApiResponseOk(res)) {
          this.props.handleUpdateModelDatas &&
            this.props.handleUpdateModelDatas({
              data: res.data,
              type: 'update'
            })
        }
      })
  }

  onDeselect = (e, relation_id) => {
    const { domEvent, key, selectedKeys = [] } = e
    domEvent && domEvent.stopPropagation()
    this.props
      .dispatch({
        type: 'organizationManager/setRelationCustomField',
        payload: {
          id: relation_id,
          field_value: selectedKeys.join(',')
        }
      })
      .then(res => {
        if (isApiResponseOk(res)) {
          this.props.handleUpdateModelDatas &&
            this.props.handleUpdateModelDatas({
              data: res.data,
              type: 'update'
            })
        }
      })
  }

  // 删除选择的value值
  handleDeleteSelectedValue = (e, deleteId) => {
    e && e.stopPropagation()
    const { itemValue } = this.state
    const { field_value, id } = itemValue
    let selectedKeys = field_value && field_value.split(',')
    selectedKeys = selectedKeys.filter(item => item != deleteId)
    this.props
      .dispatch({
        type: 'organizationManager/setRelationCustomField',
        payload: {
          id: id,
          field_value: selectedKeys.join(',')
        }
      })
      .then(res => {
        if (isApiResponseOk(res)) {
          this.props.handleUpdateModelDatas &&
            this.props.handleUpdateModelDatas({
              data: res.data,
              type: 'update'
            })
        }
      })
  }

  getSelectedValue = field_value => {
    const {
      itemValue: {
        field_content: { items = [] }
      }
    } = this.state
    const options = [...items]
    const gold_name = (options.find(item => item.id == field_value) || {})
      .item_value
    return gold_name
  }

  // 删除关联字段
  handleDeleteRelationField = (e, id) => {
    e && e.stopPropagation()
    this.props
      .dispatch({
        type: 'organizationManager/deleteRelationCustomField',
        payload: {
          id: id
        }
      })
      .then(res => {
        if (isApiResponseOk(res)) {
          this.props.handleUpdateModelDatas &&
            this.props.handleUpdateModelDatas({ type: 'delete', data: id })
        }
      })
  }

  overlayMenu = itemValue => {
    const {
      field_content: { items = [] },
      id,
      field_value
    } = itemValue
    let selectedKeys = field_value && field_value.split(',')
    return (
      <div>
        <Menu
          multiple={true}
          selectedKeys={selectedKeys}
          onSelect={e => {
            this.onSelect(e, id)
          }}
          onDeselect={e => {
            this.onDeselect(e, id)
          }}
        >
          {!!(items && Object.keys(items).length) &&
            items.map(item => {
              return (
                <Menu.Item
                  title={item.item_value}
                  value={item.id}
                  key={item.id}
                >
                  <span>{item.item_value}</span>
                  <div style={{ display: 'none' }}>
                    <Icon type="check" />
                  </div>
                </Menu.Item>
              )
            })}
        </Menu>
      </div>
    )
  }

  render() {
    const { itemValue, itemKey } = this.state
    const {
      field_id,
      id,
      field_value,
      field_content: { name, field_type }
    } = itemValue
    let selectedKeys = (field_value && field_value.split(',')) || []
    const { onlyShowPopoverContent } = this.props
    return (
      <div
        key={itemKey}
        className={`${
          commonStyles.custom_field_item_wrapper
        } ${onlyShowPopoverContent &&
          commonStyles.custom_field_item_wrapper_1}`}
      >
        <div className={commonStyles.custom_field_item}>
          <div className={commonStyles.c_left}>
            <span
              onClick={e => {
                this.handleDeleteRelationField(e, id)
              }}
              className={`${globalsetStyles.authTheme} ${commonStyles.delete_icon}`}
            >
              &#xe7fe;
            </span>
            <div className={commonStyles.field_name}>
              <span
                className={`${globalsetStyles.authTheme} ${commonStyles.field_name_icon}`}
              >
                {categoryIcon(field_type).icon}
              </span>
              <span title={name}>{name}</span>
            </div>
          </div>
          {/* <div className={`${commonStyles.field_value} ${commonStyles.pub_hover}`}> */}
          <Dropdown
            getPopupContainer={triggerNode => triggerNode.parentNode}
            overlayClassName={commonStyles.overlay_common}
            trigger={['click']}
            overlay={this.overlayMenu(itemValue)}
          >
            {!!selectedKeys.length ? (
              <div
                className={`${commonStyles.field_value} ${commonStyles.pub_hover}`}
              >
                <div className={commonStyles.field_selected}>
                  <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                    {selectedKeys.map(item => {
                      return (
                        item && (
                          <div key={item} className={commonStyles.field_s_item}>
                            <div className={commonStyles.field_s_item_bg}>
                              <span
                                style={{
                                  color: !!(selectedKeys && selectedKeys.length)
                                    ? 'rgba(0,0,0,0.65)'
                                    : 'rgba(0,0,0,0.45)'
                                }}
                              >
                                {this.getSelectedValue(item)}
                                <span
                                  onClick={e => {
                                    this.handleDeleteSelectedValue(e, item)
                                  }}
                                  className={`${globalsetStyles.authTheme} ${commonStyles.field_s_item_close}`}
                                >
                                  &#xe7fe;
                                </span>
                              </span>
                            </div>
                          </div>
                        )
                      )
                    })}
                  </div>
                  <span className={globalsetStyles.authTheme}>&#xe7ee;</span>
                </div>
              </div>
            ) : (
              <div
                className={`${commonStyles.field_value} ${commonStyles.pub_hover}`}
              >
                <div className={commonStyles.common_select}>
                  <span>未选择</span>
                  <span className={globalsetStyles.authTheme}>&#xe7ee;</span>
                </div>
              </div>
            )}
          </Dropdown>
          {/* </div> */}
        </div>
      </div>
    )
  }
}
