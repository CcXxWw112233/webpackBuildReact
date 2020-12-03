import React, { Component } from 'react'
import { Button, Dropdown, Icon, Menu, Radio, Tooltip } from 'antd'
import indexStyles from '../index.less'
import globalStyles from '@/globalset/css/globalClassName.less'
import ConfigureStepOne_one from './ConfigureStepOne_one'
import ConfigureStepOne_two from './ConfigureStepOne_two'
import ConfigureStepOne_three from './ConfigureStepOne_three'
import ConfigureStepOne_five from './ConfigureStepOne_five'
import MenuSearchPartner from '@/components/MenuSearchMultiple/MenuSearchPartner.js'
import MoreOptionsComponent from '../../MoreOptionsComponent'
import { connect } from 'dva'
import ConfigureStepOne_six from './ConfigureStepOne_six'
import { getOnlineExcelWithProcess } from '../../../../../services/technological/workFlow'
import { isApiResponseOk } from '../../../../../utils/handleResponseData'

@connect(mapStateToProps)
export default class ConfigureStepTypeOne extends Component {
  constructor(props) {
    super(props)
    let newDesignatedPersonnelList
    if (props.itemValue && props.itemValue.assignees) {
      if (props.itemValue.assignees instanceof Array) {
        newDesignatedPersonnelList = [...props.itemValue.assignees]
      } else {
        newDesignatedPersonnelList = props.itemValue.assignees.split(',')
      }
    } else {
      newDesignatedPersonnelList = []
    }
    this.state = {
      designatedPersonnelList: newDesignatedPersonnelList // 指定人员的列表
    }
    // this.state = {
    //   designatedPersonnelList: props.itemValue.assignees ? props.itemValue.assignees.split(',') : [], // 指定人员的列表
    // }
  }

  deepCopy = source => {
    const isObject = obj => {
      return typeof obj === 'object' && obj !== null
    }
    if (!isObject(source)) return source //如果不是对象的话直接返回
    let target = Array.isArray(source) ? [] : {} //数组兼容
    for (var k in source) {
      if (source.hasOwnProperty(k)) {
        if (typeof source[k] === 'object') {
          target[k] = this.deepCopy(source[k])
        } else {
          target[k] = source[k]
        }
      }
    }
    return target
  }

  updateConfigureProcess = (data, key) => {
    //更新单个数组单个属性
    const { value } = data
    const { processEditDatas = [], itemKey, itemValue, dispatch } = this.props
    const new_processEditDatas = [...processEditDatas]
    new_processEditDatas[itemKey][key] = value
    dispatch({
      type: 'publicProcessDetailModal/updateDatas',
      payload: {
        processEditDatas: new_processEditDatas
      }
    })
    if (data.code && data.type && data.type == 'delete') {
      new_processEditDatas[itemKey].options_data
        ? delete new_processEditDatas[itemKey].options_data
        : ''
      if (data.code == 'COMPLETION_DEADLINE') {
        // 表示删除完成期限
        new_processEditDatas[itemKey].deadline_time_type == ''
          ? delete new_processEditDatas[itemKey].deadline_time_type
          : ''
        new_processEditDatas[itemKey].deadline_value == ''
          ? delete new_processEditDatas[itemKey].deadline_value
          : ''
      } else if (data.code == 'DUPLICATED') {
        new_processEditDatas[itemKey].recipients == ''
          ? delete new_processEditDatas[itemKey].recipients
          : ''
      }
      dispatch({
        type: 'publicProcessDetailModal/updateDatas',
        payload: {
          processEditDatas: new_processEditDatas
        }
      })
    }
  }

  // 任何人 | 指定人
  assigneeTypeChange = e => {
    this.updateConfigureProcess({ value: e.target.value }, 'assignee_type')
  }

