import React from 'react'
import { Card, Icon, Input, Tooltip, message } from 'antd'
import NewsListStyle from './NewsList.less'
import styles from './index.css'
import QueueAnim from 'rc-queue-anim'
import {
  newsDynamicHandleTime,
  timestampToTime,
  timestampToHM
} from '../../../../utils/util'
import Comment from './Comment'
import {
  ORGANIZATION,
  TASKS,
  FLOWS,
  DASHBOARD,
  PROJECTS,
  FILES,
  MEMBERS,
  CATCH_UP,
  ORG_TEAM_BOARD_QUERY,
  NOT_HAS_PERMISION_COMFIRN,
  MESSAGE_DURATION_TIME,
  PROJECT_TEAM_CARD_INTERVIEW,
  PROJECT_FILES_FILE_INTERVIEW,
  PROJECT_FLOW_FLOW_ACCESS
} from '../../../../globalset/js/constant'
import {
  currentNounPlanFilterName,
  getOrgNameWithOrgIdFilter,
  checkIsHasPermission,
  checkIsHasPermissionInBoard
} from '../../../../utils/businessFunction'
import { connect } from 'dva'
import globalStyles from '@/globalset/css/globalClassName.less'

@connect(
  ({
    technological: {
      datas: {
        currentUserOrganizes = [],
        is_show_org_name,
        userOrgPermissions,
        userBoardPermissions
      }
    }
  }) => ({
    currentUserOrganizes,
    is_show_org_name,
    userOrgPermissions,
    userBoardPermissions
  })
)
export default class NewsListNewDatas extends React.Component {
  allSetReaded() {
    //全部标记为已读
  }
  getNewsDynamicListNext(next_id) {
    this.props.getNewsDynamicList(next_id)
  }
  updateNewsDynamic() {
    this.props.updateDatas({
      isHasNewDynamic: false
    })
    this.props.getNewsDynamicList('0')
  }
  routingJump(path) {
    this.props.dispatch({
      type: 'newsDynamic/routingJump',
      payload: {
        route: path
      }
    })
  }

  // 去到项目详情
  goToBoard({ org_id, content }) {
    // console.log(checkIsHasPermission(ORG_TEAM_BOARD_QUERY, org_id), 'sss')
    // if(!checkIsHasPermission(ORG_TEAM_BOARD_QUERY, org_id)){
    //   message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
    //   return false
    // }
    if (content && content.board && content.board.id) {
      this.routingJump(
        `/technological/projectDetail?board_id=${content &&
          content.board &&
          content.board.id}`
      )
    }
  }

  // 去任务详情
  goToTask({ board_id, content }) {
    if (!checkIsHasPermissionInBoard(PROJECT_TEAM_CARD_INTERVIEW, board_id)) {
      message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
      return false
    }
    if (content && content.card && content.card.id) {
      this.routingJump(
        `/technological/projectDetail?board_id=${content &&
          content.board &&
          content.board.id}&appsSelectKey=3&card_id=${content &&
          content.card &&
          content.card.id}`
      )
    }
  }

  // 去文件详情
  goToFile({ board_id, content }) {
    if (!checkIsHasPermissionInBoard(PROJECT_FILES_FILE_INTERVIEW, board_id)) {
      message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
      return false
    }
    if (content && content.board_file && content.board_file.id) {
      this.routingJump(
        `/technological/projectDetail?board_id=${content &&
          content.board &&
          content.board.id}&appsSelectKey=4&file_id=${content &&
          content.board_file &&
          content.board_file.id}`
      )
    }
  }

  // 去流程详情
  goToProcess({ board_id, content }) {
    if (!checkIsHasPermissionInBoard(PROJECT_FLOW_FLOW_ACCESS, board_id)) {
      message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
      return false
    }
    if (content && content.flow_instance && content.flow_instance.id) {
      this.routingJump(
        `/technological/projectDetail?board_id=${content &&
          content.board &&
          content.board.id}&appsSelectKey=2&flow_id=${content &&
          content.flow_instance &&
          content.flow_instance.id}`
      )
    }
  }

  // 去到会议
  goToMeeting({ join_url }) {
    // console.log(join_url, 'ssssss')
    window.open(join_url)
  }

