import React, { Component } from 'react'
import { Input, Dropdown, Menu, Icon, Tooltip, Select, Spin, Modal, message } from 'antd'
import DrawDetailInfoStyle from './DrawDetailInfo.less'
import {checkIsHasPermissionInBoard, isHasOrgMemberQueryPermission} from "@/utils/businessFunction";
import NoPermissionUserCard from '@/components/NoPermissionUserCard/index'
import {
  MESSAGE_DURATION_TIME, NOT_HAS_PERMISION_COMFIRN,
  PROJECT_TEAM_BOARD_EDIT, PROJECT_TEAM_BOARD_MEMBER
} from "@/globalset/js/constant";
import ShowAddMenberModal from '../../Project/ShowAddMenberModal'
import { getGlobalData } from "../../../../../utils/businessFunction";
import { isApiResponseOk } from '../../../../../utils/handleResponseData';
import { organizationInviteWebJoin, commInviteWebJoin, } from '../../../../../services/technological/index'
import globalsetStyles from '@/globalset/css/globalClassName.less'
import { connect } from 'dva'
let timer;
@connect(mapStateToProps)
export default class DetailMember extends Component {

   constructor(props) {
     super(props)
     this.state = {
       inputVal: '', 
       ShowAddMenberModalVisibile: false,
       new_avatar_list: [], // 用来保存头像的新数组 
     }
   }

   componentDidMount() {
    const { projectDetailInfoData = {}  } = this.props
    let {data = []} = projectDetailInfoData //data是参与人列表
    data = data || []
    const avatarList = data.concat([1])//[1,2,3,4,5,6,7,8,9]//长度再加一
    this.setState({
      new_avatar_list: avatarList
    })
   }

   compareDiffObject(obj1,obj2){
    let o1 = obj1 instanceof Object;
    let o2 = obj2 instanceof Object;
    // 判断是不是对象
    if (!o1 || !o2) {
        return obj1 === obj2;
    }

    //Object.keys() 返回一个由对象的自身可枚举属性(key值)组成的数组,
    //例如：数组返回下表：let arr = ["a", "b", "c"];console.log(Object.keys(arr))->0,1,2;
    if (Object.keys(obj1).length !== Object.keys(obj2).length) {
        return false;
    }

    for (let o in obj1) {
        let t1 = obj1[o] instanceof Object;
        let t2 = obj2[o] instanceof Object;
        if (t1 && t2) {
            return this.compareDiffObject(obj1[o], obj2[o]);
        } else if (obj1[o] !== obj2[o]) {
            return false;
        }
    }
    return true;
  }


   componentWillReceiveProps(nextProps) {
     const { projectDetailInfoData = {} } = nextProps
     const { projectDetailInfoData: oldProjectDetailInfoData } = this.props
     if (!this.compareDiffObject(oldProjectDetailInfoData, projectDetailInfoData)) {
      let {data = []} = projectDetailInfoData //data是参与人列表
      data = data || []
      const avatarList = data.concat([1])//[1,2,3,4,5,6,7,8,9]//长度再加一
      this.setState({
        new_avatar_list: avatarList
      })
     }
   }

  // 检测当前成员是否是自己, 如果是, 那么不能移除自己
  checkCurrentOperatorMemberWhetherSelf = (shouldDelItem) => {
    const { id } = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : {}
    // console.log(id, shouldDelItem, 'ssssss')
    let flag
    if (shouldDelItem == id) {
      flag = true
      return flag
    } else {
      flag = false
      return flag
    }
  }

    //点击添加成员操作
  setShowAddMenberModalVisibile() {
    if(!checkIsHasPermissionInBoard(PROJECT_TEAM_BOARD_MEMBER)){
      message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
      return false
    }
    this.setState({
      ShowAddMenberModalVisibile: !this.state.ShowAddMenberModalVisibile
    })
  }

  // 设置成员角色
  handleSetRoleMenuClick(props, { key }) {
    if(!checkIsHasPermissionInBoard(PROJECT_TEAM_BOARD_MEMBER)){
      message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
      return false
    }
    const { projectDetailInfoData = {}  } = this.props
    const { board_id } = projectDetailInfoData //data是参与人列表
    const { user_id } = props
    if(/^role_\w+/.test(key)) {
      const { dispatch } = this.props
      dispatch({
        type: 'projectDetail/setMemberRoleInProject',
        payload: {
          board_id,
          user_id,
          role_id: key.replace('role_', '')
        }
      })
      return false
    }
    switch (key) {
      case 'removeMember':
        if (this.checkCurrentOperatorMemberWhetherSelf(user_id)) {
          message.warn('请不要移除自己哦~', MESSAGE_DURATION_TIME)
          return false
        }
        this.confirm({board_id, user_id})
        break
      default:
        break
    }
  }

