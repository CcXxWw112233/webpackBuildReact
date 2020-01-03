import React from 'react'
import { Icon, Layout, Menu, Dropdown, Tooltip, Switch, Modal } from 'antd';
import indexStyles from './index.less'
import glabalStyles from '../../../globalset/css/globalClassName.less'
import linxiLogo from '../../../assets/library/lingxi_logo.png'
import { checkIsHasPermission, currentNounPlanFilterName, isPaymentOrgUser} from "../../../utils/businessFunction";
import {
  DASHBOARD, MEMBERS, ORG_UPMS_ORGANIZATION_EDIT, ORG_UPMS_ORGANIZATION_ROLE_CREATE,
  ORG_UPMS_ORGANIZATION_ROLE_EDIT, ORG_UPMS_ORGANIZATION_ROLE_DELETE, ORG_UPMS_ORGANIZATION_MEMBER_ADD,
  ORGANIZATION, PROJECTS, ORG_UPMS_ORGANIZATION_MEMBER_QUERY, MESSAGE_DURATION_TIME, NOT_HAS_PERMISION_COMFIRN
} from "../../../globalset/js/constant";
import Cookies from 'js-cookie'
import CreateOrganizationModal from '../components/HeaderNav/CreateOrganizationModal'
import ShowAddMenberModal from '../components/OrganizationMember/ShowAddMenberModal'
import NotificationSettingsModal from './comonent/notificationSettings/NotificationSettingsModal'
import PayUpgrade from './../components/PayUpgrade/index'
import { color_4 } from "../../../globalset/js/styles";
import { message } from "antd/lib/index";
import { connect, } from 'dva';
import hobbyImg from '@/assets/sider_left/smile.png'
import { getUsersNoticeSettingList } from '@/services/technological/notificationSetting'
import { isApiResponseOk } from "@/utils/handleResponseData";
import { organizationInviteWebJoin, commInviteWebJoin, } from '@/services/technological/index'
const { Sider } = Layout;
const { SubMenu } = Menu;
let timer;


@connect(mapStateToProps)
export default class SiderLeft extends React.Component {

  constructor(props) {
    super(props);
    const { is_simplemode = false, collapsed = true } = props;
    this.state = {
      collapsed: collapsed,
      createOrganizationVisable: false,
      ShowAddMenberModalVisibile: false, // 显示邀请组织成员的弹框
      NotificationSettingsModalVisible: false, // 是否显示通知设置的弹框, 默认为 false 不显示
      is_disabled: false, // 是否是禁用状态, 默认为true 表示禁用状态
      is_simplemode: is_simplemode,
      payUpgradeModalVisible: false,
    }
  }
  componentDidMount() {
    const { dispatch } = this.props
    dispatch({
      type: 'technological/updateDatas',
      payload: {
        is_all_org: localStorage.getItem('OrganizationId') == '0',
      }
    })
    this.getInitList()
  }

  // 获取通知设置的列表
  getInitList = () => {
    getUsersNoticeSettingList().then((res) => {
      if (isApiResponseOk(res)) {
        // console.log(res, 'sssss')
        // console.log(res, 'ssss')
      } else {
        message.error(res.message)
      }
    })
  }

  setCollapsed(collapsed) {
    if (this.state.is_simplemode) {
      this.setState({
        collapsed: false
      })
    } else {
      this.setState({
        collapsed
      })
    }

  }
  routingJump(route) {
    const { dispatch } = this.props
    dispatch({
      type: 'technological/routingJump',
      payload: {
        route
      }
    })
  }
  menuClick({ key, code }) {
    // console.log(key, 'key')
    // console.log(code, 'code')
    const { dispatch } = this.props
    dispatch({
      type: 'technological/updateDatas',
      payload: {
        naviHeadTabIndex: code
      }
    })
    let route
    switch (code) {
      case 'Workbench':
        route = 'workbench'
        break
      case 'Projects':
        route = 'project'
        break
      // case 'Shows':
      //   route='teamShow/teamList'
      // break
      case 'Case':
        window.open('https://www.di-an.com/zhichengshe')
        return
        break
      case 'Regulations':
        route = 'xczNews'
        break
      case 'InvestmentMaps':
        route = 'InvestmentMap'
        break
      default:
        break
    }
    this.routingJump(`/technological/${route}`)
  }

