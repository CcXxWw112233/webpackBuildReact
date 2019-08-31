import React, { Component } from 'react'
import indexStyles from './index.less'
import { Tooltip, Modal, Menu, Switch, Icon } from 'antd';
import linxiLogo from '@/assets/library/lingxi_logo.png'
import globalStyles from '@/globalset/css/globalClassName.less'
import { connect } from 'dva';
import { checkIsHasPermission, currentNounPlanFilterName } from "@/utils/businessFunction";
import {
    DASHBOARD, MEMBERS, ORG_UPMS_ORGANIZATION_EDIT, ORG_UPMS_ORGANIZATION_ROLE_CREATE,
    ORG_UPMS_ORGANIZATION_ROLE_EDIT, ORG_UPMS_ORGANIZATION_ROLE_DELETE, ORG_UPMS_ORGANIZATION_MEMBER_ADD,
    ORGANIZATION, PROJECTS, ORG_UPMS_ORGANIZATION_MEMBER_QUERY, MESSAGE_DURATION_TIME, NOT_HAS_PERMISION_COMFIRN
} from "@/globalset/js/constant";
import { color_4 } from "@/globalset/js/styles";
import { message } from "antd/lib/index";
import { getUsersNoticeSettingList } from '@/services/technological/notificationSetting'
import { isApiResponseOk } from "@/utils/handleResponseData";
import CreateOrganizationModal from '@/routes/Technological/components/HeaderNav/CreateOrganizationModal'
import ShowAddMenberModal from '@/routes/Technological/components/OrganizationMember/ShowAddMenberModal'
import NotificationSettingsModal from '@/routes/Technological/Sider/comonent/notificationSettings/NotificationSettingsModal'
import AccountSet from '@/routes/Technological/components/AccountSet'
import OrganizationMember from '@/routes/Technological/components/OrganizationMember'
import Organization from '@/routes/organizationManager'
import queryString from 'query-string';
const { SubMenu } = Menu;
let timer;
@connect(mapStateToProps)
export default class SimpleNavigation extends Component {

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
        const { users } = data
        const { currentSelectOrganize = {}, dispatch } = this.props
        const { id } = currentSelectOrganize
        dispatch({
            type: 'technological/inviteJoinOrganization',
            payload: {
                members: users,
                // org_id: id
            }
        })
    }

    seeMapAuthority(params) {

        if (localStorage.getItem('OrganizationId') !== "0") {
            const { dispatch } = this.props
            dispatch({
                type: 'organizationManager/getFnManagementList',
                payload: {
                    organization_id: params.key,
                }
            })
        }
    }

    // 切换组织的点击事件
    handleOrgListMenuClick = (e) => {

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
                //isHasMemberView() && this.routingJump('/technological/organizationMember')
                dispatch({
                    type: 'organizationMember/updateDatas',
                    payload: {
                        groupList: [], //全部分组
                        TreeGroupModalVisiblie: false, //树状分组是否可见
                        groupTreeList: [], //树状分组数据
                        currentBeOperateMemberId: '', //当前被操作的成员id
                        roleList: [], //当前组织角色列表
                        menuSearchSingleSpinning: false, //获取分组负责人转转转
                    }
                })
                if (checkIsHasPermission(ORG_UPMS_ORGANIZATION_MEMBER_QUERY) && localStorage.getItem('OrganizationId') != '0') {
                    //获取分组列表
                    dispatch({
                        type: 'organizationMember/getGroupList',
                        payload: {
                        }
                    })
                    // 获取分组树状列表
                    dispatch({
                        type: 'organizationMember/getGroupTreeList',
                        payload: {}
                    })
                    //查询当前角色
                    dispatch({
                        type: 'organizationMember/getCurrentOrgRole',
                        payload: {
                            type: '1'
                        }
                    })
                } else {
                    dispatch({
                        type: 'noLookPermissionsHandle',
                    })
                }
                this.props.updateStates({
                    simpleDrawerVisible: true,
                    simpleDrawerContent: <OrganizationMember />,
                    simpleDrawerTitle: '团队成员'

                });
                break
                break
            case '23': // 匹配成员管理后台
                //isHasManagerBack() && this.routingJump(`/organizationManager?nextpath=${window.location.hash.replace('#', '')}`)
                const currentSelectOrganize = localStorage.getItem('currentSelectOrganize') ? JSON.parse(localStorage.getItem('currentSelectOrganize')) : {}//JSON.parse(localStorage.getItem('currentSelectOrganize'))
                const { name, member_join_model, member_join_content, logo, logo_id, id } = currentSelectOrganize
                dispatch({
                    type: 'organizationManager/updateDatas',
                    payload: {
                        currentOrganizationInfo: { //组织信息
                            name,
                            member_join_model,
                            member_join_content,
                            logo,
                            logo_id,
                            id,
                            management_Array: [], //地图管理人员数组
                        },
                        content_tree_data: [], //可访问内容
                        function_tree_data: [],
                        orgnization_role_data: [], //组织角色数据
                        project_role_data: [], //项目角色数据
                        tabSelectKey: '1',
                        // permission_data: [], //权限数据
                        //名词定义
                        current_scheme_local: '', //已选方案名称
                        current_scheme: '', //当前方案名称
                        current_scheme_id: '',
                        scheme_data: [],
                        field_data: [],
                        editable: '0', //当前是否在自定义编辑状态 1是 0 否

                    }
                })

                dispatch({
                    type: 'organizationManager/getRolePermissions',
                    payload: {
                        type: '1',
                    }
                })
                dispatch({
                    type: 'organizationManager/getRolePermissions',
                    payload: {
                        type: '2',
                    }
                })
                dispatch({
                    type: 'organizationManager/getNounList',
                    payload: {}
                })

                this.props.updateStates({
                    simpleDrawerVisible: true,
                    simpleDrawerContent: <Organization showBackBtn={false} />,
                    simpleDrawerTitle: '后台管理'

                });

                break
            case '22': // 匹配邀请成员加入弹框显示
                checkIsHasPermission(ORG_UPMS_ORGANIZATION_MEMBER_ADD) && this.setShowAddMenberModalVisibile()
                break
            case '20': // 匹配用户设置
                //this.routingJump('/technological/accoutSet')
                dispatch({
                    type: 'accountSet/getUserInfo',
                    payload: {}
                })
                const SelectedKeys = queryString.parse(window.location.search).selectedKeys
                dispatch({
                    type: 'accountSet/updateDatas',
                    payload: {
                        SelectedKeys: SelectedKeys || '1', //正常默认进来menu选项‘1’,通过外部邮件进来其他
                    }
                })
                this.props.updateStates({
                    simpleDrawerVisible: true,
                    simpleDrawerContent: <AccountSet />,
                    simpleDrawerTitle: '账号设置'

                });
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
                this.handleMode
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
                        org_id: '0',
                        routingJumpPath: '/technological/simplemode/home',
                        isNeedRedirectHash: false
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

                dispatch({
                    type: 'simplemode/updateDatas',
                    payload: {
                        simplemodeCurrentProject: {}
                    }
                });

                dispatch({
                    type: 'investmentMap/getMapsQueryUser',
                    payload: { }
                })
                break
            case '-1': //退出
                this.logout(e)
                break

            default: // 其他组织的切换

                this.seeMapAuthority(e)

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
                                org_id: val.id,
                                routingJumpPath: '/technological/simplemode/home',
                                isNeedRedirectHash: false
                            }
                        })
                        dispatch({
                            type: 'simplemode/updateDatas',
                            payload: {
                                simplemodeCurrentProject: {}
                            }
                        });
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
                break
        }
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
    handleMode(checked) {
        // console.log(checked, 'sssss')
        const { user_set = {} } = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : {}
        const { is_simple_model } = user_set
        const { dispatch } = this.props
        dispatch({
            type: 'technological/getSetShowSimple',
            payload: {
                is_simple_model: checked ? '1' : '0',
                checked
            }
        })

    }
    render() {
        //currentUserOrganizes currentSelectOrganize组织列表和当前组织
        const {
            menuList = [],
            naviHeadTabIndex = {},
            currentUserOrganizes = [],
            currentSelectOrganize = {},
            is_show_org_name, is_all_org,
            is_show_simple } = this.props
        const { collapsed, is_disabled } = this.state
        const { current_org = {}, name, avatar, user_set = {} } = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : {}
        const { is_simple_model } = user_set
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

        return (
            <div className={`${globalStyles.global_card} ${indexStyles.menuWrapper}`}>
                <Menu onClick={this.handleOrgListMenuClick.bind(this)} selectable={true} style={{ borderRadius: '8px' }} mode={!collapsed ? 'vertical' : 'inline'} >

                    {
                        identity_type == '1' && isHasMemberView() && (
                            <Menu.Item key="24">
                                <div className={indexStyles.default_select_setting}>
                                    <div className={indexStyles.team}>
                                        <div className={`${globalStyles.authTheme} ${indexStyles.team_icon}`}>&#xe7af;</div>
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
                                        <div className={`${globalStyles.authTheme} ${indexStyles.bank_icon}`}>&#xe719;</div>
                                        <span className={indexStyles.middle_text}>组织管理后台</span>
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
                                        <div className={`${globalStyles.authTheme} ${indexStyles.add_icon}`}>&#xe7ae;</div>
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

                            </div>
                        </div>
                    </Menu.Item>

                    <SubMenu
                        key="21"
                        title={
                            <div id="default_select_setting" className={indexStyles.default_select_setting}>
                                <div className={indexStyles.hobby}>
                                    <span className={`${globalStyles.authTheme} ${indexStyles.hobby_icon}`} style={{ fontSize: 20 }}>&#xe783;</span>
                                    <span className={indexStyles.middle_text}> 偏好设置</span>
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

                            </span>
                        </Menu.Item>
                        <Menu.Item key="subInfoSet">
                            <span>通知设置</span>
                        </Menu.Item>
                        <Menu.Item key="subShowSimple">
                            <span>
                                极简模式
                        <Switch
                                    style={{ display: 'inline-block', marginLeft: 36 }}
                                    // defaultChecked={false}
                                    checked={is_simple_model == '1' ? true : false}
                                    onClick={(checked) => { this.handleMode(checked) }}
                                ></Switch>
                            </span>
                        </Menu.Item>
                    </SubMenu>

                    <Menu.Item key="10" >
                        <div className={indexStyles.itemDiv}>
                            <Icon type="plus-circle" theme="outlined" style={{ margin: 0, fontSize: 16 }} /> 创建或加入新{currentNounPlanFilterName(ORGANIZATION)}
                        </div>
                    </Menu.Item>
                    <Menu.Item key="-1">
                        <div className={indexStyles.itemDiv}>
                            <i className={`${globalStyles.authTheme} ${indexStyles.layout_icon}`} style={{ margin: 0, fontSize: 16 }}>&#xe78c;</i> 退出登录
                        </div>
                        {/* <div className={indexStyles.default_select_setting}>

                            <div className={indexStyles.account_setting}>

                                >&#xe78c;
                                <span className={indexStyles.middle_text}>退出登录</span>
                                <Tooltip placement="top" title="退出登录">
                                    <div
                                        onClick={(e) => { this.logout(e) }}
                                        className={`${globalStyles.authTheme} ${indexStyles.layout_icon}`}>&#xe78c;</div>
                                </Tooltip>
                            </div>
                        </div> */}
                    </Menu.Item>
                    <Menu.Divider />
                </Menu>

                <Menu
                    className={`${globalStyles.global_vertical_scrollbar}`}
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
                        const { name, id, identity_type, logo } = value
                        return (
                            <Menu.Item key={id} className={indexStyles.org_name} >
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <img src={logo || linxiLogo} className={indexStyles.org_img} />
                                    <span style={{ maxWidth: 100, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{name}</span>
                                </div>
                                {identity_type == '0' ? (<span className={indexStyles.middle_bott} style={{ display: 'inline-block', backgroundColor: '#e5e5e5', padding: '0 4px', borderRadius: 40, marginLeft: 6, position: 'absolute', right: 34, top: 12 }}>访客</span>) : ('')}
                            </Menu.Item>
                        )
                    })}
                </Menu>

                {/** 功能组件引入 */}
                <CreateOrganizationModal dispatch={this.props.dispatch} createOrganizationVisable={this.state.createOrganizationVisable} setCreateOrgnizationOModalVisable={this.setCreateOrgnizationOModalVisable.bind(this)} />

                <ShowAddMenberModal dispatch={this.props.dispatch} addMembers={this.addMembers.bind(this)} modalVisible={this.state.ShowAddMenberModalVisibile} setShowAddMenberModalVisibile={this.setShowAddMenberModalVisibile.bind(this)} />

                {this.state.NotificationSettingsModalVisible && (
                    <NotificationSettingsModal notificationSettingsModalVisible={this.state.NotificationSettingsModalVisible} setNotificationSettingsModalVisible={this.setNotificationSettingsModalVisible.bind(this)} />
                )}
            </div>
        )
    }
}
function mapStateToProps({ technological: { datas: {
    menuList = [], naviHeadTabIndex = {}, currentUserOrganizes = [], currentSelectOrganize = {}, is_show_org_name, is_all_org, is_show_simple
} } }) {
    return { menuList, naviHeadTabIndex, currentUserOrganizes, currentSelectOrganize, is_show_org_name, is_all_org, is_show_simple }
}

