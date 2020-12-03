import React from 'react'
import styles from './index.less'
import Action from './Action'
import { Modal, Input, Button, message, Select, Avatar } from 'antd'
import globalStyles from '../../../../../globalset/css/globalClassName.less'

export default class RoomList extends React.PureComponent {
  weeks = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  constructor(props) {
    super(props)
    this.state = {
      list: [],
      addRoomModal: false,
      roomName: '',
      timeMsg: {
        week: '',
        hours: '',
        min: '',
        format: ''
      },
      org: ''
    }
    this.timeTimer = null
  }
  componentDidMount() {
    this.fetchList()
    this.updateTimes()
    this.setTime()
  }
  setTime = () => {
    const zero = z => (z < 10 ? '0' + z : z)
    let t = new Date()
    let hours = t.getHours(),
      day = t.getDay(),
      m = t.getMinutes()
    let anp = hours < 11 ? 'AM' : 'PM'
    let week = this.weeks[day - 1]
    this.setState({
      timeMsg: {
        week: week,
        hours: zero(hours),
        min: zero(m),
        format: anp
      }
    })
  }
  updateTimes = () => {
    clearInterval(this.timeTimer)
    this.timeTimer = setInterval(() => {
      this.setTime()
    }, 10 * 1000)
  }
  componentWillUnmount() {
    clearInterval(this.timeTimer)
  }
  fetchList = () => {
    this.setTime()
    // 获取房间列表
    Action.fetchList({ _organization_id: this.props.org_id }).then(res => {
      if (res)
        this.setState({
          list: res.data
        })
    })
  }
  addRoom = () => {
    let param = {
      addRoomModal: true
    }
    if (this.props.org_id !== 0) {
      param.org = this.props.org_id
    }
    this.setState(param)
  }

  toAddRoom = () => {
    if (!this.state.roomName.trim()) {
      return message.warn('房间名称不能为空')
    }
    if (!this.state.org || this.state.org === '0') {
      return message.warn('请选择组织')
    }
    Action.addWhiteBoardRoom({
      name: this.state.roomName.trim(),
      _organization_id: this.state.org
    }).then(res => {
      if (res) {
        this.setState({
          list: this.state.list.concat([{ ...res.data, status: 1 }]),
          addRoomModal: false,
          roomName: ''
        })
        message.success('创建房间成功')
      }
    })
  }

  translateStatus = status => {
    switch (status) {
      case '1':
        return '正常'
      case '2':
        return '已过期'
      default:
        return '正常'
    }
  }
  handleRoom = room => {
    const { onEnter } = this.props
    onEnter && onEnter(room)
  }
  setOrg = val => {
    // console.log(val)
    this.setState({
      org: val
    })
  }

  translateOrgName = orgid => {
    if (orgid === '0') {
      return '全组织'
    }
    let obj = this.props.orgs.find(item => item.id === orgid)
    if (obj) {
      return obj.name
    } else return '未知组织'
  }
  render() {
    const { list, timeMsg } = this.state
    return (
      <div className={styles.room_list}>
        <div
          className={`${globalStyles.authTheme} ${styles.reLoadBtn}`}
          title="更新房间列表"
          onClick={this.fetchList}
        >
          &#xe6c3;
        </div>
        <div className={styles.room_content}>
          <div className={styles.room_title}>
            <span>白板交流</span>
            <p>
              Today at {timeMsg.hours}:{timeMsg.min} {timeMsg.format}{' '}
              {timeMsg.week}
            </p>
          </div>
          <div className={styles.room_list_flex}>
            <div
              className={`${styles.room_list_item} ${styles.room_list_item_add}`}
            >
              <div
                className={styles.room_list_item_detail}
                onClick={this.addRoom}
              >
                <span>
                  <svg
                    t="1603940762140"
                    class="icon"
                    viewBox="0 0 1024 1024"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    p-id="24072"
                    width="48"
                    height="48"
                  >
                    <path
                      d="M426.666667 0h170.666666v1024H426.666667z"
                      fill="#86B3FF"
                      p-id="24073"
                    ></path>
                    <path
                      d="M1024 426.666667v170.666666H0V426.666667z"
                      fill="#6A9AFF"
                      p-id="24074"
                    ></path>
                  </svg>
                </span>
              </div>
            </div>
            {list.map(item => {
              return (
                <div className={styles.room_list_item} key={item.id}>
                  <div
                    className={styles.room_list_item_detail}
                    onClick={() => this.handleRoom(item)}
                  >
                    <div
                      className={`${globalStyles.authTheme} ${styles.room_icon}`}
                    >
                      &#xe7fb;
                    </div>
                    <div className={styles.room_msg}>
                      <span className={styles.room_msg_title}>
                        {item.name}{' '}
                        <span className={styles.room_status}>
                          {'#'}
                          {this.translateOrgName(item.org_id)} (
                          {this.translateStatus(item.status)})
                        </span>
                      </span>
                      <div className={styles.room_msg_users}>
                        {(item.users || []).map(user => {
                          return (
                            <Avatar
                              src={user.avatar}
                              size={18}
                              style={{ marginRight: 5 }}
                            />
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        <Modal
          visible={this.state.addRoomModal}
          title={null}
          footer={null}
          bodyStyle={{
            height: 400,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
          onCancel={() => this.setState({ addRoomModal: false, roomName: '' })}
        >
          <div className={styles.addRoomContent}>
            <div className={styles.addRoomTitle}>创建白板房间</div>
            <div>
              <Input
                placeholder="房间名称"
                value={this.state.roomName}
                onChange={e =>
                  this.setState({ roomName: e.target.value.trim() })
                }
              />
            </div>
            {this.props.org_id === '0' && (
              <div>
                <Select
                  defaultValue={this.props.org_id}
                  style={{ width: '100%' }}
                  onChange={this.setOrg}
                  placeholder="请选择组织"
                >
                  <Select.Option value="0">请选择组织</Select.Option>
                  {this.props.orgs.map(item => {
                    return (
                      <Select.Option key={item.id} value={item.id}>
                        {item.name}
                      </Select.Option>
                    )
                  })}
                </Select>
              </div>
            )}
            <div>
              <Button type="primary" block onClick={this.toAddRoom}>
                确定
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    )
  }
}
