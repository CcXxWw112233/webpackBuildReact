import React from 'react'
import DrawerContentStyles from './DrawerContent.less'
import { Icon, Input, message, DatePicker, Menu } from 'antd'
import ShowAddMenberModal from '../../../components/Project/ShowAddMenberModal'
import { checkIsHasPermissionInBoard } from '../../../../../utils/businessFunction'
import {
  MESSAGE_DURATION_TIME,
  NOT_HAS_PERMISION_COMFIRN,
  PROJECT_TEAM_BOARD_MEMBER
} from '../../../../../globalset/js/constant'
import { isApiResponseOk } from '../../../../../utils/handleResponseData'
import {
  organizationInviteWebJoin,
  commInviteWebJoin
} from '../../../../../services/technological/index'
import { connect } from 'dva/index'

@connect(mapStateToProps)
export default class DCMenuItemOne extends React.Component {
  state = {
    resultArr: [], //实际显示执行人数组
    keyWord: ''
  }
  componentWillMount() {
    const { keyWord } = this.state
    const { execusorList = [] } = this.props
    this.setState({
      resultArr: this.fuzzyQuery(execusorList, keyWord)
    })
  }
  componentWillReceiveProps(nextProps) {
    const { keyWord } = this.state
    const { execusorList = [] } = nextProps
    this.setState({
      resultArr: this.fuzzyQuery(execusorList, keyWord)
    })
  }
  handleMenuIconDelete = (data, e) => {
    e.stopPropagation()
    // const { execusorList } = this.props
    // const { resultArr } = this.state
    // for(let i = 0; i <execusorList.length; i++ ){
    //   if (user_id === execusorList[i]['user_id']) {
    //     execusorList.splice(i,1)
    //     break
    //   }
    // }
    // const { keyWord } = this.state
    // this.setState({
    //   resultArr: this.fuzzyQuery(execusorList, keyWord)
    // })
    // execusorList.splice(key,1)
    // this.props.setList(user_id)
    this.props.deleteExcutor(data)
  }
  handleMenuReallyClick = data => {
    this.props.chirldrenTaskChargeChange(data)
  }
  //模糊查询
  fuzzyQuery = (list, keyWord) => {
    var arr = []
    for (var i = 0; i < list.length; i++) {
      const { name } = list[i]
      if (name.indexOf(keyWord) !== -1) {
        arr.push(list[i])
      }
    }
    return arr
  }
  onChange = e => {
    const { execusorList } = this.props
    const keyWord = e.target.value
    const resultArr = this.fuzzyQuery(execusorList, keyWord)
    this.setState({
      keyWord,
      resultArr
    })
  }
  addMenbersInProject = data => {
    const { invitationType, invitationId, rela_Condition } = this.props
    const temp_ids = data.users.split(',')
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
          rela_condition: rela_Condition
        }).then(res => {
          if (isApiResponseOk(res) == 0) {
            //...
          }
        })
      }
    })
  }
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
    const {
      execusorList,
      canNotRemoveItem,
      currentExecutor = {},
      invitationType,
      invitationId,
      isInvitation
    } = this.props //currentExecutor当前已选执行人
    const { resultArr, keyWord } = this.state
    const executorUserId = currentExecutor.user_id

    return (
      <div className={DrawerContentStyles.menuOneout}>
        <div className={DrawerContentStyles.menuOne}>
          <div style={{ width: 160, height: 42, margin: '0 auto' }}>
            <Input
              placeholder={'请输入负责人名称'}
              value={keyWord}
              style={{ width: 160, marginTop: 6 }}
              onChange={this.onChange.bind(this)}
            />
          </div>

          <div>
            {isInvitation == true ? (
              <div
                style={{ padding: 0, margin: 0, height: 32 }}
                onClick={this.setShowAddMenberModalVisibile.bind(this)}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 20,
                      backgroundColor: '&#xe70b;',
                      marginRight: 4,
                      color: 'rgb(73, 155, 230)'
                    }}
                  >
                    <Icon
                      type={'plus-circle'}
                      style={{
                        fontSize: 12,
                        marginLeft: 10,
                        color: 'rgb(73, 155, 230)'
                      }}
                    />
                  </div>
                  <span style={{ color: 'rgb(73, 155, 230)' }}>
                    邀请他人参与
                  </span>
                </div>
              </div>
            ) : (
              ''
            )}
          </div>

          {resultArr.map((value, key) => {
            const {
              user_id,
              full_name,
              fullName,
              mobile,
              email,
              avatar,
              name
            } = value
            return (
              <div style={{ position: 'relative' }} key={key}>
                <div
                  style={{ padding: 0, margin: 0, height: 32 }}
                  onClick={this.handleMenuReallyClick.bind(this, {
                    user_id,
                    full_name: name || full_name || fullName || mobile || email,
                    avatar
                  })}
                >
                  <div className={DrawerContentStyles.menuOneitemDiv}>
                    {value.avatar ? (
                      <img
                        src={value.avatar}
                        className={DrawerContentStyles.avatar}
                      />
                    ) : (
                      <div
                        style={{
                          height: 20,
                          width: 20,
                          borderRadius: 20,
                          backgroundColor: '#f2f2f2',
                          textAlign: 'center'
                        }}
                      >
                        <Icon
                          type={'user'}
                          style={{
                            fontSize: 12,
                            color: '#8c8c8c',
                            marginTop: 4,
                            display: 'block'
                          }}
                        />
                      </div>
                    )}
                    <span>{name}</span>
                  </div>
                </div>
                {executorUserId === user_id ? (
                  <Icon
                    type="close-circle"
                    style={{
                      display: canNotRemoveItem ? 'none' : 'block',
                      fontSize: 14,
                      marginLeft: 8,
                      position: 'absolute',
                      right: 10,
                      top: 9
                    }}
                    onClick={this.handleMenuIconDelete.bind(this, {
                      user_id,
                      full_name:
                        name || full_name || fullName || mobile || email,
                      avatar
                    })}
                  />
                ) : (
                  ''
                )}
              </div>
            )
          })}
        </div>

        <ShowAddMenberModal
          addMenbersInProject={this.addMenbersInProject}
          show_wechat_invite={true}
          {...this.props}
          invitationType={invitationType}
          invitationId={invitationId}
          invitationOrg={localStorage.getItem('OrganizationId')}
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
