import React from 'react'
import indexStyles from './index.less'
import { Card, Input, Icon, DatePicker, Dropdown, Button, Tooltip } from 'antd'
import MenuSearchMultiple from './MenuSearchMultiple'
import { timeToTimestamp } from '../../../../../../utils/util'
import ContentRaletion from '../../../../../../components/ContentRaletion'

const { RangePicker } = DatePicker;
//里程碑确认信息
export default class ConfirmInfoOne extends React.Component {
  state = {
    due_time: '',
    isShowBottDetail: false, //是否显示底部详情
    relations: [], //关联的内容
  }
  //这里的逻辑用来设置固定人选时将名称替换成id
  componentWillMount(nextProps) {
    const { datas: { processEditDatas = [], projectDetailInfoData = [] } } = this.props.model
    const { itemKey } = this.props
    const { assignees, assignee_type } = processEditDatas[itemKey]
    //推进人来源
    let usersArray = []
    const users = projectDetailInfoData.data
    for(let i = 0; i < users.length; i++) {
      usersArray.push(users[i].full_name || users[i].email || users[i].mobile)
    }
    //推进人
    const assigneesArray = assignees ? assignees.split(',') : []
    if(assignee_type === '3') {
      for(let i = 0; i < assigneesArray.length; i++) {
        for (let j = 0; j <　usersArray.length; j++) {
          if(assigneesArray[i] === usersArray[j]) {
            assigneesArray[i] = users[j].user_id
            continue
          }
        }
      }
      const { datas: { processEditDatas = [] } } = this.props.model
      const str = assigneesArray.join(',')
      processEditDatas[itemKey]['assignees'] = str
      this.props.updateDatasProcess({
        processEditDatas
      })
    }

    //设置底部可伸缩部分id
    this.setState({
      ConfirmInfoOut_1_bott_Id: `ConfirmInfoOut_1_bott_Id__${itemKey * 100 + 1}`
    })
  }

  tooltipFilterName({ users=[], user_id}) {
    let name = '佚名'
    for (let val of users) {
      if(user_id === val.user_id) {
        name = val.full_name || val.mobile || val.email
        break
      }
    }
    return name
  }
  datePickerChange(date, dateString) {
    if(!dateString) {
      return false
    }
    this.setState({
      due_time: dateString
    })
    // console.log(timeToTimestamp(dateString))
    const { datas: { processEditDatas = [], projectDetailInfoData = [] } } = this.props.model
    const { itemKey } = this.props
    processEditDatas[itemKey]['deadline_value'] = timeToTimestamp(dateString)
    //业务逻辑修改deadline_value作废
    processEditDatas[itemKey]['deadline'] = timeToTimestamp(dateString)
    this.props.updateDatasProcess({
      processEditDatas
    })

  }
  setAssignees(data) {
    const { datas: { processEditDatas = [] } } = this.props.model
    const { itemKey } = this.props
    const str = data.join(',')
    processEditDatas[itemKey]['assignees'] = str
    this.props.updateDatasProcess({
      processEditDatas
    })
  }
  setIsShowBottDetail() {
    this.setState({
      isShowBottDetail: !this.state.isShowBottDetail
    }, function () {
      this.funTransitionHeight(element, 500, this.state.isShowBottDetail)
    })
    const { ConfirmInfoOut_1_bott_Id } = this.state
    const element = document.getElementById(ConfirmInfoOut_1_bott_Id)
  }
  funTransitionHeight = function(element, time, type) { // time, 数值，可缺省
    if (typeof window.getComputedStyle === "undefined") return;
      const height = window.getComputedStyle(element).height;
      element.style.transition = "none"; // 本行2015-05-20新增，mac Safari下，貌似auto也会触发transition, 故要none下~
      element.style.height = "auto";
      const targetHeight = window.getComputedStyle(element).height;
      element.style.height = height;
      element.offsetWidth;
      if (time) element.style.transition = "height "+ time +"ms";
      element.style.height = type ? targetHeight : 0;
  };

