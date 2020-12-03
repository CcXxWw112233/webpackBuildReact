import React from 'react'
import DrawDetailInfoStyle from './DrawDetailInfo.less'
import {
  Icon,
  Menu,
  Dropdown,
  Tooltip,
  Modal,
  Checkbox,
  Card,
  Progress,
  Input,
  Button,
  message
} from 'antd'
import ShowAddMenberModal from '../../Project/ShowAddMenberModal'
import {
  MESSAGE_DURATION_TIME,
  NOT_HAS_PERMISION_COMFIRN,
  PROJECT_TEAM_BOARD_EDIT,
  PROJECT_TEAM_BOARD_MEMBER
} from '../../../../../globalset/js/constant'
import {
  checkIsHasPermissionInBoard,
  isHasOrgMemberQueryPermission
} from '../../../../../utils/businessFunction'
import NoPermissionUserCard from './../../../../../components/NoPermissionUserCard/index'
import UserCard from './../../../../../components/UserCard/index'
import { connect } from 'dva/index'
const TextArea = Input.TextArea

const detaiDescription =
  '欢迎使用聆悉，为了帮助你更好的上手使用好聆悉，我们为你提前预置了这个项目并放置一些帮助你理解每项功能特性的任务卡片。不会耽误你特别多时间，只需要抽空点开卡片并跟随里面的内容提示进行简单操作，即可上手使用。此处显示的文字为项目的介绍信息，旨在帮助参与项目的成员快速了解项目的基本概况，点击可编辑。如果使用中需要问题，可以随时联系我们进行交流或反馈：https://lingxi.di-an.com'
@connect(mapStateToProps)
export default class DrawDetailInfo extends React.Component {
  state = {
    isSoundsEvrybody: false, //confirm是否通知项目所有人
    isSoundsEvrybody_2: false, //edit是否通知项目所有人
    editDetaiDescription: false, //是否处于编辑状态
    detaiDescriptionValue: detaiDescription,
    ShowAddMenberModalVisibile: false
  }

  handleSetRoleMenuClick(props, { key }) {
    if (!checkIsHasPermissionInBoard(PROJECT_TEAM_BOARD_MEMBER)) {
      message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
      return false
    }
    const {
      datas: { projectDetailInfoData = {} }
    } = this.props.model
    const { board_id } = projectDetailInfoData //data是参与人列表
    const { user_id } = props
    if (/^role_\w+/.test(key)) {
      this.props.setMemberRoleInProject({
        board_id,
        user_id,
        role_id: key.replace('role_', '')
      }) //设置角色
      return false
    }
    switch (key) {
      case 'removeMember':
        this.confirm({ board_id, user_id })
        break
      default:
        break
    }
  }
  //出现confirm-------------start
  setIsSoundsEvrybody(e) {
    this.setState({
      isSoundsEvrybody: e.target.checked
    })
  }
  confirm(data) {
    const that = this
    Modal.confirm({
      title: '确认将他移出项目吗？',
      zIndex: 2000,
      content: (
        <div style={{ color: 'rgba(0,0,0, .8)', fontSize: 14 }}>
          <span>退出后将无法获取该项目的相关动态</span>
          {/*<div style={{marginTop:20,}}>*/}
          {/*<Checkbox style={{color:'rgba(0,0,0, .8)',fontSize: 14, }} onChange={this.setIsSoundsEvrybody.bind(this)}>通知项目所有参与人</Checkbox>*/}
          {/*</div>*/}
        </div>
      ),
      okText: '确认',
      cancelText: '取消',
      onOk() {
        that.props.removeMenbers(data)
      }
    })
  }
  //出现confirm-------------end

  //点击区域描述可编辑区域-----------start
  setEditDetaiDescriptionShow() {
    if (!checkIsHasPermissionInBoard(PROJECT_TEAM_BOARD_EDIT)) {
      message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
      return false
    }
    this.setState({
      editDetaiDescription: true
    })
  }
  setEditIsSoundsEvrybody(e) {
    this.setState({
      isSoundsEvrybody_2: e.target.checked
    })
  }
  textAreaChange(e) {
    this.setState({
      detaiDescriptionValue: e.target.value || detaiDescription
    })
    const {
      datas: { projectDetailInfoData = {} }
    } = this.props.model
    projectDetailInfoData['description'] = e.target.value
  }
  editSave(board_id, e) {
    const {
      datas: { projectDetailInfoData = {} }
    } = this.props.model

    const obj = {
      isSoundsEvrybody_2: this.state.isSoundsEvrybody_2,
      description: projectDetailInfoData['description'],
      board_id
    }
    this.props.updateProject(obj)
    this.setState({
      editDetaiDescription: false
    })
  }
  //点击区域描述可编辑区域-----------end

