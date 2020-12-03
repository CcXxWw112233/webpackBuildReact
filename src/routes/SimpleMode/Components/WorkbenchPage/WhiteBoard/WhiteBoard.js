import React from 'react'
import styles from './index.less'
import globalStyles from '../../../../../globalset/css/globalClassName.less'
import WhiteBoard, { WTools, Controller } from 'whiteboard-lingxi'
import { WEvent } from 'whiteboard-lingxi/lib/utils'
import Action from './Action'
import SelectMembers from '../../../../../components/MenuSearchMultiple/MenuSearchPartner'
import { getCurrentOrgAccessibleAllMembers } from '../../../../../services/technological/workbench'
import { Dropdown, message, Modal } from 'antd'

export default class WhiteBoardRoom extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      page_number: 1,
      users: [],
      intheRoomUsers: []
    }
    WEvent.on('exit:room', () => {
      this.exitWhiteboard()
      Modal.info({
        centered: true,
        title: '移出房间通知',
        content: '您已被管理员移出房间,如有疑问,请联系管理员'
      })
    })
  }
  componentDidMount() {
    // 打开websocket
    Action.openWS()
  }
  // 点击退出白板
  exitWhiteboard = () => {
    const { onClose } = this.props
    onClose && onClose()
  }
  componentWillUnmount() {
    // 关闭ws
    Action.closeWS()
  }
  /**
   * 加载白板
   * @param {*} WB_lx 白板加载完成
   */
  WhiteBoardLoad = WB_lx => {
    Action.init(WB_lx, this.state.page_number, this.props.room_id)
    // 获取组织成员，去除自己的数据
    getCurrentOrgAccessibleAllMembers({
      _organization_id: this.props.room.org_id
    }).then(res => {
      // console.log(res)
      this.setState({
        users: (res.data.users || [])
          .map(item => {
            return { ...item, user_id: item.id }
          })
          .filter(item => item.id !== Action.user.id),
        intheRoomUsers: this.props.room.users
      })
    })
  }

  /**
   * 点击用户选择
   */
  handleChangeMember = ({ key, type }) => {
    if (type === 'add') {
      Action.invitationUser({ room_id: this.props.room_id, user_id: key }).then(
        res => {
          message.success('已发送邀请')
        }
      )
    } else if (type === 'remove') {
      Action.KickOutUser({ room_id: this.props.room_id, user_id: key }).then(
        res => {
          message.success('已踢除用户')
        }
      )
    }
  }
  render() {
    return (
      <div className={styles.WhiteBoardRoom_container}>
        <div
          className={`${styles.WhiteBoardRoom_close} ${globalStyles.authTheme}`}
          onClick={this.exitWhiteboard}
        >
          &#xe7ce;
        </div>
        <div className={`${styles.settings} ${globalStyles.authTheme}`}>
          {this.props.room.create_by === Action.user.id &&
            this.props.room.status == 1 && (
              <Dropdown
                trigger="click"
                overlay={
                  <SelectMembers
                    keyCode="user_id"
                    HideInvitationOther={true}
                    listData={this.state.users}
                    chirldrenTaskChargeChange={this.handleChangeMember}
                    searchName="name"
                    currentSelect={this.state.intheRoomUsers}
                  />
                }
              >
                <div className={styles.invitation}>
                  <span>&#xe7db;</span>
                </div>
              </Dropdown>
            )}
        </div>
        <WhiteBoard onLoad={this.WhiteBoardLoad} RoomId={this.props.room_id}>
          {this.props.room.status == 1 && <WTools />}
          <Controller />
        </WhiteBoard>
      </div>
    )
  }
}