  //修改通知人的回调 S
  chirldrenTaskChargeChange = data => {
    const { projectDetailInfoData = {}, currentOrgAllMembers = [] } = this.props
    const { selectedKeys = [], type, key } = data
    if (type == 'add') {
      // 表示添加的操作
      let assignee_value = []
      // 多个任务执行人
      // const membersData = projectDetailInfoData['data'] //所有的人
      const membersData = [...currentOrgAllMembers] //所有的人
      for (let i = 0; i < selectedKeys.length; i++) {
        for (let j = 0; j < membersData.length; j++) {
          if (selectedKeys[i] === membersData[j]['user_id']) {
            assignee_value.push(membersData[j].user_id)
          }
        }
      }
      this.setState({
        designatedPersonnelList: assignee_value
      })
      this.updateConfigureProcess(
        { value: assignee_value.join(',') },
        'assignees'
      )
    }

    if (type == 'remove') {
      // 表示移除的操作
      const { itemValue } = this.props
      const { assignees } = itemValue
      const { designatedPersonnelList = [] } = this.state
      let newDesignatedPersonnelList = [...designatedPersonnelList]
      let newAssigneesArray =
        assignees && assignees.length ? assignees.split(',') : []
      if (selectedKeys.length == '0') {
        // 表示取消全选
        newAssigneesArray = []
      } else {
        newDesignatedPersonnelList.map((item, index) => {
          if (item == key) {
            newDesignatedPersonnelList.splice(index, 1)
            newAssigneesArray.splice(index, 1)
          }
        })
      }
      let newAssigneesStr = newAssigneesArray.join(',')
      this.setState({
        designatedPersonnelList: newAssigneesArray
      })
      this.updateConfigureProcess({ value: newAssigneesStr }, 'assignees')
    }
  }
  // 添加执行人的回调 E

  // 移除执行人的回调 S
  handleRemoveExecutors = (e, shouldDeleteItem) => {
    e && e.stopPropagation()
    const { itemValue } = this.props
    const { assignees } = itemValue
    const { designatedPersonnelList = [] } = this.state
    let newDesignatedPersonnelList = [...designatedPersonnelList]
    let newAssigneesArray =
      assignees && assignees.length ? assignees.split(',') : []
    newDesignatedPersonnelList.map((item, index) => {
      if (item == shouldDeleteItem) {
        newDesignatedPersonnelList.splice(index, 1)
        newAssigneesArray.splice(index, 1)
      }
    })
    let newAssigneesStr = newAssigneesArray.join(',')
    this.setState({
      designatedPersonnelList: newAssigneesArray
    })
    this.updateConfigureProcess({ value: newAssigneesStr }, 'assignees')
  }

  // 获取在线表格
  getOnlineExcelWithProcess = data => {
    // if (data && data.find(i=>i.field_type == '6')) return
    getOnlineExcelWithProcess({}).then(res => {
      if (isApiResponseOk(res)) {
        data.push({
          online_excel_id: res.data,
          field_type: '6'
        })
        this.updateConfigureProcess({ value: data }, 'forms')
        this.props.updateSheetList &&
          this.props.updateSheetList({ id: res.data, sheetData: [] })
      }
    })
  }