  render() {
    const {
      datas: {
        newsDynamicList = [],
        next_id,
        isHasMore = true,
        isHasNewDynamic,
        newsList = []
      }
    } = this.props.model
    // console.log(newsDynamicList, 'sssss')
    const { currentUserOrganizes = [], is_show_org_name } = this.props
    //过滤消息内容
    const filterTitleContain = (activity_type, messageValue) => {
      // console.log(messageValue, 'sssss')
      let contain = ''
      let messageContain = <div></div>
      let link_message = <span></span>
      let jumpToBoard = (
        <span
          style={{ color: '#1890FF', cursor: 'pointer' }}
          onClick={() => {
            this.goToBoard({
              org_id: messageValue.org_id,
              content: messageValue.content
            })
          }}
        >
          {messageValue.content.board && messageValue.content.board.name}
        </span>
      )
      let jumpToTask = (
        // <span style={{color: '#1890FF', cursor: 'pointer', maxWidth: 100, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', display: 'inline-block', verticalAlign: 'top'}} onClick={this.routingJump.bind(this, `/technological/projectDetail?board_id=${messageValue.content && messageValue.content.board && messageValue.content.board.id}&appsSelectKey=3&card_id=${messageValue.content && messageValue.content.card && messageValue.content.card.id}`)}>{messageValue.content && messageValue.content.card && messageValue.content.card.name}</span>
        <span
          style={{ color: '#1890FF', cursor: 'pointer' }}
          onClick={() => {
            this.goToTask({
              board_id: messageValue.content.board.id,
              content: messageValue.content
            })
          }}
        >
          {messageValue.content &&
            messageValue.content.card &&
            messageValue.content.card.name}
        </span>
      )

      let jumpToFile = (
        // <span style={{color: '#1890FF', cursor: 'pointer', maxWidth: 100, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', display: 'inline-block', verticalAlign: 'top'}} onClick={this.routingJump.bind(this, `/technological/projectDetail?board_id=${messageValue.content && messageValue.content.board && messageValue.content.board.id}&appsSelectKey=4&file_id=${messageValue.content && messageValue.content.board_file && messageValue.content.board_file.id}`)}>{messageValue.content && messageValue.content.board_file && messageValue.content.board_file.name}</span>
        <span
          style={{ color: '#1890FF', cursor: 'pointer' }}
          onClick={() => {
            this.goToFile({
              board_id: messageValue.content.board.id,
              content: messageValue.content
            })
          }}
        >
          {messageValue.content &&
            messageValue.content.board_file &&
            messageValue.content.board_file.name}
        </span>
      )

      let jumpToProcess = (
        // <span style={{color: '#1890FF', cursor: 'pointer', maxWidth: 100, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', display: 'inline-block', verticalAlign: 'top'}} onClick={this.routingJump.bind(this, `/technological/projectDetail?board_id=${messageValue.content && messageValue.content.board && messageValue.content.board.id}&appsSelectKey=2&flow_id=${messageValue.content && messageValue.content.flow_instance && messageValue.content.flow_instance.id}`)}>{messageValue.content && messageValue.content.flow_instance && messageValue.content.flow_instance.name}</span>
        <span
          style={{ color: '#1890FF', cursor: 'pointer' }}
          onClick={() => {
            this.goToProcess({
              board_id: messageValue.content.board.id,
              content: messageValue.content
            })
          }}
        >
          {messageValue.content &&
            messageValue.content.flow_instance &&
            messageValue.content.flow_instance.name}
        </span>
      )
      // 会议
      let jumpToMeeting = (
        <span
          style={{
            color: '#1890FF',
            cursor: 'pointer',
            maxWidth: 100,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            display: 'inline-block',
            verticalAlign: 'top'
          }}
          onClick={() => {
            this.goToMeeting({
              join_url:
                messageValue.content.meeting &&
                messageValue.content.meeting.join_url
            })
          }}
        >
          {messageValue.content &&
            messageValue.content.meeting &&
            messageValue.content.meeting.meeting_name}
        </span>
      )

      switch (activity_type) {
        // 组织
        case 'organization.member.apply': // 申请加入组织
          contain = `申请加入${currentNounPlanFilterName(ORGANIZATION)}`
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator && messageValue.creator.name} 申请加入
                {currentNounPlanFilterName(ORGANIZATION)}「
                {messageValue.content &&
                  messageValue.content.org &&
                  messageValue.content.org.name}
                」
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToHM(messageValue.created)}
              </div>
            </div>
          )
          break
        //项目 ----------------------------------------
        case 'board.create': // 项目创建
          contain = `创建${currentNounPlanFilterName(PROJECTS)}`
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name} 创建
                {currentNounPlanFilterName(PROJECTS)}「{jumpToBoard}」
                {currentNounPlanFilterName(PROJECTS)}
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToHM(messageValue.created)}
              </div>
            </div>
          )
          break
        case 'board.update.name': // 更新项目信息
          contain = `更新${currentNounPlanFilterName(PROJECTS)}信息`
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name} 修改了原项目名 「
                {messageValue.content && messageValue.content.rela_data}」为「
                {jumpToBoard}」名称
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToHM(messageValue.created)}
              </div>
            </div>
          )
          break
        case 'board.update.description': // 修改项目描述
          contain = `修改${currentNounPlanFilterName(PROJECTS)}描述`
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name} 修改了「{jumpToBoard}」的
                {currentNounPlanFilterName(PROJECTS)}描述
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToHM(messageValue.created)}
              </div>
            </div>
          )
          break
        // case 'board.update.archived': // 项目归档
        //   contain = `${currentNounPlanFilterName(PROJECTS)}归档`
        //   messageContain = (
        //     <div className={NewsListStyle.news_3}>
        //       <div className={NewsListStyle.news_3_text}>{messageValue.creator.name} 归档了「{jumpToBoard}」{currentNounPlanFilterName(PROJECTS)}</div>
        //       <div className={NewsListStyle.news_3_time}>{timestampToHM(messageValue.created)}</div>
        //     </div>
        //   )
        //   break
        case 'board.update.user.quit': // 用户退出项目
          contain = `退出${currentNounPlanFilterName(PROJECTS)}`
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name} 退出了「{jumpToBoard}」
                {currentNounPlanFilterName(PROJECTS)}
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToHM(messageValue.created)}
              </div>
            </div>
          )
          break
        case 'board.update.app.remove': // 移除项目功能
          contain = `移除了${currentNounPlanFilterName(PROJECTS)}功能`
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name} 在
                {currentNounPlanFilterName(PROJECTS)}「{jumpToBoard}」中
                移除了「
                {messageValue.content.rela_data &&
                  messageValue.content.rela_data}
                」的功能
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToHM(messageValue.created)}
              </div>
            </div>
          )
          break
        case 'board.update.app.add': // 添加了项目的功能
          contain = `添加${currentNounPlanFilterName(PROJECTS)}功能`
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name}在
                {currentNounPlanFilterName(PROJECTS)}「{jumpToBoard}」中
                添加了「
                {messageValue.content.rela_data &&
                  messageValue.content.rela_data}
                」的功能
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToHM(messageValue.created)}
              </div>
            </div>
          )
          break
        case 'board.flow.node.deadline.set': // 设置流程节点时间
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name} 在
                {currentNounPlanFilterName(PROJECTS)}「{jumpToBoard}」中 设置了
                {currentNounPlanFilterName(FLOWS)}「{jumpToProcess}」中步骤「
                {messageValue.content.flow_node_instance &&
                  messageValue.content.flow_node_instance.name}
                」的截止时间
              </div>
              {/* 「{messageValue.content.flow_node_instance.name}」 */}
              <div className={NewsListStyle.news_3_time}>
                {timestampToHM(messageValue.created)}
              </div>
            </div>
          )
          contain = `设置${currentNounPlanFilterName(FLOWS)}节点截止时间`
          break
        case 'board.flow.instance.deadline.set': // 设置流程实例的截止时间
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name} 在
                {currentNounPlanFilterName(PROJECTS)}「{jumpToBoard}」中
                设置了流程「{jumpToProcess}」的截止时间
              </div>
              {/* 「{messageValue.content.flow_node_instance.name}」 */}
              <div className={NewsListStyle.news_3_time}>
                {timestampToHM(messageValue.created)}
              </div>
            </div>
          )
          contain = `设置${currentNounPlanFilterName(FLOWS)}截止时间`
          break
        case 'board.flow.task.attach.upload': // 在流程中上传文件
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name} 在流程「{jumpToProcess}」上传了文件
                「
                {
                  <span>
                    {messageValue.content &&
                      messageValue.content.rela_data &&
                      messageValue.content.rela_data.name}
                  </span>
                }
                」
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToHM(messageValue.created)}
              </div>
            </div>
          )
          contain = `上传${currentNounPlanFilterName(FLOWS)}文件附件`
          break
        case 'board.flow.cc.notice': // 在流程中抄送
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name} 在流程「
                {
                  <span
                    style={{ color: '#1890FF', cursor: 'pointer' }}
                    onClick={() =>
                      this.props.dispatch({
                        type: 'newsDynamic/routingJump',
                        payload: {
                          route: `/technological/projectDetail?board_id=${
                            messageValue.content.board.id
                          }&appsSelectKey=2&flow_id=${messageValue.content
                            .flow_instance &&
                            messageValue.content.flow_instance.id}`
                        }
                      })
                    }
                  >
                    {messageValue.content &&
                      messageValue.content.flow_instance &&
                      messageValue.content.flow_instance.name}
                  </span>
                }
                」中 给您抄送了{currentNounPlanFilterName(FLOWS)}
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToHM(messageValue.created)}
              </div>
            </div>
          )
          contain = `在${currentNounPlanFilterName(FLOWS)}中抄送`
          break
        case 'board.delete': // 项目的删除
          contain = `删除${currentNounPlanFilterName(PROJECTS)}`
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name} 删除了「{jumpToBoard}」
                {currentNounPlanFilterName(PROJECTS)}
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToHM(messageValue.created)}
              </div>
            </div>
          )
          break
        case 'board.update.user.add': // 项目中添加成员
          contain = `添加${currentNounPlanFilterName(PROJECTS)}成员`
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name} 邀请「
                {messageValue.content.rela_users &&
                  Array.isArray(messageValue.content.rela_users) &&
                  messageValue.content.rela_users}
                」加入了「{jumpToBoard}」{currentNounPlanFilterName(PROJECTS)}
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToHM(messageValue.created)}
              </div>
            </div>
          )
          break
        case 'board.content.link.add': // 新增的关联内容
          contain = `新增关联内容`
          if (
            messageValue.content &&
            messageValue.content.rela_data &&
            messageValue.content.rela_data.type
          ) {
            if (messageValue.content.rela_data.type == '3') {
              // 表示任务
              link_message = (
                <span>
                  在{currentNounPlanFilterName(TASKS)}「{jumpToTask}
                  」中新增了关联内容「
                  {messageValue.content.rela_data &&
                    messageValue.content.rela_data.name}
                  」
                </span>
              )
            } else if (messageValue.content.rela_data.type == '2') {
              // 表示流程
              link_message = (
                <span>
                  在{currentNounPlanFilterName(FLOWS)}「{jumpToProcess}
                  」中新增了关联内容「
                  {messageValue.content.rela_data &&
                    messageValue.content.rela_data.name}
                  」
                </span>
              )
            } else if (messageValue.content.rela_data.type == '21') {
              // 表示流程节点
              link_message = (
                <span>
                  在{currentNounPlanFilterName(FLOWS)}「{jumpToProcess}
                  」的节点「
                  {messageValue.content.flow_node &&
                    messageValue.content.flow_node.name}
                  」中新增了关联内容「
                  {messageValue.content.rela_data &&
                    messageValue.content.rela_data.name}
                  」
                </span>
              )
            } else if (messageValue.content.rela_data.type == '4') {
              // 表示文件
              link_message = (
                <span>
                  在{currentNounPlanFilterName(FILES)}「{jumpToFile}
                  」中新增了关联内容「
                  {messageValue.content.rela_data &&
                    messageValue.content.rela_data.name}
                  」
                </span>
              )
            }
          }
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name} {link_message}
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToHM(messageValue.created)}
              </div>
            </div>
          )
          break
        case 'board.content.link.remove': // 移除关联内容
          contain = `关联内容的移除`
          if (
            messageValue.content &&
            messageValue.content.rela_data &&
            messageValue.content.rela_data.type
          ) {
            if (messageValue.content.rela_data.type == '3') {
              // 表示任务
              link_message = (
                <span>
                  在{currentNounPlanFilterName(TASKS)}「{jumpToTask}
                  」中移除了关联内容「
                  {messageValue.content.rela_data &&
                    messageValue.content.rela_data.name}
                  」
                </span>
              )
            } else if (messageValue.content.rela_data.type == '2') {
              // 表示流程
              link_message = (
                <span>
                  在{currentNounPlanFilterName(FLOWS)}「{jumpToProcess}
                  」中移除了关联内容「
                  {messageValue.content.rela_data &&
                    messageValue.content.rela_data.name}
                  」
                </span>
              )
            } else if (messageValue.content.rela_data.type == '21') {
              // 表示流程节点
              link_message = (
                <span>
                  在{currentNounPlanFilterName(FLOWS)}「{jumpToProcess}
                  」的节点「
                  {messageValue.content.flow_node &&
                    messageValue.content.flow_node.name}
                  」中移除了关联内容「
                  {messageValue.content.rela_data &&
                    messageValue.content.rela_data.name}
                  」
                </span>
              )
            } else if (messageValue.content.rela_data.type == '4') {
              // 表示文件
              link_message = (
                <span>
                  在{currentNounPlanFilterName(FILES)}「{jumpToFile}
                  」中移除了关联内容「
                  {messageValue.content.rela_data &&
                    messageValue.content.rela_data.name}
                  」
                </span>
              )
            }
          }
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name} {link_message}
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToHM(messageValue.created)}
              </div>
            </div>
          )
          break
        case 'board.content.link.update': // 修改关联内容
          contain = `关联内容名称的修改`
          if (
            messageValue.content &&
            messageValue.content.rela_data &&
            messageValue.content.rela_data.type
          ) {
            if (messageValue.content.rela_data.type == '3') {
              // 表示任务
              link_message = (
                <span>
                  在{currentNounPlanFilterName(TASKS)}「{jumpToTask}
                  」中修改了关联内容「
                  {messageValue.content.rela_data &&
                    messageValue.content.rela_data.name}
                  」
                </span>
              )
            } else if (messageValue.content.rela_data.type == '2') {
              // 表示流程
              link_message = (
                <span>
                  在{currentNounPlanFilterName(FLOWS)}「{jumpToProcess}
                  」中修改了关联内容「
                  {messageValue.content.rela_data &&
                    messageValue.content.rela_data.name}
                  」
                </span>
              )
            } else if (messageValue.content.rela_data.type == '21') {
              // 表示流程节点
              link_message = (
                <span>
                  在{currentNounPlanFilterName(FLOWS)}「{jumpToProcess}
                  」的节点「
                  {messageValue.content.flow_node &&
                    messageValue.content.flow_node.name}
                  」中修改了关联内容「
                  {messageValue.content.rela_data &&
                    messageValue.content.rela_data.name}
                  」
                </span>
              )
            } else if (messageValue.content.rela_data.type == '4') {
              // 表示文件
              link_message = (
                <span>
                  在{currentNounPlanFilterName(FILES)}「{jumpToFile}
                  」中修改了关联内容「
                  {messageValue.content.rela_data &&
                    messageValue.content.rela_data.name}
                  」
                </span>
              )
            }
          }
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name} {link_message}
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToHM(messageValue.created)}
              </div>
            </div>
          )
          break
        case 'board.update.user.role': // 设置用户在项目中的角色
          contain = `在${currentNounPlanFilterName(PROJECTS)}中设置成员角色`
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name}在
                {currentNounPlanFilterName(PROJECTS)}「{jumpToBoard}
                」中设置了成员「
                {messageValue.content.rela_users &&
                  messageValue.content.rela_users}
                」的角色为「
                {messageValue.content.rela_data &&
                  messageValue.content.rela_data}
                」
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToHM(messageValue.created)}
              </div>
            </div>
          )
          break
        // case 'board.update.contentprivilege': // 设置项目的内容特权
        //   break
        //任务 --------------------------------------------
        case 'board.card.create':
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name} 创建了
                {messageValue.content.card_type &&
                messageValue.content.card_type == '0'
                  ? currentNounPlanFilterName(TASKS)
                  : '日程'}
                「{jumpToTask}」{' '}
              </div>
              {/* <div className={NewsListStyle.news_3_card}>{jumpToTask}</div>
             <div className={NewsListStyle.news_3_project}>{currentNounPlanFilterName(PROJECTS)}：# {jumpToBoard}</div>
             <div className={NewsListStyle.news_3_group}>分组：{messageValue.list_name?messageValue.list_name:'无'}</div> */}
              <div className={NewsListStyle.news_3_time}>
                {timestampToHM(messageValue.created)}
              </div>
            </div>
          )
          contain = `创建${
            messageValue.content.card_type &&
            messageValue.content.card_type == '0'
              ? currentNounPlanFilterName(TASKS)
              : '日程'
          }`
          break
        case 'board.card.create.child': // 创建子卡片
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name} 在{currentNounPlanFilterName(TASKS)}
                「
                {messageValue.content.rela_card &&
                  messageValue.content.rela_card.name}
                」 中创建了子{currentNounPlanFilterName(TASKS)}「{jumpToTask}」{' '}
              </div>
              {/* <div className={NewsListStyle.news_3_card}>{jumpToTask}</div>
              <div className={NewsListStyle.news_3_project}>{currentNounPlanFilterName(PROJECTS)}：# {jumpToBoard}</div>
              <div className={NewsListStyle.news_3_group}>分组：{messageValue.list_name}</div> */}
              <div className={NewsListStyle.news_3_time}>
                {timestampToHM(messageValue.created)}
              </div>
            </div>
          )
          contain = `创建子${currentNounPlanFilterName(TASKS)}`
          break
        case 'board.card.update.finish.child': // 子卡片的完成\
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name} 在{currentNounPlanFilterName(TASKS)}
                「
                {messageValue.content.rela_card &&
                  messageValue.content.rela_card.name}
                」 中完成了子{currentNounPlanFilterName(TASKS)}「{jumpToTask}」{' '}
              </div>
              {/* <div className={NewsListStyle.news_3_card}>{jumpToTask}</div>
            <div className={NewsListStyle.news_3_project}>{currentNounPlanFilterName(PROJECTS)}：# {jumpToBoard}</div>
            <div className={NewsListStyle.news_3_group}>分组：{messageValue.list_name}</div> */}
              <div className={NewsListStyle.news_3_time}>
                {timestampToHM(messageValue.created)}
              </div>
            </div>
          )
          contain = `完成子${currentNounPlanFilterName(TASKS)}`
          break
        case 'board.card.update.cancel.finish.child': // 取消完成子卡片
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name} 在{currentNounPlanFilterName(TASKS)}
                「
                {messageValue.content.rela_card &&
                  messageValue.content.rela_card.name}
                」 中取消完成了子{currentNounPlanFilterName(TASKS)}「
                {jumpToTask}」{' '}
              </div>
              {/* <div className={NewsListStyle.news_3_card}>{jumpToTask}</div>
          <div className={NewsListStyle.news_3_project}>{currentNounPlanFilterName(PROJECTS)}：# {jumpToBoard}</div>
          <div className={NewsListStyle.news_3_group}>分组：{messageValue.list_name}</div> */}
              <div className={NewsListStyle.news_3_time}>
                {timestampToHM(messageValue.created)}
              </div>
            </div>
          )
          contain = `取消完成子${currentNounPlanFilterName(TASKS)}`
          break
        case 'board.card.update.archived': // 归档卡片
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name} 归档了
                {currentNounPlanFilterName(TASKS)}「{jumpToTask}」{' '}
              </div>
              {/* <div className={NewsListStyle.news_3_card}>{jumpToBoard}</div>
              <div className={NewsListStyle.news_3_project}>{currentNounPlanFilterName(PROJECTS)}：# {jumpToBoard}</div>
              <div className={NewsListStyle.news_3_group}>分组：{messageValue.list_name}</div> */}
              <div className={NewsListStyle.news_3_time}>
                {timestampToHM(messageValue.created)}
              </div>
            </div>
          )
          contain = `归档${currentNounPlanFilterName(TASKS)}`
          break
        case 'board.card.update.finish':
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name} 完成了
                {currentNounPlanFilterName(TASKS)}「{jumpToTask}」{' '}
              </div>
              {/* <div className={NewsListStyle.news_3_card}>{jumpToBoard}</div>
              <div className={NewsListStyle.news_3_project}>{currentNounPlanFilterName(PROJECTS)}：# {jumpToBoard}</div>
              <div className={NewsListStyle.news_3_group}>分组：{messageValue.list_name?messageValue.list_name:'无'}</div> */}
              <div className={NewsListStyle.news_3_time}>
                {timestampToHM(messageValue.created)}
              </div>
            </div>
          )
          contain = `完成${currentNounPlanFilterName(TASKS)}`
          break
        case 'board.card.update.cancel.finish':
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name} 取消完成
                {currentNounPlanFilterName(TASKS)}「{jumpToTask}」{' '}
              </div>
              {/* <div className={NewsListStyle.news_3_card}>{jumpToBoard}</div>
              <div className={NewsListStyle.news_3_project}>{currentNounPlanFilterName(PROJECTS)}：# {jumpToBoard}</div>
              <div className={NewsListStyle.news_3_group}>分组：{messageValue.list_name}</div> */}
              <div className={NewsListStyle.news_3_time}>
                {timestampToHM(messageValue.created)}
              </div>
            </div>
          )
          contain = `取消完成${currentNounPlanFilterName(TASKS)}`
          break
        case 'board.card.delete':
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name} 删除了
                {currentNounPlanFilterName(TASKS)}「{jumpToTask}」{' '}
              </div>
              {/* <div className={NewsListStyle.news_3_card}>{jumpToTask}</div>
              <div className={NewsListStyle.news_3_project}>{currentNounPlanFilterName(PROJECTS)}：# {jumpToBoard}</div>
              <div className={NewsListStyle.news_3_group}>分组：{messageValue.list_name?messageValue.list_name:'无'}</div> */}
              <div className={NewsListStyle.news_3_time}>
                {timestampToHM(messageValue.created)}
              </div>
            </div>
          )
          contain = `删除${currentNounPlanFilterName(TASKS)}`
          break
        case 'board.card.delete.child': // 删除子卡片
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name}在{currentNounPlanFilterName(TASKS)}
                「
                {messageValue.content.rela_card &&
                  messageValue.content.rela_card.name}
                」中 删除了子{currentNounPlanFilterName(TASKS)}「{jumpToTask}」{' '}
              </div>
              {/* <div className={NewsListStyle.news_3_card}>{jumpToTask}</div>
            <div className={NewsListStyle.news_3_project}>{currentNounPlanFilterName(PROJECTS)}：# {jumpToBoard}</div>
            <div className={NewsListStyle.news_3_group}>分组：{messageValue.list_name?messageValue.list_name:'无'}</div> */}
              <div className={NewsListStyle.news_3_time}>
                {timestampToHM(messageValue.created)}
              </div>
            </div>
          )
          contain = `删除子${currentNounPlanFilterName(TASKS)}`
          break
        case 'board.card.update.name': // 更新卡片信息
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name} 修改了原
                {currentNounPlanFilterName(TASKS)}名「
                {messageValue.content.rela_data &&
                  messageValue.content.rela_data.name}
                」为「{jumpToTask}」 名称
              </div>
              {/* <div className={NewsListStyle.news_3_card}>{jumpToTask}</div>
              <div className={NewsListStyle.news_3_project}>{currentNounPlanFilterName(PROJECTS)}：# {jumpToBoard}</div>
              <div className={NewsListStyle.news_3_group}>分组：{messageValue.list_name?messageValue.list_name:'无'}</div> */}
              <div className={NewsListStyle.news_3_time}>
                {timestampToHM(messageValue.created)}
              </div>
            </div>
          )
          contain = `更新${currentNounPlanFilterName(TASKS)}信息`
          break
        case 'board.card.update.name.child': // 修改子卡片名称
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name} 修改了归属于
                {currentNounPlanFilterName(TASKS)}「
                {messageValue.content.rela_card &&
                  messageValue.content.rela_card.name}
                」中的原子{currentNounPlanFilterName(TASKS)}「
                {messageValue.content.rela_data &&
                  messageValue.content.rela_data.name}
                」名称为{currentNounPlanFilterName(TASKS)}「{jumpToTask}」
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToHM(messageValue.created)}
              </div>
            </div>
          )
          contain = `修改子${currentNounPlanFilterName(TASKS)}名称`
          break
        case 'board.card.update.startTime':
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name}在{currentNounPlanFilterName(TASKS)}
                「{jumpToTask}」中修改了开始时间{' '}
              </div>
              {/* <div className={NewsListStyle.news_3_card}>{jumpToTask}</div>
              <div className={NewsListStyle.news_3_project}>{currentNounPlanFilterName(PROJECTS)}：# {jumpToBoard}</div>
              <div className={NewsListStyle.news_3_group}>分组：{messageValue.list_name?messageValue.list_name:'无'}</div> */}
              <div className={NewsListStyle.news_3_time}>
                {timestampToHM(messageValue.created)}
              </div>
            </div>
          )
          contain = `修改${currentNounPlanFilterName(TASKS)}开始时间`
          break
        case 'board.card.update.dutTime':
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name} 在{currentNounPlanFilterName(TASKS)}
                「{jumpToTask}」中修改了结束时间{' '}
              </div>
              {/* <div className={NewsListStyle.news_3_card}>{jumpToTask}</div>
              <div className={NewsListStyle.news_3_project}>{currentNounPlanFilterName(PROJECTS)}：# {jumpToBoard}</div>
              <div className={NewsListStyle.news_3_group}>分组：{messageValue.list_name?messageValue.list_name:'无'}</div> */}
              <div className={NewsListStyle.news_3_time}>
                {timestampToHM(messageValue.created)}
              </div>
            </div>
          )
          contain = `修改${currentNounPlanFilterName(TASKS)}结束时间`
          break
        case 'board.card.update.dutTime.child': // 修改子卡片的结束时间
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name} 修改了归属于
                {currentNounPlanFilterName(TASKS)}「
                {messageValue.content.rela_card &&
                  messageValue.content.rela_card.name}
                」的子{currentNounPlanFilterName(TASKS)}「{jumpToTask}
                」的结束时间{' '}
              </div>
              {/* <div className={NewsListStyle.news_3_card}>{jumpToTask}</div>
            <div className={NewsListStyle.news_3_project}>{currentNounPlanFilterName(PROJECTS)}：# {jumpToBoard}</div>
            <div className={NewsListStyle.news_3_group}>分组：{messageValue.list_name?messageValue.list_name:'无'}</div> */}
              <div className={NewsListStyle.news_3_time}>
                {timestampToHM(messageValue.created)}
              </div>
            </div>
          )
          contain = `修改子${currentNounPlanFilterName(TASKS)}结束时间`
          break
        case 'board.card.update.description': // 修改卡片的描述
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name}在
                {currentNounPlanFilterName(PROJECTS)}「{jumpToBoard}」中更新了
                {currentNounPlanFilterName(TASKS)}「{jumpToTask}」的描述{' '}
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToHM(messageValue.created)}
              </div>
            </div>
          )
          contain = `更新${currentNounPlanFilterName(TASKS)}描述`
          break
        case 'board.card.update.executor.add': // 父任务添加执行人
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name} 在{currentNounPlanFilterName(TASKS)}
                「{jumpToTask}」中指派了负责人为 「
                {messageValue.content.rela_data &&
                  messageValue.content.rela_data.name}
                」{' '}
              </div>
              {/* <div className={NewsListStyle.news_3_card}>{jumpToTask}</div>
              <div className={NewsListStyle.news_3_text}>指派给 {messageValue.content.rela_data && messageValue.content.rela_data.name}</div>
              <div className={NewsListStyle.news_3_project}>{currentNounPlanFilterName(PROJECTS)}：# {jumpToBoard}</div>
              <div className={NewsListStyle.news_3_group}>分组：{messageValue.list_name?messageValue.list_name:'无'}</div> */}
              <div className={NewsListStyle.news_3_time}>
                {timestampToHM(messageValue.created)}
              </div>
            </div>
          )
          contain = `添加${currentNounPlanFilterName(TASKS)}执行人`
          break
        case 'board.card.update.executor.add.child': // 添加子任务执行人
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name} 在归属于
                {currentNounPlanFilterName(TASKS)}「
                {messageValue.content.rela_card &&
                  messageValue.content.rela_card.name}
                」中的子{currentNounPlanFilterName(TASKS)}「{jumpToTask}
                」指派了负责人为 「
                {messageValue.content.rela_data &&
                  messageValue.content.rela_data.name}
                」{' '}
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToHM(messageValue.created)}
              </div>
            </div>
          )
          contain = `添加子${currentNounPlanFilterName(TASKS)}执行人`
          break
        case 'board.card.update.executor.remove.child': // 移除子执行人
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name} 在归属于
                {currentNounPlanFilterName(TASKS)}「
                {messageValue.content.rela_card &&
                  messageValue.content.rela_card.name}
                」中的子{currentNounPlanFilterName(TASKS)}「{jumpToTask}
                」移除了负责人为 「
                {messageValue.content.rela_data &&
                  messageValue.content.rela_data.name}
                」{' '}
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToHM(messageValue.created)}
              </div>
            </div>
          )
          contain = `移除子${currentNounPlanFilterName(TASKS)}执行人`
          break
        case 'board.card.update.executor.remove':
          // console.log({messageValue})
          contain = `移除${currentNounPlanFilterName(PROJECTS)}成员`
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name} 将 「
                {messageValue.content.rela_data &&
                  messageValue.content.rela_data.name}
                」 移出了「{jumpToTask}」{currentNounPlanFilterName(PROJECTS)}
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToHM(messageValue.created)}
              </div>
            </div>
          )
          break
        case 'board.card.update.label.add':
          if (messageValue.content.rela_data !== undefined) {
            messageContain = (
              <div className={NewsListStyle.news_3}>
                <div className={NewsListStyle.news_3_text}>
                  {messageValue.creator.name} 在
                  {currentNounPlanFilterName(TASKS)}「{jumpToTask}
                  」中添加了标签「
                  {messageValue.content.rela_data &&
                    messageValue.content.rela_data.name}
                  」
                </div>
                {/* <div className={NewsListStyle.news_3_card}>{jumpToTask}</div>
              <div className={NewsListStyle.news_3_project}>{currentNounPlanFilterName(PROJECTS)}：# {jumpToBoard}</div>
              <div className={NewsListStyle.news_3_group}>分组：{messageValue.list_name?messageValue.list_name:'无'}</div> */}
                <div className={NewsListStyle.news_3_time}>
                  {timestampToHM(messageValue.created)}
                </div>
              </div>
            )
          } else {
            messageContain = <div></div>
          }

          contain = `添加${currentNounPlanFilterName(TASKS)}标签`
          break
        case 'board.card.update.label.remove': // 标签的移除
          if (messageValue.content.rela_data !== undefined) {
            messageContain = (
              <div className={NewsListStyle.news_3}>
                <div className={NewsListStyle.news_3_text}>
                  {messageValue.creator.name} 删除了标签「
                  {messageValue.content.rela_data &&
                    messageValue.content.rela_data.name}
                  」「{jumpToTask}」
                </div>
                {/* <div className={NewsListStyle.news_3_card}>{jumpToTask}</div>
                <div className={NewsListStyle.news_3_project}>{currentNounPlanFilterName(PROJECTS)}：# {jumpToBoard}</div>
                <div className={NewsListStyle.news_3_group}>分组：{messageValue.list_name?messageValue.list_name:'无'}</div> */}
                <div className={NewsListStyle.news_3_time}>
                  {timestampToHM(messageValue.created)}
                </div>
              </div>
            )
          } else {
            messageContain = <div></div>
          }
          contain = `移除${currentNounPlanFilterName(TASKS)}标签`
          break
        case 'board.card.update.file.add': // 上传文件附件
          contain = `添加了${currentNounPlanFilterName(FILES)}附件`
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name} 在{currentNounPlanFilterName(TASKS)}{' '}
                「{jumpToTask}」中上传了文件附件 「
                {messageValue.content.rela_data &&
                  messageValue.content.rela_data.name}
                」
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToHM(messageValue.created)}
              </div>
            </div>
          )
          break
        case 'board.card.update.file.remove': // 移除附件
          contain = `移除了${currentNounPlanFilterName(FILES)}附件`
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name} 在{currentNounPlanFilterName(TASKS)}{' '}
                「{jumpToTask}」中移除了文件附件 「
                {messageValue.content.rela_data &&
                  messageValue.content.rela_data.name}
                」
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToHM(messageValue.created)}
              </div>
            </div>
          )
          break
        case 'board.card.add.to.milestone': // 添加里程碑关联内容
          contain = `关联${currentNounPlanFilterName(TASKS)}到里程碑`
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name}在{currentNounPlanFilterName(TASKS)}
                「{jumpToTask}」中添加了关联里程碑「
                {messageValue.content.milestone &&
                  messageValue.content.milestone.name}
                」内容
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToHM(messageValue.created)}
              </div>
            </div>
          )
          break
        case 'board.card.remove.to.milestone': // 把任务从里程碑中删除
          contain = `将关联${currentNounPlanFilterName(TASKS)}移除到里程碑`
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name}在{currentNounPlanFilterName(TASKS)}
                「{jumpToTask}」中移除了关联里程碑「
                {messageValue.content.milestone &&
                  messageValue.content.milestone.name}
                」的内容
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToHM(messageValue.created)}
              </div>
            </div>
          )
          break
        case 'board.card.list.group.add': // 添加分组
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name} 在
                {currentNounPlanFilterName(PROJECTS)}「{jumpToBoard}
                」中添加了分组「
                {messageValue.content.lists && messageValue.content.lists.name}
                」
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToHM(messageValue.created)}
              </div>
            </div>
          )
          break
        case 'board.card.list.group.update.name': // 更新分组
          contain = `更新了分组信息`
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name} 在
                {currentNounPlanFilterName(PROJECTS)} 「{jumpToBoard}
                」中更新了原分组 「
                {messageValue.content.rela_data &&
                  messageValue.content.rela_data}
                」名称为「
                {messageValue.content.lists && messageValue.content.lists.name}
                」
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToHM(messageValue.created)}
              </div>
            </div>
          )
          break
        case 'board.card.list.group.remove': // 删除卡片分组
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name} 在
                {currentNounPlanFilterName(PROJECTS)}「{jumpToBoard}
                」中移除了分组「
                {messageValue.content.lists && messageValue.content.lists.name}
                」
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToHM(messageValue.created)}
              </div>
            </div>
          )
          contain = `移除${currentNounPlanFilterName(TASKS)}分组`
          break
        //流程 ---------------------------------
        case 'board.flow.task.assignee.notice': // 流程待处理
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                您有一个{currentNounPlanFilterName(FLOWS)}「{jumpToProcess}
                」任务待处理
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToHM(messageValue.created)}
              </div>
            </div>
          )
          contain = `${currentNounPlanFilterName(FLOWS)}待处理任务通知`
          break
        case 'board.flow.instance.initiate':
          contain = `启动${currentNounPlanFilterName(FLOWS)}`
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name} 启动
                {currentNounPlanFilterName(FLOWS)}「{jumpToProcess}」
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToHM(messageValue.created)}
              </div>
            </div>
          )
          break
        case 'board.update.user.remove':
          contain = `移除${currentNounPlanFilterName(PROJECTS)}成员`
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name} 将「
                {messageValue.content.rela_users}」移出了「{jumpToBoard}」
                {currentNounPlanFilterName(PROJECTS)}
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToHM(messageValue.created)}
              </div>
            </div>
          )
          break
        case 'board.flow.task.recall': // 流程撤回
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name} 撤回
                {currentNounPlanFilterName(FLOWS)}「{jumpToProcess}」节点「
                {messageValue.content.flow_node_instance.name}」
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToHM(messageValue.created)}
              </div>
            </div>
          )
          contain = `撤回${currentNounPlanFilterName(FLOWS)}任务`
          break
        case 'board.flow.task.reject': // 驳回流程
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name} 驳回
                {currentNounPlanFilterName(FLOWS)}「{jumpToProcess}」节点「
                {messageValue.content.flow_node_instance.name}」
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToHM(messageValue.created)}
              </div>
            </div>
          )
          contain = `驳回${currentNounPlanFilterName(FLOWS)}任务`
          break
        case 'board.flow.task.reassign':
          contain = '重新指派审批人'
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name} 在{currentNounPlanFilterName(FLOWS)}
                「{jumpToProcess}」节点「
                {
                  messageValue.content.flow_node_instance.name
                }」中重新指定审批人 {messageValue.content.user.name}
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToHM(messageValue.created)}
              </div>
            </div>
          )
          break
        // case 'board.flow.task.attach.upload': // 流程附件上传
        //   contain = `${currentNounPlanFilterName(FLOWS)}文件上传`
        //   messageContain = (
        //     <div className={NewsListStyle.news_3}>
        //       <div className={NewsListStyle.news_3_text}>{messageValue.creator.name} 在{currentNounPlanFilterName(FLOWS)}「{jumpToProcess}」 上传了文件「{jumpToFile}」</div>
        //       <div className={NewsListStyle.news_3_time}>{timestampToHM(messageValue.created)}</div>
        //     </div>
        //   )
        //   break
        case 'board.flow.task.pass': // 流程通过
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name} 在
                {currentNounPlanFilterName(PROJECTS)}「{jumpToBoard}」
                中完成了任务「
                {messageValue.content.flow_node_instance &&
                  messageValue.content.flow_node_instance.name}
                」
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToHM(messageValue.created)}
              </div>
            </div>
          )
          contain = `完成${currentNounPlanFilterName(FLOWS)}任务`
          break
        case 'board.flow.instance.discontinue':
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name} 在
                {currentNounPlanFilterName(PROJECTS)}「{jumpToBoard}」中 终止了
                {currentNounPlanFilterName(FLOWS)}「{jumpToProcess}」
              </div>
              {/* 「{messageValue.content.flow_node_instance.name}」 */}
              <div className={NewsListStyle.news_3_time}>
                {timestampToHM(messageValue.created)}
              </div>
            </div>
          )
          contain = `终止${currentNounPlanFilterName(FLOWS)}任务`
          break
        case 'board.flow.instance.delete': // 删除流程
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name} 在
                {currentNounPlanFilterName(PROJECTS)}「{jumpToBoard}」中 删除了
                {currentNounPlanFilterName(FLOWS)}「{jumpToProcess}」
              </div>
              {/* 「{messageValue.content.flow_node_instance.name}」 */}
              <div className={NewsListStyle.news_3_time}>
                {timestampToHM(messageValue.created)}
              </div>
            </div>
          )
          contain = `删除${currentNounPlanFilterName(FLOWS)}任务`
          break
        case 'board.flow.task.assignee.notice':
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                您有一个{currentNounPlanFilterName(FLOWS)}任务待处理
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToHM(messageValue.created)}
              </div>
            </div>
          )
          contain = `${currentNounPlanFilterName(FLOWS)}待处理任务通知`
          break
        //文档
        case 'board.folder.add':
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name} 创建了文件夹「
                {messageValue.content.board_folder.name}」
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToHM(messageValue.created)}
              </div>
            </div>
          )
          contain = `创建文件夹`
          break
        case 'board.file.upload':
          contain = `上传${currentNounPlanFilterName(FILES)}`
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name}在
                {currentNounPlanFilterName(PROJECTS)} 「{jumpToBoard}」中上传了
                {currentNounPlanFilterName(FILES)}「{jumpToFile}」
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToHM(messageValue.created)}
              </div>
            </div>
          )
          break
        case 'board.file.version.upload':
          contain = `${currentNounPlanFilterName(FILES)}版本更新`
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name}在
                {currentNounPlanFilterName(PROJECTS)}「{jumpToBoard}」中更新了
                {currentNounPlanFilterName(FILES)}「{jumpToFile}」
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToHM(messageValue.created)}
              </div>
            </div>
          )
          break
        case 'board.folder.remove.recycle':
          contain = '移除文件夹到回收站'
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name} 移动文件夹「
                {messageValue.content.board_folder.name}」到回收站
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToHM(messageValue.created)}
              </div>
            </div>
          )
          break
        case 'board.file.remove.recycle':
          contain = `移除${currentNounPlanFilterName(FILES)}到回收站`
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name} 移动
                {currentNounPlanFilterName(FILES)}「{jumpToFile}」到回收站
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToHM(messageValue.created)}
              </div>
            </div>
          )
          break
        case 'board.file.move.to.folder': // 移动文件到某个文件夹中
          contain = `移动${currentNounPlanFilterName(FILES)}到某个文件夹中`
          let showList = []
          let hideList = []
          messageValue.content.board_file_list.forEach((item, i) => {
            if (i >= 1) {
              hideList.push([<span>{item.name}</span>, <br />])
            } else {
              showList.push(item.name)
            }
          })
          if (messageValue.content.board_file_list.length > 1) {
            showList.push('...')
          }

          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator && messageValue.creator.name} 移动
                {currentNounPlanFilterName(FILES)}「
                {
                  <span
                    className={styles.fileName}
                    onClick={() => {
                      this.goToFile({
                        board_id: messageValue.content.board.id,
                        content: messageValue.content
                      })
                    }}
                  >
                    {showList}
                  </span>
                }
                」到文件夹「
                {messageValue.content.target_folder &&
                  messageValue.content.target_folder.name}
                」
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToHM(messageValue.created)}
              </div>
            </div>
          )
          break
        case 'board.file.copy.to.folder': // 复制文件到某个文件夹中
          contain = `复制${currentNounPlanFilterName(FILES)}到某个文件夹中`
          let showCopyList = []
          let hideCopyList = []
          messageValue.content.board_file_list.forEach((item, i) => {
            if (i >= 1) {
              hideCopyList.push([<span>{item.name}</span>, <br />])
            } else {
              showCopyList.push(item.name)
            }
          })
          if (
            messageValue.content &&
            messageValue.content.board_file_list.length > 1
          ) {
            showCopyList.push('...')
          }
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator && messageValue.creator.name} 复制
                {currentNounPlanFilterName(FILES)}「
                {
                  <span
                    className={styles.fileName}
                    onClick={() => {
                      this.goToFile({
                        board_id: messageValue.content.board.id,
                        content: messageValue.content
                      })
                    }}
                  >
                    {showCopyList}
                  </span>
                }
                」到文件夹「
                {messageValue.content &&
                  messageValue.content.target_folder &&
                  messageValue.content.target_folder.name}
                」
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToHM(messageValue.created)}
              </div>
            </div>
          )
          break
        // 评论 ----------------------------------------
        case 'board.file.comment.add': // 添加一条文件评论动态
          contain = `添加${currentNounPlanFilterName(FILES)}评论`
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {' '}
                {messageValue.creator && messageValue.creator.name}在
                {currentNounPlanFilterName(FILES)}「{jumpToFile}
                」中发表了一条评论
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToHM(messageValue.created)}
              </div>
            </div>
          )
          break
        case 'board.file.comment.remove': // 移除文件评论
          contain = `移除${currentNounPlanFilterName(FILES)}评论`
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {' '}
                {messageValue.creator && messageValue.creator.name}在
                {currentNounPlanFilterName(FILES)}「{jumpToFile}
                」中删除了一条评论
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToHM(messageValue.created)}
              </div>
            </div>
          )
          break
        case 'board.card.update.comment.add': // 添加任务评论
          contain = `${currentNounPlanFilterName(TASKS)}评论`
          break
        case 'board.card.update.comment.remove': // 移除任务评论
          contain = `${currentNounPlanFilterName(TASKS)}评论`
          break
        case 'board.flow.comment.add': // 添加流程评论
          contain = `添加${currentNounPlanFilterName(FLOWS)}评论`
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {' '}
                {messageValue.creator && messageValue.creator.name}在
                {currentNounPlanFilterName(FLOWS)}「{jumpToProcess}
                」中发表了一条评论
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToHM(messageValue.created)}
              </div>
            </div>
          )
          break
        case 'board.flow.comment.remove': // 移除流程评论
          contain = `移除${currentNounPlanFilterName(FLOWS)}评论`
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {' '}
                {messageValue.creator && messageValue.creator.name}在
                {currentNounPlanFilterName(FLOWS)}「{jumpToProcess}
                」中删除了一条评论
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToHM(messageValue.created)}
              </div>
            </div>
          )
          break
        case 'board.card.comment.at.notice': // 任务评论@通知
          contain = `在${currentNounPlanFilterName(TASKS)}中@了您`
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {' '}
                {messageValue.creator && messageValue.creator.name}在
                {currentNounPlanFilterName(TASKS)}「{jumpToTask}」的评论中@了您
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToHM(messageValue.created)}
              </div>
            </div>
          )
          break
        // case 'board.file.comment.at.notice': // 文件评论@通知
        //   contain = `在${currentNounPlanFilterName(FILES)}中@了您`
        //   break
        case 'meeting.create': // 发起会议
          contain = `发起了一条会议`
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator && messageValue.creator.name}
                {messageValue.content.board && messageValue.content.board.name && (
                  <span>
                    在{currentNounPlanFilterName(PROJECTS)}「{jumpToBoard}」中
                  </span>
                )}
                {/* { messageValue.content.board && messageValue.content.board.name ? `中` : ``} */}
                向您发起了一条会议 「{jumpToMeeting}」
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToHM(messageValue.created)}
              </div>
            </div>
          )
          break
        default:
          messageContain = <div></div>
          break
      }
      return { contain, messageContain }
    }
    //项目动态
    const projectNews = (value, key) => {
      const { content = {}, action, created, org_id } = value
      const { board = {}, card = {}, lists = {} } = content
      const board_name = board['name']
      const list_name = lists['name']

      return (
        <div className={NewsListStyle.containr} key={key}>
          <div className={NewsListStyle.top}>
            <div className={NewsListStyle.left}>
              <div className={NewsListStyle.l_l}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 40,
                    position: 'relative'
                  }}
                >
                  <span className={`${NewsListStyle.common_icon}`}>
                    <div className={`${globalStyles.authTheme}`}>&#xe61a;</div>
                  </span>
                </div>
              </div>
              <div className={NewsListStyle.l_r}>
                <div>{filterTitleContain(action, value).contain} </div>
                <div>
                  {is_show_org_name && (
                    <div className={NewsListStyle.news_orgName}>
                      {/* <span>组织:</span> */}
                      <span style={{ marginRight: 5 }}>
                        {' '}
                        {getOrgNameWithOrgIdFilter(
                          org_id,
                          currentUserOrganizes
                        )}
                      </span>
                      <Icon type="caret-right" style={{ fontSize: 8 }} />
                    </div>
                  )}
                  {/* {currentNounPlanFilterName(PROJECTS)}：{board_name}<Icon type="caret-right" style={{fontSize: 8}}/>  {list_name || '分组'} */}
                  {board_name}
                  <Icon type="caret-right" style={{ fontSize: 8 }} />{' '}
                  {list_name || '分组'}
                </div>
                {/* <div>{timestampToTime(created)}</div> */}
              </div>
            </div>
            <div className={NewsListStyle.right}>
              {/*打钩*/}
              {/*<Icon type="pushpin-o" className={NewsListStyle.timer}/><Icon type="check" className={NewsListStyle.check} />*/}
            </div>
          </div>
          <div className={NewsListStyle.bott}>
            <div className={NewsListStyle.news_1}>
              {filterTitleContain(action, value).messageContain}{' '}
            </div>
          </div>
        </div>
      )
    }
    //任务动态
    const taskNews = (value, key) => {
      // console.log(value, 'sssss')
      const { content = {}, org_id, action } = value
      const { board = {}, card = {}, lists = {} } = content
      const card_name = card['name']
      const card_id = card['id']
      const list_name = lists['name']
      const board_name = board['name']
      const board_id = board['id']
      return (
        <div className={NewsListStyle.containr} key={key}>
          <div className={NewsListStyle.top}>
            <div className={NewsListStyle.left}>
              <div className={NewsListStyle.l_l}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 40,
                    position: 'relative'
                  }}
                >
                  <span className={`${NewsListStyle.common_icon}`}>
                    <div className={`${globalStyles.authTheme}`}>&#xe61c;</div>
                  </span>
                </div>
              </div>
              <div className={NewsListStyle.l_r}>
                <div>{filterTitleContain(action, value).contain}</div>
                <div>
                  {is_show_org_name && (
                    <div className={NewsListStyle.news_orgName}>
                      {/* <span>组织:</span> */}
                      <span style={{ marginRight: 5 }}>
                        {' '}
                        {getOrgNameWithOrgIdFilter(
                          org_id,
                          currentUserOrganizes
                        )}
                      </span>
                      <Icon type="caret-right" style={{ fontSize: 8 }} />
                    </div>
                  )}
                  {/* {currentNounPlanFilterName(PROJECTS)}：{board_name}<Icon type="caret-right" style={{fontSize: 8}}/>  {list_name || '分组'} */}
                  {board_name}
                  <Icon type="caret-right" style={{ fontSize: 8 }} />{' '}
                  {list_name || '分组'}
                </div>
              </div>
            </div>
            <div className={NewsListStyle.right}>
              {/*<Icon type="pushpin-o" className={NewsListStyle.timer}/><Icon type="check" className={NewsListStyle.check} />*/}
            </div>
          </div>
          <div className={NewsListStyle.bott}>
            <div className={NewsListStyle.news_1}>
              {filterTitleContain(action, value).messageContain}{' '}
            </div>
          </div>
        </div>
      )
    }

    /**
     * 公共评论的数据结构
     * @param {String} action 动作的类型匹配
     * @param {Object} common_data 需要的一些数据
     * @param {String} text 文本内容
     * @param {String} common_id 就是需要传入的是什么id, 任务、文件、流程等
     */
    const CommonCommentNews = (
      action,
      common_data = {},
      common_id,
      comment_id
    ) => {
      return (
        <>
          <div className={NewsListStyle.top}>
            <div className={NewsListStyle.left}>
              <div className={NewsListStyle.l_l}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 40,
                    position: 'relative'
                  }}
                >
                  <span className={`${NewsListStyle.common_icon}`}>
                    <div className={`${globalStyles.authTheme}`}>&#xe6a1;</div>
                  </span>
                </div>
              </div>
              <div className={NewsListStyle.l_r}>
                <div>
                  {filterTitleContain(action, common_data.value[0]).contain}
                </div>
                <div>
                  {is_show_org_name && (
                    <div className={NewsListStyle.news_orgName}>
                      {/* <span>组织:</span> */}
                      <span style={{ marginRight: 5 }}>
                        {' '}
                        {getOrgNameWithOrgIdFilter(
                          common_data.org_id,
                          currentUserOrganizes
                        )}
                      </span>
                      <Icon type="caret-right" style={{ fontSize: 8 }} />
                    </div>
                  )}
                  {/* {currentNounPlanFilterName(PROJECTS)}：{board_name} <Icon type="caret-right" style={{fontSize: 8}}/> 分组 {list_name} */}
                  {common_data.board_name}{' '}
                  <Icon type="caret-right" style={{ fontSize: 8 }} /> 分组{' '}
                  {common_data.list_name}
                </div>
              </div>
            </div>
            <div className={NewsListStyle.right}>
              {/*<Icon type="pushpin-o" className={NewsListStyle.timer}/><Icon type="check" className={NewsListStyle.check} />*/}
            </div>
          </div>
          <div className={NewsListStyle.bott}>
            {/*{news_4}*/}
            <div className={NewsListStyle.news_4}>
              {common_data.value.map((val, key) => {
                const { creator, created, content = {}, action } = val
                const { card_comment = {} } = content
                const { avatar } = creator
                const common_text = '「该评论已被删除」'
                // let del_arr = [] // 定义一个删除的数组
                // let new_del = []
                // switch (action) {
                //   case 'board.card.update.comment.remove': // 卡片删除评论
                //     if (content.card_comment && content.card_comment.id) {
                //       del_arr.push(content.card_comment.id)
                //     }
                //     new_del = [...del_arr]
                //     new_del = new_del.concat(...new_del)
                //     console.log(new_del && new_del.indexOf(comment_id) != -1, 'ssss')
                //     break;

                //   default:
                //     break;
                // }
                return (
                  <div className={NewsListStyle.news_4_top} key={key}>
                    <div className={NewsListStyle.news_4_left}>
                      {/*<img src="" />*/}
                      {avatar ? (
                        <img src={avatar} />
                      ) : (
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 40,
                            backgroundColor: '#f5f5f5',
                            textAlign: 'center'
                          }}
                        >
                          <Icon
                            type={'user'}
                            style={{
                              fontSize: 18,
                              marginTop: 12,
                              color: '#8c8c8c'
                            }}
                          />
                        </div>
                      )}
                    </div>
                    <div className={NewsListStyle.news_4_right}>
                      <div className={NewsListStyle.r_t}>
                        <div className={NewsListStyle.r_t_l}>
                          {creator.name}
                        </div>
                        <div className={NewsListStyle.r_t_r}>
                          {timestampToHM(created)}
                        </div>
                      </div>
                      <div className={NewsListStyle.r_b}>
                        {common_data.type == '14' &&
                          (card_comment['text'] != ''
                            ? card_comment['text']
                            : common_text)}
                        {/* { common_data.type == '22' && (flow_content['name'] != '' ? flow_content['name'] : common_text) } */}
                      </div>
                    </div>
                  </div>
                )
              })}
              <div className={NewsListStyle.news_4_middle}>
                {/*<img src="" />*/}
                {/*<img src="" />*/}
              </div>
              <div className={NewsListStyle.news_4_bottom}>
                <Comment
                  {...this.props}
                  parentKey={common_data.parentKey}
                  childrenKey={common_data.childrenKey}
                  valueItem={common_data.value[0]}
                  board_id={common_data.board_id}
                  common_id={common_id}
                  comment_type={common_data.type}
                />
              </div>
            </div>
          </div>
        </>
      )
    }

    //评论动态
    const commentNews = (value, parentKey, childrenKey, type) => {
      const { content = {}, org_id, creator, created } = value[0]
      const {
        board = {},
        card = {},
        lists = {},
        card_comment = {},
        flow_instance = {}
      } = content
      const card_id = card['id']
      const flow_id = flow_instance['id']
      let list_name = lists['name']
      let board_name = board['name']
      let board_id = board['id']
      const params = {
        parentKey,
        childrenKey,
        value,
        board_id,
        type,
        org_id,
        board_name,
        list_name
      }

      return (
        <div className={NewsListStyle.containr}>
          {value.map((val, key) => {
            const { action } = val
            let messageContain
            switch (action) {
              case 'board.card.update.comment.add': // 卡片添加评论
                messageContain = (
                  <div>
                    {CommonCommentNews(
                      action,
                      params,
                      card_id,
                      card_comment['id']
                    )}
                  </div>
                )
                break
              // case 'board.card.update.comment.remove': // 卡片删除评论
              //   messageContain = (
              //     <div>{CommonCommentNews(action, params, card_id, card_comment['text'])}</div>
              //   )
              //   break
              // case 'board.file.comment.add': // 添加文件评论
              //   messageContain = (
              //     <div>{CommonCommentNews(action, params, card_id, card_comment['text'])}</div>
              //   )
              //   break
              // case 'board.flow.comment.add': // 添加流程评论
              //   messageContain = (
              //     <div>{CommonCommentNews(action, params, flow_id, flow_content['name'])}</div>
              //   )
              //   break
              default:
                messageContain = <div></div>
                break
            }
            return messageContain
          })}
        </div>
      )
    }
    //流程动态
    const processNews = value => {
      const { content = {}, action, org_id } = value
      const { board = {}, flow_instance = {} } = content
      const board_name = board['name']
      const board_id = board['id']
      return (
        <div className={NewsListStyle.containr}>
          <div className={NewsListStyle.top}>
            <div className={NewsListStyle.left}>
              <div className={NewsListStyle.l_l}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 40,
                    position: 'relative'
                  }}
                >
                  <span className={`${NewsListStyle.common_icon}`}>
                    <div className={`${globalStyles.authTheme}`}>&#xe61e;</div>
                  </span>
                </div>
                {/*<img src="" />*/}
              </div>
              <div className={NewsListStyle.l_r}>
                <div>{filterTitleContain(action, value).contain}</div>
                <div>
                  {is_show_org_name && (
                    <div className={NewsListStyle.news_orgName}>
                      {/* <span>组织:</span> */}
                      <span style={{ marginRight: 5 }}>
                        {' '}
                        {getOrgNameWithOrgIdFilter(
                          org_id,
                          currentUserOrganizes
                        )}
                      </span>
                      <Icon type="caret-right" style={{ fontSize: 8 }} />
                    </div>
                  )}
                  {/* {currentNounPlanFilterName(PROJECTS)}： {board_name} */}
                  {board_name}
                </div>
              </div>
            </div>
            <div className={NewsListStyle.right}>
              {/*<Icon type="pushpin-o" className={NewsListStyle.timer}/><Icon type="check" className={NewsListStyle.check} />*/}
            </div>
          </div>
          <div className={NewsListStyle.bott}>
            <div className={NewsListStyle.news_1}>
              {filterTitleContain(action, value).messageContain}{' '}
            </div>
          </div>
        </div>
      )
    }
    //文档动态
    const fileNews = (value, key) => {
      const { content = {}, action, org_id } = value
      const { board = {}, flow_instance = {} } = content
      const board_name = board['name']
      const board_id = board['id']
      return (
        <div className={NewsListStyle.containr}>
          <div className={NewsListStyle.top}>
            <div className={NewsListStyle.left}>
              <div className={NewsListStyle.l_l}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 40,
                    position: 'relative'
                  }}
                >
                  <span className={`${NewsListStyle.common_icon}`}>
                    <div className={`${globalStyles.authTheme}`}>&#xe619;</div>
                  </span>
                </div>
              </div>
              <div className={NewsListStyle.l_r}>
                <div>{filterTitleContain(action, value).contain} </div>
                <div>
                  {is_show_org_name && (
                    <div className={NewsListStyle.news_orgName}>
                      {/* <span>组织:</span> */}
                      <span style={{ marginRight: 5 }}>
                        {' '}
                        {getOrgNameWithOrgIdFilter(
                          org_id,
                          currentUserOrganizes
                        )}
                      </span>
                      <Icon type="caret-right" style={{ fontSize: 8 }} />
                    </div>
                  )}
                  {/* {currentNounPlanFilterName(PROJECTS)}： {board_name} */}
                  {board_name}
                </div>
              </div>
            </div>
            <div className={NewsListStyle.right}>
              {/*<Icon type="pushpin-o" className={NewsListStyle.timer}/><Icon type="check" className={NewsListStyle.check} />*/}
            </div>
          </div>
          <div className={NewsListStyle.bott}>
            <div className={NewsListStyle.news_1}>
              {filterTitleContain(action, value).messageContain}{' '}
            </div>
          </div>
        </div>
      )
    }

    // 会议动态
    const meetingNews = value => {
      const { content = {}, action, org_id } = value
      const { board = {} } = content
      const board_name = board['name']
      const board_id = board['id']
      return (
        <div className={NewsListStyle.containr}>
          <div className={NewsListStyle.top}>
            <div className={NewsListStyle.left}>
              <div className={NewsListStyle.l_l}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 40,
                    position: 'relative'
                  }}
                >
                  <span className={`${NewsListStyle.common_icon}`}>
                    <div className={`${globalStyles.authTheme}`}>&#xeaed;</div>
                  </span>
                </div>
                {/*<img src="" />*/}
              </div>
              <div className={NewsListStyle.l_r}>
                {board_name ? (
                  <>
                    <div>{filterTitleContain(action, value).contain}</div>
                    <div>
                      {is_show_org_name && (
                        <div className={NewsListStyle.news_orgName}>
                          {/* <span>组织:</span> */}
                          <span style={{ marginRight: 5 }}>
                            {' '}
                            {getOrgNameWithOrgIdFilter(
                              org_id,
                              currentUserOrganizes
                            )}
                          </span>
                          <Icon type="caret-right" style={{ fontSize: 8 }} />
                        </div>
                      )}
                      {/* {currentNounPlanFilterName(PROJECTS)}： {board_name} */}
                      {board_name}
                    </div>
                  </>
                ) : (
                  <div style={{ lineHeight: '36px' }}>
                    {filterTitleContain(action, value).contain}
                  </div>
                )}
              </div>
            </div>
            <div className={NewsListStyle.right}>
              {/*<Icon type="pushpin-o" className={NewsListStyle.timer}/><Icon type="check" className={NewsListStyle.check} />*/}
            </div>
          </div>
          <div className={NewsListStyle.bott}>
            <div className={NewsListStyle.news_1}>
              {filterTitleContain(action, value).messageContain}{' '}
            </div>
          </div>
        </div>
      )
    }

    // 申请加入组织
    const applyOrg = (value, key) => {
      // console.log(value, 'sssss')
      const { action } = value
      return (
        <div className={NewsListStyle.containr}>
          <div className={NewsListStyle.top}>
            <div className={NewsListStyle.left}>
              <div className={NewsListStyle.l_l}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 40,
                    position: 'relative'
                  }}
                >
                  <span className={`${NewsListStyle.common_icon}`}>
                    <div className={`${globalStyles.authTheme}`}>&#xe6a4;</div>
                  </span>
                </div>
              </div>
              <div className={NewsListStyle.l_r}>
                <div style={{ lineHeight: '36px' }}>
                  {filterTitleContain(action, value).contain}{' '}
                </div>
              </div>
            </div>
            <div className={NewsListStyle.right}>
              {/*<Icon type="pushpin-o" className={NewsListStyle.timer}/><Icon type="check" className={NewsListStyle.check} />*/}
            </div>
          </div>
          <div className={NewsListStyle.bott}>
            <div className={NewsListStyle.news_1}>
              {filterTitleContain(action, value).messageContain}{' '}
            </div>
          </div>
        </div>
      )
    }

    //具体详细信息
    const filterNewsType = (type, value, parentKey, childrenKey) => {
      let containner = <div></div>
      switch (type) {
        case '10': // 项目动态
          containner = value.map((val, key) => (
            <div key={key}>{projectNews(val)}</div>
          ))
          break
        case '11': // 任务动态
          containner = value.map((val, key) => (
            <div key={key}>{taskNews(val)}</div>
          ))
          break
        case '12': // 流程动态
          containner = value.map((val, key) => (
            <div key={key}>{processNews(val)}</div>
          ))
          break
        case '13': // 文件动态
          containner = value.map((val, key) => (
            <div key={key}>{fileNews(val)}</div>
          ))
          break
        case '14': // 卡片的评论动态
          containner = commentNews(value, parentKey, childrenKey, type)
          break
        case '15': // 文件的评论动态
          containner = commentNews(value, parentKey, childrenKey, type)
          break
        case '21': // 任务的关联内容
          containner = value.map((val, key) => (
            <div key={key}>{taskNews(val)}</div>
          ))
          break
        case '22': // 流程的评论动态
          containner = value.map((val, key) => (
            <div key={key}>{processNews(val)}</div>
          ))
          break
        case '16': // 任务评论 @ 通知
          containner = value.map((val, key) => (
            <div key={key}>{taskNews(val)}</div>
          ))
          break
        case '17': // 文件评论 @ 通知
          // containner = (value.map((val, key) => (<div key={key}>{fileNews(val)}</div>)))
          break
        case '30': // 申请加入组织
          containner = value.map((val, key) => (
            <div key={key}>{applyOrg(val)}</div>
          ))
          break
        case '20': // 创建会议
          containner = value.map((val, key) => (
            <div key={key}>{meetingNews(val)}</div>
          ))
          break
        default:
          break
      }
      return containner
    }
    return (
      <div style={{ paddingBottom: 100, transform: 'none', display: 'inline' }}>
        {newsDynamicList.map((value, parentkey) => {
          const { date, dataList = [], newDataList = [] } = value
          return (
            <div className={NewsListStyle.itemOut} key={parentkey}>
              <div className={NewsListStyle.head}>
                <div>{date}</div>
              </div>
              {newDataList.map((value, childrenKey) => {
                // console.log(value, 'ssss')
                const { rela_type, TypeArrayList = [] } = value
                return (
                  <div key={childrenKey}>
                    {filterNewsType(
                      rela_type,
                      TypeArrayList,
                      parentkey,
                      childrenKey
                    )}
                  </div>
                )
              })}
            </div>
          )
        })}
        <div style={{ marginBottom: 20 }}>
          {isHasMore ? (
            <div
              onClick={this.getNewsDynamicListNext.bind(this, next_id)}
              style={{
                height: 30,
                maxWidth: 770,
                minWidth: 600,
                margin: '0 auto',
                lineHeight: '30px',
                textAlign: 'center',
                backgroundColor: '#e5e5e5',
                borderRadius: 4,
                marginTop: 20,
                cursor: 'pointer'
              }}
            >
              点击加载更多
              <Icon type="arrow-down" theme="outlined" />
            </div>
          ) : (
            <div
              style={{
                height: 30,
                maxWidth: 770,
                minWidth: 600,
                margin: '0 auto',
                lineHeight: '30px',
                textAlign: 'center',
                marginTop: 20,
                color: '#8c8c8c'
              }}
            >
              没有更多了...
            </div>
          )}
        </div>
        {/* <div style={{ margin: 'auto', position: 'absolute', top: 0, right: 0, left: 0, bottom: 0, textAlign: 'center' }}>
          <div style={{ fontSize: 48, color: 'rgba(0,0,0,0.15)' }} className={`${globalStyles.authTheme}`}>&#xe683;</div>
          <span style={{ color: 'rgba(217,217,217,1)' }}>动态模块维护中...</span>
        </div> */}
      </div>
    )
  }
}