  //点击添加成员操作
  setShowAddMenberModalVisibile() {
    if (!checkIsHasPermissionInBoard(PROJECT_TEAM_BOARD_MEMBER)) {
      message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
      return false
    }
    this.setState({
      ShowAddMenberModalVisibile: !this.state.ShowAddMenberModalVisibile
    })
  }

  render() {
    const { editDetaiDescription, detaiDescriptionValue } = this.state
    const {
      datas: {
        projectInfoDisplay,
        isInitEntry,
        projectDetailInfoData = {},
        projectRoles = []
      }
    } = this.props.model
    let {
      board_id,
      board_name,
      data = [],
      description,
      residue_quantity,
      realize_quantity
    } = projectDetailInfoData //data是参与人列表

    data = data || []
    const avatarList = data.concat([1]) //[1,2,3,4,5,6,7,8,9]//长度再加一
    const manImageDropdown = props => {
      const {
        role_id,
        role_name = '...',
        name,
        email = '...',
        avatar,
        mobile = '...',
        user_id,
        organization = '...',
        we_chat = '...'
      } = props
      if (!isHasOrgMemberQueryPermission()) {
        return <NoPermissionUserCard avatar={avatar} full_name={role_name} />
      }
      // return (<UserCard avatar={avatar} email={email} name={name} mobile={mobile} role_name={''} />)
      return (
        <div className={DrawDetailInfoStyle.manImageDropdown}>
          <div className={DrawDetailInfoStyle.manImageDropdown_top}>
            <div className={DrawDetailInfoStyle.left}>
              {avatar ? (
                <img src={avatar} />
              ) : (
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 32,
                    backgroundColor: '#f2f2f2',
                    textAlign: 'center'
                  }}
                >
                  <Icon
                    type={'user'}
                    style={{ fontSize: 20, color: '#8c8c8c', marginTop: 9 }}
                  />
                </div>
              )}
            </div>
            <div className={DrawDetailInfoStyle.right}>
              <div className={DrawDetailInfoStyle.name}>{name || '佚名'}</div>
              <Tooltip title="该功能即将上线">
                <div className={DrawDetailInfoStyle.percent}>
                  <div style={{ width: '0' }}></div>
                  <div style={{ width: '0' }}></div>
                  <div style={{ width: '100%' }}></div>
                </div>
              </Tooltip>
            </div>
            {role_id === '3' ? (
              ''
            ) : (
              <Dropdown overlay={manOperateMenu(props)}>
                <div
                  className={DrawDetailInfoStyle.manImageDropdown_top_operate}
                >
                  <Icon type="ellipsis" theme="outlined" />
                </div>
              </Dropdown>
            )}
          </div>
          <div className={DrawDetailInfoStyle.manImageDropdown_middle}>
            <div className={DrawDetailInfoStyle.detailItem}>
              <div>职位：</div>
              <div>{role_name}</div>
            </div>
            {/*<div className={DrawDetailInfoStyle.detailItem}>*/}
            {/*<div>组织：</div>*/}
            {/*<div>{organization}</div>*/}
            {/*</div>*/}
            <div className={DrawDetailInfoStyle.detailItem}>
              <div>邮箱：</div>
              <div>{email}</div>
            </div>
            <div className={DrawDetailInfoStyle.detailItem}>
              <div>手机：</div>
              <div>{mobile}</div>
            </div>
            {/* <div className={DrawDetailInfoStyle.detailItem}>
              <div>微信：</div>
              <div>{we_chat}</div>
            </div> */}
          </div>
          {/*<div className={DrawDetailInfoStyle.manImageDropdown_bott}>*/}
          {/*<img src="" />*/}
          {/*</div>*/}
        </div>
      )
    }
    const manOperateMenu = props => {
      const { is_visitor } = props
      return (
        <Menu onClick={this.handleSetRoleMenuClick.bind(this, props)}>
          {is_visitor === '0' &&
          checkIsHasPermissionInBoard(PROJECT_TEAM_BOARD_MEMBER) ? (
            <Menu.SubMenu title="设置角色" key={'setRole'}>
              {projectRoles.map((value, key) => {
                return (
                  <Menu.Item
                    key={`role_${value.id}`}
                    style={{ textAlign: 'center', padding: 0, margin: 0 }}
                  >
                    <div className={DrawDetailInfoStyle.elseProjectMemu}>
                      {value.name}
                    </div>
                  </Menu.Item>
                )
              })}
            </Menu.SubMenu>
          ) : (
            ''
          )}

          {checkIsHasPermissionInBoard(PROJECT_TEAM_BOARD_MEMBER) && (
            <Menu.Item
              key={'removeMember'}
              style={{ textAlign: 'center', padding: 0, margin: 0 }}
            >
              <div className={DrawDetailInfoStyle.elseProjectDangerMenu}>
                移除成员
              </div>
            </Menu.Item>
          )}
        </Menu>
      )
    }
    const EditArea = (
      <div>
        <TextArea
          defaultValue={description || detaiDescriptionValue}
          autosize={true}
          className={DrawDetailInfoStyle.editTextArea}
          onChange={this.textAreaChange.bind(this)}
        />
        <div style={{ textAlign: 'right' }}>
          {/*<div>*/}
          {/*<Checkbox style={{color: 'rgba(0,0,0, .8)', fontSize: 14, marginTop: 10 }} onChange={this.setEditIsSoundsEvrybody.bind(this)}>通知项目所有参与人</Checkbox>*/}
          {/*</div>*/}
          <Button
            type={'primary'}
            style={{ fontSize: 14, marginTop: 10 }}
            onClick={this.editSave.bind(this, board_id)}
          >
            保存
          </Button>
        </div>
      </div>
    )
    return (
      <div className={DrawDetailInfoStyle.detailInfoOut}>
        <div
          className={
            projectInfoDisplay
              ? DrawDetailInfoStyle.detailInfo
              : DrawDetailInfoStyle.detailInfo_2
          }
          style={{ display: isInitEntry ? 'block' : 'none' }}
        >
          <div className={DrawDetailInfoStyle.top}>
            <div className={DrawDetailInfoStyle.topItem}>
              <div>{residue_quantity || '0'}</div>
              <div>剩余任务</div>
            </div>
            <div className={DrawDetailInfoStyle.topItem}>
              <div style={{ color: '#8c8c8c' }}>{realize_quantity || '0'}</div>
              <div>已完成</div>
            </div>
            {/*<div className={DrawDetailInfoStyle.topItem}>*/}
            {/*<div >0</div>*/}
            {/*<div>距离下一节点</div>*/}
            {/*</div>*/}
          </div>
          <div className={DrawDetailInfoStyle.manImageList}>
            {avatarList.map((value, key) => {
              if (key < avatarList.length - 1) {
                const { avatar, user_id } = value
                return (
                  <div className={DrawDetailInfoStyle.manImageItem} key={key}>
                    {/*<div className={DrawDetailInfoStyle.delete} onClick={this.confirm.bind(this, { board_id, user_id })}>*/}
                    {/*<Icon type="close" />*/}
                    {/*</div>*/}
                    <Dropdown overlay={manImageDropdown(value)}>
                      {avatar ? (
                        <img src={avatar} />
                      ) : (
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 36,
                            backgroundColor: '#f2f2f2',
                            textAlign: 'center'
                          }}
                        >
                          <Icon
                            type={'user'}
                            style={{
                              fontSize: 20,
                              color: '#8c8c8c',
                              marginTop: 9
                            }}
                          />
                        </div>
                      )}
                    </Dropdown>
                  </div>
                )
              } else {
                return (
                  checkIsHasPermissionInBoard(PROJECT_TEAM_BOARD_MEMBER) && (
                    <div
                      className={DrawDetailInfoStyle.addManImageItem}
                      key={key}
                      onClick={this.setShowAddMenberModalVisibile.bind(this)}
                    >
                      <Icon
                        type="plus"
                        style={{
                          color: '#8c8c8c',
                          fontSize: 20,
                          fontWeight: 'bold',
                          marginTop: 8
                        }}
                      />
                    </div>
                  )
                )
              }
            })}
          </div>
          {!editDetaiDescription ? (
            <div
              className={DrawDetailInfoStyle.Bottom}
              onClick={this.setEditDetaiDescriptionShow.bind(this)}
            >
              {description || detaiDescriptionValue}
            </div>
          ) : (
            EditArea
          )}
        </div>
        <ShowAddMenberModal
          {...this.props}
          board_id={board_id}
          modalVisible={this.state.ShowAddMenberModalVisibile}
          setShowAddMenberModalVisibile={this.setShowAddMenberModalVisibile.bind(
            this
          )}
        />
      </div>
    )
  }
}

function mapStateToProps({
  technological: {
    datas: { userBoardPermissions }
  }
}) {
  return {
    userBoardPermissions
  }
}
