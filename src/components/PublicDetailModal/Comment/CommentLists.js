import React from 'react';
import { Card, Icon, Input, Button, Mention, Upload, Tooltip, Avatar } from 'antd'
import CommentStyles from './Comment2.less'
import commonCommentStyles from './commonComment.less'
import { judgeTimeDiffer, judgeTimeDiffer_ten, newsDynamicHandleTime, timestampToHM } from "../../../utils/util";
import { currentNounPlanFilterName } from "@/utils/businessFunction";
import { TASKS } from '@/globalset/js/constant'
import { connect } from 'dva'

const Dragger = Upload.Dragger

@connect(mapStateToProps)
export default class CommentListItem extends React.Component {
  state = {
    closeNormal: true,
    content_detail_use_id_local: '',
  }

  componentDidMount() {
    this.getCommentList(this.props)
  }

  componentWillReceiveProps(nextProps) {
    this.getCommentList(nextProps)
  }

  //获取评论列表
  getCommentList = (props) => {
    const { dispatch, commentUseParams = {}, isShowAllDynamic } = props
    const { content_detail_use_id, flag, origin_type } = commentUseParams
    const { content_detail_use_id_local } = this.state
    if (!content_detail_use_id || content_detail_use_id == content_detail_use_id_local) {
      return
    }
    this.setState({
      content_detail_use_id_local: content_detail_use_id
    })
    if (origin_type && origin_type == '1') { // 表示是任务
      dispatch({
        type: 'publicModalComment/getCardCommentListAll',
        payload: {
          id: content_detail_use_id,
          flag: isShowAllDynamic ? '0' : '1'
        }
      })
      return
    }
    dispatch({
      type: 'publicModalComment/getPublicModalDetailCommentList',
      payload: {
        id: content_detail_use_id,
        flag: isShowAllDynamic ? '0' : '1'
      }
    })
  }

  boxOnMouseOver() {
    this.setState({
      closeNormal: false
    })
  }
  hideBeyond() {
    this.setState({
      closeNormal: true
    })
  }

  deleteComment(id) {
    const { commentUseParams = {} } = this.props
    const { deleteComment } = commentUseParams
    deleteComment && deleteComment({ id })
  }

  commitClicShowEdit(data) {
    this.props.commitClicShowEdit(data)
  }

  getSpeicalTime = () => {
    let now = new Date()
    now.setMinutes(now.getMinutes() + 10)
    return now.getMinutes()
  }