  //创建或加入组织
  setCreateOrgnizationOModalVisable() {
    this.setState({
      createOrganizationVisable: !this.state.createOrganizationVisable
    })
  }

  // 显示通知设置
  setNotificationSettingsModalVisible() {
    const { NotificationSettingsModalVisible } = this.state
    this.setState({
      NotificationSettingsModalVisible: !NotificationSettingsModalVisible
    })
  }

  //添加组织成员操作
  setShowAddMenberModalVisibile() {
    if (!checkIsHasPermission(ORG_UPMS_ORGANIZATION_MEMBER_ADD)) {
      message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
    }
    this.setState({
      ShowAddMenberModalVisibile: !this.state.ShowAddMenberModalVisibile
    })
  }

  addMembers(data) {

    const { invitationType, invitationId, rela_Condition } = this.props
    const temp_ids = data.users.split(",")
    const invitation_org = localStorage.getItem('OrganizationId')
    organizationInviteWebJoin({
      _organization_id: invitation_org,
      type: '11',
      users: temp_ids
    }).then(res => {
      if (res && res.code === '0') {
        commInviteWebJoin({
          id: invitation_org,
          role_id: res.data.role_id,
          type: '11',
          users: res.data.users,
          rela_condition: rela_Condition,
        }).then(res => {

        })
      }
    })

    // const { users } = data
    // const { currentSelectOrganize = {}, dispatch } = this.props
    // const { id } = currentSelectOrganize
    // dispatch({
    //   type: 'technological/inviteJoinOrganization',
    //   payload: {
    //     members: users,
    //     // org_id: id
    //   }
    // })
  }

  // 切换组织的点击事件
  handleOrgListMenuClick = (e) => {
    // console.log(e, 'ssss')
    const { key } = e
    const { is_disabled } = this.state
    const { currentUserOrganizes = [] } = this.props
    const { id } = currentUserOrganizes
    const { dispatch, is_show_org_name } = this.props
    //是否拥有查看成员入口
    const isHasMemberView = () => {
      return checkIsHasPermission(ORG_UPMS_ORGANIZATION_MEMBER_QUERY)
    }

    //是否拥有管理后台入口
    const isHasManagerBack = () => {
      let flag = false
      if (
        checkIsHasPermission(ORG_UPMS_ORGANIZATION_EDIT) ||
        checkIsHasPermission(ORG_UPMS_ORGANIZATION_ROLE_CREATE) ||
        checkIsHasPermission(ORG_UPMS_ORGANIZATION_ROLE_EDIT) ||
        checkIsHasPermission(ORG_UPMS_ORGANIZATION_ROLE_DELETE)
      ) {
        flag = true
      }
      return flag
    }

    switch (key) {
      case '24': // 匹配团队成员
        isHasMemberView() && this.routingJump('/technological/organizationMember')
        break
      case '23': // 匹配成员管理后台
        isHasManagerBack() && this.routingJump(`/organizationManager?nextpath=${window.location.hash.replace('#', '')}`)
        break
      case '22': // 匹配邀请成员加入弹框显示
        checkIsHasPermission(ORG_UPMS_ORGANIZATION_MEMBER_ADD) && this.setShowAddMenberModalVisibile()
        break
      case '20': // 匹配用户设置
        this.routingJump('/technological/accoutSet')
        break
      case 'subShowOrgName':
        // console.log('sss', 2222)
        this.handleShowAllOrg
        break
      case 'subInfoSet':
        if (!timer) {
          clearTimeout(timer)
        }
        timer = setTimeout(() => {
          this.setNotificationSettingsModalVisible()
        }, 300)

        break
      case 'subShowSimple':
        this.handleMode(1);
        break
      case '10': // 创建或加入新组织
        this.setCreateOrgnizationOModalVisable()
        break
      case '0': // 匹配全部组织
        this.setState({
          is_disabled: false
        })
        localStorage.setItem('currentSelectOrganize', JSON.stringify({}))
        dispatch({
          type: 'technological/changeCurrentOrg',
          payload: {
            org_id: '0'
          }
        })
        dispatch({
          type: 'technological/updateDatas',
          payload: {
            currentSelectOrganize: {},
            is_all_org: true,
            is_show_org_name: is_show_org_name ? true : false,
          }
        })

        // this.nextMenuClick(key)

        break
      default: // 其他组织的切换
        this.setState({
          is_disabled: true
        })
        for (let val of currentUserOrganizes) {
          if (key === val['id']) {
            localStorage.setItem('currentSelectOrganize', JSON.stringify(val))
            dispatch({
              type: 'technological/updateDatas',
              payload: {
                currentSelectOrganize: val
              }
            })
            dispatch({
              type: 'technological/changeCurrentOrg',
              payload: {
                org_id: val.id
              }
            })
            break
          }
        }
        dispatch({
          type: 'technological/updateDatas',
          payload: {
            is_all_org: false,
            is_show_org_name: is_show_org_name ? true : false
          }
        })

        // this.nextMenuClick(0)

        break
    }
  }
  //选择全组织, 默认回到工作台
  nextMenuClick(key) {
    let data = {
      key: key,
      code: 'Workbench'
    }
    this.menuClick(data)
  }

