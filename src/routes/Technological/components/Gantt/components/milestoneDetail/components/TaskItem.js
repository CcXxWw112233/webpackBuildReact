import React from 'react'
import taskItemStyles from './taskItem.less'
import { Icon, Input, Button, DatePicker, Dropdown, Menu, Avatar, Tooltip, Popconfirm, } from 'antd'
import { timestampToTimeNormal, timeToTimestamp } from '../../../../../../../utils/util'
import globalStyles from '../../../../../../../globalset/css/globalClassName.less'
import AvatarList from '../../../../../../../components/avatarList'
import { connect } from 'dva'
const TextArea = Input.TextArea

@connect(mapStateToProps)
export default class DCAddChirdrenTaskItem extends React.Component{

  state = {
    isCheck: false,
    localChildTaskName: '',
    isInEditTaskName: false,
  }
  deleteConfirm = ({id}) => {
    const { milestone_id, dispatch } = this.props
    dispatch({
      type: 'milestoneDetail/taskCancelRelaMiletones',
      payload: {
        id: milestone_id,
        rela_id: id
      }
    })
  }
  render() {
    const { itemValue = {} } = this.props
    const { id, name, deadline, is_completed, users = []} = itemValue

    return (
      <div className={`${taskItemStyles.taskItem}`}>
        <div className={`${taskItemStyles.item_1} ${taskItemStyles.pub_hover}`} >

          {/*完成*/}
          <div className={is_completed == '1' ? taskItemStyles.nomalCheckBoxActive: taskItemStyles.nomalCheckBox}>
            <Icon type="check" style={{color: '#FFFFFF', fontSize: 12, fontWeight: 'bold'}}/>
          </div>

          {/*名称*/}
          <div style={{wordWrap: 'break-word', paddingTop: 2}} >
            {name}
          </div>
          {/*日期*/}
          <div style={{color: '#d5d5d5'}}>{timestampToTimeNormal(deadline, '/', true)}</div>
          <div style={{margin: '0 8px'}}>
            <AvatarList size={'small'} users={users} />
          </div>
          {/*<Avatar size={16} src={executor.avatar} style={{fontSize: 14,margin: '0 12px 0 12px'}}>*/}
            {/*{executor.name || '佚' }*/}
          {/*</Avatar>*/}

          {/*cuozuo*/}
          <Popconfirm onConfirm={this.deleteConfirm.bind(this, {id})} title={'删除该子任务？'}>
            <Tooltip title={'移出里程碑'}>
              <div className={`${globalStyles.authTheme} ${taskItemStyles.deletedIcon}`} style={{fontSize: 16}}>&#xe70f;</div>
            </Tooltip>
          </Popconfirm>
        </div>
      </div>
    )
  }
}
function mapStateToProps({ milestoneDetail: { milestone_detail = {} } }) {
  return { milestone_detail }
}