  render() {
    const { due_time, isShowBottDetail, ConfirmInfoOut_1_bott_Id, relations = [] } = this.state
    const { datas: { processEditDatas = [], projectDetailInfoData = [] } } = this.props.model
    const { itemKey } = this.props
    const { board_id } = projectDetailInfoData
    const { name, description, assignees, assignee_type, deadline_type, deadline_value, is_workday, id } = processEditDatas[itemKey]
    //推进人来源
    const users = projectDetailInfoData.data
    //推进人
    const assigneesArray = assignees ? assignees.split(',') : []
    const imgOrAvatar = ({users, user_id}) => {
      let img = ''
      for(let val of users) {
        if(val['user_id'] == user_id) {
          img = val['avatar']
          break
        }
      }
      return img ? (
        <div>
          <img src={img} style={{width: 18, height: 18, marginRight: 8, borderRadius: 16, margin: '0 8px'}} />
        </div>
      ):(
        <div style={{lineHeight: '18px', height: 18, width: 16, borderRadius: 18, backgroundColor: '#e8e8e8', marginRight: 8, textAlign: 'center', margin: '0 8px', marginTop: 2, }}>
          <Icon type={'user'} style={{fontSize: 10, color: '#8c8c8c', }}/>
        </div>
      )
    }
    const filterAssignee = (assignee_type) => {
      let container = (<div></div>)
      switch (assignee_type) {
        case '1':
          container = (<div style={{color: '#595959'}}>任何人</div>)
          break
        case '2':
          container = (
            <div>
              <Dropdown overlay={<MenuSearchMultiple usersArray={users} setAssignees={this.setAssignees.bind(this)} />}>
                {assigneesArray.length? (
                  <div style={{display: 'flex'}}>
                    {assigneesArray.map((value, key)=>{
                      if (key < 6)
                        return(
                          <Tooltip key={key} placement="top" title={this.tooltipFilterName.bind(this, {users: users, user_id: value})}>
                            <div>{imgOrAvatar({users: users, user_id: value})}</div>
                          </Tooltip>
                        )
                    })}
                    {assigneesArray.length >6?(<span style={{color: '#595959'}}>{`等${assigneesArray.length}人`}</span>): ('') }
                  </div>
                ) : (
                  <div>
                    设置推进人
                  </div>
                )}
              </Dropdown>
            </div>
)
          break
        case '3':
          container = (
            <div style={{display: 'flex'}}>
              {assigneesArray.map((value, key)=>{
                if (key < 6)
                  return(
                    <Tooltip key={key} placement="top" title={this.tooltipFilterName.bind(this, {users: users, user_id: value})}>
                      <div>{imgOrAvatar({users: users, user_id: value})}</div>
                    </Tooltip>
                  )
              })}
              {assigneesArray.length >6?(<span style={{color: '#595959'}}>{`等${assigneesArray.length}人`}</span>): ('') }
            </div>
          )
          break
        default:
          container = (<div></div>)
          break
      }
      return container
    }
    const filterDueTime = (deadline_type) => {
      let container = (<div></div>)
      switch (deadline_type) {
        case '1':
          container = (<div style={{color: '#595959'}}>无限期</div>)
          break
        case '2':
          container = (
            <div style={{position: 'relative' }}>
              {due_time || '设置截止时间'}
              <DatePicker onChange={this.datePickerChange.bind(this)}
                           placeholder={'选择截止时间'}
                           showTime
                           format="YYYY-MM-DD HH:mm"
                           style={{opacity: 0, height: 16, minWidth: 0, maxWidth: '100px', background: '#000000', position: 'absolute', right: 0, zIndex: 2, cursor: 'pointer'}} />
            </div>
          )
          break
        case '3':
          container = (<div style={{color: '#595959'}}>{`${is_workday === '0'? '固定': '工作日'}${deadline_value}天`}</div>)
          break
        default:
          container = (<div></div>)
          break
      }
      return container
    }

    return (
      <div className={indexStyles.ConfirmInfoOut_1}>
        <Card style={{width: '100%', backgroundColor: '#f5f5f5'}}>
          <div className={indexStyles.ConfirmInfoOut_1_top}>
            <div className={indexStyles.ConfirmInfoOut_1_top_left}>
              <div className={indexStyles.ConfirmInfoOut_1_top_left_left}>{itemKey+1}</div>
              <div className={indexStyles.ConfirmInfoOut_1_top_left_right}>
                <div>{name}</div>
                <div>里程碑</div>
              </div>
            </div>
            <div className={indexStyles.ConfirmInfoOut_1_top_right}>
              {filterAssignee(assignee_type)}
              {/*原先可以设置无限期/手动设置/固定天数*/}
              {/*{filterDueTime(deadline_type)}*/}
              {/*只能手动设置*/}
              {filterDueTime('2')}
              <div className={isShowBottDetail ? indexStyles.upDown_up: indexStyles.upDown_down}><Icon onClick={this.setIsShowBottDetail.bind(this)} type="down" theme="outlined" style={{color: '#595959'}}/></div>
            </div>
          </div>
          <div className={isShowBottDetail? indexStyles.ConfirmInfoOut_1_bottShow : indexStyles.ConfirmInfoOut_1_bottNormal} id={ConfirmInfoOut_1_bott_Id} >
            <div className={indexStyles.ConfirmInfoOut_1_bott_left}></div>
            <div className={indexStyles.ConfirmInfoOut_1_bott_right} >
              <div className={indexStyles.ConfirmInfoOut_1_bott_right_dec}>{description}</div>
              <div>
                <ContentRaletion
                  {...this.props}
                  board_id ={board_id}
                  link_id={id}
                  link_local={'22'}
                />
              </div>
            </div>
          </div>
        </Card>
      </div>
    )
  }
}