  //设置全局搜索
  setGlobalSearchModalVisible() {
    const { dispatch } = this.props
    dispatch({
      type: 'globalSearch/updateDatas',
      payload: {
        globalSearchModalVisible: true
      }
    })
  }

  // 退出登录的操作
  logout(e) {
    e.stopPropagation()
    const { dispatch } = this.props
    Modal.confirm({
      title: '确定退出登录？',
      okText: '确认',
      zIndex: 2000,
      onOk() {
        dispatch({
          type: 'technological/logout',
          payload: {

          }
        })
      },
      cancelText: '取消',
    });
  }

  openPayUpgradeModal = (e) => {
    e.stopPropagation();
    this.setState({
      payUpgradeModalVisible: true
    });
   }

   setPayUpgradeModalVisible = (visible) => {
    this.setState({
      payUpgradeModalVisible: visible
    });
   }

  // 是否显示全部组织
  handleShowAllOrg(checked) {
    const { dispatch, is_show_org_name, is_all_org } = this.props
    const { is_disabled } = this.state
    dispatch({
      type: 'technological/updateDatas',
      payload: {
        is_show_org_name: !is_show_org_name
      }
    })
    dispatch({
      type: 'technological/getSetShowOrgName',
      payload: {
        preference_show_org_name: is_all_org && checked ? '1' : '0'
      }
    })
  }

  // 是否显示极简模式
  handleMode(model) {
    const { dispatch } = this.props
    dispatch({
      type: 'technological/setShowSimpleModel',
      payload: {
        is_simple_model: model
      }
    })
    // 需要将普通模式的侧边栏状态更新
    dispatch({
      type: 'technological/updateDatas',
      payload: {
        siderRightCollapsed: false
      }
    })
  }