  filterTitleContain = (activity_type, data) => {
    let contain = ''
    let messageContainer = (<div></div>)
    const { create_time } = data
    switch (activity_type) {
      case 'board.card.create':// 创建卡片
        messageContainer = (
          <div className={commonCommentStyles.news_item}>
            <span className={commonCommentStyles.news_text}>
              <span className={commonCommentStyles.news_creator}>{data.creator && data.creator.name}</span>
              <span>创建了一条</span>
              <span>{data.content && data.content.card_type && data.content.card_type == '0' ? currentNounPlanFilterName(TASKS) : '会议'}</span>
              <span className={commonCommentStyles.news_card_name}>{(data.content && data.content.card && data.content.card.name) && data.content.card.name}</span>
            </span>
            <span>{newsDynamicHandleTime(create_time)} {timestampToHM(create_time)}</span>
          </div>
        )
        break
      case 'board.card.delete':// 删除卡片
        messageContainer = (
          <div className={commonCommentStyles.news_item}>
            <span className={commonCommentStyles.news_text}>
              <span className={commonCommentStyles.news_creator}>{data.creator && data.creator.name}</span>
              <span>删除了一条</span>
              <span>{data.content && data.content.card_type && data.content.card_type == '0' ? currentNounPlanFilterName(TASKS) : '会议'}</span>
              <span className={commonCommentStyles.news_card_name}>{(data.content && data.content.card && data.content.card.name) && data.content.card.name}</span>
            </span>
            <span>{newsDynamicHandleTime(create_time)} {timestampToHM(create_time)}</span>
          </div>
        )
        break
      case 'board.card.update.name':// 更新任务名
        messageContainer = (
          <div className={commonCommentStyles.news_item}>
            <span className={commonCommentStyles.news_text}>
              <span className={commonCommentStyles.news_creator}>{data.creator && data.creator.name}</span>
              <span>将</span>
              <span className={commonCommentStyles.news_card_name}>{(data.content && data.content.rela_data && data.content.rela_data.name) && data.content.rela_data.name}</span>
              <span>的{currentNounPlanFilterName(TASKS)}的名称修改为</span>
              <span className={commonCommentStyles.news_card_name}>{(data.content && data.content.card && data.content.card.name) && data.content.card.name}</span>
            </span>
            <span>{newsDynamicHandleTime(create_time)} {timestampToHM(create_time)}</span>
          </div>
        )
        break
      case 'board.card.update.executor.add':// 添加任务执行人
        messageContainer = (
          <div className={commonCommentStyles.news_item}>
            <span className={commonCommentStyles.news_text}>
              <span className={commonCommentStyles.news_creator}>{data.creator && data.creator.name}</span>
              <span>将</span>
              <span>{data.content && data.content.card_type && data.content.card_type == '0' ? currentNounPlanFilterName(TASKS) : '会议'}</span>
              <span className={commonCommentStyles.news_card_name}>{(data.content && data.content.card && data.content.card.name) && data.content.card.name}</span>
              <span>指派给</span>
              <span className={commonCommentStyles.news_creator}>{(data.content && data.content.rela_data && data.content.rela_data.name) && data.content.rela_data.name}</span>
            </span>
            <span>{newsDynamicHandleTime(create_time)} {timestampToHM(create_time)}</span>
          </div>
        )
        break
      case 'board.card.update.executor.remove':// 移除任务执行人
        messageContainer = (
          <div className={commonCommentStyles.news_item}>
            <span className={commonCommentStyles.news_text}>
              <span className={commonCommentStyles.news_creator}>{data.creator && data.creator.name}</span>
              <span>在</span>
              <span className={commonCommentStyles.news_card_name}>{(data.content && data.content.card && data.content.card.name) && data.content.card.name}</span>
              <span>{data.content && data.content.card_type && data.content.card_type == '0' ? currentNounPlanFilterName(TASKS) : '会议'}</span>
              <span>中移除了执行人</span>
              <span className={commonCommentStyles.news_creator}>{(data.content && data.content.rela_data && data.content.rela_data.name) && data.content.rela_data.name}</span>
            </span>
            <span>{newsDynamicHandleTime(create_time)} {timestampToHM(create_time)}</span>
          </div>
        )
        break
      case 'board.card.update.finish':// 完成任务
        messageContainer = (
          <div className={commonCommentStyles.news_item}>
            <span className={commonCommentStyles.news_text}>
              <span className={commonCommentStyles.news_creator}>{data.creator && data.creator.name}</span>
              <span>完成了</span>
              <span className={commonCommentStyles.news_card_name}>{(data.content && data.content.card && data.content.card.name) && data.content.card.name}</span>
              <span>{data.content && data.content.card_type && data.content.card_type == '0' ? currentNounPlanFilterName(TASKS) : '会议'}</span>
            </span>
            <span>{newsDynamicHandleTime(create_time)} {timestampToHM(create_time)}</span>
          </div>
        )
        break
      case 'board.card.update.cancel.finish':// 取消完成任务
        messageContainer = (
          <div className={commonCommentStyles.news_item}>
            <span className={commonCommentStyles.news_text}>
              <span className={commonCommentStyles.news_creator}>{data.creator && data.creator.name}</span>
              <span>重做了</span>
              <span className={commonCommentStyles.news_card_name}>{(data.content && data.content.card && data.content.card.name) && data.content.card.name}</span>
              <span>{data.content && data.content.card_type && data.content.card_type == '0' ? currentNounPlanFilterName(TASKS) : '会议'}</span>
            </span>
            <span>{newsDynamicHandleTime(create_time)} {timestampToHM(create_time)}</span>
          </div>
        )
        break
      case 'board.card.update.description':// 更新任务描述
        messageContainer = (
          <div className={commonCommentStyles.news_item}>
            <span className={commonCommentStyles.news_text}>
              <span className={commonCommentStyles.news_creator}>{data.creator && data.creator.name}</span>
              <span>修改了</span>
              <span className={commonCommentStyles.news_card_name}>{(data.content && data.content.card && data.content.card.name) && data.content.card.name}</span>
              <span>的{data.content && data.content.card_type && data.content.card_type == '0' ? currentNounPlanFilterName(TASKS) : '会议'}描述</span>
            </span>
            <span>{newsDynamicHandleTime(create_time)} {timestampToHM(create_time)}</span>
          </div>
        )
      break
      case 'board.card.update.startTime':// 修改开始时间
        messageContainer = (
          <div className={commonCommentStyles.news_item}>
            <span className={commonCommentStyles.news_text}>
              <span className={commonCommentStyles.news_creator}>{data.creator && data.creator.name}</span>
              <span>修改了</span>
              <span className={commonCommentStyles.news_card_name}>{(data.content && data.content.card && data.content.card.name) && data.content.card.name}</span>
              <span>的{data.content && data.content.card_type && data.content.card_type == '0' ? currentNounPlanFilterName(TASKS) : '会议'}开始时间</span>
            </span>
            <span>{newsDynamicHandleTime(create_time)} {timestampToHM(create_time)}</span>
          </div>
        )
        break
      case 'board.card.update.dutTime':// 修改开始时间
        messageContainer = (
          <div className={commonCommentStyles.news_item}>
            <span className={commonCommentStyles.news_text}>
              <span className={commonCommentStyles.news_creator}>{data.creator && data.creator.name}</span>
              <span>修改了{data.content && data.content.card_type && data.content.card_type == '0' ? currentNounPlanFilterName(TASKS) : '会议'}</span>
              <span className={commonCommentStyles.news_card_name}>{(data.content && data.content.card && data.content.card.name) && data.content.card.name}</span>
              <span>的截止时间</span>
            </span>
            <span>{newsDynamicHandleTime(create_time)} {timestampToHM(create_time)}</span>
          </div>
        )
        break
      case 'board.card.update.label.add':// 添加标签
        messageContainer = (
          <div className={commonCommentStyles.news_item}>
            <span className={commonCommentStyles.news_text}>
              <span className={commonCommentStyles.news_creator}>{data.creator && data.creator.name}</span>
              <span>在{data.content && data.content.card_type && data.content.card_type == '0' ? currentNounPlanFilterName(TASKS) : '会议'}:</span>
              <span className={commonCommentStyles.news_card_name}>{(data.content && data.content.card && data.content.card.name) && data.content.card.name}</span>
              <span>中添加了标签:</span>
              <span className={commonCommentStyles.news_card_name}>{(data.content && data.content.rela_data && data.content.rela_data.name) && data.content.rela_data.name}</span>
            </span>
            <span>{newsDynamicHandleTime(create_time)} {timestampToHM(create_time)}</span>
          </div>
        )
        break
      case 'board.card.update.label.remove':// 移除标签
        messageContainer = (
          <div className={commonCommentStyles.news_item}>
            <span className={commonCommentStyles.news_text}>
              <span className={commonCommentStyles.news_creator}>{data.creator && data.creator.name}</span>
              <span>在{data.content && data.content.card_type && data.content.card_type == '0' ? currentNounPlanFilterName(TASKS) : '会议'}:</span>
              <span className={commonCommentStyles.news_card_name}>{(data.content && data.content.card && data.content.card.name) && data.content.card.name}</span>
              <span>中移除了标签:</span>
              <span className={commonCommentStyles.news_card_name}>{(data.content && data.content.rela_data && data.content.rela_data.name) && data.content.rela_data.name}</span>
            </span>
            <span>{newsDynamicHandleTime(create_time)} {timestampToHM(create_time)}</span>
          </div>
        )
        break
      case 'board.card.create.child': // 创建子任务
        messageContainer = (
          <div className={commonCommentStyles.news_item}>
            <span className={commonCommentStyles.news_text}>
              <span className={commonCommentStyles.news_creator}>{data.creator && data.creator.name}</span>
              <span>在</span>
              <span className={commonCommentStyles.news_card_name}>{(data.content && data.content.rela_card && data.content.rela_card.name) && data.content.rela_card.name}</span>
              <span>中添加了一条</span>
              <span>子{currentNounPlanFilterName(TASKS)}:</span>
              <span className={commonCommentStyles.news_card_name}>{(data.content && data.content.card && data.content.card.name) && data.content.card.name}</span>
            </span>
            <span>{newsDynamicHandleTime(create_time)} {timestampToHM(create_time)}</span>
          </div>
        )
        break
      case 'board.card.delete.child': // 删除子任务
        messageContainer = (
          <div className={commonCommentStyles.news_item}>
            <span className={commonCommentStyles.news_text}>
              <span className={commonCommentStyles.news_creator}>{data.creator && data.creator.name}</span>
              <span>删除了</span>
              <span className={commonCommentStyles.news_card_name}>{(data.content && data.content.rela_card && data.content.rela_card.name) && data.content.rela_card.name}</span>
              <span>中的一条</span>
              <span>子{currentNounPlanFilterName(TASKS)}:</span>
              <span className={commonCommentStyles.news_card_name}>{(data.content && data.content.card && data.content.card.name) && data.content.card.name}</span>
            </span>
            <span>{newsDynamicHandleTime(create_time)} {timestampToHM(create_time)}</span>
          </div>
        )
        break
      case 'board.card.update.finish.child': // 完成子任务
        messageContainer = (
          <div className={commonCommentStyles.news_item}>
            <span className={commonCommentStyles.news_text}>
              <span className={commonCommentStyles.news_creator}>{data.creator && data.creator.name}</span>
              <span>完成了</span>
              <span className={commonCommentStyles.news_card_name}>{(data.content && data.content.rela_card && data.content.rela_card.name) && data.content.rela_card.name}</span>
              <span>的子{currentNounPlanFilterName(TASKS)}:</span>
              <span className={commonCommentStyles.news_card_name}>{(data.content && data.content.card && data.content.card.name) && data.content.card.name}</span>
            </span>
            <span>{newsDynamicHandleTime(create_time)} {timestampToHM(create_time)}</span>
          </div>
        )
        break
      case 'board.card.update.cancel.finish.child': // 取消完成子任务
        messageContainer = (
          <div className={commonCommentStyles.news_item}>
            <span className={commonCommentStyles.news_text}>
              <span className={commonCommentStyles.news_creator}>{data.creator && data.creator.name}</span>
              <span>重做了</span>
              <span className={commonCommentStyles.news_card_name}>{(data.content && data.content.rela_card && data.content.rela_card.name) && data.content.rela_card.name}</span>
              <span>的子{currentNounPlanFilterName(TASKS)}:</span>
              <span className={commonCommentStyles.news_card_name}>{(data.content && data.content.card && data.content.card.name) && data.content.card.name}</span>
            </span>
            <span>{newsDynamicHandleTime(create_time)} {timestampToHM(create_time)}</span>
          </div>
        )
        break
      case 'board.card.update.name.child': // 更新子任务名称
        messageContainer = (
          <div className={commonCommentStyles.news_item}>
            <span className={commonCommentStyles.news_text}>
              <span className={commonCommentStyles.news_creator}>{data.creator && data.creator.name}</span>
              <span>将</span>
              <span className={commonCommentStyles.news_card_name}>{(data.content && data.content.rela_card && data.content.rela_card.name) && data.content.rela_card.name}</span>
              <span>的子{currentNounPlanFilterName(TASKS)}:</span>
              <span className={commonCommentStyles.news_card_name}>{(data.content && data.content.rela_data && data.content.rela_data.name) && data.content.rela_data.name}</span>
              <span>的名称修改为</span>
              <span className={commonCommentStyles.news_card_name}>{(data.content && data.content.card && data.content.card.name) && data.content.card.name}</span>
            </span>
            <span>{newsDynamicHandleTime(create_time)} {timestampToHM(create_time)}</span>
          </div>
        )
        break
      case 'board.card.update.file.add': // 添加附件
        messageContainer = (
          <div className={commonCommentStyles.news_item}>
            <span className={commonCommentStyles.news_text}>
              <span className={commonCommentStyles.news_creator}>{data.creator && data.creator.name}</span>
              <span>在</span>
              <span className={commonCommentStyles.news_card_name}>{(data.content && data.content.card && data.content.card.name) && data.content.card.name}</span>
              <span>中上传了附件:</span>
              <span className={commonCommentStyles.news_card_name}>{(data.content && data.content.rela_data && data.content.rela_data.name) && data.content.rela_data.name}</span>
            </span>
            <span>{newsDynamicHandleTime(create_time)} {timestampToHM(create_time)}</span>
          </div>
        )
        break
      case 'board.card.update.file.remove': // 移除附件
        messageContainer = (
          <div className={commonCommentStyles.news_item}>
            <span className={commonCommentStyles.news_text}>
              <span className={commonCommentStyles.news_creator}>{data.creator && data.creator.name}</span>
              <span>移除了</span>
              <span className={commonCommentStyles.news_card_name}>{(data.content && data.content.card && data.content.card.name) && data.content.card.name}</span>
              <span>的附件:</span>
              <span className={commonCommentStyles.news_card_name}>{(data.content && data.content.rela_data && data.content.rela_data.name) && data.content.rela_data.name}</span>
            </span>
            <span>{newsDynamicHandleTime(create_time)} {timestampToHM(create_time)}</span>
          </div>
        )
      break
      default:
        break
    }
    return { contain, messageContainer }
  }

