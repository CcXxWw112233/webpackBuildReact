import React from 'react'
import { connect } from 'dva'
import { message } from 'antd'
import NewsListStyle from './NewsList.less'
import globalStyles from '@/globalset/css/globalClassName.less'
import { timestampToTimeNormal2 } from '../../../../../../utils/util'
// import Comment from './Comment'
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
} from '../../../../../../globalset/js/constant'
import {
  currentNounPlanFilterName,
  getOrgNameWithOrgIdFilter,
  checkIsHasPermission,
  checkIsHasPermissionInBoard
} from '../../../../../../utils/businessFunction'
import double_right from '@/assets/workbench/double_right.png'
import MilestoneDetail from '../../../../components/Gantt/components/milestoneDetail'

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
export default class InitialNews extends React.Component {
  // state = {
  //   miletone_detail_modal_visible: false, // 里程碑的弹窗
  // }

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

  componentDidMount() {
    const { dispatch } = this.props
    dispatch({
      type: 'technological/getCurrentUserOrganizes',
      payload: {}
    })
  }

  // 去到项目详情
  goToBoard({ org_id, content }) {
    // console.log(checkIsHasPermission(ORG_TEAM_BOARD_QUERY, org_id), 'sss')
    // if (!checkIsHasPermission(ORG_TEAM_BOARD_QUERY, org_id)) {
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

  // 去到里程碑
  // goToMilestone({ board_id, content, milestone_id }) {
  //   const { dispatch } = this.props
  //   if (!checkIsHasPermissionInBoard(PROJECT_TEAM_BOARD_MILESTONE, board_id)) {
  //     message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
  //     return false
  //   }
  //   this.set_miletone_detail_modal_visible()
  //   dispatch({
  //     type: 'milestoneDetail/getMilestoneDetail',
  //     payload: {
  //       id: milestone_id
  //     }
  //   })
  //   dispatch({
  //     type: 'milestoneDetail/updateDatas',
  //     payload: {
  //       milestone_id,
  //     }
  //   })
  // }

  // // 设置里程碑的弹窗
  // set_miletone_detail_modal_visible = () => {
  //   const { miletone_detail_modal_visible } = this.state
  //   this.setState({
  //     miletone_detail_modal_visible: !miletone_detail_modal_visible
  //   })
  // }

  render() {
    const {
      datas: {
        newsDynamicList = [],
        next_id,
        isHasMore = true,
        isHasNewDynamic
      }
    } = this.props.model
    // console.log(newsDynamicList, 'ssss')
    // const { datas: { projectDetailInfoData = [], } } = this.props.model
    // const { data } = projectDetailInfoData
    // console.log(data, 'sssss')
    const { currentUserOrganizes = [], is_show_org_name } = this.props
    // console.log('this is issues model ---->>>', this.props.model.datas  )
    //过滤消息内容
    const filterTitleContain = (activity_type, messageValue) => {
      // console.log(messageValue, 'sss')
      // console.log(activity_type, 'ssss')
      let contain = ''
      let messageContain = <div></div>
      // console.log(messageValue, 'sssss')

      let link_message = <span></span>

      let jumpToBoard = (
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
            this.goToBoard({
              org_id: messageValue.org_id,
              content: messageValue.content
            })
          }}
        >
          {messageValue.content &&
            messageValue.content.board &&
            messageValue.content.board.name}
        </span>
      )
      let jumpToTask = (
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

      // let jumpToMilestone = (
      //   <span
      //     style={{color: '#1890FF', display: 'inline-block'}}
      //     onClick={ () => { this.goToMilestone({ board_id: messageValue.content.board.id, content: messageValue.content, milestone_id: messageValue.content.milestone.id }) } }
      //   >{messageValue.content && messageValue.content.milestone && messageValue.content.milestone.name}</span>
      // )
      // 会议
      // let jumpToMeeting = (
      //   <span style={{color: '#1890FF', cursor: 'pointer'}} onClick={() => window.location.href = `http://localhost/#/technological/projectDetail?board_id=${messageValue.content.board.id}&appsSelectKey=3&card_id=${messageValue.content.card.id}`}>{messageValue.content && messageValue.content.card && messageValue.content.card.name}</span>
      // )
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
                {timestampToTimeNormal2(messageValue.created)}
              </div>
            </div>
          )
          break
        //项目
        case 'board.create':
          contain = `创建${currentNounPlanFilterName(PROJECTS)}`
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name} 创建
                {currentNounPlanFilterName(PROJECTS)}「{jumpToBoard}」
              </div>
              <div className={NewsListStyle.news_3_project}>
                <span style={{ marginRight: 2, color: '#8C8C8C' }}>#</span>
                {is_show_org_name && (
                  <div className={NewsListStyle.news_3_orgName}>
                    {getOrgNameWithOrgIdFilter(
                      messageValue.org_id,
                      currentUserOrganizes
                    )}
                    <img src={double_right} alt="" />
                  </div>
                )}
                {jumpToBoard}&nbsp;
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToTimeNormal2(messageValue.created)}
              </div>
            </div>
          )
          break
        case 'board.update.name':
          contain = `更新${currentNounPlanFilterName(PROJECTS)}信息`
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name} 修改了原项目名 「
                {messageValue.content && messageValue.content.rela_data}」为「
                {jumpToBoard}」名称
              </div>
              <div className={NewsListStyle.news_3_project}>
                <span style={{ marginRight: 2, color: '#8C8C8C' }}>#</span>
                {is_show_org_name && (
                  <div className={NewsListStyle.news_3_orgName}>
                    {getOrgNameWithOrgIdFilter(
                      messageValue.org_id,
                      currentUserOrganizes
                    )}
                    <img src={double_right} alt="" />
                  </div>
                )}
                {jumpToBoard}&nbsp;
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToTimeNormal2(messageValue.created)}
              </div>
            </div>
          )
          break
        case 'board.card.update.file.add': // 添加附件
          contain = `添加了文件附件`
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
                {timestampToTimeNormal2(messageValue.created)}
              </div>
            </div>
          )
          break
        case 'board.card.update.file.remove': // 移除附件
          contain = `移除了文件附件`
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
                {timestampToTimeNormal2(messageValue.created)}
              </div>
            </div>
          )
          break
        case 'board.update.description': // 修改项目详情
          contain = `修改${currentNounPlanFilterName(PROJECTS)}详情`
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name} 修改了「{jumpToBoard}」的
                {currentNounPlanFilterName(PROJECTS)}描述{' '}
              </div>
              <div className={NewsListStyle.news_3_project}>
                <span style={{ marginRight: 2, color: '#8C8C8C' }}>#</span>
                {is_show_org_name && (
                  <div className={NewsListStyle.news_3_orgName}>
                    {getOrgNameWithOrgIdFilter(
                      messageValue.org_id,
                      currentUserOrganizes
                    )}
                    <img src={double_right} alt="" />
                  </div>
                )}
                {jumpToBoard}&nbsp;
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToTimeNormal2(messageValue.created)}
              </div>
            </div>
          )
          break
        // case 'board.update.archived':
        //   contain = `${currentNounPlanFilterName(PROJECTS)}归档`
        //   messageContain = (
        //     <div className={NewsListStyle.news_3}>
        //       <div className={NewsListStyle.news_3_text}>{messageValue.creator.name} 归档了「{jumpToBoard}」</div>
        //       <div className={NewsListStyle.news_3_project}>
        //         <span style={{ marginRight: 2, color: '#8C8C8C' }}>#</span>
        //         {
        //           is_show_org_name && (
        //             <div className={NewsListStyle.news_3_orgName}>
        //               {getOrgNameWithOrgIdFilter(messageValue.org_id, currentUserOrganizes)}
        //               <img src={double_right} alt="" />
        //             </div>
        //           )
        //         }
        //         {jumpToBoard}&nbsp;
        //         </div>
        //       <div className={NewsListStyle.news_3_time}>{timestampToTimeNormal2(messageValue.created)}</div>
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
              <div className={NewsListStyle.news_3_project}>
                <span style={{ marginRight: 2, color: '#8C8C8C' }}>#</span>
                {is_show_org_name && (
                  <div className={NewsListStyle.news_3_orgName}>
                    {getOrgNameWithOrgIdFilter(
                      messageValue.org_id,
                      currentUserOrganizes
                    )}
                    <img src={double_right} alt="" />
                  </div>
                )}
                {jumpToBoard}&nbsp;
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToTimeNormal2(messageValue.created)}
              </div>
            </div>
          )
          break
        case 'board.flow.task.attach.upload': // 流程附件上传
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name} 在流程「{jumpToProcess}」上传了
                {currentNounPlanFilterName(FILES)}「
                {
                  <span>
                    {messageValue.content &&
                      messageValue.content.rela_data &&
                      messageValue.content.rela_data.name}
                  </span>
                }
                」
              </div>
              <div className={NewsListStyle.news_3_project}>
                <span style={{ marginRight: 2, color: '#8C8C8C' }}>#</span>
                {is_show_org_name && (
                  <div className={NewsListStyle.news_3_orgName}>
                    {getOrgNameWithOrgIdFilter(
                      messageValue.org_id,
                      currentUserOrganizes
                    )}
                    <img src={double_right} alt="" />
                  </div>
                )}
                {jumpToBoard}&nbsp;
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToTimeNormal2(messageValue.created)}
              </div>
            </div>
          )
          contain = `上传${currentNounPlanFilterName(FLOWS)}文件附件`
          break
        case 'board.flow.cc.notice': // 流程抄送通知
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
                          route: `/technological/projectDetail?board_id=${messageValue
                            .content.board &&
                            messageValue.content.board
                              .id}&appsSelectKey=2&flow_id=${messageValue
                            .content.flow_instance &&
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
                」中 {messageValue.title && messageValue.title}
              </div>
              <div className={NewsListStyle.news_3_project}>
                <span style={{ marginRight: 2, color: '#8C8C8C' }}>#</span>
                {is_show_org_name && (
                  <div className={NewsListStyle.news_3_orgName}>
                    {getOrgNameWithOrgIdFilter(
                      messageValue.org_id,
                      currentUserOrganizes
                    )}
                    <img src={double_right} alt="" />
                  </div>
                )}
                {jumpToBoard}&nbsp;
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToTimeNormal2(messageValue.created)}
              </div>
            </div>
          )
          break
        case 'board.delete':
          contain = `删除${currentNounPlanFilterName(PROJECTS)}`
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name} 删除了「{jumpToBoard}」
                {currentNounPlanFilterName(PROJECTS)}
              </div>
              <div className={NewsListStyle.news_3_project}>
                <span style={{ marginRight: 2, color: '#8C8C8C' }}>#</span>
                {is_show_org_name && (
                  <div className={NewsListStyle.news_3_orgName}>
                    {getOrgNameWithOrgIdFilter(
                      messageValue.org_id,
                      currentUserOrganizes
                    )}
                    <img src={double_right} alt="" />
                  </div>
                )}
                {jumpToBoard}&nbsp;
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToTimeNormal2(messageValue.created)}
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
                  messageValue.content.rela_users.join(',')}
                」加入了「{jumpToBoard}」{currentNounPlanFilterName(PROJECTS)}
              </div>
              <div className={NewsListStyle.news_3_project}>
                <span style={{ marginRight: 2, color: '#8C8C8C' }}>#</span>
                {is_show_org_name && (
                  <div className={NewsListStyle.news_3_orgName}>
                    {getOrgNameWithOrgIdFilter(
                      messageValue.org_id,
                      currentUserOrganizes
                    )}
                    <img src={double_right} alt="" />
                  </div>
                )}
                {jumpToBoard}&nbsp;
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToTimeNormal2(messageValue.created)}
              </div>
            </div>
          )
          break
        case 'board.content.link.add': // 关联内容的添加
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
                {messageValue.creator.name}
                {link_message}
              </div>
              <div className={NewsListStyle.news_3_project}>
                <span style={{ marginRight: 2, color: '#8C8C8C' }}>#</span>
                {is_show_org_name && (
                  <div className={NewsListStyle.news_3_orgName}>
                    {getOrgNameWithOrgIdFilter(
                      messageValue.org_id,
                      currentUserOrganizes
                    )}
                    <img src={double_right} alt="" />
                  </div>
                )}
                {jumpToBoard}&nbsp;
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToTimeNormal2(messageValue.created)}
              </div>
            </div>
          )
          break
        case 'board.content.link.remove': // 关联内容的移除
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
              <div className={NewsListStyle.news_3_project}>
                <span style={{ marginRight: 2, color: '#8C8C8C' }}>#</span>
                {is_show_org_name && (
                  <div className={NewsListStyle.news_3_orgName}>
                    {getOrgNameWithOrgIdFilter(
                      messageValue.org_id,
                      currentUserOrganizes
                    )}
                    <img src={double_right} alt="" />
                  </div>
                )}
                {jumpToBoard}&nbsp;
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToTimeNormal2(messageValue.created)}
              </div>
            </div>
          )
          break
        case 'board.content.link.update': // 关联内容的名称的修改
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
              <div className={NewsListStyle.news_3_project}>
                <span style={{ marginRight: 2, color: '#8C8C8C' }}>#</span>
                {is_show_org_name && (
                  <div className={NewsListStyle.news_3_orgName}>
                    {getOrgNameWithOrgIdFilter(
                      messageValue.org_id,
                      currentUserOrganizes
                    )}
                    <img src={double_right} alt="" />
                  </div>
                )}
                {jumpToBoard}&nbsp;
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToTimeNormal2(messageValue.created)}
              </div>
            </div>
          )
          break
        case 'board.card.update.executor.remove': // 移除执行人
          // console.log({messageValue})
          contain = `移除${currentNounPlanFilterName(PROJECTS)}成员`
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name} 将 「
                {messageValue.content.rela_data &&
                  messageValue.content.rela_data.name}
                」 移出了「{jumpToTask}」
              </div>
              <div className={NewsListStyle.news_3_project}>
                <span style={{ marginRight: 2, color: '#8C8C8C' }}>#</span>
                {is_show_org_name && (
                  <div className={NewsListStyle.news_3_orgName}>
                    {getOrgNameWithOrgIdFilter(
                      messageValue.org_id,
                      currentUserOrganizes
                    )}
                    <img src={double_right} alt="" />
                  </div>
                )}
                {jumpToBoard}&nbsp;
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToTimeNormal2(messageValue.created)}
              </div>
            </div>
          )
          break
        //任务
        case 'board.card.create': // 创建任务
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name} 创建了
                {messageValue.content.card_type &&
                messageValue.content.card_type == '0'
                  ? currentNounPlanFilterName(TASKS)
                  : '日程'}
              </div>
              <div className={NewsListStyle.news_3_card}>「{jumpToTask}」</div>
              <div className={NewsListStyle.news_3_project}>
                <span style={{ marginRight: 2, color: '#8C8C8C' }}>#</span>
                {is_show_org_name && (
                  <div className={NewsListStyle.news_3_orgName}>
                    {getOrgNameWithOrgIdFilter(
                      messageValue.org_id,
                      currentUserOrganizes
                    )}
                    <img src={double_right} alt="" />
                  </div>
                )}
                {jumpToBoard}&nbsp;&gt;
              </div>
              <div className={NewsListStyle.news_3_group}>
                {messageValue.lists ? messageValue.lists.name : '无'}
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToTimeNormal2(messageValue.created)}
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
                {messageValue.creator.name}在{currentNounPlanFilterName(TASKS)}
                「
                {messageValue.content.rela_card &&
                  messageValue.content.rela_card.name}
                」 中 创建了子{currentNounPlanFilterName(TASKS)}
              </div>
              <div className={NewsListStyle.news_3_card}>「{jumpToTask}」</div>
              <div className={NewsListStyle.news_3_project}>
                <span style={{ marginRight: 2, color: '#8C8C8C' }}>#</span>
                {is_show_org_name && (
                  <div className={NewsListStyle.news_3_orgName}>
                    {getOrgNameWithOrgIdFilter(
                      messageValue.org_id,
                      currentUserOrganizes
                    )}
                    <img src={double_right} alt="" />
                  </div>
                )}
                {jumpToBoard}&nbsp;
              </div>
              <div className={NewsListStyle.news_3_group}>
                {messageValue.lists && messageValue.lists.name}
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToTimeNormal2(messageValue.created)}
              </div>
            </div>
          )
          contain = `创建子${currentNounPlanFilterName(TASKS)}`
          break
        case 'board.card.update.name':
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name} 修改了原
                {currentNounPlanFilterName(TASKS)}名「
                {messageValue.content.rela_data &&
                  messageValue.content.rela_data.name}
                」为
              </div>
              <div className={NewsListStyle.news_3_card}>
                「{jumpToTask}」名称
              </div>
              <div className={NewsListStyle.news_3_project}>
                <span style={{ marginRight: 2, color: '#8C8C8C' }}>#</span>
                {is_show_org_name && (
                  <div className={NewsListStyle.news_3_orgName}>
                    {getOrgNameWithOrgIdFilter(
                      messageValue.org_id,
                      currentUserOrganizes
                    )}
                    <img src={double_right} alt="" />
                  </div>
                )}
                {jumpToBoard}&nbsp;&gt;
              </div>
              <div className={NewsListStyle.news_3_group}>
                {messageValue.lists ? messageValue.lists.name : '无'}
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToTimeNormal2(messageValue.created)}
              </div>
            </div>
          )
          contain = `更新${currentNounPlanFilterName(TASKS)}信息`
          break
        case 'board.card.update.archived':
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name} 归档了
                {currentNounPlanFilterName(TASKS)}
              </div>
              <div className={NewsListStyle.news_3_card}>「{jumpToTask}」</div>
              <div className={NewsListStyle.news_3_project}>
                <span style={{ marginRight: 2, color: '#8C8C8C' }}>#</span>
                {is_show_org_name && (
                  <div className={NewsListStyle.news_3_orgName}>
                    {getOrgNameWithOrgIdFilter(
                      messageValue.org_id,
                      currentUserOrganizes
                    )}
                    <img src={double_right} alt="" />
                  </div>
                )}
                {jumpToBoard}&nbsp;
              </div>
              <div className={NewsListStyle.news_3_group}>
                {messageValue.lists && messageValue.lists.name}
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToTimeNormal2(messageValue.created)}
              </div>
            </div>
          )
          contain = `${currentNounPlanFilterName(TASKS)}归档`
          break
        case 'board.card.update.finish':
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name} 完成了
                {currentNounPlanFilterName(TASKS)}
              </div>
              <div className={NewsListStyle.news_3_card}>「{jumpToTask}」</div>
              <div className={NewsListStyle.news_3_project}>
                <span style={{ marginRight: 2, color: '#8C8C8C' }}>#</span>
                {is_show_org_name && (
                  <div className={NewsListStyle.news_3_orgName}>
                    {getOrgNameWithOrgIdFilter(
                      messageValue.org_id,
                      currentUserOrganizes
                    )}
                    <img src={double_right} alt="" />
                  </div>
                )}
                {jumpToBoard}&nbsp;&gt;
              </div>
              <div className={NewsListStyle.news_3_group}>
                {messageValue.lists ? messageValue.lists.name : '无'}
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToTimeNormal2(messageValue.created)}
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
                {currentNounPlanFilterName(TASKS)}
              </div>
              <div className={NewsListStyle.news_3_card}>「{jumpToTask}」</div>
              <div className={NewsListStyle.news_3_project}>
                <span style={{ marginRight: 2, color: '#8C8C8C' }}>#</span>
                {is_show_org_name && (
                  <div className={NewsListStyle.news_3_orgName}>
                    {getOrgNameWithOrgIdFilter(
                      messageValue.org_id,
                      currentUserOrganizes
                    )}
                    <img src={double_right} alt="" />
                  </div>
                )}
                {jumpToBoard}&nbsp;&gt;
              </div>
              <div className={NewsListStyle.news_3_group}>
                {messageValue.lists ? messageValue.lists.name : '无'}
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToTimeNormal2(messageValue.created)}
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
                {currentNounPlanFilterName(TASKS)}
              </div>
              <div className={NewsListStyle.news_3_card}>「{jumpToTask}」</div>
              <div className={NewsListStyle.news_3_project}>
                <span style={{ marginRight: 2, color: '#8C8C8C' }}>#</span>
                {is_show_org_name && (
                  <div className={NewsListStyle.news_3_orgName}>
                    {getOrgNameWithOrgIdFilter(
                      messageValue.org_id,
                      currentUserOrganizes
                    )}
                    <img src={double_right} alt="" />
                  </div>
                )}
                {jumpToBoard}&nbsp;&gt;
              </div>
              <div className={NewsListStyle.news_3_group}>
                {messageValue.lists ? messageValue.lists.name : '无'}
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToTimeNormal2(messageValue.created)}
              </div>
            </div>
          )
          contain = `删除${currentNounPlanFilterName(TASKS)}`
          break
        case 'board.card.update.name.child': // 修改子卡片的名称
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
                」名称为{currentNounPlanFilterName(TASKS)}
              </div>
              <div className={NewsListStyle.news_3_card}>「{jumpToTask}」</div>
              <div className={NewsListStyle.news_3_project}>
                <span style={{ marginRight: 2, color: '#8C8C8C' }}>#</span>
                {is_show_org_name && (
                  <div className={NewsListStyle.news_3_orgName}>
                    {getOrgNameWithOrgIdFilter(
                      messageValue.org_id,
                      currentUserOrganizes
                    )}
                    <img src={double_right} alt="" />
                  </div>
                )}
                {jumpToBoard}&nbsp;&gt;
              </div>
              <div className={NewsListStyle.news_3_group}>
                {messageValue.lists ? messageValue.lists.name : '无'}
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToTimeNormal2(messageValue.created)}
              </div>
            </div>
          )
          contain = `修改子${currentNounPlanFilterName(TASKS)}名称`
          break
        case 'board.card.update.startTime': // 修改开始时间
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name} 在{currentNounPlanFilterName(TASKS)}
              </div>
              <div className={NewsListStyle.news_3_card}>
                「{jumpToTask}」中修改了开始时间
              </div>
              <div className={NewsListStyle.news_3_project}>
                <span style={{ marginRight: 2, color: '#8C8C8C' }}>#</span>
                {is_show_org_name && (
                  <div className={NewsListStyle.news_3_orgName}>
                    {getOrgNameWithOrgIdFilter(
                      messageValue.org_id,
                      currentUserOrganizes
                    )}
                    <img src={double_right} alt="" />
                  </div>
                )}
                {jumpToBoard}&nbsp;&gt;
              </div>
              <div className={NewsListStyle.news_3_group}>
                {messageValue.lists ? messageValue.lists.name : '无'}
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToTimeNormal2(messageValue.created)}
              </div>
            </div>
          )
          contain = `修改${currentNounPlanFilterName(TASKS)}的开始时间`
          break
        case 'board.card.update.dutTime': // 修改结束时间
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name}在{currentNounPlanFilterName(TASKS)}{' '}
              </div>
              <div className={NewsListStyle.news_3_card}>
                「{jumpToTask}」中修改了结束时间
              </div>
              <div className={NewsListStyle.news_3_project}>
                <span style={{ marginRight: 2, color: '#8C8C8C' }}>#</span>
                {is_show_org_name && (
                  <div className={NewsListStyle.news_3_orgName}>
                    {getOrgNameWithOrgIdFilter(
                      messageValue.org_id,
                      currentUserOrganizes
                    )}
                    <img src={double_right} alt="" />
                  </div>
                )}
                {jumpToBoard}&nbsp;&gt;
              </div>
              <div className={NewsListStyle.news_3_group}>
                {messageValue.lists ? messageValue.lists.name : '无'}
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToTimeNormal2(messageValue.created)}
              </div>
            </div>
          )
          contain = `修改${currentNounPlanFilterName(TASKS)}的结束时间`
          break
        case 'board.card.update.dutTime.child': // 修改子卡片的结束时间
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name}修改了归属于
                {currentNounPlanFilterName(TASKS)}「
                {messageValue.content.rela_card &&
                  messageValue.content.rela_card.name}
                」的子{currentNounPlanFilterName(TASKS)}{' '}
              </div>
              <div className={NewsListStyle.news_3_card}>
                「{jumpToTask}」的结束时间
              </div>
              <div className={NewsListStyle.news_3_project}>
                <span style={{ marginRight: 2, color: '#8C8C8C' }}>#</span>
                {is_show_org_name && (
                  <div className={NewsListStyle.news_3_orgName}>
                    {getOrgNameWithOrgIdFilter(
                      messageValue.org_id,
                      currentUserOrganizes
                    )}
                    <img src={double_right} alt="" />
                  </div>
                )}
                {jumpToBoard}&nbsp;&gt;
              </div>
              <div className={NewsListStyle.news_3_group}>
                {messageValue.lists ? messageValue.lists.name : '无'}
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToTimeNormal2(messageValue.created)}
              </div>
            </div>
          )
          contain = `修改子${currentNounPlanFilterName(TASKS)}的结束时间`
          break
        case 'board.card.update.description': // 修改卡片的描述
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name}在
                {currentNounPlanFilterName(PROJECTS)}「{jumpToBoard}」中更新了
                {currentNounPlanFilterName(TASKS)}
              </div>
              <div className={NewsListStyle.news_3_card}>
                「{jumpToTask}」的描述
              </div>
              <div className={NewsListStyle.news_3_project}>
                <span style={{ marginRight: 2, color: '#8C8C8C' }}>#</span>
                {is_show_org_name && (
                  <div className={NewsListStyle.news_3_orgName}>
                    {getOrgNameWithOrgIdFilter(
                      messageValue.org_id,
                      currentUserOrganizes
                    )}
                    <img src={double_right} alt="" />
                  </div>
                )}
                {jumpToBoard}&nbsp;&gt;
              </div>
              <div className={NewsListStyle.news_3_group}>
                {messageValue.lists ? messageValue.lists.name : '无'}
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToTimeNormal2(messageValue.created)}
              </div>
            </div>
          )
          break
        case 'board.card.update.finish.child': // 标记子任务的完成
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name}在{currentNounPlanFilterName(TASKS)}
                「
                {messageValue.content.rela_card &&
                  messageValue.content.rela_card.name}
                」中 完成了子{currentNounPlanFilterName(TASKS)}
              </div>
              <div className={NewsListStyle.news_3_card}>「{jumpToTask}」</div>
              <div className={NewsListStyle.news_3_project}>
                <span style={{ marginRight: 2, color: '#8C8C8C' }}>#</span>
                {is_show_org_name && (
                  <div className={NewsListStyle.news_3_orgName}>
                    {getOrgNameWithOrgIdFilter(
                      messageValue.org_id,
                      currentUserOrganizes
                    )}
                    <img src={double_right} alt="" />
                  </div>
                )}
                {jumpToBoard}&nbsp;&gt;
              </div>
              <div className={NewsListStyle.news_3_group}>
                {messageValue.lists ? messageValue.lists.name : '无'}
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToTimeNormal2(messageValue.created)}
              </div>
            </div>
          )
          contain = `完成子${currentNounPlanFilterName(TASKS)}`
          break
        case 'board.card.update.cancel.finish.child': // 取消子任务的完成
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name}在{currentNounPlanFilterName(TASKS)}
                「
                {messageValue.content.rela_card &&
                  messageValue.content.rela_card.name}
                」中 取消完成了子{currentNounPlanFilterName(TASKS)}
              </div>
              <div className={NewsListStyle.news_3_card}>「{jumpToTask}」</div>
              <div className={NewsListStyle.news_3_project}>
                <span style={{ marginRight: 2, color: '#8C8C8C' }}>#</span>
                {is_show_org_name && (
                  <div className={NewsListStyle.news_3_orgName}>
                    {getOrgNameWithOrgIdFilter(
                      messageValue.org_id,
                      currentUserOrganizes
                    )}
                    <img src={double_right} alt="" />
                  </div>
                )}
                {jumpToBoard}&nbsp;&gt;
              </div>
              <div className={NewsListStyle.news_3_group}>
                {messageValue.lists ? messageValue.lists.name : '无'}
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToTimeNormal2(messageValue.created)}
              </div>
            </div>
          )
          contain = `取消完成子${currentNounPlanFilterName(TASKS)}`
          break
        case 'board.card.delete.child': // 删除子卡片
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name} 在{currentNounPlanFilterName(TASKS)}
                「
                {messageValue.content.rela_card &&
                  messageValue.content.rela_card.name}
                」中删除了子
              </div>
              <div className={NewsListStyle.news_3_card}>「{jumpToTask}」</div>
              <div className={NewsListStyle.news_3_project}>
                <span style={{ marginRight: 2, color: '#8C8C8C' }}>#</span>
                {is_show_org_name && (
                  <div className={NewsListStyle.news_3_orgName}>
                    {getOrgNameWithOrgIdFilter(
                      messageValue.org_id,
                      currentUserOrganizes
                    )}
                    <img src={double_right} alt="" />
                  </div>
                )}
                {jumpToBoard}&nbsp;&gt;
              </div>
              <div className={NewsListStyle.news_3_group}>
                {messageValue.lists ? messageValue.lists.name : '无'}
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToTimeNormal2(messageValue.created)}
              </div>
            </div>
          )
          contain = `删除子${currentNounPlanFilterName(TASKS)}`
          break
        case 'board.card.update.executor.add': // 添加执行人
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name} 在{currentNounPlanFilterName(TASKS)}
                「
              </div>
              <div className={NewsListStyle.news_3_card}>{jumpToTask}</div>」
              <div className={NewsListStyle.news_3_text}>
                指派了负责人为 「
                {messageValue.content.rela_data &&
                  messageValue.content.rela_data.name}
                」
              </div>
              <span style={{ marginRight: 2, color: '#8C8C8C' }}>#</span>
              {is_show_org_name && (
                <div className={NewsListStyle.news_3_orgName}>
                  {getOrgNameWithOrgIdFilter(
                    messageValue.org_id,
                    currentUserOrganizes
                  )}
                  <img src={double_right} alt="" />
                </div>
              )}
              {/* <div className={NewsListStyle.news_3_project}>{currentNounPlanFilterName(PROJECTS)}：{jumpToBoard}</div> */}
              <div className={NewsListStyle.news_3_project}>{jumpToBoard} </div>
              <div className={NewsListStyle.news_3_group}>
                {messageValue.lists ? messageValue.lists.name : '无'}
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToTimeNormal2(messageValue.created)}
              </div>
            </div>
          )
          contain = `添加${currentNounPlanFilterName(TASKS)}执行人`
          break
        case 'board.card.update.executor.add.child': // 添加子卡片的执行人
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name} 在归属于
                {currentNounPlanFilterName(TASKS)}「
                {messageValue.content.rela_card &&
                  messageValue.content.rela_card.name}
                」中的子{currentNounPlanFilterName(TASKS)}「
              </div>
              <div className={NewsListStyle.news_3_card}>{jumpToTask}</div>」
              <div className={NewsListStyle.news_3_text}>
                指派了负责人为 「
                {messageValue.content.rela_data &&
                  messageValue.content.rela_data.name}
                」
              </div>
              <span style={{ marginRight: 2, color: '#8C8C8C' }}>#</span>
              {is_show_org_name && (
                <div className={NewsListStyle.news_3_orgName}>
                  {getOrgNameWithOrgIdFilter(
                    messageValue.org_id,
                    currentUserOrganizes
                  )}
                  <img src={double_right} alt="" />
                </div>
              )}
              {/* <div className={NewsListStyle.news_3_project}>{currentNounPlanFilterName(PROJECTS)}：{jumpToBoard}</div> */}
              <div className={NewsListStyle.news_3_project}>
                「{jumpToBoard}」{' '}
              </div>
              <div className={NewsListStyle.news_3_group}>
                {messageValue.lists ? messageValue.lists.name : '无'}
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToTimeNormal2(messageValue.created)}
              </div>
            </div>
          )
          contain = `添加子${currentNounPlanFilterName(TASKS)}执行人`
          break
        case 'board.card.update.executor.remove.child': // 移除子卡片执行人
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name} 在归属于
                {currentNounPlanFilterName(TASKS)}「
                {messageValue.content.rela_card &&
                  messageValue.content.rela_card.name}
                」中的子{currentNounPlanFilterName(TASKS)}「
              </div>
              <div className={NewsListStyle.news_3_card}>{jumpToTask}</div>」
              <div className={NewsListStyle.news_3_text}>
                移除了负责人为 「
                {messageValue.content.rela_data &&
                  messageValue.content.rela_data.name}
                」
              </div>
              <span style={{ marginRight: 2, color: '#8C8C8C' }}>#</span>
              {is_show_org_name && (
                <div className={NewsListStyle.news_3_orgName}>
                  {getOrgNameWithOrgIdFilter(
                    messageValue.org_id,
                    currentUserOrganizes
                  )}
                  <img src={double_right} alt="" />
                </div>
              )}
              {/* <div className={NewsListStyle.news_3_project}>{currentNounPlanFilterName(PROJECTS)}：{jumpToBoard}</div> */}
              <div className={NewsListStyle.news_3_project}>
                「{jumpToBoard}」{' '}
              </div>
              <div className={NewsListStyle.news_3_group}>
                {messageValue.lists ? messageValue.lists.name : '无'}
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToTimeNormal2(messageValue.created)}
              </div>
            </div>
          )
          contain = `移除子${currentNounPlanFilterName(TASKS)}执行人`
          break
        case 'board.card.update.label.add': // 添加标签
          if (messageValue.content.rela_data !== undefined) {
            messageContain = (
              <div className={NewsListStyle.news_3}>
                <div className={NewsListStyle.news_3_text}>
                  {messageValue.creator.name} 在
                  {currentNounPlanFilterName(TASKS)}{' '}
                </div>
                <div className={NewsListStyle.news_3_card}>
                  「{jumpToTask}」 中 添加了标签「
                  {messageValue.content.rela_data &&
                    messageValue.content.rela_data.name}
                  」{' '}
                </div>
                <div className={NewsListStyle.news_3_project}>
                  <span style={{ marginRight: 2, color: '#8C8C8C' }}>#</span>
                  {is_show_org_name && (
                    <div className={NewsListStyle.news_3_orgName}>
                      {getOrgNameWithOrgIdFilter(
                        messageValue.org_id,
                        currentUserOrganizes
                      )}
                      <img src={double_right} alt="" />
                    </div>
                  )}
                  {jumpToBoard}&nbsp;&gt;
                </div>
                <div className={NewsListStyle.news_3_group}>
                  {messageValue.lists ? messageValue.lists.name : '无'}
                </div>
                <div className={NewsListStyle.news_3_time}>
                  {timestampToTimeNormal2(messageValue.created)}
                </div>
              </div>
            )
          } else {
            messageContain = <div></div>
          }
          contain = `添加${currentNounPlanFilterName(TASKS)}标签`
          break
        case 'board.card.update.label.remove': // 移除标签
          if (messageValue.content.rela_data !== undefined) {
            messageContain = (
              <div className={NewsListStyle.news_3}>
                <div className={NewsListStyle.news_3_text}>
                  {messageValue.creator.name}在
                  {currentNounPlanFilterName(TASKS)}
                </div>
                <div className={NewsListStyle.news_3_card}>
                  「{jumpToTask}」中 删除了标签「
                  {messageValue.content.rela_data &&
                    messageValue.content.rela_data.name}
                  」
                </div>
                <div className={NewsListStyle.news_3_project}>
                  <span style={{ marginRight: 2, color: '#8C8C8C' }}>#</span>
                  {is_show_org_name && (
                    <div className={NewsListStyle.news_3_orgName}>
                      {getOrgNameWithOrgIdFilter(
                        messageValue.org_id,
                        currentUserOrganizes
                      )}
                      <img src={double_right} alt="" />
                    </div>
                  )}
                  {jumpToBoard}&nbsp;&gt;
                </div>
                <div className={NewsListStyle.news_3_group}>
                  {messageValue.lists ? messageValue.lists.name : '无'}
                </div>
                <div className={NewsListStyle.news_3_time}>
                  {timestampToTimeNormal2(messageValue.created)}
                </div>
              </div>
            )
          } else {
            messageContain = <div></div>
          }
          contain = `移除${currentNounPlanFilterName(TASKS)}标签`
          break
        // case 'board.card.update.contentprivilege':
        //   contain = '设置任务内容特权'
        //   break
        case 'board.card.add.to.milestone':
          contain = '把任务添加到里程碑'
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name}在{currentNounPlanFilterName(TASKS)}
              </div>
              <div className={NewsListStyle.news_3_card}>
                「{jumpToTask}」中添加了关联里程碑「
                {messageValue.content.milestone &&
                  messageValue.content.milestone.name}
                」内容
              </div>
              <div className={NewsListStyle.news_3_project}>
                <span style={{ marginRight: 2, color: '#8C8C8C' }}>#</span>
                {is_show_org_name && (
                  <div className={NewsListStyle.news_3_orgName}>
                    {getOrgNameWithOrgIdFilter(
                      messageValue.org_id,
                      currentUserOrganizes
                    )}
                    <img src={double_right} alt="" />
                  </div>
                )}
                {jumpToBoard}&nbsp;&gt;
              </div>
              <div className={NewsListStyle.news_3_group}>
                {messageValue.lists ? messageValue.lists.name : '无'}
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToTimeNormal2(messageValue.created)}
              </div>
            </div>
          )
          break
        case 'board.card.remove.to.milestone':
          contain = '把任务从里程碑中删除'
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name}在{currentNounPlanFilterName(TASKS)}
              </div>
              <div className={NewsListStyle.news_3_card}>
                「{jumpToTask}」中移除了关联里程碑「
                {messageValue.content.milestone &&
                  messageValue.content.milestone.name}
                」的内容
              </div>
              <div className={NewsListStyle.news_3_project}>
                <span style={{ marginRight: 2, color: '#8C8C8C' }}>#</span>
                {is_show_org_name && (
                  <div className={NewsListStyle.news_3_orgName}>
                    {getOrgNameWithOrgIdFilter(
                      messageValue.org_id,
                      currentUserOrganizes
                    )}
                    <img src={double_right} alt="" />
                  </div>
                )}
                {jumpToBoard}&nbsp;&gt;
              </div>
              <div className={NewsListStyle.news_3_group}>
                {messageValue.lists ? messageValue.lists.name : '无'}
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToTimeNormal2(messageValue.created)}
              </div>
            </div>
          )
          break
        case 'board.card.list.group.add': // 更新分组
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name} 在
                {currentNounPlanFilterName(PROJECTS)}
              </div>
              <div className={NewsListStyle.news_3_card}>
                「{jumpToBoard}」中
              </div>
              <div className={NewsListStyle.news_3_text}>
                添加了分组
                {messageValue.content.lists && messageValue.content.lists.name}
              </div>
              <span style={{ marginRight: 2, color: '#8C8C8C' }}>#</span>
              {is_show_org_name && (
                <div className={NewsListStyle.news_3_orgName}>
                  {getOrgNameWithOrgIdFilter(
                    messageValue.org_id,
                    currentUserOrganizes
                  )}
                  <img src={double_right} alt="" />
                </div>
              )}
              {/* <div className={NewsListStyle.news_3_project}>{currentNounPlanFilterName(PROJECTS)}：{jumpToBoard}</div> */}
              <div className={NewsListStyle.news_3_project}>
                {jumpToBoard} &gt;{' '}
              </div>
              <div className={NewsListStyle.news_3_group}>
                {messageValue.content.lists
                  ? messageValue.content.lists.name
                  : '无'}
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToTimeNormal2(messageValue.created)}
              </div>
            </div>
          )
          contain = `更新${currentNounPlanFilterName(TASKS)}分组`
          break
        case 'board.card.list.group.remove': // 删除卡片分组
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name} 在
                {currentNounPlanFilterName(PROJECTS)}
              </div>
              <div className={NewsListStyle.news_3_card}>
                「{jumpToBoard}」中
              </div>
              <div className={NewsListStyle.news_3_text}>
                移除了分组「
                {messageValue.content.lists && messageValue.content.lists.name}
                」
              </div>
              <span style={{ marginRight: 2, color: '#8C8C8C' }}>#</span>
              {is_show_org_name && (
                <div className={NewsListStyle.news_3_orgName}>
                  {getOrgNameWithOrgIdFilter(
                    messageValue.org_id,
                    currentUserOrganizes
                  )}
                  <img src={double_right} alt="" />
                </div>
              )}
              {/* <div className={NewsListStyle.news_3_project}>{currentNounPlanFilterName(PROJECTS)}：{jumpToBoard}</div> */}
              <div className={NewsListStyle.news_3_project}>
                {jumpToBoard} &gt;{' '}
              </div>
              <div className={NewsListStyle.news_3_group}>
                {messageValue.content.lists
                  ? messageValue.content.lists.name
                  : '无'}
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToTimeNormal2(messageValue.created)}
              </div>
            </div>
          )
          contain = `移除${currentNounPlanFilterName(TASKS)}分组`
          break
        case 'board.card.list.group.update.name': //更新了分组名称
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name} 在
                {currentNounPlanFilterName(PROJECTS)}
              </div>
              <div className={NewsListStyle.news_3_card}>「{jumpToBoard}」</div>
              <div className={NewsListStyle.news_3_text}>
                中更新了原「
                {messageValue.content.rela_data &&
                  messageValue.content.rela_data}
                」分组名称为「
                {messageValue.content.lists && messageValue.content.lists.name}
                」
              </div>
              <span style={{ marginRight: 2, color: '#8C8C8C' }}>#</span>
              {is_show_org_name && (
                <div className={NewsListStyle.news_3_orgName}>
                  {getOrgNameWithOrgIdFilter(
                    messageValue.org_id,
                    currentUserOrganizes
                  )}
                  <img src={double_right} alt="" />
                </div>
              )}
              {/* <div className={NewsListStyle.news_3_project}>{currentNounPlanFilterName(PROJECTS)}：{jumpToBoard}</div> */}
              <div className={NewsListStyle.news_3_project}>
                {jumpToBoard} &gt;{' '}
              </div>
              <div className={NewsListStyle.news_3_group}>
                {messageValue.content.lists
                  ? messageValue.content.lists.name
                  : '无'}
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToTimeNormal2(messageValue.created)}
              </div>
            </div>
          )
          contain = `更新${currentNounPlanFilterName(TASKS)}分组`
          break
        //流程
        case 'board.flow.instance.initiate': // 启动流程
          contain = `启动${currentNounPlanFilterName(FLOWS)}`
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name} 在
                {currentNounPlanFilterName(PROJECTS)}「{jumpToBoard}」中启动
                {currentNounPlanFilterName(FLOWS)}「{jumpToProcess}」
              </div>
              <div className={NewsListStyle.news_3_project}>
                <span style={{ marginRight: 2, color: '#8C8C8C' }}>#</span>
                {is_show_org_name && (
                  <div className={NewsListStyle.news_3_orgName}>
                    {getOrgNameWithOrgIdFilter(
                      messageValue.org_id,
                      currentUserOrganizes
                    )}
                    <img src={double_right} alt="" />
                  </div>
                )}
                {jumpToBoard}&nbsp;
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToTimeNormal2(messageValue.created)}
              </div>
            </div>
          )
          break
        case 'board.update.user.remove': // 移除了项目
          contain = `移除${currentNounPlanFilterName(PROJECTS)}成员`
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name} 将「
                {messageValue.content.rela_users &&
                  messageValue.content.rela_users}
                」移出了「{jumpToBoard}」{currentNounPlanFilterName(PROJECTS)}
              </div>
              <div className={NewsListStyle.news_3_project}>
                <span style={{ marginRight: 2, color: '#8C8C8C' }}>#</span>
                {is_show_org_name && (
                  <div className={NewsListStyle.news_3_orgName}>
                    {getOrgNameWithOrgIdFilter(
                      messageValue.org_id,
                      currentUserOrganizes
                    )}
                    <img src={double_right} alt="" />
                  </div>
                )}
                {jumpToBoard}&nbsp;
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToTimeNormal2(messageValue.created)}
              </div>
            </div>
          )
          break
        case 'board.update.app.add': // 添加了项目的功能
          contain = `添加${currentNounPlanFilterName(PROJECTS)}功能`
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name} 在
                {currentNounPlanFilterName(PROJECTS)}「{jumpToBoard}」中添加了「
                {messageValue.content.rela_data &&
                  messageValue.content.rela_data}
                」的功能
              </div>
              <div className={NewsListStyle.news_3_project}>
                <span style={{ marginRight: 2, color: '#8C8C8C' }}>#</span>
                {is_show_org_name && (
                  <div className={NewsListStyle.news_3_orgName}>
                    {getOrgNameWithOrgIdFilter(
                      messageValue.org_id,
                      currentUserOrganizes
                    )}
                    <img src={double_right} alt="" />
                  </div>
                )}
                {jumpToBoard}&nbsp;
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToTimeNormal2(messageValue.created)}
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
                {currentNounPlanFilterName(PROJECTS)}「{jumpToBoard}」中移除了「
                {messageValue.content.rela_data &&
                  messageValue.content.rela_data}
                」的功能
              </div>
              <div className={NewsListStyle.news_3_project}>
                <span style={{ marginRight: 2, color: '#8C8C8C' }}>#</span>
                {is_show_org_name && (
                  <div className={NewsListStyle.news_3_orgName}>
                    {getOrgNameWithOrgIdFilter(
                      messageValue.org_id,
                      currentUserOrganizes
                    )}
                    <img src={double_right} alt="" />
                  </div>
                )}
                {jumpToBoard}&nbsp;
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToTimeNormal2(messageValue.created)}
              </div>
            </div>
          )
          break
        case 'board.update.user.role': // 设置用户在项目中的角色
          contain = `设置了${currentNounPlanFilterName(PROJECTS)}成员角色`
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name} 在
                {currentNounPlanFilterName(PROJECTS)}「{jumpToBoard}
                」中设置了成员「
                {messageValue.content.rela_users &&
                  messageValue.content.rela_users}
                」的角色为「
                {messageValue.content.rela_data &&
                  messageValue.content.rela_data}
                」
              </div>
              <div className={NewsListStyle.news_3_project}>
                <span style={{ marginRight: 2, color: '#8C8C8C' }}>#</span>
                {is_show_org_name && (
                  <div className={NewsListStyle.news_3_orgName}>
                    {getOrgNameWithOrgIdFilter(
                      messageValue.org_id,
                      currentUserOrganizes
                    )}
                    <img src={double_right} alt="" />
                  </div>
                )}
                {jumpToBoard}&nbsp;
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToTimeNormal2(messageValue.created)}
              </div>
            </div>
          )
          break
        // case 'board.update.contentprivilege': // 设置项目的内容特权
        //   break
        case 'board.flow.task.recall':
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name} 撤回
                {currentNounPlanFilterName(FLOWS)}「{jumpToProcess}」节点「
                {messageValue.content.flow_node_instance &&
                  messageValue.content.flow_node_instance.name}
                」
              </div>
              <div className={NewsListStyle.news_3_project}>
                <span style={{ marginRight: 2, color: '#8C8C8C' }}>#</span>
                {is_show_org_name && (
                  <div className={NewsListStyle.news_3_orgName}>
                    {getOrgNameWithOrgIdFilter(
                      messageValue.org_id,
                      currentUserOrganizes
                    )}
                    <img src={double_right} alt="" />
                  </div>
                )}
                {jumpToBoard}&nbsp;
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToTimeNormal2(messageValue.created)}
              </div>
            </div>
          )
          contain = `撤回${currentNounPlanFilterName(FLOWS)}任务`
          break
        case 'board.flow.task.reject':
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name} 驳回
                {currentNounPlanFilterName(FLOWS)}「{jumpToProcess}」节点「
                {messageValue.content.flow_node_instance &&
                  messageValue.content.flow_node_instance.name}
                」
              </div>
              <div className={NewsListStyle.news_3_project}>
                <span style={{ marginRight: 2, color: '#8C8C8C' }}>#</span>
                {is_show_org_name && (
                  <div className={NewsListStyle.news_3_orgName}>
                    {getOrgNameWithOrgIdFilter(
                      messageValue.org_id,
                      currentUserOrganizes
                    )}
                    <img src={double_right} alt="" />
                  </div>
                )}
                {jumpToBoard}&nbsp;
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToTimeNormal2(messageValue.created)}
              </div>
            </div>
          )
          contain = `撤回${currentNounPlanFilterName(FLOWS)}任务`
          break
        case 'board.flow.task.reassign':
          contain = '重新指派审批人'
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name} 在{currentNounPlanFilterName(FLOWS)}
                「{jumpToProcess}」节点「
                {messageValue.content.flow_node_instance &&
                  messageValue.content.flow_node_instance.name}
                」中重新指定审批人 {messageValue.content.user.name}
              </div>
              <div className={NewsListStyle.news_3_project}>
                <span style={{ marginRight: 2, color: '#8C8C8C' }}>#</span>
                {is_show_org_name && (
                  <div className={NewsListStyle.news_3_orgName}>
                    {getOrgNameWithOrgIdFilter(
                      messageValue.org_id,
                      currentUserOrganizes
                    )}
                    <img src={double_right} alt="" />
                  </div>
                )}
                {jumpToBoard}&nbsp;
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToTimeNormal2(messageValue.created)}
              </div>
            </div>
          )
          break
        case 'board.flow.task.pass':
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name} 在{currentNounPlanFilterName(FLOWS)}
                「{jumpToProcess}」 中完成了任务「
                {messageValue.content.flow_node_instance &&
                  messageValue.content.flow_node_instance.name}
                」
              </div>
              <div className={NewsListStyle.news_3_project}>
                <span style={{ marginRight: 2, color: '#8C8C8C' }}>#</span>
                {is_show_org_name && (
                  <div className={NewsListStyle.news_3_orgName}>
                    {getOrgNameWithOrgIdFilter(
                      messageValue.org_id,
                      currentUserOrganizes
                    )}
                    <img src={double_right} alt="" />
                  </div>
                )}
                {jumpToBoard}&nbsp;&gt;
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToTimeNormal2(messageValue.created)}
              </div>
            </div>
          )
          contain = `完成${currentNounPlanFilterName(FLOWS)}任务`
          break
        case 'board.flow.instance.discontinue': // 中止流程
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name} 在
                {currentNounPlanFilterName(PROJECTS)}「{jumpToBoard}」中
                中止了流程「{jumpToProcess}」
              </div>
              <div className={NewsListStyle.news_3_project}>
                <span style={{ marginRight: 2, color: '#8C8C8C' }}>#</span>
                {is_show_org_name && (
                  <div className={NewsListStyle.news_3_orgName}>
                    {getOrgNameWithOrgIdFilter(
                      messageValue.org_id,
                      currentUserOrganizes
                    )}
                    <img src={double_right} alt="" />
                  </div>
                )}
                {jumpToBoard}&nbsp;
              </div>
              {/* 「{messageValue.content.flow_node_instance.name}」 */}
              <div className={NewsListStyle.news_3_time}>
                {timestampToTimeNormal2(messageValue.created)}
              </div>
            </div>
          )
          contain = `完成${currentNounPlanFilterName(FLOWS)}任务`
          break
        case 'board.flow.instance.delete': // 删除流程
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name} 在
                {currentNounPlanFilterName(PROJECTS)}「{jumpToBoard}」中
                删除了流程「{jumpToProcess}」
              </div>
              <div className={NewsListStyle.news_3_project}>
                <span style={{ marginRight: 2, color: '#8C8C8C' }}>#</span>
                {is_show_org_name && (
                  <div className={NewsListStyle.news_3_orgName}>
                    {getOrgNameWithOrgIdFilter(
                      messageValue.org_id,
                      currentUserOrganizes
                    )}
                    <img src={double_right} alt="" />
                  </div>
                )}
                {jumpToBoard}&nbsp;
              </div>
              {/* 「{messageValue.content.flow_node_instance.name}」 */}
              <div className={NewsListStyle.news_3_time}>
                {timestampToTimeNormal2(messageValue.created)}
              </div>
            </div>
          )
          contain = `删除${currentNounPlanFilterName(FLOWS)}任务`
          break
        case 'board.flow.instance.deadline.set': // 设置流程实例的截止时间
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name} 在
                {currentNounPlanFilterName(PROJECTS)}「{jumpToBoard}」中
                设置了流程「{jumpToProcess}」的截止时间
              </div>
              <div className={NewsListStyle.news_3_project}>
                <span style={{ marginRight: 2, color: '#8C8C8C' }}>#</span>
                {is_show_org_name && (
                  <div className={NewsListStyle.news_3_orgName}>
                    {getOrgNameWithOrgIdFilter(
                      messageValue.org_id,
                      currentUserOrganizes
                    )}
                    <img src={double_right} alt="" />
                  </div>
                )}
                {jumpToBoard}&nbsp;
              </div>
              {/* 「{messageValue.content.flow_node_instance.name}」 */}
              <div className={NewsListStyle.news_3_time}>
                {timestampToTimeNormal2(messageValue.created)}
              </div>
            </div>
          )
          contain = `设置${currentNounPlanFilterName(FLOWS)}截止时间`
          break
        case 'board.flow.node.deadline.set': // 流程节点的截止时间
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
              <div className={NewsListStyle.news_3_project}>
                <span style={{ marginRight: 2, color: '#8C8C8C' }}>#</span>
                {is_show_org_name && (
                  <div className={NewsListStyle.news_3_orgName}>
                    {getOrgNameWithOrgIdFilter(
                      messageValue.org_id,
                      currentUserOrganizes
                    )}
                    <img src={double_right} alt="" />
                  </div>
                )}
                {jumpToBoard}&nbsp;
              </div>
              {/* 「{messageValue.content.flow_node_instance.name}」 */}
              <div className={NewsListStyle.news_3_time}>
                {timestampToTimeNormal2(messageValue.created)}
              </div>
            </div>
          )
          contain = `设置${currentNounPlanFilterName(FLOWS)}截止时间`
          break
        case 'board.flow.task.assignee.notice':
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                您有一个{currentNounPlanFilterName(FLOWS)}「{jumpToProcess}
                」任务待处理
              </div>
              <div className={NewsListStyle.news_3_project}>
                <span style={{ marginRight: 2, color: '#8C8C8C' }}>#</span>
                {is_show_org_name && (
                  <div className={NewsListStyle.news_3_orgName}>
                    {getOrgNameWithOrgIdFilter(
                      messageValue.org_id,
                      currentUserOrganizes
                    )}
                    <img src={double_right} alt="" />
                  </div>
                )}
                {jumpToBoard}&nbsp;
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToTimeNormal2(messageValue.created)}
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
                {messageValue.content.board_folder &&
                  messageValue.content.board_folder.name}
                」
              </div>
              <div className={NewsListStyle.news_3_project}>
                <span style={{ marginRight: 2, color: '#8C8C8C' }}>#</span>
                {is_show_org_name && (
                  <div className={NewsListStyle.news_3_orgName}>
                    {getOrgNameWithOrgIdFilter(
                      messageValue.org_id,
                      currentUserOrganizes
                    )}
                    <img src={double_right} alt="" />
                  </div>
                )}
                {jumpToBoard}&nbsp;
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToTimeNormal2(messageValue.created)}
              </div>
            </div>
          )
          contain = `创建文件夹`
          break
        case 'board.file.upload': // 文件上传
          contain = `上传${currentNounPlanFilterName(FILES)}`
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name} 在{' '}
                {currentNounPlanFilterName(PROJECTS)}「{jumpToBoard}」中 上传了
                {currentNounPlanFilterName(FILES)}「{jumpToFile}」
              </div>
              <div className={NewsListStyle.news_3_project}>
                <span style={{ marginRight: 2, color: '#8C8C8C' }}>#</span>
                {is_show_org_name && (
                  <div className={NewsListStyle.news_3_orgName}>
                    {getOrgNameWithOrgIdFilter(
                      messageValue.org_id,
                      currentUserOrganizes
                    )}
                    <img src={double_right} alt="" />
                  </div>
                )}
                {jumpToBoard}&nbsp;
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToTimeNormal2(messageValue.created)}
              </div>
            </div>
          )
          break
        case 'board.file.version.upload': // 文件版本更新上传
          contain = `${currentNounPlanFilterName(FILES)}版本更新`
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name}在
                {currentNounPlanFilterName(PROJECTS)}「{jumpToBoard}」中更新了
                {currentNounPlanFilterName(FILES)}「{jumpToFile}」
              </div>
              <div className={NewsListStyle.news_3_project}>
                <span style={{ marginRight: 2, color: '#8C8C8C' }}>#</span>
                {is_show_org_name && (
                  <div className={NewsListStyle.news_3_orgName}>
                    {getOrgNameWithOrgIdFilter(
                      messageValue.org_id,
                      currentUserOrganizes
                    )}
                    <img src={double_right} alt="" />
                  </div>
                )}
                {jumpToBoard}&nbsp;
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToTimeNormal2(messageValue.created)}
              </div>
            </div>
          )
          break
        case 'board.folder.remove.recycle':
          contain = '移除文件夹到回收站'
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name} 在 「{jumpToBoard}」中 移动文件夹「
                {messageValue.content.board_folder &&
                  messageValue.content.board_folder.name}
                」到回收站
              </div>
              <div className={NewsListStyle.news_3_project}>
                <span style={{ marginRight: 2, color: '#8C8C8C' }}>#</span>
                {is_show_org_name && (
                  <div className={NewsListStyle.news_3_orgName}>
                    {getOrgNameWithOrgIdFilter(
                      messageValue.org_id,
                      currentUserOrganizes
                    )}
                    <img src={double_right} alt="" />
                  </div>
                )}
                {jumpToBoard}&nbsp;
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToTimeNormal2(messageValue.created)}
              </div>
            </div>
          )
          break
        case 'board.file.remove.recycle':
          contain = `移除${currentNounPlanFilterName(FILES)}到回收站`
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name} 在
                {currentNounPlanFilterName(PROJECTS)}「{jumpToBoard}」中移动
                {currentNounPlanFilterName(FILES)}「{jumpToFile}」到回收站
              </div>
              <div className={NewsListStyle.news_3_project}>
                <span style={{ marginRight: 2, color: '#8C8C8C' }}>#</span>
                {is_show_org_name && (
                  <div className={NewsListStyle.news_3_orgName}>
                    {getOrgNameWithOrgIdFilter(
                      messageValue.org_id,
                      currentUserOrganizes
                    )}
                    <img src={double_right} alt="" />
                  </div>
                )}
                {jumpToBoard}&nbsp;
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToTimeNormal2(messageValue.created)}
              </div>
            </div>
          )
          break
        case 'board.file.move.to.folder':
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
                <span
                  className={NewsListStyle.fileName}
                  onClick={() => {
                    this.goToFile({
                      board_id: messageValue.content.board.id,
                      content: messageValue.content
                    })
                  }}
                >
                  {showList}
                </span>
                」到文件夹「
                {messageValue.content.target_folder &&
                  messageValue.content.target_folder.name}
                」
              </div>
              <div className={NewsListStyle.news_3_project}>
                <span style={{ marginRight: 2, color: '#8C8C8C' }}>#</span>
                {is_show_org_name && (
                  <div className={NewsListStyle.news_3_orgName}>
                    {getOrgNameWithOrgIdFilter(
                      messageValue.org_id,
                      currentUserOrganizes
                    )}
                    <img src={double_right} alt="" />
                  </div>
                )}
                {jumpToBoard}&nbsp;
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToTimeNormal2(messageValue.created)}
              </div>
            </div>
          )
          break
        case 'board.file.copy.to.folder':
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
                <span
                  className={NewsListStyle.fileName}
                  onClick={() => {
                    this.goToFile({
                      board_id: messageValue.content.board.id,
                      content: messageValue.content
                    })
                  }}
                >
                  {showCopyList}
                </span>
                」到文件夹「
                {messageValue.content &&
                  messageValue.content.target_folder &&
                  messageValue.content.target_folder.name}
                」
              </div>
              <div className={NewsListStyle.news_3_project}>
                <span style={{ marginRight: 2, color: '#8C8C8C' }}>#</span>
                {is_show_org_name && (
                  <div className={NewsListStyle.news_3_orgName}>
                    {getOrgNameWithOrgIdFilter(
                      messageValue.org_id,
                      currentUserOrganizes
                    )}
                    <img src={double_right} alt="" />
                  </div>
                )}
                {jumpToBoard}&nbsp;
              </div>
              <div className={NewsListStyle.news_3_time}>
                {timestampToTimeNormal2(messageValue.created)}
              </div>
            </div>
          )
          break
        case 'meeting.create': // 发起会议
          // console.log('进来了', 'ssss')
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>
                {messageValue.creator.name}
                {messageValue.content.board && messageValue.content.board.name && (
                  <span>
                    在{currentNounPlanFilterName(PROJECTS)}「{jumpToBoard}」中
                  </span>
                )}
                {/* { messageValue.content.board && messageValue.content.board.name ? `中` : ``} */}
                向您发起了一条会议 「{jumpToMeeting}」
              </div>
              {/* 「{messageValue.content.flow_node_instance.name}」 */}
              <div className={NewsListStyle.news_3_time}>
                {timestampToTimeNormal2(messageValue.created)}
              </div>
            </div>
          )
          contain = `发起会议`
          break

        // 里程碑 --------------------------------------------
        // case 'board.milestone.add':
        //   contain = `创建里程碑`
        //   messageContain = (
        //     <div className={NewsListStyle.news_3}>
        //       <div><span className={NewsListStyle.news_3_text}>{messageValue.creator.name}</span> 创建了里程碑「{jumpToMilestone}」</div>
        //       <div className={NewsListStyle.news_3_time}>{timestampToTimeNormal2(messageValue.created)}</div>
        //     </div>
        //   )
        //   break
        // case 'board.milestone.upd':
        //   contain = `修改里程碑`
        //   messageContain = (
        //     <div className={NewsListStyle.news_3}>
        //       <div><span className={NewsListStyle.news_3_text}>{messageValue.creator.name}</span> 修改了原里程碑名「{messageValue.content.milestone.old_name}」为「{jumpToMilestone}」里程碑名称</div>
        //       <div className={NewsListStyle.news_3_time}>{timestampToTimeNormal2(messageValue.created)}</div>
        //     </div>
        //   )
        //   break
        // case 'board.milestone.principal.add': // 设置里程碑负责人
        //   contain = `设置了里程碑负责人`
        //   messageContain = (
        //     <div className={NewsListStyle.news_3}>
        //       <div><span className={NewsListStyle.news_3_text}>{messageValue.creator.name}</span> 添加了里程碑「{jumpToMilestone}」负责人为「{messageValue.content.rela_user && messageValue.content.rela_user.name}」</div>
        //       <div className={NewsListStyle.news_3_time}>{timestampToTimeNormal2(messageValue.created)}</div>
        //     </div>
        //   )
        //   break
        // case 'board.milestone.principal.remove': // 移除负责人
        //   contain = `移除了里程碑负责人`
        //   messageContain = (
        //     <div className={NewsListStyle.news_3}>
        //       <div><span className={NewsListStyle.news_3_text}>{messageValue.creator.name}</span> 在里程碑「{jumpToMilestone}」中移除了负责人「{messageValue.content.rela_user && messageValue.content.rela_user.name}」</div>
        //       <div className={NewsListStyle.news_3_time}>{timestampToTimeNormal2(messageValue.created)}</div>
        //     </div>
        //   )
        //   break

        default:
          messageContain = <div></div>
          break
      }
      return { contain, messageContain }
    }
    //项目动态
    const projectNews = value => {
      // console.log(value, 'ssss')
      const { action } = value
      return (
        <div className={NewsListStyle.news_1}>
          {filterTitleContain(action, value).messageContain}
        </div>
      )
    }
    //任务动态
    const taskNews = value => {
      return (
        <div className={NewsListStyle.containr}>
          {value.map((val, key) => {
            const { action } = val
            return (
              <div className={NewsListStyle.news_1} key={key}>
                {filterTitleContain(action, val).messageContain}
              </div>
            )
          })}
        </div>
      )
    }
    //评论动态
    const commentNews = (value, parentKey, childrenKey) => {
      const { content = {}, org_id } = value[0]
      const { board = {}, card = {}, card_list = {} } = content
      const card_name = card['name']
      const card_id = card['id']
      const list_name = card_list['name']
      const board_name = board['name']
      const board_id = board['id']

      return (
        <div className={NewsListStyle.containr}>
          {value.map((val, key) => {
            const { action } = val
            let messageContain

            switch (action) {
              case 'board.card.update.comment.add':
                messageContain = (
                  <div className={NewsListStyle.news_3} key={key}>
                    <div className={NewsListStyle.news_3_text}>
                      {' '}
                      {val.creator.name}在{currentNounPlanFilterName(TASKS)}「
                    </div>
                    <div className={NewsListStyle.news_3_card}>
                      {
                        <span
                          style={{ color: '#1890FF', cursor: 'pointer' }}
                          onClick={() =>
                            this.props.dispatch({
                              type: 'newsDynamic/routingJump',
                              payload: {
                                route: `/technological/projectDetail?board_id=${val
                                  .content.board &&
                                  val.content.board
                                    .id}&appsSelectKey=3&card_id=${val.content
                                  .card && val.content.card.id}`
                              }
                            })
                          }
                        >
                          {val.content &&
                            val.content.card &&
                            val.content.card.name}
                        </span>
                      }
                      」中发表了一条评论
                    </div>
                    <div className={NewsListStyle.news_3_project}>
                      <span style={{ marginRight: 2, color: '#8C8C8C' }}>
                        #
                      </span>
                      {is_show_org_name && (
                        <div className={NewsListStyle.news_3_orgName}>
                          {getOrgNameWithOrgIdFilter(
                            org_id,
                            currentUserOrganizes
                          )}
                          <img src={double_right} alt="" />
                        </div>
                      )}
                      {
                        <span
                          style={{ color: '#1890FF', cursor: 'pointer' }}
                          onClick={() =>
                            this.props.dispatch({
                              type: 'newsDynamic/routingJump',
                              payload: {
                                route: `/technological/projectDetail?board_id=${val
                                  .content.board &&
                                  val.content.board.id}&appsSelectKey=3`
                              }
                            })
                          }
                        >
                          {val.content &&
                            val.content.board &&
                            val.content.board.name}
                        </span>
                      }{' '}
                      &gt;
                    </div>
                    <div className={NewsListStyle.news_3_group}>
                      {val.content.lists ? val.content.lists.name : '无'}
                    </div>
                    <div className={NewsListStyle.news_3_time}>
                      {timestampToTimeNormal2(val.created)}
                    </div>
                  </div>
                )
                break
              case 'board.card.update.comment.remove': // 移除卡片评论
                messageContain = (
                  <div className={NewsListStyle.news_3} key={key}>
                    <div className={NewsListStyle.news_3_text}>
                      {' '}
                      {val.creator.name} 在{currentNounPlanFilterName(TASKS)}「
                    </div>
                    <div className={NewsListStyle.news_3_card}>
                      {
                        <span
                          style={{ color: '#1890FF', cursor: 'pointer' }}
                          onClick={() =>
                            this.props.dispatch({
                              type: 'newsDynamic/routingJump',
                              payload: {
                                route: `/technological/projectDetail?board_id=${val
                                  .content.board &&
                                  val.content.board
                                    .id}&appsSelectKey=3&card_id=${val.content
                                  .card && val.content.card.id}`
                              }
                            })
                          }
                        >
                          {val.content &&
                            val.content.card &&
                            val.content.card.name}
                        </span>
                      }
                      」中删除了一条评论
                    </div>
                    <div className={NewsListStyle.news_3_project}>
                      <span style={{ marginRight: 2, color: '#8C8C8C' }}>
                        #
                      </span>
                      {is_show_org_name && (
                        <div className={NewsListStyle.news_3_orgName}>
                          {getOrgNameWithOrgIdFilter(
                            org_id,
                            currentUserOrganizes
                          )}
                          <img src={double_right} alt="" />
                        </div>
                      )}
                      {
                        <span
                          style={{ color: '#1890FF', cursor: 'pointer' }}
                          onClick={() =>
                            this.props.dispatch({
                              type: 'newsDynamic/routingJump',
                              payload: {
                                route: `/technological/projectDetail?board_id=${val
                                  .content.board &&
                                  val.content.board
                                    .id}&appsSelectKey=4&file_id=${val.content
                                  .board_file && val.content.board_file.id}`
                              }
                            })
                          }
                        >
                          {val.content &&
                            val.content.board &&
                            val.content.board.name}
                        </span>
                      }
                    </div>
                    <div className={NewsListStyle.news_3_group}>
                      {val.list_name ? val.list_name : '无'}
                    </div>
                    <div className={NewsListStyle.news_3_time}>
                      {timestampToTimeNormal2(val.created)}
                    </div>
                  </div>
                )
                break
              case 'board.file.comment.add': // 添加文件评论
                messageContain = (
                  <div className={NewsListStyle.news_3} key={key}>
                    <div className={NewsListStyle.news_3_text}>
                      {' '}
                      {val.creator.name}在{currentNounPlanFilterName(FILES)}「
                    </div>
                    <div className={NewsListStyle.news_3_card}>
                      {
                        <span
                          style={{ color: '#1890FF', cursor: 'pointer' }}
                          onClick={() =>
                            this.props.dispatch({
                              type: 'newsDynamic/routingJump',
                              payload: {
                                route: `/technological/projectDetail?board_id=${val
                                  .content.board &&
                                  val.content.board
                                    .id}&appsSelectKey=3&card_id=${val.content
                                  .board_file && val.content.board_file.id}`
                              }
                            })
                          }
                        >
                          {val.content &&
                            val.content.board_file &&
                            val.content.board_file.name}
                        </span>
                      }
                      」中发表了一条评论
                    </div>
                    <div className={NewsListStyle.news_3_project}>
                      <span style={{ marginRight: 2, color: '#8C8C8C' }}>
                        #
                      </span>
                      {is_show_org_name && (
                        <div className={NewsListStyle.news_3_orgName}>
                          {getOrgNameWithOrgIdFilter(
                            org_id,
                            currentUserOrganizes
                          )}
                          <img src={double_right} alt="" />
                        </div>
                      )}
                      {
                        <span
                          style={{ color: '#1890FF', cursor: 'pointer' }}
                          onClick={() =>
                            this.props.dispatch({
                              type: 'newsDynamic/routingJump',
                              payload: {
                                route: `/technological/projectDetail?board_id=${val
                                  .content.board &&
                                  val.content.board.id}&appsSelectKey=3`
                              }
                            })
                          }
                        >
                          {val.content &&
                            val.content.board &&
                            val.content.board.name}
                        </span>
                      }{' '}
                      &gt;
                    </div>
                    <div className={NewsListStyle.news_3_group}>
                      {val.content.lists ? val.content.lists.name : '无'}
                    </div>
                    <div className={NewsListStyle.news_3_time}>
                      {timestampToTimeNormal2(val.created)}
                    </div>
                  </div>
                )
                break
              case 'board.flow.comment.add': // 在流程中添加评论
                messageContain = (
                  <div className={NewsListStyle.news_3} key={key}>
                    <div className={NewsListStyle.news_3_text}>
                      {' '}
                      {val.creator.name}在{currentNounPlanFilterName(FLOWS)}「
                    </div>
                    <div className={NewsListStyle.news_3_card}>
                      {
                        <span
                          style={{ color: '#1890FF', cursor: 'pointer' }}
                          onClick={() =>
                            this.props.dispatch({
                              type: 'newsDynamic/routingJump',
                              payload: {
                                route: `/technological/projectDetail?board_id=${val
                                  .content.board &&
                                  val.content.board
                                    .id}&appsSelectKey=3&card_id=${val.content
                                  .flow_instance &&
                                  val.content.flow_instance.id}`
                              }
                            })
                          }
                        >
                          {val.content &&
                            val.content.flow_instance &&
                            val.content.flow_instance.name}
                        </span>
                      }
                      」中发表了一条评论
                    </div>
                    <div className={NewsListStyle.news_3_project}>
                      <span style={{ marginRight: 2, color: '#8C8C8C' }}>
                        #
                      </span>
                      {is_show_org_name && (
                        <div className={NewsListStyle.news_3_orgName}>
                          {getOrgNameWithOrgIdFilter(
                            org_id,
                            currentUserOrganizes
                          )}
                          <img src={double_right} alt="" />
                        </div>
                      )}
                      {
                        <span
                          style={{ color: '#1890FF', cursor: 'pointer' }}
                          onClick={() =>
                            this.props.dispatch({
                              type: 'newsDynamic/routingJump',
                              payload: {
                                route: `/technological/projectDetail?board_id=${val
                                  .content.board &&
                                  val.content.board.id}&appsSelectKey=3`
                              }
                            })
                          }
                        >
                          {val.content &&
                            val.content.board &&
                            val.content.board.name}
                        </span>
                      }{' '}
                      &gt;
                    </div>
                    <div className={NewsListStyle.news_3_group}>
                      {val.content.lists ? val.content.lists.name : '无'}
                    </div>
                    <div className={NewsListStyle.news_3_time}>
                      {timestampToTimeNormal2(val.created)}
                    </div>
                  </div>
                )
                break
              case 'board.flow.comment.remove': // 在流程中移除评论
                messageContain = (
                  <div className={NewsListStyle.news_3} key={key}>
                    <div className={NewsListStyle.news_3_text}>
                      {' '}
                      {val.creator.name}在{currentNounPlanFilterName(FLOWS)}「
                    </div>
                    <div className={NewsListStyle.news_3_card}>
                      {
                        <span
                          style={{ color: '#1890FF', cursor: 'pointer' }}
                          onClick={() =>
                            this.props.dispatch({
                              type: 'newsDynamic/routingJump',
                              payload: {
                                route: `/technological/projectDetail?board_id=${val
                                  .content.board &&
                                  val.content.board
                                    .id}&appsSelectKey=3&card_id=${val.content
                                  .flow_instance &&
                                  val.content.flow_instance.id}`
                              }
                            })
                          }
                        >
                          {val.content &&
                            val.content.flow_instance &&
                            val.content.flow_instance.name}
                        </span>
                      }
                      」中删除了一条评论
                    </div>
                    <div className={NewsListStyle.news_3_project}>
                      <span style={{ marginRight: 2, color: '#8C8C8C' }}>
                        #
                      </span>
                      {is_show_org_name && (
                        <div className={NewsListStyle.news_3_orgName}>
                          {getOrgNameWithOrgIdFilter(
                            org_id,
                            currentUserOrganizes
                          )}
                          <img src={double_right} alt="" />
                        </div>
                      )}
                      {
                        <span
                          style={{ color: '#1890FF', cursor: 'pointer' }}
                          onClick={() =>
                            this.props.dispatch({
                              type: 'newsDynamic/routingJump',
                              payload: {
                                route: `/technological/projectDetail?board_id=${val
                                  .content.board &&
                                  val.content.board.id}&appsSelectKey=3`
                              }
                            })
                          }
                        >
                          {val.content &&
                            val.content.board &&
                            val.content.board.name}
                        </span>
                      }{' '}
                      &gt;
                    </div>
                    <div className={NewsListStyle.news_3_group}>
                      {val.content.lists ? val.content.lists.name : '无'}
                    </div>
                    <div className={NewsListStyle.news_3_time}>
                      {timestampToTimeNormal2(val.created)}
                    </div>
                  </div>
                )
                break
              case 'board.card.comment.at.notice': // 任务评论 at 我的
                messageContain = (
                  <div className={NewsListStyle.news_3} key={key}>
                    <div className={NewsListStyle.news_3_text}>
                      {' '}
                      {val.creator.name}在{currentNounPlanFilterName(TASKS)}「
                    </div>
                    <div className={NewsListStyle.news_3_card}>
                      {
                        <span
                          style={{ color: '#1890FF', cursor: 'pointer' }}
                          onClick={() =>
                            this.props.dispatch({
                              type: 'newsDynamic/routingJump',
                              payload: {
                                route: `/technological/projectDetail?board_id=${val
                                  .content.board &&
                                  val.content.board
                                    .id}&appsSelectKey=3&card_id=${val.content
                                  .card && val.content.card.id}`
                              }
                            })
                          }
                        >
                          {val.content &&
                            val.content.card &&
                            val.content.card.name}
                        </span>
                      }
                      」的评论中@了您
                    </div>
                    <div className={NewsListStyle.news_3_project}>
                      <span style={{ marginRight: 2, color: '#8C8C8C' }}>
                        #
                      </span>
                      {is_show_org_name && (
                        <div className={NewsListStyle.news_3_orgName}>
                          {getOrgNameWithOrgIdFilter(
                            org_id,
                            currentUserOrganizes
                          )}
                          <img src={double_right} alt="" />
                        </div>
                      )}
                      {
                        <span
                          style={{ color: '#1890FF', cursor: 'pointer' }}
                          onClick={() =>
                            this.props.dispatch({
                              type: 'newsDynamic/routingJump',
                              payload: {
                                route: `/technological/projectDetail?board_id=${val
                                  .content.board &&
                                  val.content.board.id}&appsSelectKey=3`
                              }
                            })
                          }
                        >
                          {val.content &&
                            val.content.board &&
                            val.content.board.name}
                        </span>
                      }{' '}
                      &gt;
                    </div>
                    <div className={NewsListStyle.news_3_group}>
                      {val.content.lists ? val.content.lists.name : '无'}
                    </div>
                    <div className={NewsListStyle.news_3_time}>
                      {timestampToTimeNormal2(val.created)}
                    </div>
                  </div>
                )
                break
              // case 'board.file.comment.at.notice': // 文件评论 @ 我的
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
      const { action } = value
      return (
        <div className={NewsListStyle.news_1}>
          {filterTitleContain(action, value).messageContain}
        </div>
      )
    }
    //文档动态
    const fileNews = (value, key) => {
      const { action } = value
      return (
        <div className={NewsListStyle.news_1}>
          {filterTitleContain(action, value).messageContain}
        </div>
      )
    }

    //@评论动态
    const commentNews_2 = (value, parentKey, childrenKey) => {
      return (
        <div className={NewsListStyle.containr}>
          {value.map((val, key) => {
            const { creator } = val
            return (
              <div className={NewsListStyle.news_3} key={key}>
                {/* <div className={NewsListStyle.news_3_text}> {creator.name} {text} {activity_type == 'cardCommentAt' && currentNounPlanFilterName(TASKS)}</div>
                <div className={NewsListStyle.news_3_card}>{card_name || file_name}</div>
                <div className={NewsListStyle.news_3_project}>{currentNounPlanFilterName(PROJECTS)}：#{board_name}</div>
                {activity_type == 'cardCommentAt' && <div className={NewsListStyle.news_3_group}>分组：{list_name}</div>}
                <div className={NewsListStyle.news_3_time}>{timestampToTimeNormal2(val.created)}</div> */}
              </div>
            )
          })}
        </div>
      )
    }

    // 里程碑动态
    const milestoneNews = value => {
      const { action } = value
      return (
        <div className={NewsListStyle.news_1}>
          {filterTitleContain(action, value).messageContain}
        </div>
      )
    }

    // 会议动态
    const meetingNews = value => {
      // console.log(value, 'ssss')
      const { action } = value
      return (
        <div className={NewsListStyle.news_1}>
          {filterTitleContain(action, value).messageContain}
        </div>
      )
    }

    // 申请加入组织
    const applyOrg = (value, key) => {
      // console.log(value, 'sssss')
      const { action } = value
      return (
        <div className={NewsListStyle.news_1}>
          {filterTitleContain(action, value).messageContain}
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
          containner = taskNews(value)
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
          containner = commentNews(value, parentKey, childrenKey)
          break
        case '15': // 文件的评论动态
          containner = commentNews(value, parentKey, childrenKey)
          break
        case '21': // 任务的关联内容
          containner = taskNews(value)
          break
        case '22': // 流程的评论动态
          containner = commentNews(value, parentKey, childrenKey)
          break
        case '16': // 任务评论 @ 通知
          containner = commentNews(value, parentKey, childrenKey)
          break
        // case '17': // 文件评论 @ 通知
        //   containner = (commentNews(value, parentKey, childrenKey))
        //   break
        case '18':
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
        {/*{isHasNewDynamic?(*/}
        {/*<div className={NewsListStyle.newsConfirm} onClick={this.updateNewsDynamic.bind(this)}>您有新消息，点击更新查看</div>*/}
        {/*): ('')}*/}

        {newsDynamicList && newsDynamicList.length ? (
          newsDynamicList.map((value, parentkey) => {
            const { date, dataList = [], newDataList = [] } = value
            return (
              <div className={NewsListStyle.itemOut} key={parentkey}>
                {newDataList.map((value, childrenKey) => {
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
          })
        ) : (
          <div
            style={{
              margin: 'auto',
              position: 'absolute',
              top: 0,
              right: 0,
              left: 0,
              bottom: 0,
              textAlign: 'center'
            }}
          >
            <div
              style={{ fontSize: 48, color: 'rgba(0,0,0,0.15)' }}
              className={`${globalStyles.authTheme}`}
            >
              &#xe683;
            </div>
            <span style={{ color: 'rgba(217,217,217,1)' }}>暂无动态</span>
          </div>
        )}
      </div>
    )
  }
}
