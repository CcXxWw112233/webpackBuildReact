// 容器组件
import React, { Component, useState, useEffect } from 'react'
import {
  Input,
  Button,
  Modal,
  Collapse,
  Tooltip,
  Dropdown,
  Menu,
  message
} from 'antd'
import indexStyles from './index.less'
import commonStyles from './common.less'
import globalStyles from '@/globalset/css/globalClassName.less'
import CustomFieldCategory from './component/CustomFieldCategory'
import axios from 'axios'
import Cookies from 'js-cookie'
import { setUploadHeaderBaseInfo } from '../../../utils/businessFunction'
import CustomFieldQuoteDetail from './component/CustomFieldQuoteDetail'
import {
  createCustomFieldGroup,
  getCustomFieldList,
  getCustomFieldQuoteList
} from '../../../services/organization'
import { isApiResponseOk } from '../../../utils/handleResponseData'
import { getCreateUser, categoryIcon } from './handleOperateModal'
import EmptyImg from '@/assets/projectDetail/process/Empty@2x.png'

const { Panel } = Collapse

export default class ContainerWithIndexUI extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isAddCustomFieldVisible: false, // 是否显示添加字段
      isAddCustomFieldListVisible: false, // 是否显示添加分组字段
      isRenameFieldVisible: false, // 是否重命名
      inputValue: '', // 创建分组名称
      local_rename: '', // 保存一个本地的名称
      re_inputValue: '', // 重命名的名称
      current_rename_item: '' // 当前操作重命名的元素
    }
  }

  initState = () => {
    this.setState({
      isAddCustomFieldVisible: false,
      isAddCustomFieldListVisible: false,
      isRenameFieldVisible: false,
      inputValue: '',
      local_rename: '', // 保存一个本地的名称
      re_inputValue: '', // 重命名的名称
      current_rename_item: ''
    })
  }

  componentDidMount() {
    this.props.dispatch({
      type: 'organizationManager/getCustomFieldList',
      payload: {}
    })
  }

  componentWillUnmount() {
    this.initState()
  }

  updateState = () => {
    this.setState({
      isCustomFieldQuoteDetailVisible: false
    })
  }

  // 关闭回调
  onCancel = () => {
    this.initState()
  }

  // 点击添加字段
  handleAddCustomFields = (e, item) => {
    e && e.stopPropagation()
    this.setState({
      isAddCustomFieldVisible: true
    })
    if (item) {
      this.props.dispatch({
        type: 'organizationManager/updateDatas',
        payload: {
          currentOperateFieldItem: {
            ...item,
            type: 'group'
          }
        }
      })
    }
  }

  // 点击添加分组字段
  setAddCustomFieldsList = e => {
    e && e.stopPropagation()
    this.setState({
      isAddCustomFieldListVisible: true
    })
  }

  // 点击详情
  handleCustomQuoteDetail = (e, id) => {
    e && e.stopPropagation()
    getCustomFieldQuoteList({ id }).then(res => {
      if (isApiResponseOk(res)) {
        this.setState({
          isCustomFieldQuoteDetailVisible: true,
          quoteList: res.data
        })
      }
    })
  }

  onChange = e => {
    this.setState({
      inputValue: e.target.value
    })
  }

  onBlur = e => {
    let value = e.target.value
    if (!value || value.trimLR() == '') {
      this.setState({
        isAddCustomFieldListVisible: false
      })
    }
  }

  // 创建自定义字段分组
  handleCreateCustomFieldGroup = e => {
    e && e.stopPropagation()
    const { inputValue } = this.state
    const { dispatch } = this.props
    if (!inputValue || inputValue.trimLR() == '') {
      this.setState({
        isAddCustomFieldListVisible: false
      })
      return
    } else {
      dispatch({
        type: 'organizationManager/createCustomFieldGroup',
        payload: {
          name: inputValue
        }
      })
      this.setState({
        isAddCustomFieldListVisible: false,
        inputValue: ''
      })
    }
  }

  // 重命名
  handleRename = (e, item) => {
    const { domEvent } = e
    const { id, name } = item
    domEvent && domEvent.stopPropagation()
    this.setState({
      isRenameFieldVisible: true,
      local_rename: name,
      re_inputValue: name,
      current_rename_item: id
    })
  }

  renameChange = e => {
    let value = e.target.value
    if (!value || value.trimLR() == '') {
      this.setState({
        re_inputValue: ''
      })
      return
    }
    this.setState({
      re_inputValue: value
    })
  }

  renameBlur = e => {
    // let value = e.target.value
    // if (!value || value.trimLR() == '') {
    //   this.setState({
    //     re_inputValue: ''
    //   })
    // }
  }

  onOk = () => {
    const { current_rename_item, re_inputValue } = this.state
    this.props
      .dispatch({
        type: 'organizationManager/updateCustomFieldGroup',
        payload: {
          id: current_rename_item,
          name: re_inputValue
        }
      })
      .then(res => {
        if (isApiResponseOk(res)) {
          this.initState()
        }
      })
  }

  // 编辑字段
  handleEditField = (e, item) => {
    const { domEvent } = e
    domEvent && domEvent.stopPropagation()
    this.setState({
      isAddCustomFieldVisible: true
    })
    this.props.dispatch({
      type: 'organizationManager/updateDatas',
      payload: {
        currentOperateFieldItem: {
          ...item,
          type: 'no_group'
        }
      }
    })
  }

  discountConfirm = ({ item }) => {
    const modal = Modal.confirm()
    const that = this
    modal.update({
      title: '确认要停用这条字段吗？',
      content: '停用后不影响已引用该字段的事项,且该字段在添加字段时不再出现',
      zIndex: 1110,
      okText: '确认',
      cancelText: '取消',
      style: {
        letterSpacing: '1px'
      },
      onOk: () => {
        that.props.dispatch({
          type: 'organizationManager/discountCustomField',
          payload: {
            id: item.id,
            field_status: '1'
          }
        })
      },
      onCancel: () => {
        modal.destroy()
      }
    })
  }

  // 停用字段
  handleDiscountField = (e, item) => {
    const { domEvent } = e
    domEvent && domEvent.stopPropagation()
    this.discountConfirm({ item })
  }

  deleteConfirm = ({ item, type }) => {
    const modal = Modal.confirm()
    const that = this
    modal.update({
      title: '确认要删除这条字段吗？',
      content: '删除后不可恢复',
      zIndex: 1110,
      okText: '确认',
      cancelText: '取消',
      style: {
        letterSpacing: '1px'
      },
      // getContainer: document.getElementById('org_managementContainer') ? () => document.getElementById('org_managementContainer') : triggerNode => triggerNode.parentNode,
      onOk: () => {
        that.props.dispatch({
          type:
            type == 'no_group'
              ? 'organizationManager/deleteCustomField'
              : 'organizationManager/deleteCustomFieldGroup',
          payload: {
            id: item.id
          }
        })
      },
      onCancel: () => {
        modal.destroy()
      }
    })
  }

  // 删除字段
  handleDeleteField = ({ e, item, type }) => {
    const { domEvent } = e
    domEvent && domEvent.stopPropagation()
    if (!!(item.fields && item.fields.length)) {
      let gold_value = item.fields.find(item => item.quote_num != 0)
      if (!!(gold_value && Object.keys(gold_value).length)) {
        message.warn('字段被引用中，无法删除')
        return
      }
    }
    // else
    if (!!item.quote_num && item.quote_num != 0) {
      message.warn('字段被引用中，无法删除')
      return
    }
    this.deleteConfirm({ item, type })
  }

  customFiledsOverlay = ({ item, type }) => {
    return (
      <Menu>
        {type == 'group' && (
          <Menu.Item
            onClick={e => {
              this.handleRename(e, item)
            }}
            key="rename"
          >
            重命名
          </Menu.Item>
        )}
        {type == 'no_group' && (
          <Menu.Item
            onClick={e => {
              this.handleEditField(e, item)
            }}
            key="edit_fileds"
          >
            编辑字段
          </Menu.Item>
        )}
        {type == 'no_group' && (
          <Menu.Item
            key="discont_fileds"
            onClick={e => {
              this.handleDiscountField(e, item)
            }}
          >
            <div>
              <span style={{ marginRight: '5px' }}>停用字段</span>
              <span
                title="停用后不影响已引用该字段的事项,且该字段在添加字段时不再出现"
                style={{ cursor: 'pointer' }}
                className={globalStyles.authTheme}
              >
                &#xe77b;
              </span>
            </div>
          </Menu.Item>
        )}
        <Menu.Item
          onClick={e => {
            this.handleDeleteField({ e, item, type })
          }}
          style={{ color: '#F5222D' }}
          key="delelte_fileds"
        >
          删除
        </Menu.Item>
      </Menu>
    )
  }

  dropDownContent = ({ item, type }) => {
    return (
      <Dropdown
        trigger={['click']}
        getPopupContainer={triggerNode => triggerNode.parentNode}
        overlay={this.customFiledsOverlay({ item, type })}
      >
        {/* <Tooltip title="字段菜单分类" getPopupContainer={triggerNode => triggerNode.parentNode}> */}
        <span
          className={`${commonStyles.custom_fileds_more} ${globalStyles.authTheme}`}
        >
          <em>&#xe66f;</em>
        </span>
        {/* </Tooltip> */}
      </Dropdown>
    )
  }

  headerContent = (item, flag) => {
    return (
      <div
        className={indexStyles.collapse_header_}
        style={{ paddingLeft: flag ? '80px' : '44px' }}
      >
        <div title={item.name} className={indexStyles.collapse_header_left}>
          {item.name}
        </div>
        <div
          className={indexStyles.collapse_header_right}
          onClick={e => e && e.stopPropagation()}
        >
          <Tooltip
            title="添加字段"
            getPopupContainer={triggerNode => triggerNode.parentNode}
          >
            <span
              onClick={e => this.handleAddCustomFields(e, item)}
              className={globalStyles.authTheme}
            >
              <em>&#xe70b;</em>
            </span>
          </Tooltip>
          {this.dropDownContent({ item, type: 'group' })}
        </div>
      </div>
    )
  }

  panelContent = (value, index) => {
    const { field_status, group_id, quote_num, field_type, id } = value
    return (
      <>
        {group_id != '0' && (
          <hr
            className={`${commonStyles.custom_hr} ${commonStyles.custom_hr_sub}`}
          />
        )}
        <div className={indexStyles.panel_content_hover}>
          <div className={indexStyles.panel_content}>
            <div className={indexStyles.panel_content_left}>
              <div className={indexStyles.panel_item_name}>
                <span className={globalStyles.authTheme}>
                  {categoryIcon(field_type).icon}
                </span>
                <span>{value.name}</span>
              </div>
              <div className={indexStyles.panel_detail}>
                <span>类型：{categoryIcon(field_type).field_name}</span>
                {/* <span>被引用次数：{quote_num} 次 <em onClick={(e) => { this.handleCustomQuoteDetail(e, id) }}>详情</em></span> */}
                <span>
                  <em
                    onClick={e => {
                      this.handleCustomQuoteDetail(e, id)
                    }}
                  >
                    引用详情
                  </em>
                </span>
                <span>创建人：{getCreateUser()}</span>
                <span>
                  状态:{' '}
                  <span style={{ color: field_status == '1' && '#F5222D' }}>
                    {field_status == '0' ? '启用' : '停用'}
                  </span>
                </span>
              </div>
            </div>
            <div className={indexStyles.panel_content_right}>
              {this.dropDownContent({ item: value, type: 'no_group' })}
            </div>
          </div>
        </div>
        {(!!index || index == 0) && (
          <hr
            className={`${commonStyles.custom_hr} ${commonStyles.custom_hr_nogroup}`}
          />
        )}
      </>
    )
  }

  renderCustomCategoryContent = () => {
    const {
      customFieldsList,
      customFieldsList: { groups = [], fields = [] }
    } = this.props
    return (
      <>
        {!(customFieldsList && Object.keys(customFieldsList).length) ? (
          <div
            className={indexStyles.custom_noData}
            style={{ minHeight: '540px' }}
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
        ) : (
          <div className={`${indexStyles.collapse_content}`}>
            <Collapse destroyInactivePanel={true} bordered={false}>
              {!!(groups && groups.length) &&
                groups.map(item => {
                  let flag = !!(item.fields && item.fields.length)
                  return (
                    <Panel
                      showArrow={flag}
                      header={this.headerContent(item, flag)}
                      key={item.id}
                    >
                      {item.fields &&
                        item.fields.length &&
                        item.fields.map(value => {
                          return <div>{this.panelContent(value)}</div>
                        })}
                    </Panel>
                  )
                })}
            </Collapse>
            {!!(fields && fields.length) &&
              fields.map((item, index) => {
                return (
                  <div className={indexStyles.no_collapse_content}>
                    {this.panelContent(item, index)}
                  </div>
                )
              })}
          </div>
        )}
      </>
    )
  }

  render() {
    const {
      isRenameFieldVisible,
      isAddCustomFieldVisible,
      isAddCustomFieldListVisible,
      inputValue,
      isCustomFieldQuoteDetailVisible,
      re_inputValue,
      local_rename
    } = this.state
    const { customFieldsList = {} } = this.props
    return (
      <>
        <div className={indexStyles.custom_fields_wrapper}>
          <div>
            <div className={indexStyles.custom_title}>
              <div
                className={`${globalStyles.authTheme} ${indexStyles.custom_title_icon}`}
              >
                &#xe7f8;
              </div>
              <div className={indexStyles.custom_title_name}>自定义字段</div>
            </div>
            <div className={indexStyles.custom_add_field}>
              <span onClick={e => this.handleAddCustomFields(e)}>
                <span className={globalStyles.authTheme}>&#xe782;</span>
                <span>添加字段</span>
              </span>
            </div>
            <div style={{ marginBottom: '12px' }}>
              {isAddCustomFieldListVisible ? (
                <div className={indexStyles.custom_add_field_list_input_field}>
                  <Input
                    autoFocus={true}
                    value={inputValue}
                    onChange={this.onChange}
                    onBlur={this.onBlur}
                  />
                  <Button
                    type="primary"
                    disabled={!inputValue || inputValue.trimLR() == ''}
                    onClick={this.handleCreateCustomFieldGroup}
                  >
                    确定
                  </Button>
                </div>
              ) : (
                <div
                  className={indexStyles.custom_add_field_list}
                  onClick={this.setAddCustomFieldsList}
                >
                  <span className={globalStyles.authTheme}>&#xe782;</span>
                  <span>新建字段分组</span>
                </div>
              )}
            </div>
            <hr className={commonStyles.custom_hr} />
            {/* 分组和默认列表 */}
            <div
              className={`${globalStyles.global_vertical_scrollbar}`}
              style={{
                minHeight: '550px',
                maxHeight: '550px',
                overflowY: 'auto',
                margin: '0px -44px',
                padding: '0px 44px'
              }}
            >
              {this.renderCustomCategoryContent()}
            </div>
          </div>
        </div>
        <div
          id={'customCategoryContainer'}
          className={indexStyles.customCategoryContainer}
        >
          {isAddCustomFieldVisible && (
            <Modal
              width={440}
              visible={isAddCustomFieldVisible}
              title={null}
              footer={null}
              destroyOnClose={true}
              maskClosable={false}
              getContainer={() =>
                document.getElementById('customCategoryContainer')
              }
              onCancel={this.onCancel}
              style={{ width: '440px' }}
              maskStyle={{ backgroundColor: 'rgba(0,0,0,.3)' }}
            >
              <CustomFieldCategory
                customFieldsList={customFieldsList}
                onCancel={this.onCancel}
              />
            </Modal>
          )}
        </div>
        {isRenameFieldVisible && (
          <Modal
            width={440}
            visible={isRenameFieldVisible}
            title={'重命名'}
            destroyOnClose={true}
            maskClosable={false}
            getContainer={() =>
              document.getElementById('customCategoryContainer')
            }
            onCancel={() => {
              this.setState({
                isRenameFieldVisible: false
              })
            }}
            okButtonProps={{
              disabled: local_rename == re_inputValue || !re_inputValue
            }}
            style={{ width: '440px' }}
            maskStyle={{ backgroundColor: 'rgba(0,0,0,.3)' }}
            onOk={this.onOk}
          >
            <Input
              maxLength={100}
              value={re_inputValue}
              onChange={this.renameChange}
              onBlur={this.renameBlur}
            />
          </Modal>
        )}
        {/* 点击详情内容 */}
        {
          <CustomFieldQuoteDetail
            visible={isCustomFieldQuoteDetailVisible}
            updateState={this.updateState}
            quoteList={this.state.quoteList}
          />
        }
      </>
    )
  }
}