  // 评论动态
  commentNews = (data) => {
    const { id: local_user_id } = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : {};
    const { action, create_time, text, id } = data
    let container = ''
    let messageContainer = (<div></div>)
    switch (action) {
      case 'board.card.update.comment.add': // 任务添加评论
        messageContainer = (
          <div className={commonCommentStyles.common_item}>
            {/* 头像 */}
            <div className={commonCommentStyles.common_left}>
              <Avatar src={(data.creator && data.creator.avatar) && data.creator.avatar} icon="user" style={{ color: '#8c8c8c' }}></Avatar>
            </div>
            {/* 右边内容 */}
            <div className={commonCommentStyles.common_right}>
              <div className={commonCommentStyles.common_top}>
                <div className={commonCommentStyles.common_name}>
                  {data.creator && data.creator.name}
                </div>
                {
                  judgeTimeDiffer_ten(create_time) || (local_user_id != (data.creator && data.creator.id) && data.creator.id) ? (
                    <div className={commonCommentStyles.common_create_time}>
                      {newsDynamicHandleTime(create_time)} {timestampToHM(create_time)}
                    </div>
                  ) : (
                      <div className={commonCommentStyles.common_delete} onClick={this.deleteComment.bind(this, id)}>
                        撤回
                    </div>
                    )
                }
              </div>
              <div className={commonCommentStyles.common_bott} >
                <span className={commonCommentStyles.common_text}>{text}</span>
              </div>
            </div>
          </div>
        )
        break;
      case 'board.common.comment.add':// 里程碑评论
        messageContainer = (
          <div className={commonCommentStyles.common_item}>
            {/* 头像 */}
            <div className={commonCommentStyles.common_left}>
              <Avatar src={(data.creator && data.creator.avatar) && data.creator.avatar} icon="user" style={{ color: '#8c8c8c' }}></Avatar>
            </div>
            {/* 右边内容 */}
            <div className={commonCommentStyles.common_right}>
              <div className={commonCommentStyles.common_top}>
                <div className={commonCommentStyles.common_name}>
                  {data.creator && data.creator.name}
                </div>
                {
                  judgeTimeDiffer_ten(create_time) ? (
                    <div className={commonCommentStyles.common_create_time}>
                      {newsDynamicHandleTime(create_time)} {timestampToHM(create_time)}
                    </div>
                  ) : (
                      <div className={commonCommentStyles.common_delete} onClick={this.deleteComment.bind(this, id)}>
                        撤回
                    </div>
                    )
                }
              </div>
              <div className={commonCommentStyles.common_bott} >
                <span className={commonCommentStyles.common_text}>{text}</span>
              </div>
            </div>
          </div>
        )
        break
      default:
        break;
    }
    return messageContainer
  }