  // 出现移除的confirm
  confirm(data) {
    const that = this
    Modal.confirm({
      title: '确认将他移出项目吗？',
      zIndex: 2000,
      content: <div style={{color: 'rgba(0,0,0, .8)', fontSize: 14}}>
        <span >退出后将无法获取该项目的相关动态</span>
        {/*<div style={{marginTop:20,}}>*/}
        {/*<Checkbox style={{color:'rgba(0,0,0, .8)',fontSize: 14, }} onChange={this.setIsSoundsEvrybody.bind(this)}>通知项目所有参与人</Checkbox>*/}
        {/*</div>*/}
      </div>,
      okText: '确认',
      cancelText: '取消',
      onOk() {
        const { dispatch } = that.props
        dispatch({
          type: 'projectDetail/removeMenbers',
          payload: {
            ...data
          }
        })
      }
    });
  }

  //模糊查询
  fuzzyQuery = (list, keyWord) => {
      var arr = [];
      list.map(item => {
        if (item.name && item.name.indexOf(keyWord) != -1) {
          arr.push(item)
          return
        } else if ( item.email && item.email.indexOf(keyWord) != -1) {
          arr.push(item)
          return
        } else if (item.mobile && item.mobile.indexOf(keyWord) != -1) {
          arr.push(item)
          return
        }
      })
      return arr;
  }

  // 输入框的chg事件
  handleChange(e) {
    let val = e.target.value
    const {projectDetailInfoData = {} } = this.props
    let {data = []} = projectDetailInfoData //data是参与人列表
    data = data || []
    const avatarList = data.concat([1])//[1,2,3,4,5,6,7,8,9]//长度再加一
    let new_list = [...avatarList]
    this.setState({
      inputVal: val
    })
    if (!val) {
      this.setState({
        new_avatar_list: new_list
      })
      return
    }
    new_list.map(item => {
      let resultArr = this.fuzzyQuery(avatarList, val)
      this.setState({
        new_avatar_list: resultArr.concat([1])
      })
    })
    
  }

    // 邀请人进项目
    addMenbersInProject = (data) => {
      const { invitationType, invitationId, rela_Condition, dispatch } = this.props
      const temp_ids = data.users.split(",")
      const invitation_org = localStorage.getItem('OrganizationId')
      organizationInviteWebJoin({
        _organization_id: invitation_org,
        type: invitationType,
        users: temp_ids
      }).then(res => {
        if (res && res.code === '0') {
          commInviteWebJoin({
            id: invitationId,
            role_id: res.data.role_id,
            type: invitationType,
            users: res.data.users,
            rela_condition: rela_Condition,
          }).then(res => {
            if (isApiResponseOk(res)) {
              setTimeout(() => {
                message.success('邀请成功', MESSAGE_DURATION_TIME)
              }, 500)
              const { projectDetailInfoData = {} } = this.props
              const { board_id } = projectDetailInfoData
              if (invitationType === '1') {
                dispatch({
                  type: 'projectDetail/projectDetailInfo',
                  payload: {
                    id: board_id
                  }
                })
                dispatch({
                  type: 'workbenchTaskDetail/projectDetailInfo',
                  payload: {
                    id: board_id
                  }
                })
              }
            }
          })
        }
      })
    }


