import React, { Component } from 'react'
import commonStyles from '../common.less'
import globalsetStyles from '@/globalset/css/globalClassName.less'
import {
  Select,
  Dropdown,
  Menu,
  Icon,
  DatePicker,
  Input,
  InputNumber
} from 'antd'
import { categoryIcon } from '../../../routes/organizationManager/CustomFields/handleOperateModal'
import MenuSearchPartner from '@/components/MenuSearchMultiple/MenuSearchPartner.js'
import { connect } from 'dva'
import { isApiResponseOk } from '../../../utils/handleResponseData'
import {
  isObjectValueEqual,
  timeToTimestamp,
  timestampFormat,
  isArrayEqual
} from '../../../utils/util'
import { getGroupList } from '../../../services/technological/organizationMember'

@connect(
  ({
    projectDetail: {
      datas: { projectDetailInfoData = {} }
    },
    technological: {
      datas: { correspondingOrganizationMmembersList = [] }
    }
  }) => ({
    projectDetailInfoData,
    correspondingOrganizationMmembersList
  })
)
export default class MemberFieldContent extends Component {
  constructor(props) {
    super(props)
    this.state = {
      itemValue: props.itemValue,
      itemKey: props.itemKey,
      selected_memebers_value:
        props.itemValue && props.itemValue.field_value
          ? props.itemValue && props.itemValue.field_value
          : []
    }
  }

  initState = () => {
    this.setState({
      orgMembersData: [],
      boardMembersData: []
    })
  }

  // 获取组织成员列表
  // getGroupList = (org_id, props) => {
  //   getGroupList({ _organization_id: org_id }).then(res => {
  //     if (isApiResponseOk(res)) {
  //       let data = []
  //       res.data.data.forEach(item => {
  //         if (item.members && item.members.length) {
  //           data.push(...item.members)
  //         }
  //       })
  //       this.setState({
  //         orgMembersData: data
  //       },() => {
  //         this.getMembersList(props, data)
  //       })
  //     }
  //   })
  // }

  componentDidMount() {
    setTimeout(() => {
      this.getMembersList(this.props)
    }, 200)
  }

  componentWillReceiveProps(nextProps) {
    if (
      !isArrayEqual(
        this.props.projectDetailInfoData.data,
        nextProps.projectDetailInfoData.data
      ) ||
      !isObjectValueEqual(this.props.itemValue, nextProps.itemValue) ||
      !isArrayEqual(
        this.props.correspondingOrganizationMmembersList,
        nextProps.correspondingOrganizationMmembersList
      )
    ) {
      this.setState({
        itemValue: nextProps.itemValue,
        itemKey: nextProps.itemKey,
        selected_memebers_value:
          nextProps.itemValue && nextProps.itemValue.field_value
            ? nextProps.itemValue && nextProps.itemValue.field_value
            : []
      })
      this.getMembersList(nextProps)
    }
  }

  componentWillUnmount() {
    this.initState()
  }