  // 获取动态列表
  filterNewsType = (type, value, parentKey) => {
    let containner = (<div></div>)
    const { action, message_type } = value
    //任务动态
    const taskNews = (value) => {
      return (
        <div className={commonCommentStyles.containr}>
          <div className={commonCommentStyles.news_1} key={parentKey}>
            {
              message_type == '2' ? (
                <>{this.filterTitleContain(action, value).messageContainer}</>
              ) : (
                <>{this.commentNews(value).messageContainer}</>
              )
            }
          </div>
        </div>
      )
    }
    switch (type) {
      case '11': // 任务动态
        containner = (taskNews(value))
        break
      case '14': // 卡片的评论动态
        containner = (this.commentNews(value))
        break
      case '16': // 任务评论 @ 通知
        // containner = (commentNews(value, parentKey, childrenKey))
        break
      case '20': // 创建会议
        // containner = (value.map((val, key) => (<div key={key}>{meetingNews(val)}</div>)))
        break
      case '18':
        containner = (this.commentNews(value))
        break
      default:
        break
    }
    return containner
  }

  render() {

    const { comment_list = [], isShowAllDynamic } = this.props
    const { closeNormal } = this.state
    // const listItem = (value) => {
    //   const { full_name, avatar, text, create_time, id, flag, type } = value
    //   return (
    //     <div className={CommentStyles.commentListItem}>
    //       <div className={CommentStyles.left}>
    //         <Avatar src={avatar} icon="user" style={{ color: '#8c8c8c' }}></Avatar>
    //       </div>
    //       <div className={CommentStyles.right}>
    //         <div>
    //           <div className={CommentStyles.full_name}>
    //             {full_name}
    //             {type == '1'?(
    //               <span style={{marginLeft: 6}}>评论了</span>
    //             ):('')}
    //             {type == '1'?(
    //               <span className={CommentStyles.full_name_quan} onClick={this.commitClicShowEdit.bind(this, value)}>圈点{flag}</span>
    //             ):('')}

    //             </div>
    //           <div className={CommentStyles.text}>{text}</div>
    //         </div>
    //         <div className={CommentStyles.bott} >
    //           <div className={CommentStyles.create_time}>
    //             {timestampToTimeNormal(create_time, '', true)}
    //           </div>
    //           <div className={CommentStyles.delete} onClick={this.deleteComment.bind(this, id)}>
    //              删除
    //           </div>
    //         </div>
    //       </div>
    //     </div>
    //   )
    // }

    // const commentNews = (data) => {
    //   const { action, create_time, text, id } = data
    //   let container = ''
    //   let messageContainer = (<div></div>)
    //   switch (action) {
    //     case 'board.common.comment.add': // 添加评论
    //       messageContainer = (
    //         <div className={commonCommentStyles.common_item}>
    //           {/* 头像 */}
    //           <div className={commonCommentStyles.common_left}>
    //             <Avatar src={(data.creator && data.creator.avatar) && data.creator.avatar} icon="user" style={{ color: '#8c8c8c' }}></Avatar>
    //           </div>
    //           {/* 右边内容 */}
    //           <div className={commonCommentStyles.common_right}>
    //             <div className={commonCommentStyles.common_top}>
    //               <div className={commonCommentStyles.common_name}>
    //                 {data.creator && data.creator.name}
    //               </div>
    //               {/* <div className={commonCommentStyles.common_delete} onClick={this.deleteComment.bind(this,id)}>
    //                 撤回
    //               </div> */}
    //               {
    //                 judgeTimeDiffer_ten(create_time) ? (
    //                   <div className={commonCommentStyles.common_create_time}>
    //                     {newsDynamicHandleTime(create_time)} {timestampToHM(create_time)}
    //                   </div>
    //                 ) : (
    //                     <div className={commonCommentStyles.common_delete} onClick={this.deleteComment.bind(this, id)}>
    //                       撤回
    //                   </div>
    //                   )
    //               }
    //             </div>
    //             <div className={commonCommentStyles.common_bott} >
    //               <span className={commonCommentStyles.common_text}>{text}</span>
    //             </div>
    //           </div>
    //         </div>
    //       )
    //       break;
    //     default:
    //       break;
    //   }
    //   return messageContainer
    // }

    return (
      <div className={CommentStyles.commentListItemBox}>
        {/*{comment_list.length > 20 ?(*/}
        {/*<div className={CommentStyles.commentListItemControl}>*/}
        {/*{closeNormal?(*/}
        {/*<div>*/}
        {/*<Icon type="eye" />*/}
        {/*</div>*/}
        {/*):(*/}
        {/*<div>*/}
        {/*<Icon type="arrow-up" onClick={this.hideBeyond.bind(this)}/>*/}
        {/*</div>*/}
        {/*)}*/}
        {/*</div>*/}
        {/*) : ('')}*/}
        <div onMouseOver={this.boxOnMouseOver.bind(this)}>
          {comment_list.map((value, key) => {
            // if(isShowAllDynamic && key > 19) {
            //   return false
            // }
            const { rela_type } = value
            return (
              <div key={key}>
                {/* {listItem(value)} */}
                {/* {commentNews(value)} */}
                {this.filterNewsType(rela_type, value, key)}
              </div>
            )
          })}
        </div>
      </div>
    )
  }
}


//  建立一个从（外部的）state对象到（UI 组件的）props对象的映射关系
function mapStateToProps({ publicModalComment: { comment_list = [] } }) {
  return { comment_list }
}