  render() {
    let { inputVal, new_avatar_list = [] } = this.state
    const { projectDetailInfoData = {}, projectRoles = [] } = this.props
    let { board_id, board_name, data = [],org_id} = projectDetailInfoData //data是参与人列表

    const manImageDropdown = (props) => {
      const { role_id, role_name='...', name, email='...', avatar, mobile='...', user_id, organization='...', we_chat='...'} = props
      if(!isHasOrgMemberQueryPermission()) {
        return <NoPermissionUserCard avatar={avatar} full_name={role_name} />
      }
      // return (<UserCard avatar={avatar} email={email} name={name} mobile={mobile} role_name={''} />)
      return (
        <div className={DrawDetailInfoStyle.manImageDropdown}>
          <div className={DrawDetailInfoStyle.manImageDropdown_top}>
            <div className={DrawDetailInfoStyle.left}>
              {avatar?(
                <img src={avatar} />
              ):(
                <div style={{width: 32, height: 32, borderRadius: 32, backgroundColor: '#f2f2f2', textAlign: 'center'}}>
                  <Icon type={'user'} style={{fontSize: 20, color: '#8c8c8c', marginTop: 9}}/>
                </div>
              )}
            </div>
            <div className={DrawDetailInfoStyle.right}>
              <div className={DrawDetailInfoStyle.name}>{name || '佚名'}</div>
              <Tooltip title="该功能即将上线">
                <div className={DrawDetailInfoStyle.percent}>
                  <div style={{width: '0'}}></div>
                  <div style={{width: '0'}}></div>
                  <div style={{width: '100%'}}></div>
                </div>
              </Tooltip>
            </div>
            {role_id === '3'? ('') : (
              <Dropdown overlay={manOperateMenu(props)} getPopupContainer={triggerNode => triggerNode.parentNode} overlayClassName={DrawDetailInfoStyle.overlay_manOperateMenu}>
                <div className={DrawDetailInfoStyle.manImageDropdown_top_operate}><Icon type="ellipsis" theme="outlined" /></div>
              </Dropdown>
            )}

          </div>
          <div className={DrawDetailInfoStyle.manImageDropdown_middle}>
            <div className={DrawDetailInfoStyle.detailItem}>
              <div>职位：</div>
              <div>{role_name}</div>
            </div>
            <div className={DrawDetailInfoStyle.detailItem}>
              <div>邮箱：</div>
              <div>{email}</div>
            </div>
            <div className={DrawDetailInfoStyle.detailItem}>
              <div>手机：</div>
              <div>{mobile}</div>
            </div>
          </div>
        </div>
      )
    }

    const manOperateMenu = (props) => {
      const { is_visitor } = props
      return(
        <Menu onClick={this.handleSetRoleMenuClick.bind(this, props)}>
          {checkIsHasPermissionInBoard(PROJECT_TEAM_BOARD_MEMBER) ? (
            <Menu.SubMenu title="设置角色" key={'setRole'}>
              {projectRoles.map((value, key) => {
                return(
                  <Menu.Item key={`role_${value.id}`} style={{textAlign: 'center', padding: 0, margin: 5}}>
                    <div className={DrawDetailInfoStyle.elseProjectMemu}>
                      {value.name}
                    </div>
                  </Menu.Item>
                )
              })}
            </Menu.SubMenu>
          ):('')}

          {checkIsHasPermissionInBoard(PROJECT_TEAM_BOARD_MEMBER) && (
            <Menu.Item key={'removeMember'} style={{textAlign: 'center', padding: 0, margin: 0}}>
              <div className={DrawDetailInfoStyle.elseProjectDangerMenu}>
                移除成员
              </div>
            </Menu.Item>
          )}
        </Menu>
      )
    }

    return (
      <div style={{maxHeight: 600, minHeight: '200px', overflowY: 'auto'}} className={globalsetStyles.global_vertical_scrollbar}>
        <div className={DrawDetailInfoStyle.input_search}>
          {/* <span className={DrawDetailInfoStyle.search_icon}><Icon type="search" /></span> */}
          <Input 
            style={{width: '100%'}}
            prefix={<Icon type="search" style={{ color: 'rgba(0,0,0,.45)'}} />}
            value={inputVal}
            onChange={ (e) => { this.handleChange(e) } }
          />
        </div>
        <div className={`${DrawDetailInfoStyle.manImageList} ${DrawDetailInfoStyle.detail_member}`}>
          {
            checkIsHasPermissionInBoard(PROJECT_TEAM_BOARD_MEMBER) && (
              <Tooltip title="邀请新成员" placement="top">
                <div className={DrawDetailInfoStyle.addManImageItem} onClick={this.setShowAddMenberModalVisibile.bind(this)}>
                  <Icon type="plus" style={{color: '#8c8c8c', fontSize: 20, fontWeight: 'bold', marginTop: 8, color: '#40A9FF'}}/>
                </div>
              </Tooltip>
              )
          }
          {
            new_avatar_list && new_avatar_list.map((value, key) => {
              if(key < new_avatar_list.length - 1) {
                const { avatar, user_id } = value
                return(
                  <div className={`${DrawDetailInfoStyle.manImageItem}`} key={ key }>
                    <Dropdown overlay={manImageDropdown(value)}>
                      {avatar?(<img src={avatar} />): (
                        <div style={{width: 40, height: 40, borderRadius: 40, backgroundColor: '#f2f2f2', textAlign: 'center'}}>
                          <Icon type={'user'} style={{fontSize: 20, color: '#8c8c8c', marginTop: 9}}/>
                        </div>
                      )
                      }
                    </Dropdown>
                  </div>
                )
              }
            })
          }
        </div>
        <ShowAddMenberModal
          addMenbersInProject={this.addMenbersInProject}
          show_wechat_invite={true}
          invitationId={this.props.invitationId}
          invitationType={this.props.invitationType}
          invitationOrg={org_id} 
          board_id = {board_id} modalVisible={this.state.ShowAddMenberModalVisibile} 
          setShowAddMenberModalVisibile={this.setShowAddMenberModalVisibile.bind(this)}/>
      </div>
    )
  }
}

//  建立一个从（外部的）state对象到（UI 组件的）props对象的映射关系
function mapStateToProps({
  projectDetail: {
    datas: {
      projectDetailInfoData = {},
      projectRoles = []
    }
  },
}) {
  return {
    projectDetailInfoData,
    projectRoles
  }
}
