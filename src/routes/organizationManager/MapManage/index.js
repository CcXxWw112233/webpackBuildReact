import React from 'react'
import { Icon, Dropdown, Menu, Tooltip, Modal, message } from 'antd'
import indexStyles from './index.less'
import { connect } from 'dva'
import {
  MESSAGE_DURATION_TIME,
  NOT_HAS_PERMISION_COMFIRN,
  PROJECT_TEAM_BOARD_EDIT,
  PROJECT_TEAM_BOARD_MEMBER
} from '@/globalset/js/constant'
import {
  checkIsHasPermissionInBoard,
  isHasOrgMemberQueryPermission
} from '../../../utils/businessFunction'
import ShowAddMenberModal from '@/routes/Technological/components/Project/ShowAddMenberModal'
import iconSrc from '@/assets/organizationManager/crown/crown@2x.png'
const getEffectOrReducerByName = name => `organizationManager/${name}`

@connect(
  ({
    MapManage = {},
    technological,
    organizationManager: {
      datas: { management_Array = [] }
    }
  }) => {
    const { userBoardPermissions } = technological.datas
    return {
      MapManage,
      management_Array,
      technological,
      userBoardPermissions
    }
  }
)
export default class MapManage extends React.Component {
  state = {
    organization_id: localStorage.getItem('OrganizationId')
  }

  constructor(props) {
    super(props)
  }

  componentDidMount() {}

  componentWillReceiveProps() {}

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

  confirm(data) {
    const that = this
    that.investmentMapDeleteAdministrators(data.user_id)
    message.info('移除成功', MESSAGE_DURATION_TIME)
  }

  //点击添加成员操作
  setShowAddMenberModalVisibile() {
    const { technological } = this.props
    if (!technological) {
      message.info('当前数据异常, 请先回到首页!')
      return
    }
    if (!checkIsHasPermissionInBoard(PROJECT_TEAM_BOARD_MEMBER)) {
      message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
      return false
    }
    this.setState({
      ShowAddMenberModalVisibile: !this.state.ShowAddMenberModalVisibile
    })
  }

  investmentMapAddAdministrators(data) {
    const { organization_id } = this.state
    const { dispatch } = this.props

    let str = data.users
    var userArr = new Array()
    userArr = str.split(',')

    dispatch({
      type: getEffectOrReducerByName('investmentMapAddAdministrators'),
      payload: {
        _organization_id: organization_id,
        user_ids: userArr
      }
    })
  }

  //删除
  investmentMapDeleteAdministrators(user_id) {
    const { organization_id } = this.state
    const { dispatch } = this.props
    const userArr = []
    let temp = []
    userArr.push(user_id)
    temp = temp.concat(...userArr)
    dispatch({
      type: getEffectOrReducerByName('investmentMapDeleteAdministrators'),
      payload: {
        _organization_id: organization_id,
        user_ids: temp
      }
    })
  }
  addMenbersInProject = data => {
    this.investmentMapAddAdministrators(data)
  }
  render() {
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

    const managementArr = this.props.management_Array
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
      // if(!isHasOrgMemberQueryPermission()) {
      //   return <NoPermissionUserCard avatar={avatar} full_name={role_name} />
      // }
      return (
        <div className={indexStyles.manImageDropdown}>
          <div className={indexStyles.manImageDropdown_top}>
            <div className={indexStyles.left}>
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
            <div className={indexStyles.right}>
              <div className={indexStyles.name}>{name || '佚名'}</div>
              <Tooltip title="该功能即将上线">
                <div className={indexStyles.percent}>
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
                <div className={indexStyles.manImageDropdown_top_operate}>
                  <Icon type="ellipsis" theme="outlined" />
                </div>
              </Dropdown>
            )}
          </div>
          <div className={indexStyles.manImageDropdown_middle}>
            <div className={indexStyles.detailItem}>
              <div>职位：</div>
              <div>{role_name}</div>
            </div>
            {/*<div className={DrawDetailInfoStyle.detailItem}>*/}
            {/*<div>组织：</div>*/}
            {/*<div>{organization}</div>*/}
            {/*</div>*/}
            <div className={indexStyles.detailItem}>
              <div>邮箱：</div>
              <div>{email}</div>
            </div>
            <div className={indexStyles.detailItem}>
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
            <Menu.SubMenu key={'setRole'}>
              {projectRoles.map((value, key) => {
                return (
                  <Menu.Item
                    key={`role_${value.id}`}
                    style={{ textAlign: 'center', padding: 0, margin: 0 }}
                  >
                    <div className={indexStyles.elseProjectMemu}>
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
              <div className={indexStyles.elseProjectDangerMenu}>移除职员</div>
            </Menu.Item>
          )}
        </Menu>
      )
    }
    // const titleText = currentNounPlanFilterName(MAP_ADMIN)
    const titleText = '地图管理'
    return (
      <div>
        <div className={indexStyles.tips_Style}>
          <img src={iconSrc} className={indexStyles.icon_Style} />
          <span className={indexStyles.title_Style}>地图后台管理员</span>
        </div>
        <div className={indexStyles.itemStyle}>
          <div
            className={indexStyles.plusBtn}
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
          <div className={indexStyles.itemList}>
            {managementArr &&
              managementArr.map((value, key) => {
                const { avatar } = value
                return (
                  <div className={indexStyles.manImageItem} key={key}>
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
                              marginTop: 8
                            }}
                          />
                        </div>
                      )}
                    </Dropdown>
                  </div>
                )
              })}
          </div>
        </div>
        <ShowAddMenberModal
          title={titleText}
          _organization_id={localStorage.getItem('OrganizationId')}
          addMenbersInProject={this.addMenbersInProject}
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