  // 移除操作人
  handleRemoveExecutors = (e, user_id) => {
    e && e.stopPropagation()
    const {
      selected_memebers_value = [],
      itemValue: { id }
    } = this.state
    let users = selected_memebers_value
      .filter(item => item.user_id != user_id)
      .map(item => {
        return item.user_id
      })
    this.props
      .dispatch({
        type: 'organizationManager/setRelationCustomField',
        payload: {
          id,
          field_value: !!(users && users.length) ? users.join(',') : ''
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

  // 操作单人
  handleSingleMembersData = data => {
    const {
      itemValue: {
        id,
        field_content: {
          field_set: { member_selected_range }
        }
      },
      orgMembersData = [],
      boardMembersData = []
    } = this.state
    const { projectDetailInfoData = {} } = this.props
    const { selectedKeys = [], type, key } = data
    if (type == 'add') {
      // 表示添加的操作
      // let selected_memebers_value = []
      // let users = []
      // // 多个任务执行人
      // const membersData = [...operateData] //所有的人
      // for (let j = 0; j < membersData.length; j++) {
      //   if (key === membersData[j]['user_id']) {
      //     selected_memebers_value.push(membersData[j])
      //     users.push(membersData[j].user_id)
      //   }
      // }
      this.props
        .dispatch({
          type: 'organizationManager/setRelationCustomField',
          payload: {
            id,
            field_value: key
          }
        })
        .then(res => {
          if (isApiResponseOk(res)) {
            // this.setState({
            //   selected_memebers_value
            // });
            this.props.handleUpdateModelDatas &&
              this.props.handleUpdateModelDatas({
                data: res.data,
                type: 'update'
              })
          }
        })
    } else if (type == 'remove') {
      const {
        selected_memebers_value = [],
        itemValue: { field_value = [] }
      } = this.state
      // 多个任务执行人
      let gold_user = field_value.filter(item => item.user_id != key)
      let user_id = !!(gold_user && gold_user.length)
        ? gold_user[0].user_id
        : ''
      selected_memebers_value.map((item, index) => {
        if (item.user_id == key) {
          selected_memebers_value.splice(index, 1)
        }
      })
      this.props
        .dispatch({
          type: 'organizationManager/setRelationCustomField',
          payload: {
            id,
            field_value: user_id
          }
        })
        .then(res => {
          if (isApiResponseOk(res)) {
            // this.setState({
            //   selected_memebers_value
            // });
            this.props.handleUpdateModelDatas &&
              this.props.handleUpdateModelDatas({
                data: res.data,
                type: 'update'
              })
          }
        })
    }
  }

  // 操作多人
  handleMultipleMmembersData = data => {
    const {
      itemValue: {
        id,
        field_content: {
          field_set: { member_selected_range }
        }
      },
      orgMembersData = [],
      boardMembersData = []
    } = this.state
    const {
      projectDetailInfoData = {},
      correspondingOrganizationMmembersList = []
    } = this.props
    const { selectedKeys = [], type, key } = data
    let operateData =
      member_selected_range == '1' ? orgMembersData : boardMembersData
    if (type == 'add') {
      // 表示添加的操作
      // let selected_memebers_value = []
      let users = []
      // 多个任务执行人
      const membersData = [...operateData] //所有的人
      for (let i = 0; i < selectedKeys.length; i++) {
        for (let j = 0; j < membersData.length; j++) {
          if (selectedKeys[i] === membersData[j]['user_id']) {
            // selected_memebers_value.push(membersData[j])
            users.push(membersData[j].user_id)
          }
        }
      }
      this.props
        .dispatch({
          type: 'organizationManager/setRelationCustomField',
          payload: {
            id,
            field_value: !!(users && users.length) ? users.join(',') : ''
          }
        })
        .then(res => {
          if (isApiResponseOk(res)) {
            // this.setState({
            //   selected_memebers_value
            // });
            this.props.handleUpdateModelDatas &&
              this.props.handleUpdateModelDatas({
                data: res.data,
                type: 'update'
              })
          }
        })
    } else if (type == 'remove') {
      this.props
        .dispatch({
          type: 'organizationManager/setRelationCustomField',
          payload: {
            id,
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
  }

  chirldrenTaskChargeChange = data => {
    const {
      itemValue: {
        id,
        field_content: {
          field_set: { member_selected_type }
        }
      }
    } = this.state
    switch (member_selected_type) {
      case '1': // 表示单人
        this.handleSingleMembersData(data)
        break
      case '2': // 表示多人
        this.handleMultipleMmembersData(data)
        break
      default:
        break
    }
  }

  // 根据不同的类型获取不同的成员列表
  getMembersList = (props, orgData = []) => {
    const {
      projectDetailInfoData: { board_id, org_id, data: boardData },
      correspondingOrganizationMmembersList = []
    } = props
    const {
      itemValue: {
        field_content: {
          field_set: { member_selected_range }
        }
      }
    } = this.state
    switch (member_selected_range) {
      case '1': // 表示当前组织
        // membersData = [...orgData]
        this.setState({
          orgMembersData: correspondingOrganizationMmembersList.map(item => {
            let new_item = { ...item }
            new_item = {
              ...item,
              user_id: item.id
            }
            return new_item
          })
        })
        break
      case '2': // 表示项目
        // membersData = [...boardData]
        this.setState({
          boardMembersData: boardData
        })
        break
      default:
        break
    }
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

  render() {
    const {
      itemValue,
      itemKey,
      selected_memebers_value = [],
      boardMembersData = [],
      orgMembersData = []
    } = this.state
    const {
      field_id,
      id,
      field_value,
      field_content: {
        name,
        field_type,
        field_set: { member_selected_range, member_selected_type }
      }
    } = itemValue
    const { onlyShowPopoverContent } = this.props
    let data =
      member_selected_range == '1'
        ? orgMembersData
        : JSON.parse(JSON.stringify(boardMembersData))
    return (
      <div
        key={id}
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
          {/* <div className={`${commonStyles.field_value} ${commonStyles.pub_hover}`}>
            <div onClick={this.onClick} className={commonStyles.common_select}>
              <span>未选择</span>
              <span className={globalsetStyles.authTheme}>&#xe7ee;</span>
            </div>
          </div> */}
          <span style={{ flex: '1' }}>
            {!(selected_memebers_value && selected_memebers_value.length) ? (
              <div
                className={`${commonStyles.field_value} ${commonStyles.pub_hover}`}
              >
                <Dropdown
                  trigger={['click']}
                  overlayClassName={commonStyles.overlay_pricipal}
                  getPopupContainer={triggerNode => triggerNode.parentNode}
                  overlay={
                    <MenuSearchPartner
                      single={member_selected_type == '1' ? true : false}
                      isInvitation={true}
                      inviteOthersToBoardCalback={
                        this.inviteOthersToBoardCalback
                      }
                      listData={data}
                      keyCode={'user_id'}
                      searchName={'name'}
                      currentSelect={selected_memebers_value}
                      chirldrenTaskChargeChange={this.chirldrenTaskChargeChange}
                    />
                  }
                >
                  <div
                    onClick={this.onClick}
                    className={commonStyles.common_select}
                  >
                    <span>未选择</span>
                    <span className={globalsetStyles.authTheme}>&#xe7ee;</span>
                  </div>
                </Dropdown>
              </div>
            ) : (
              <div style={{ flex: '1', position: 'relative' }}>
                <Dropdown
                  trigger={['click']}
                  overlayClassName={commonStyles.overlay_pricipal}
                  getPopupContainer={triggerNode => triggerNode.parentNode}
                  overlay={
                    <MenuSearchPartner
                      single={member_selected_type == '1' ? true : false}
                      isInvitation={true}
                      // inviteOthersToBoardCalback={this.inviteOthersToBoardCalback}
                      listData={data}
                      keyCode={'user_id'}
                      searchName={'name'}
                      currentSelect={selected_memebers_value}
                      chirldrenTaskChargeChange={this.chirldrenTaskChargeChange}
                      // board_id={board_id}
                    />
                  }
                >
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      minHeight: '38px'
                    }}
                    className={`${commonStyles.field_right} ${commonStyles.pub_hover}`}
                  >
                    {selected_memebers_value.map(value => {
                      const { avatar, name, user_name, user_id } = value
                      return (
                        <div
                          key={user_id}
                          className={`${commonStyles.first_pric}`}
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            marginLeft: '-12px'
                          }}
                        >
                          <div
                            className={`${commonStyles.user_item}`}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              position: 'relative',
                              margin: '2px 10px',
                              textAlign: 'center',
                              height: '38px'
                            }}
                            key={user_id}
                          >
                            {avatar ? (
                              <img
                                style={{
                                  width: '24px',
                                  height: '24px',
                                  borderRadius: 20,
                                  margin: '0 2px'
                                }}
                                src={avatar}
                              />
                            ) : (
                              <div
                                style={{
                                  width: '24px',
                                  height: '24px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  borderRadius: 20,
                                  backgroundColor: '#f5f5f5',
                                  margin: '0 2px'
                                }}
                              >
                                <Icon
                                  type={'user'}
                                  style={{ fontSize: 12, color: '#8c8c8c' }}
                                />
                              </div>
                            )}
                            <div
                              style={{ marginRight: 8, fontSize: '14px' }}
                              className={commonStyles.value_text}
                            >
                              {name || user_name || '佚名'}
                            </div>
                            <span
                              onClick={e => {
                                this.handleRemoveExecutors(e, user_id)
                              }}
                              className={`${commonStyles.userItemDeleBtn}`}
                            ></span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </Dropdown>
              </div>
            )}
          </span>
        </div>
      </div>
    )
  }
}
