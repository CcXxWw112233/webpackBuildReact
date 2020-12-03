import React from 'react'
import indexStyle from './index.less'
import { Link } from 'dva/router'
import {
  Input,
  Icon,
  Menu,
  Dropdown,
  Tooltip,
  Tabs,
  Card,
  Modal,
  Button,
  message
} from 'antd'
import Cookies from 'js-cookie'
import CreateOrganizationModal from './CreateOrganizationModal'
import { color_4 } from '../../../../globalset/js/styles'
import ShowAddMenberModal from '../OrganizationMember/ShowAddMenberModal'
import {
  MESSAGE_DURATION_TIME,
  NOT_HAS_PERMISION_COMFIRN,
  ORG_UPMS_ORGANIZATION_GROUP,
  ORG_UPMS_ORGANIZATION_MEMBER_ADD,
  ORG_UPMS_ORGANIZATION_MEMBER_QUERY
} from '../../../../globalset/js/constant'
import { checkIsHasPermission } from '../../../../utils/businessFunction'

import {
  ORGANIZATION,
  TASKS,
  FLOWS,
  DASHBOARD,
  PROJECTS,
  FILES,
  MEMBERS,
  CATCH_UP
} from '../../../../globalset/js/constant'
import { currentNounPlanFilterName } from '../../../../utils/businessFunction'

const TabPane = Tabs.TabPane
const SubMenu = Menu.SubMenu
@connect(mapStateToProps)
export default class HeaderNav extends React.Component {
  constructor(props) {
    super(props)
  }
  state = {
    menuVisible: false,
    createOrganizationVisable: false,
    ShowAddMenberModalVisibile: false
  }

  //蓝色按钮下拉菜单
  handleMenuClick = e => {
    const { key } = e
    this.setState({ menuVisible: false })
    switch (key) {
      case '1':
        break
      case '2':
        if (!checkIsHasPermission(ORG_UPMS_ORGANIZATION_MEMBER_QUERY)) {
          message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
          return false
        }
        this.props.routingJump('/technological/organizationMember')
        this.props.updateDatas({
          naviHeadTabIndex: '10'
        })
        break
      case '3':
        // console.log(window.location.hash)
        this.props.routingJump(
          `/organization?nextpath=${window.location.hash.replace('#', '')}`
        ) //目标页面的返回按钮返回的路劲
        this.props.updateDatas({
          naviHeadTabIndex: '10'
        })
        break
      case '4':
        if (!checkIsHasPermission(ORG_UPMS_ORGANIZATION_MEMBER_ADD)) {
          message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
          return false
        }
        this.setShowAddMenberModalVisibile()
        break
      case '5':
        break
      case '6':
        this.props.routingJump('/technological/accoutSet')
        this.props.updateDatas({
          naviHeadTabIndex: '10'
        })
        break
      case '7':
        break
      case '8':
        break
      case '9':
        break
      case '10':
        //创建组织的弹窗打开
        this.setCreateOrgnizationOModalVisable()
        break
      //这里是选择组织
      default:
        const {
          datas: { currentUserOrganizes = [] }
        } = this.props.model
        for (let val of currentUserOrganizes) {
          if (key === val['id']) {
            Cookies.set('org_id', val.id, { expires: 30, path: '' })
            localStorage.setItem('currentSelectOrganize', JSON.stringify(val))
            this.props.updateDatas({ currentSelectOrganize: val })
            this.props.changeCurrentOrg({ org_id: val.id })
            break
          }
        }
        break
    }
  }
  //下拉菜单显示状态改变
  handleVisibleChange = flag => {
    this.setState({ menuVisible: flag })
  }
  //tab
  tabItemClick = key => {
    let route
    switch (key) {
      case '1':
        route = 'newsDynamic'
        break
      case '2':
        route = 'workbench'
        break
      case '3':
        route = 'project'
        break
      case '4':
        this.props.updateDatas({
          naviHeadTabIndex: '4'
        })
        return false
        break
      case '5':
        this.props.routingJump('/technological/teamShow/teamList')
        return false
        break
      default:
        break
    }
    this.props.updateDatas({
      naviHeadTabIndex: key
    })
    this.props.routingJump(`/technological/${route}`)
  }
  logout(e) {
    e.stopPropagation()
    const that = this
    Modal.confirm({
      title: '确定退出登录？',
      okText: '确认',
      zIndex: 2000,
      onOk: that.props.logout,
      cancelText: '取消'
    })
  }