  //表单填写项
  menuAddFormClick = ({ key }) => {
    const { processEditDatas = [], itemValue, itemKey } = this.props
    const { forms = [] } = processEditDatas[itemKey]
    //推进人一项
    let newFormsData = [...forms]
    newFormsData = newFormsData.map(item => {
      if (item.is_click_currentTextForm) {
        let new_item
        new_item = { ...item, is_click_currentTextForm: false }
        return new_item
      } else {
        return item
      }
    })
    let obj = {}
    switch (key) {
      case '1':
        obj = {
          // 表示文本
          field_type: '1', //类型 1=文本 2=选择 3=日期 4=表格 5=附件
          title: '文本输入', //标题
          prompt_content: '请填写内容', //提示内容
          is_required: '0', //是否必填 1=必须 0=不是必须
          verification_rule: '', //校验规则
          val_min_length: '', //最小长度
          val_max_length: '', //最大长度
          is_click_currentTextForm: true
        }
        break
      case '2':
        obj = {
          field_type: '2', //类型 1=文本 2=选择 3=日期 4=表格 5=附件
          title: '下拉选择', //标题
          prompt_content: '请选择内容', //提示内容
          is_required: '0', //是否必填 1=必须 0=不是必须
          is_multiple_choice: '0', //是否多选 1=是 0=否
          options: [
            {
              label_value: '0',
              label_name: '选项1'
            }
          ],
          is_click_currentTextForm: true
        }
        break
      case '3': //下拉
        obj = {
          //日期
          field_type: '3', //类型 1=文本 2=选择 3=日期 4=表格 5=附件
          title: '日期选择', //标题
          prompt_content: '请选择日期', //提示内容
          is_required: '0', //是否必填 1=必须 0=不是必须
          date_range: '1', //日期范围 1=单个日期 2=开始日期~截止日期
          date_precision: '2', //日期精度 1=仅日期 2=日期+时间
          is_click_currentTextForm: true
        }
        break
      case '5':
        obj = {
          field_type: '5', //类型 1=文本 2=选择 3=日期 4=表格 5=附件
          title: '附件上传', //标题
          prompt_content: '', //提示内容
          is_required: '0', //是否必填 1=必须 0=不是必须
          limit_file_num: '10', //上传数量
          limit_file_size: '20', //上传大小限制
          limit_file_type: [
            //限制上传类型(文件格式) document=文档 image=图像 audio=音频 video=视频
            'document',
            'image',
            'audio',
            'video'
          ],
          is_click_currentTextForm: true
        }
        break
      case '6':
        this.getOnlineExcelWithProcess(newFormsData)
        break
      default:
        break
    }
    if (!(obj && Object.keys(obj).length)) return
    newFormsData.push(obj)
    this.updateConfigureProcess({ value: newFormsData }, 'forms')
  }

  // 渲染不同的表项
  filterForm = (value, key) => {
    if (!value) return <></>
    const { field_type } = value
    const { itemKey, itemValue, updateSheetList } = this.props
    let container = <div></div>
    switch (field_type) {
      case '1':
        container = (
          // eslint-disable-next-line react/jsx-pascal-case
          <ConfigureStepOne_one
            updateConfigureProcess={this.updateConfigureProcess}
            itemKey={key}
            itemValue={value}
            parentKey={itemKey}
            parentValue={itemValue}
          />
        )
        break
      case '2':
        container = (
          // eslint-disable-next-line react/jsx-pascal-case
          <ConfigureStepOne_two
            updateConfigureProcess={this.updateConfigureProcess}
            itemKey={key}
            itemValue={value}
            parentKey={itemKey}
            parentValue={itemValue}
          />
        )
        break
      case '3':
        container = (
          // eslint-disable-next-line react/jsx-pascal-case
          <ConfigureStepOne_three
            updateConfigureProcess={this.updateConfigureProcess}
            itemKey={key}
            itemValue={value}
            parentKey={itemKey}
            parentValue={itemValue}
          />
        )
        break
      case '5':
        container = (
          // eslint-disable-next-line react/jsx-pascal-case
          <ConfigureStepOne_five
            updateConfigureProcess={this.updateConfigureProcess}
            itemKey={key}
            itemValue={value}
            parentKey={itemKey}
            parentValue={itemValue}
          />
        )
        break
      case '6':
        container = (
          // eslint-disable-next-line react/jsx-pascal-case
          <ConfigureStepOne_six
            setSheet={this.props.setSheet}
            updateSheetList={updateSheetList}
            updateConfigureProcess={this.updateConfigureProcess}
            itemKey={key}
            itemValue={value}
            parentKey={itemKey}
            parentValue={itemValue}
          />
        )
        break
      default:
        break
    }
    return container
  }

  // 把assignees中的执行人,在项目中的所有成员过滤出来
  filterAssignees = () => {
    const {
      projectDetailInfoData: { data = [] },
      currentOrgAllMembers = []
    } = this.props
    const { designatedPersonnelList = [] } = this.state
    // let new_data = [...data]
    let new_data = [...currentOrgAllMembers]
    let newDesignatedPersonnelList =
      designatedPersonnelList &&
      designatedPersonnelList.map(item => {
        return new_data.find(item2 => item2.user_id == item) || {}
      })
    newDesignatedPersonnelList = newDesignatedPersonnelList.filter(
      item => item.user_id
    )
    // let arr = []
    // newDesignatedPersonnelList = newData.filter((item,index) => {
    //   if (approvalsList.indexOf(item.user_id) != -1) {
    //     arr.push(item)
    //     return item
    //   }
    // })

    return newDesignatedPersonnelList
  }

