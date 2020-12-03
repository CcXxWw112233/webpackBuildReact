import React from 'react'
import styles from './index.less'
// import RoomList from './RoomList'
// import WhiteBoard from './WhiteBoard'
import Action from './Action'
import { connect } from 'dva'
const RoomList = React.lazy(() => import('./RoomList'))
const WhiteBoard = React.lazy(() => import('./WhiteBoard'))

@connect(
  ({
    technological: {
      datas: { currentUserOrganizes = [], OrganizationId }
    }
  }) => ({
    currentUserOrganizes,
    OrganizationId
  })
)
export default class WhiteBoardRooms extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      mode: 'list', // 当前模式属于列表还是房间
      room_id: ''
    }
  }

  handleRoom = val => {
    // console.log(val)
    Action.room_id = val.id
    this.setState({
      room_id: val.id,
      mode: 'whiteBoard',
      room: val
    })
  }
  closeWhiteBoard = () => {
    this.setState({
      mode: 'list',
      room_id: '',
      room: {}
    })
    Action.room_id = ''
  }

  render() {
    const { mode } = this.state
    return (
      <div className={styles.whiteboard_rooms}>
        {mode === 'list' && (
          <RoomList
            onEnter={this.handleRoom}
            orgs={this.props.currentUserOrganizes}
            org_id={this.props.OrganizationId}
          />
        )}
        {mode === 'whiteBoard' && (
          <WhiteBoard
            orgs={this.props.currentUserOrganizes}
            org_id={this.props.OrganizationId}
            room_id={this.state.room_id}
            room={this.state.room}
            onClose={this.closeWhiteBoard}
          />
        )}
      </div>
    )
  }
}