  //创建或加入组织
  setCreateOrgnizationOModalVisable() {
    this.setState({
      createOrganizationVisable: !this.state.createOrganizationVisable
    })
  }
  //添加组织成员操作
  setShowAddMenberModalVisibile() {
    this.setState({
      ShowAddMenberModalVisibile: !this.state.ShowAddMenberModalVisibile
    })
  }
  addMembers(data) {
    const { users } = data
    const { datas = {} } = this.props.model
    const { currentSelectOrganize = {} } = datas
    const { id } = currentSelectOrganize
    this.props.inviteJoinOrganization({
      members: users
      // org_id: id
    })
  }

  // 托盘
  elseOperateMenuClick({ key }) {
    switch (key) {
      case '1':
        window.open('https://www.di-an.com/zhichengshe')
        // this.props.routingJump('/teamShow/teamList')
        break
      case '2':
        window.open('https://www.di-an.com/xiaocezhi')
        // this.props.routingJump('/teamShow/teamList')
        break
      default:
        break
    }
  }
  render() {
    const { datas = {} } = this.props.model
    const {
      userInfo = {},
      currentUserOrganizes = [],
      currentSelectOrganize = {}
    } = datas //currentUserOrganizes currentSelectOrganize组织列表和当前组织
    const {
      aboutMe,
      avatar,
      createTime,
      email,
      full_name,
      id,
      lastLoginTime,
      mobile,
      current_org = {},
      phone,
      qq,
      status,
      updateTime,
      username,
      wechat
    } = localStorage.getItem('userInfo')
      ? JSON.parse(localStorage.getItem('userInfo'))
      : {}
    const { identity_type } = current_org //是否访客 1不是 0是
    const orgnizationName =
      currentSelectOrganize.name || currentNounPlanFilterName(ORGANIZATION)
    const { logo } = currentSelectOrganize
    const userInfoMenu = (
      <Card className={indexStyle.menuDiv}>
        <div className={indexStyle.triangle}></div>
        <Menu onClick={this.handleMenuClick.bind(this)} selectable={false}>
          <SubMenu
            key="sub"
            title={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div
                  style={{
                    flex: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontSize: 16,
                    color: '#000'
                  }}
                >
                  {orgnizationName}
                </div>
                {identity_type !== '1' ? (
                  <div
                    style={{
                      padding: '0 4px',
                      fontSize: 12,
                      height: 24,
                      lineHeight: '24px',
                      backgroundColor: '#f5f5f5',
                      borderRadius: 24,
                      margin: '0 16px 0 4px'
                    }}
                  >
                    访客
                  </div>
                ) : (
                  ''
                )}
              </div>
            }
          >
            {currentUserOrganizes.map((value, key) => {
              const { name, id } = value
              return (
                <Menu.Item
                  key={id}
                  style={{ padding: 0, margin: 0, color: '#595959' }}
                >
                  <div
                    className={indexStyle.itemDiv}
                    style={{ padding: '0 16px' }}
                  >
                    {name}
                  </div>
                </Menu.Item>
              )
            })}
            <Menu.Item
              key="10"
              style={{ padding: 0, margin: 0, color: '#595959' }}
            >
              <div
                className={indexStyle.itemDiv}
                style={{ padding: '0 16px', color: color_4 }}
              >
                <Icon
                  type="plus-circle"
                  theme="outlined"
                  style={{ margin: 0, fontSize: 16 }}
                />{' '}
                创建或加入新{currentNounPlanFilterName(ORGANIZATION)}
              </div>
            </Menu.Item>
          </SubMenu>
          <Menu.Divider key="none_1" />
          {currentUserOrganizes.length && identity_type == '1' ? (
            <Menu.Item key="2" style={{ padding: 0, margin: 0 }}>
              <div className={indexStyle.itemDiv}>
                <span className={indexStyle.specificalItem}>
                  <Icon type="team" />
                  <span className={indexStyle.specificalItemText}>
                    {currentNounPlanFilterName(MEMBERS)}
                  </span>
                </span>
              </div>
            </Menu.Item>
          ) : (
            ''
          )}
          {currentUserOrganizes.length && identity_type == '1' ? (
            <Menu.Item key="3" style={{ padding: 0, margin: 0 }}>
              <div className={indexStyle.itemDiv}>
                <span className={indexStyle.specificalItem}>
                  <Icon type="home" />
                  <span className={indexStyle.specificalItemText}>
                    {currentNounPlanFilterName(ORGANIZATION)}管理后台
                  </span>
                </span>
              </div>
            </Menu.Item>
          ) : (
            ''
          )}

          {currentUserOrganizes.length && identity_type == '1' ? (
            <Menu.Item key="4" style={{ padding: 0, margin: 0 }}>
              <div className={indexStyle.itemDiv}>
                <span className={indexStyle.specificalItem}>
                  <Icon type="user-add" />
                  <span className={indexStyle.specificalItemText}>
                    邀请{currentNounPlanFilterName(MEMBERS)}加入
                  </span>
                </span>
              </div>
            </Menu.Item>
          ) : (
            ''
          )}

          <Menu.Item key="5" style={{ padding: 0, margin: 0 }}>
            <Tooltip placement="topLeft" title={'即将上线'}>
              <div className={indexStyle.itemDiv}>
                <span>
                  <Icon type="sound" />
                  通知设置
                </span>
              </div>
            </Tooltip>
          </Menu.Item>
          {/*onClick={this.routeingJump.bind(this,'/technological/accoutSet')}*/}
          <Menu.Item key="6" style={{ padding: 0, margin: 0 }}>
            <div className={indexStyle.itemDiv}>
              <span className={indexStyle.specificalItem}>
                <Icon type="schedule" />
                <span className={indexStyle.specificalItemText}>账户设置</span>
              </span>
            </div>
          </Menu.Item>
          <Menu.Divider
            key="none_2"
            style={{ height: 0, padding: 0, margin: 0 }}
          />
          <Menu.Item key="7" style={{ height: 64, padding: 0, margin: 0 }}>
            <div
              className={indexStyle.itemDiv_2}
              onClick={() => {
                this.props.routingJump('/technological/accoutSet')
              }}
            >
              <div className={indexStyle.avatar}>
                {avatar ? (
                  <img src={avatar} alt="" />
                ) : (
                  <Icon
                    type="user"
                    style={{
                      fontSize: 28,
                      color: '#ffffff',
                      display: 'inline-block',
                      margin: '0 auto',
                      marginTop: 6
                    }}
                  />
                )}
              </div>
              <div className={indexStyle.description}>
                <Tooltip placement="topRight" title={full_name}>
                  <p>{full_name || mobile || email}</p>
                </Tooltip>
                <Tooltip placement="topLeft" title={email}>
                  <p>{email || mobile}</p>
                </Tooltip>
              </div>
              <div style={{ marginLeft: 14 }}>
                <Icon
                  type="login"
                  style={{ fontSize: 18 }}
                  onClick={this.logout.bind(this)}
                />
              </div>
            </div>
          </Menu.Item>
        </Menu>
      </Card>
    )
    // const elseOperateMenu = (
    //   <Card  className={indexStyle.menuDiv} style={{margin: 0}}>
    //     <div className={indexStyle.triangle} style={{left: '50%',marginLeft: -8}} ></div>
    //     <Menu onClick={this.elseOperateMenuClick.bind(this)} selectable={false} >
    //       <Menu.Item key="1" style={{padding:0,margin: 0}}>
    //         <div className={indexStyle.itemDiv}>
    //          <span  className={indexStyle.specificalItem}><span className={indexStyle.specificalItemText}>知城社</span></span>
    //         </div>
    //       </Menu.Item>
    //       <Menu.Item key="2" style={{padding:0,margin: 0}}>
    //         <div className={indexStyle.itemDiv}>
    //           <span  className={indexStyle.specificalItem}><span className={indexStyle.specificalItemText}>晓策志</span></span>
    //         </div>
    //       </Menu.Item>
    //     </Menu>
    //   </Card>
    // )
    const elseOperateMenu = (
      <Menu onClick={this.elseOperateMenuClick.bind(this)} selectable={false}>
        <Menu.Item key="1">知城社</Menu.Item>
        <Menu.Item key="2">晓策志</Menu.Item>
      </Menu>
    )

    const {
      datas: { naviHeadTabIndex }
    } = this.props.model

    return (
      <div>
        <div className={indexStyle.outInner}></div>
        <div className={indexStyle.out}>
          <div className={indexStyle.out_left}>
            <Dropdown
              overlay={userInfoMenu}
              onVisibleChange={this.handleVisibleChange}
              visible={this.state.menuVisible}
            >
              {logo ? (
                <img src={logo} />
              ) : (
                <div className={indexStyle.out_left_left}>
                  {orgnizationName.substring(0, 1)}
                </div>
              )}
            </Dropdown>
            <div className={indexStyle.out_left_right}>
              <span
                className={
                  naviHeadTabIndex === '1' ? indexStyle.tableChoose : ''
                }
                onClick={this.tabItemClick.bind(this, '1')}
              >
                {currentNounPlanFilterName(CATCH_UP)}
              </span>
              <span
                className={
                  naviHeadTabIndex === '2' ? indexStyle.tableChoose : ''
                }
                onClick={this.tabItemClick.bind(this, '2')}
              >
                {currentNounPlanFilterName(DASHBOARD)}
              </span>
              <span
                className={
                  naviHeadTabIndex === '3' ? indexStyle.tableChoose : ''
                }
                onClick={this.tabItemClick.bind(this, '3')}
              >
                {currentNounPlanFilterName(PROJECTS)}
              </span>
              <Dropdown overlay={elseOperateMenu} placement={'bottomCenter'}>
                <span
                  className={
                    naviHeadTabIndex === '4' ? indexStyle.tableChoose : ''
                  }
                  onClick={this.tabItemClick.bind(this, '4')}
                >
                  资讯
                </span>
              </Dropdown>
              <span
                className={
                  naviHeadTabIndex === '5' ? indexStyle.tableChoose : ''
                }
                onClick={this.tabItemClick.bind(this, '5')}
              >
                我的展示
              </span>

              {/*{currentUserOrganizes.length ? (*/}
              {/*<Dropdown overlay={elseOperateMenu} placement={'bottomCenter'}>*/}
              {/*<span ><Icon type="appstore" style={{fontSize: 16,color: '#262626'}}/></span>*/}
              {/*</Dropdown>*/}
              {/*) : ('')}*/}
            </div>
          </div>
          <div className={indexStyle.out_right}>
            <Input
              placeholder="搜索"
              className={indexStyle.searchInput}
              // style={{height:40, width: 400,fontSize: 16,marginRight: 24}}
              prefix={
                <Icon
                  type="search"
                  style={{ color: 'rgba(0,0,0,.25)', fontSize: 16 }}
                />
              }
            />
            <div className={indexStyle.add}>
              <Icon
                type="plus"
                style={{ fontSize: 20, color: '#ffffff', fontWeight: 'bold' }}
              />
            </div>
          </div>
        </div>
        <CreateOrganizationModal
          {...this.props}
          createOrganizationVisable={this.state.createOrganizationVisable}
          setCreateOrgnizationOModalVisable={this.setCreateOrgnizationOModalVisable.bind(
            this
          )}
        />
        <ShowAddMenberModal
          {...this.props}
          addMembers={this.addMembers.bind(this)}
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
    datas: { userOrgPermissions }
  }
}) {
  return {
    userOrgPermissions
  }
}