  render() {
    const { menuList = [], naviHeadTabIndex = {}, currentUserOrganizes = [], currentSelectOrganize = {}, is_show_org_name, is_all_org } = this.props //currentUserOrganizes currentSelectOrganize组织列表和当前组织
    let temp = []
    menuList.forEach((item) => {
      if (item.status === '1') {
        temp.push(item)
      }
    })
    let res = temp.reduce((r, c) => {
      let _c
      switch (c.name) {
        case '优秀案例':
          _c = { ...c, theme: '&#xe65a;' }
          break
        case '政策法规':
          _c = { ...c, theme: '&#xe6c9;' }
          break
        // case '我的展示':
        //   _c = {...c, theme: '&#xe60b;'}
        // break
        case '投资地图':
          _c = { ...c, theme: '&#xe676;' }
        default:
          break
      }
      return [
        ...r,
        _c
      ]
    }, [])

    const { collapsed, is_disabled } = this.state

    const navArray = [
      {
        theme: '&#xe6f7;',
        name: currentNounPlanFilterName(DASHBOARD),
        code: 'Workbench'
      },
      {
        theme: '&#xe60a;',
        name: currentNounPlanFilterName(PROJECTS),
        code: 'Projects'
      },
      ...res
    ]
    const removeEmptyArrayEle = (arr) => {
      for (var i = 0; i < arr.length; i++) {
        if (arr[i] == undefined) {
          arr.splice(i, 1);
          i = i - 1; // i - 1 ,因为空元素在数组下标 2 位置，删除空之后，后面的元素要向前补位，
          // 这样才能真正去掉空元素,觉得这句可以删掉的连续为空试试，然后思考其中逻辑
        }
      }
      return arr;
    };

    // 去除空数组
    let new_arr = removeEmptyArrayEle(navArray)

    const { current_org = {}, name, avatar, user_set = {} } = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : {}
    const { is_simple_model } = user_set
    // console.log(is_simple_model, 'sssssssss')
    const { identity_type } = current_org //是否访客 1不是 0是
    const orgnizationName = currentSelectOrganize.name || currentNounPlanFilterName(ORGANIZATION)
    const { logo, id } = currentSelectOrganize

    //是否拥有查看成员入口
    const isHasMemberView = () => {
      return checkIsHasPermission(ORG_UPMS_ORGANIZATION_MEMBER_QUERY)
    }

    //是否拥有管理后台入口
    const isHasManagerBack = () => {
      let flag = false
      if (
        checkIsHasPermission(ORG_UPMS_ORGANIZATION_EDIT) ||
        checkIsHasPermission(ORG_UPMS_ORGANIZATION_ROLE_CREATE) ||
        checkIsHasPermission(ORG_UPMS_ORGANIZATION_ROLE_EDIT) ||
        checkIsHasPermission(ORG_UPMS_ORGANIZATION_ROLE_DELETE)
      ) {
        flag = true
      }
      return flag
    }

    const orgListMenu = (
      <div className={`${glabalStyles.global_card} ${indexStyles.menuWrapper}`}>
        <Menu onClick={this.handleOrgListMenuClick.bind(this)} selectable={true} style={{ marginTop: -20 }} mode={!collapsed ? 'vertical' : 'inline'} >

          {
            identity_type == '1' && isHasMemberView() && (
              <Menu.Item key="24">
                <div className={indexStyles.default_select_setting}>
                  <div className={indexStyles.team}>
                    <div className={`${glabalStyles.authTheme} ${indexStyles.team_icon}`}>&#xe7af;</div>
                    <span className={indexStyles.middle_text}>团队成员</span>
                  </div>
                </div>
              </Menu.Item>
            )
          }

          {
            identity_type == '1' && isHasManagerBack() && (
              <Menu.Item key="23">
                <div className={indexStyles.default_select_setting}>
                  <div className={indexStyles.bank}>
                    <div className={`${glabalStyles.authTheme} ${indexStyles.bank_icon}`}>&#xe719;</div>
                    <span className={indexStyles.middle_text}>组织管理后台</span>
                    <div className={indexStyles.payUpgrade} onClick={(e)=>{this.openPayUpgradeModal(e)}} >升级</div>
                  </div>
                </div>
              </Menu.Item>
            )
          }

          {
            identity_type == '1' && checkIsHasPermission(ORG_UPMS_ORGANIZATION_MEMBER_ADD) && (
              <Menu.Item key="22">
                <div className={indexStyles.default_select_setting}>
                  <div className={indexStyles.addUsers}>
                    <div className={`${glabalStyles.authTheme} ${indexStyles.add_icon}`}>&#xe7ae;</div>
                    <span className={indexStyles.middle_text}>邀请成员加入</span>
                  </div>
                </div>
              </Menu.Item>
            )
          }

          {identity_type == '1' && <Menu.Divider />}

          <Menu.Item key="20">
            <div className={indexStyles.default_select_setting}>
              <div className={indexStyles.account_setting}>
                {
                  avatar ? <span className={indexStyles.left_img}><img src={avatar} className={indexStyles.avartarImg} /></span> : ''
                }
                <span className={indexStyles.middle_text}>账户设置</span>
                <Tooltip placement="top" title="退出登录">
                  <div
                    onClick={(e) => { this.logout(e) }}
                    className={`${glabalStyles.authTheme} ${indexStyles.layout_icon}`}>&#xe78c;</div>
                </Tooltip>
              </div>
            </div>
          </Menu.Item>

          <SubMenu
            key="21"
            title={
              <div id="default_select_setting" className={indexStyles.default_select_setting}>
                <div className={indexStyles.hobby}>
                  <span className={`${glabalStyles.authTheme} ${indexStyles.hobby_icon}`}>&#xe783;</span>
                  <span className={indexStyles.middle_text}>偏好设置</span>
                  {/* <span><Icon type="right" /></span> */}
                </div>
              </div>
            }
          >
            {/* <Menu.Item disabled={!is_show_org_name || is_disabled} key="subShowOrgName"> */}
            <Menu.Item key="subShowOrgName">
              <span>显示组织名称
                  <Switch
                  style={{ display: 'inline-block', marginLeft: 8 }}
                  onClick={(checked) => { this.handleShowAllOrg(checked) }}
                  checked={is_show_org_name}
                ></Switch>
                {/* 这是控制禁用的状态逻辑(保留) */}
                {/* {
                      is_show_org_name && is_all_org ? (
                        <Switch
                          disabled={is_disabled}
                          style={{ display: 'inline-block', marginLeft: 8 }}
                          onClick={ (checked) => { this.handleShowAllOrg(checked) } }
                          defaultChecked={true}
                        ></Switch>
                      ) : (
                        <Switch
                          disabled={is_disabled}
                          style={{ display: 'inline-block', marginLeft: 8 }}
                          onClick={ (checked) => { this.handleShowAllOrg(checked) } }
                          defaultChecked={false}
                        ></Switch>
                      )
                    }  */}
              </span>
            </Menu.Item>
            <Menu.Item key="subInfoSet">
              <span>通知设置</span>
            </Menu.Item>
            <Menu.Item key="subShowSimple">
              <span>
                切换极简模式
              </span>
            </Menu.Item>
          </SubMenu>

          <Menu.Item key="10" >
            <div className={indexStyles.itemDiv} style={{ color: color_4 }}>
              <Icon type="plus-circle" theme="outlined" style={{ margin: 0, fontSize: 16 }} /> 创建或加入新{currentNounPlanFilterName(ORGANIZATION)}
            </div>
          </Menu.Item>

          <Menu.Divider />
        </Menu>
        <Menu
          className={`${glabalStyles.global_vertical_scrollbar}`}
          style={{ maxHeight: 200, overflowY: 'auto' }}
          selectedKeys={id ? [id] : ['0']}
          onClick={this.handleOrgListMenuClick.bind(this)} selectable={true} mode="vertical" >
          <Menu.Item key="0" className={indexStyles.org_name}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <img src={linxiLogo} className={indexStyles.org_img} />
              <span style={{ maxWidth: 100, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>全部组织</span>
            </div>
          </Menu.Item>
          {currentUserOrganizes.map((value, key) => {
            const { name, id, identity_type, logo } = value;
            let disabled = !isPaymentOrgUser(id);//是否付费组织
            return (
              <Menu.Item key={id} className={indexStyles.org_name} disabled={disabled}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <img src={logo || linxiLogo} className={indexStyles.org_img} />
                  <span style={{ maxWidth: 100, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{name}</span>
                </div>
                {identity_type == '0' ? (<span className={indexStyles.middle_bott} style={{ display: 'inline-block', backgroundColor: '#e5e5e5', padding: '0 4px', borderRadius: 40, marginLeft: 6, position: 'absolute', right: 34, top: 12 }}>访客</span>) : ('')}
              </Menu.Item>
            )
          })}
        </Menu>
      </div>
    )

    // //是否拥有管理后台入口
    // const isHasManagerBack = () => {
    //   let flag = false
    //   if(
    //     checkIsHasPermission(ORG_UPMS_ORGANIZATION_EDIT) ||
    //     checkIsHasPermission(ORG_UPMS_ORGANIZATION_ROLE_CREATE) ||
    //     checkIsHasPermission(ORG_UPMS_ORGANIZATION_ROLE_EDIT) ||
    //     checkIsHasPermission(ORG_UPMS_ORGANIZATION_ROLE_DELETE)
    //   ) {
    //     flag = true
    //   }
    //   return flag
    // }

    // //是否拥有查看成员入口
    // const isHasMemberView = () => {
    //   return checkIsHasPermission(ORG_UPMS_ORGANIZATION_MEMBER_QUERY)
    // }
    return (
      <Sider
        id={'siderLeft'}
        trigger={null}
        collapsible={true}
        onMouseEnter={this.setCollapsed.bind(this, false)}
        onMouseLeave={this.setCollapsed.bind(this, true)}
        className={`${indexStyles.siderLeft} ${collapsed ? indexStyles.siderLeft_state_min : indexStyles.siderLeft_state_exp}`} collapsedWidth={64} width={260} theme={'light'} collapsed={collapsed}
      >

        <Dropdown getPopupContainer={() => document.getElementById('siderLeft')} overlay={orgListMenu}>
          <div className={indexStyles.contain_1} style={{ position: 'relative' }}>
            <div className={indexStyles.left}>
              <img src={logo || linxiLogo} className={indexStyles.left_img} />
            </div>
            <div className={indexStyles.middle}>
              <div className={indexStyles.username}>
                {name}
              </div>
              {
                is_show_org_name && (
                  <div className={indexStyles.middle_top}>
                    {orgnizationName}
                  </div>
                )
              }

            </div>
            {
              identity_type == '0' && collapsed == false ? (
                <div className={indexStyles.middle_bott} style={{ position: 'absolute', top: 16, right: 30 }}>
                  访客
                  </div>
              ) : ('')
            }
          </div>
        </Dropdown>


        <div className={indexStyles.contain_2}>
          <div className={`${indexStyles.navItem}`} onClick={this.setGlobalSearchModalVisible.bind(this)} >
            <div className={`${glabalStyles.authTheme} ${indexStyles.navItem_left}`}>&#xe611;</div>
            <div className={indexStyles.navItem_right}> 搜索</div>
          </div>
        </div>

        <div className={indexStyles.contain_2}>
          {new_arr.map((value, key) => {
            const { theme, name, code } = value
            return (
              <div key={key} className={`${indexStyles.navItem} ${code == naviHeadTabIndex ? indexStyles.navItemSelected : ''}`} onClick={this.menuClick.bind(this, { key, code })}>
                <div className={`${glabalStyles.authTheme} ${indexStyles.navItem_left}`} dangerouslySetInnerHTML={{ __html: theme }}></div>
                <div className={indexStyles.navItem_right}> {name}</div>
              </div>
            )
          })}
        </div>

        <CreateOrganizationModal dispatch={this.props.dispatch} createOrganizationVisable={this.state.createOrganizationVisable} setCreateOrgnizationOModalVisable={this.setCreateOrgnizationOModalVisable.bind(this)} />

        <ShowAddMenberModal dispatch={this.props.dispatch} addMembers={this.addMembers.bind(this)} modalVisible={this.state.ShowAddMenberModalVisibile} setShowAddMenberModalVisibile={this.setShowAddMenberModalVisibile.bind(this)} invitationId={localStorage.getItem('OrganizationId')} invitationType='11' invitationOrg={localStorage.getItem('OrganizationId')} />

        {this.state.NotificationSettingsModalVisible && (
          <NotificationSettingsModal notificationSettingsModalVisible={this.state.NotificationSettingsModalVisible} setNotificationSettingsModalVisible={this.setNotificationSettingsModalVisible.bind(this)} />
        )}
        {
          this.state.payUpgradeModalVisible && <PayUpgrade setPayUpgradeModalVisible={this.setPayUpgradeModalVisible}/>
        }

      </Sider>

    )
  }
}
//  建立一个从（外部的）state对象到（UI 组件的）props对象的映射关系
function mapStateToProps({ technological: { datas: {
  menuList = [], naviHeadTabIndex = {}, currentUserOrganizes = [], currentSelectOrganize = {}, is_show_org_name, is_all_org
} } }) {
  return { menuList, naviHeadTabIndex, currentUserOrganizes, currentSelectOrganize, is_show_org_name, is_all_org }
}