  renderFieldType = () => {
    return (
      <div>
        <Menu
          onClick={this.menuAddFormClick}
          getPopupContainer={triggerNode => triggerNode.parentNode}
        >
          <Menu.Item key="1">文本</Menu.Item>
          <Menu.Item key="2">选择</Menu.Item>
          <Menu.Item key="3">日期</Menu.Item>
          <Menu.Item key="5">附件</Menu.Item>
          <Menu.Item key="6">在线表格</Menu.Item>
        </Menu>
      </div>
    )
  }

  // 渲染指定人员
  renderDesignatedPersonnel = () => {
    const {
      projectDetailInfoData: { data = [], board_id, org_id },
      currentOrgAllMembers = []
    } = this.props
    // const { designatedPersonnelList = [] } = this.state
    let designatedPersonnelList = this.filterAssignees()
    return (
      <div style={{ flex: 1, padding: '8px 0' }}>
        {!designatedPersonnelList.length ? (
          <div style={{ position: 'relative' }}>
            <Dropdown
              trigger={['click']}
              overlayClassName={indexStyles.overlay_pricipal}
              getPopupContainer={triggerNode => triggerNode.parentNode}
              overlayStyle={{ maxWidth: '200px' }}
              overlay={
                <MenuSearchPartner
                  isInvitation={true}
                  // show_select_all={true}
                  // select_all_type={'0'}
                  listData={currentOrgAllMembers}
                  keyCode={'user_id'}
                  searchName={'name'}
                  currentSelect={designatedPersonnelList}
                  // board_id={board_id}
                  // invitationType='1'
                  // invitationId={board_id}
                  // invitationOrg={org_id}
                  chirldrenTaskChargeChange={this.chirldrenTaskChargeChange}
                />
              }
            >
              {/* 添加通知人按钮 */}

              <div className={indexStyles.addNoticePerson}>
                <span
                  className={`${globalStyles.authTheme} ${indexStyles.plus_icon}`}
                >
                  &#xe8fe;
                </span>
              </div>
            </Dropdown>
          </div>
        ) : (
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              lineHeight: '22px'
            }}
          >
            {designatedPersonnelList.map((value, index) => {
              const { avatar, name, user_name, user_id } = value
              return (
                <div
                  style={{ display: 'flex', alignItems: 'center' }}
                  key={user_id}
                >
                  <div
                    className={`${indexStyles.user_item}`}
                    style={{
                      position: 'relative',
                      textAlign: 'center',
                      marginBottom: '8px'
                    }}
                    key={user_id}
                  >
                    {avatar ? (
                      <Tooltip
                        overlayStyle={{ minWidth: '62px' }}
                        getPopupContainer={triggerNode =>
                          triggerNode.parentNode
                        }
                        placement="top"
                        title={name || user_name || '佚名'}
                      >
                        <img
                          className={indexStyles.img_hover}
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: 20,
                            margin: '0 2px'
                          }}
                          src={avatar}
                        />
                      </Tooltip>
                    ) : (
                      <Tooltip
                        overlayStyle={{ minWidth: '62px' }}
                        getPopupContainer={triggerNode =>
                          triggerNode.parentNode
                        }
                        placement="top"
                        title={name || user_name || '佚名'}
                      >
                        <div
                          className={indexStyles.default_user_hover}
                          style={{
                            width: '32px',
                            height: '32px',
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
                            style={{ fontSize: 14, color: '#8c8c8c' }}
                          />
                        </div>
                      </Tooltip>
                    )}
                    <span
                      onClick={e => {
                        this.handleRemoveExecutors(e, user_id)
                      }}
                      className={`${indexStyles.userItemDeleBtn}`}
                    ></span>
                  </div>
                </div>
              )
            })}
            <Dropdown
              trigger={['click']}
              overlayClassName={indexStyles.overlay_pricipal}
              getPopupContainer={triggerNode => triggerNode.parentNode}
              overlayStyle={{ maxWidth: '200px' }}
              overlay={
                <MenuSearchPartner
                  isInvitation={true}
                  // show_select_all={true}
                  // select_all_type={'0'}
                  listData={currentOrgAllMembers}
                  keyCode={'user_id'}
                  searchName={'name'}
                  currentSelect={designatedPersonnelList}
                  // board_id={board_id}
                  // invitationType='1'
                  // invitationId={board_id}
                  // invitationOrg={org_id}
                  chirldrenTaskChargeChange={this.chirldrenTaskChargeChange}
                />
              }
            >
              {/* 添加通知人按钮 */}

              <div
                className={indexStyles.addNoticePerson}
                style={{ marginTop: '-6px' }}
              >
                <span
                  className={`${globalStyles.authTheme} ${indexStyles.plus_icon}`}
                >
                  &#xe8fe;
                </span>
              </div>
            </Dropdown>
          </div>
        )}
      </div>
    )
  }

  render() {
    const {
      itemValue,
      processEditDatas = [],
      currentOrgAllMembers = [],
      itemKey,
      projectDetailInfoData: { data = [], board_id, org_id }
    } = this.props
    const { forms = [] } = processEditDatas[itemKey]
    const { assignee_type } = itemValue
    return (
      <div style={{ position: 'relative' }}>
        <div
          style={{ paddingBottom: '16px', borderBottom: '1px solid #e8e8e8' }}
          onClick={e => {
            e && e.stopPropagation()
          }}
        >
          <div>
            {forms.map((value, key) => {
              return (
                <div key={`${key}-${value}`}>{this.filterForm(value, key)}</div>
              )
            })}
          </div>
          <div style={{ position: 'relative' }}>
            <Dropdown
              overlayClassName={indexStyles.overlay_addTabsItem}
              overlay={this.renderFieldType()}
              getPopupContainer={
                // () => document.getElementById('addTabsItem')
                triggerNode => triggerNode.parentNode
              }
              trigger={['click']}
            >
              <Button id="addTabsItem" className={indexStyles.add_tabsItem}>
                <span
                  style={{ color: 'rgba(24,144,255,1)' }}
                  className={globalStyles.authTheme}
                >
                  &#xe782;
                </span>
                &nbsp;&nbsp;&nbsp;添加表项
              </Button>
            </Dropdown>
          </div>
        </div>
        {/* 填写人 */}
        <div
          className={indexStyles.fill_person}
          style={{ flexDirection: 'column' }}
          onClick={e => {
            e && e.stopPropagation()
          }}
        >
          <div>
            <span
              className={`${globalStyles.authTheme} ${indexStyles.label_person}`}
            >
              <span style={{ fontSize: '16px' }}>&#xe7b2;</span> 填写人&nbsp;:
            </span>
            <Radio.Group
              style={{ lineHeight: '48px' }}
              value={assignee_type}
              onChange={this.assigneeTypeChange}
            >
              <Radio value="1">流程发起人</Radio>
              <Radio value="2">指定人员</Radio>
            </Radio.Group>
          </div>
          {assignee_type == '2' && this.renderDesignatedPersonnel()}
        </div>
        {/* 更多选项 */}
        <div>
          <MoreOptionsComponent
            itemKey={itemKey}
            itemValue={itemValue}
            updateConfigureProcess={this.updateConfigureProcess}
            data={currentOrgAllMembers}
            board_id={board_id}
            org_id={org_id}
          />
        </div>
      </div>
    )
  }
}

// 步骤类型为资料收集
ConfigureStepTypeOne.defaultProps = {}

function mapStateToProps({
  publicProcessDetailModal: {
    processEditDatas = [],
    processCurrentEditStep,
    currentOrgAllMembers = []
  },
  projectDetail: {
    datas: { projectDetailInfoData = {} }
  }
}) {
  return {
    processEditDatas,
    processCurrentEditStep,
    currentOrgAllMembers,
    projectDetailInfoData
  }
}
