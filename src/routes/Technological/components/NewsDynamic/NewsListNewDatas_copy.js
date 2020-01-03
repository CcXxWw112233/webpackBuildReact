import React from 'react';
import { Card, Icon, Input } from 'antd'
import NewsListStyle from './NewsList.less'
import QueueAnim from 'rc-queue-anim'
import {newsDynamicHandleTime, timestampToTime, timestampToHM} from '../../../../utils/util'
import Comment from './Comment'
import {ORGANIZATION, TASKS, FLOWS, DASHBOARD, PROJECTS, FILES, MEMBERS, CATCH_UP} from "../../../../globalset/js/constant";
import {currentNounPlanFilterName} from "../../../../utils/businessFunction";

export default class NewsListNewDatas extends React.Component {

  allSetReaded() { //全部标记为已读

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
  render() {
    const { datas: { newsDynamicList = [], next_id, isHasMore = true, isHasNewDynamic }} = this.props.model
    // const { date, dataList = []} = newsDynamicList
    //项目动态
    const news_1 = (
      <div className={NewsListStyle.news_1}>严世威 邀请你加入了「协作工作平台」项目。</div>
    )
    //项目动态编辑
    const news_2 = (
<div className={NewsListStyle.news_2}>
      欢迎使用ProductName，为了帮助你更好的上手使用好ProductName，我们为你提前预置了这个项目并放置一些帮助你理解每项功能特性的任务卡片。
      不会耽误你特别多时间，只需要抽空点开卡片并跟随里面的内容提示进行简单操作，即可上手使用。
      此处显示的文字为项目的介绍信息，旨在帮助参与项目的成员快速了解项目的基本概况，点击可编辑。
      如果使用中需要问题，可以随时联系我们进行交流或反馈：app.di-an.com
    </div>
)
    //时间动态动态
    const news_3 = (
      <div className={NewsListStyle.news_3}>
        <div className={NewsListStyle.news_3_text}>严世威 邀请你加入了「协作工作平台」项目。</div>
        <div className={NewsListStyle.news_3_time}>17:00</div>
      </div>
    )
    //评论动态
    const news_4 = (
      <div className={NewsListStyle.news_4}>
        <div className={NewsListStyle.news_4_top}>
          <div className={NewsListStyle.news_4_left}>
            <img src="" />
          </div>
          <div className={NewsListStyle.news_4_right}>
            <div className={NewsListStyle.r_t}>
              <div className={NewsListStyle.r_t_l}>明显</div>
              <div className={NewsListStyle.r_t_r}>20:11</div>
            </div>
            <div className={NewsListStyle.r_b}>
              我刚刚是从动态里点击进来的，动态接受非常及时。我来演示一下发布带图片的评论样式吧~
              我刚刚是从动态里点击进来的，动态接受非常及时。我来演示一下发布带图片的评论样式吧~
              我刚刚是从动态里点击进来的，动态接受非常及时。我来演示一下发布带图片的评论样式吧~
            </div>
          </div>
        </div>
        <div className={NewsListStyle.news_4_middle}>
          <img src="" />
          <img src="" />
        </div>
        <div className={NewsListStyle.news_4_bottom}>
          <Comment {...this.props} />
        </div>
      </div>
    )
    //编辑动态
    const news_5 = (
      <div className={NewsListStyle.news_5}>
        <div className={NewsListStyle.news_5_title}>
          <div className={NewsListStyle.news_5_text}>严世威 邀请你加入了「协作工作平台」项目。</div>
          <div className={NewsListStyle.news_5_time}>17:00</div>
        </div>
        <div className={NewsListStyle.news_5_desctiption}>
          欢迎使用ProductName，为了帮助你更好的上手使用好ProductName，我们为你提前预置了这个项目并放置一些帮助你理解每项功能特性的任务卡片。 不会耽误你特别多时间，只需要抽空点开卡片并跟随里面的内容提示进行简单操作，即可上手使用。 此处显示的文字为项目的介绍信息，旨在帮助参与项目的成员快速了解项目的基本概况，点击可编辑。 如果使用中需要问题，可以随时联系我们进行交流或反馈：app.di-an.com
        </div>
      </div>
    )
    //过滤消息内容
    const filterTitleContain = (activity_type, messageValue) => {
      let contain = ''
      let messageContain = (<div></div>)
      switch (activity_type) {
        //项目
        case 'createBoard':
          contain = `创建${currentNounPlanFilterName(PROJECTS)}`
          messageContain = (<div>{messageValue.user_name} 创建{currentNounPlanFilterName(PROJECTS)}「<span style={{color: '#1890FF', cursor: 'pointer'}}>{messageValue.board_name}</span>」{currentNounPlanFilterName(PROJECTS)}。</div>)
          break
        case 'updBoard':
          contain = `更新${currentNounPlanFilterName(PROJECTS)}信息`
          messageContain = (<div>{messageValue.user_name} 更新了「<span style={{color: '#1890FF', cursor: 'pointer'}}>{messageValue.board_name}</span>」{currentNounPlanFilterName(PROJECTS)}信息。</div>)
          break
        case 'archivedBoard':
          contain = `${currentNounPlanFilterName(PROJECTS)}归档`
          messageContain = (<div>{messageValue.user_name} 归档了「<span style={{color: '#1890FF', cursor: 'pointer'}}>{messageValue.board_name}</span>」{currentNounPlanFilterName(PROJECTS)}。</div>)
          break
        case 'quitBoard':
          contain = `退出${currentNounPlanFilterName(PROJECTS)}`
          messageContain = (<div>{messageValue.user_name} 退出了「<span style={{color: '#1890FF', cursor: 'pointer'}}>{messageValue.board_name}</span>」{currentNounPlanFilterName(PROJECTS)}。</div>)
          break
        case 'delBoard':
          contain = `删除${currentNounPlanFilterName(PROJECTS)}`
          messageContain = (<div>{messageValue.user_name} 删除了「<span style={{color: '#1890FF', cursor: 'pointer'}}>{messageValue.board_name}</span>」{currentNounPlanFilterName(PROJECTS)}。</div>)
          break
        case 'addBoardUser':
          contain = `添加${currentNounPlanFilterName(PROJECTS)}成员`
          messageContain = (<div>{messageValue.user_name} 邀请{messageValue.member}加入了「<span style={{color: '#1890FF', cursor: 'pointer'}}>{messageValue.board_name}</span>」{currentNounPlanFilterName(PROJECTS)}。</div>)
          break
        case 'removeBoardUser':
          contain = `移除${currentNounPlanFilterName(PROJECTS)}成员`
          messageContain = (<div>{messageValue.user_name} 将{messageValue.removed_user_name}移出了「<span style={{color: '#1890FF', cursor: 'pointer'}}>{messageValue.board_name}</span>」{currentNounPlanFilterName(PROJECTS)}。</div>)
          break
        //任务
        case 'createCard':
          messageContain = (
           <div className={NewsListStyle.news_3}>
            <div className={NewsListStyle.news_3_text}>{messageValue.user_name} 创建了{currentNounPlanFilterName(TASKS)}「{messageValue.card_name}」。</div>
            <div className={NewsListStyle.news_3_time}>{timestampToHM(messageValue.map.create_time)}</div>
          </div>
          )
          contain = `创建${currentNounPlanFilterName(TASKS)}`
          break
        case 'createChildCard':
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>{messageValue.user_name} 创建了子{currentNounPlanFilterName(TASKS)}「{messageValue.card_name}」。</div>
              <div className={NewsListStyle.news_3_time}>{timestampToHM(messageValue.map.create_time)}</div>
            </div>
          )
          contain = `创建子${currentNounPlanFilterName(TASKS)}`
          break
        case 'updCard':
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>{messageValue.user_name} 更新了{currentNounPlanFilterName(TASKS)}信息「{messageValue.card_name}」。</div>
              <div className={NewsListStyle.news_3_time}>{timestampToHM(messageValue.map.create_time)}</div>
            </div>
          )
          contain = `更新${currentNounPlanFilterName(TASKS)}信息`
          break
        case 'archivedCard':
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>{messageValue.user_name} 归档了{currentNounPlanFilterName(TASKS)}「{messageValue.card_name}」。</div>
              <div className={NewsListStyle.news_3_time}>{timestampToHM(messageValue.map.create_time)}</div>
            </div>
          )
          contain = `${currentNounPlanFilterName(TASKS)}归档`
          break
        case 'realizeCard':
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>{messageValue.user_name} 完成了{currentNounPlanFilterName(TASKS)}「{messageValue.card_name}」。</div>
              <div className={NewsListStyle.news_3_time}>{timestampToHM(messageValue.map.create_time)}</div>
            </div>
          )
          contain = `完成${currentNounPlanFilterName(TASKS)}`
          break
        case 'cancelRealizeCard':
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>{messageValue.user_name} 取消完成{currentNounPlanFilterName(TASKS)}「{messageValue.card_name}」。</div>
              <div className={NewsListStyle.news_3_time}>{timestampToHM(messageValue.map.create_time)}</div>
            </div>
          )
          contain = `取消完成${currentNounPlanFilterName(TASKS)}`
          break
        case 'delCard':
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>{messageValue.user_name} 删除了{currentNounPlanFilterName(TASKS)}「{messageValue.card_name}」。</div>
              <div className={NewsListStyle.news_3_time}>{timestampToHM(messageValue.map.create_time)}</div>
            </div>
          )
          contain = `删除${currentNounPlanFilterName(TASKS)}`
          break
        case 'addCardUser':
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>{messageValue.user_name} 把{currentNounPlanFilterName(TASKS)}「{messageValue.card_name}」执行人指派给 {messageValue.map.full_name}。</div>
              <div className={NewsListStyle.news_3_time}>{timestampToHM(messageValue.map.create_time)}</div>
            </div>
          )
          contain = `添加任${currentNounPlanFilterName(TASKS)}执行人`
          break
        case 'addCardLabel':
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>{messageValue.user_name} 添加了标签「{messageValue.label_name}」。</div>
              <div className={NewsListStyle.news_3_time}>{timestampToHM(messageValue.map.create_time)}</div>
            </div>
          )
          contain = `添加${currentNounPlanFilterName(TASKS)}标签`
          break
        case 'removeCardLabel':
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>{messageValue.user_name} 删除了标签「{messageValue.label_name}」。</div>
              <div className={NewsListStyle.news_3_time}>{timestampToHM(messageValue.map.create_time)}</div>
            </div>
          )
          contain = `移除${currentNounPlanFilterName(TASKS)}标签`
          break
        case 'createLabel':
          contain = '添加标签'
          break
        case 'updLabel':
          contain = '更新标签信息'
          break
        //评论
        case 'addComment':
          contain = '新评论'
          break
        case 'deleteComment':
          contain = '删除评论'
          break
        //流程
        case 'createWrokflowTpl':
          contain = `创建${currentNounPlanFilterName(FLOWS)}模板`
          break
        case 'startWorkflow':
          contain = `启动${currentNounPlanFilterName(FLOWS)}`
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>{messageValue.user_name} 启动{currentNounPlanFilterName(FLOWS)}「{messageValue.flow_instance_name}」。</div>
              <div className={NewsListStyle.news_3_time}>{timestampToHM(messageValue.map.create_time)}</div>
            </div>
          )
          break
        case 'recallWorkflowTask':
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>{messageValue.user_name} 撤回{currentNounPlanFilterName(FLOWS)}「{messageValue.flow_instance_name}」节点「{messageValue.flow_node_name}」。</div>
              <div className={NewsListStyle.news_3_time}>{timestampToHM(messageValue.map.create_time)}</div>
            </div>
          )
          contain = `撤回${currentNounPlanFilterName(FLOWS)}任务`
          break
        case 'reassignAssignee':
          contain = '重新指派审批人'
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>{messageValue.user_name} 在{currentNounPlanFilterName(FLOWS)}「{messageValue.flow_instance_name}」节点「{messageValue.flow_node_name}」中重新指定审批人 {messageValue.assignee}。</div>
              <div className={NewsListStyle.news_3_time}>{timestampToHM(messageValue.map.create_time)}</div>
            </div>
          )
          break
        case 'uploadWorkflowFile':
          contain = `${currentNounPlanFilterName(FLOWS)}文件上传`
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>{messageValue.user_name} 在{currentNounPlanFilterName(FLOWS)}「{messageValue.flow_instance_name}」 上传了文件「{messageValue.file_name}」。</div>
              <div className={NewsListStyle.news_3_time}>{timestampToHM(messageValue.map.create_time)}</div>
            </div>
          )
          break
        case 'completeWorkflowTask':
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>{messageValue.user_name} 在{currentNounPlanFilterName(FLOWS)}「{messageValue.flow_instance_name}」 中完成了任务「{messageValue.flow_node_name}」。</div>
              <div className={NewsListStyle.news_3_time}>{timestampToHM(messageValue.map.create_time)}</div>
            </div>
          )
          contain = `完成${currentNounPlanFilterName(FLOWS)}任务`
          break
        case 'waitingWorkflowTaskNotice':
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>您有一个{currentNounPlanFilterName(FLOWS)}任务待处理。</div>
              <div className={NewsListStyle.news_3_time}>{timestampToHM(messageValue.map.create_time)}</div>
            </div>
          )
          contain = `${currentNounPlanFilterName(FLOWS)}待处理任务通知`
          break
        //文档
        case 'createFolder':
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>{messageValue.user_name} 创建了文件夹「{messageValue.folder_name}」。</div>
              <div className={NewsListStyle.news_3_time}>{timestampToHM(messageValue.map.create_time)}</div>
            </div>
          )
          contain = `创建文件夹`
          break
        case 'updFolder':
          contain = `更新文件夹`
          break
        case 'uploadFile':
          contain = `上传${currentNounPlanFilterName(FILES)}`
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>{messageValue.user_name} 上传了{currentNounPlanFilterName(FILES)}「{messageValue.file_name}」。</div>
              <div className={NewsListStyle.news_3_time}>{timestampToHM(messageValue.map.create_time)}</div>
            </div>
          )
          break
        case 'updVersionFile':
          contain = `${currentNounPlanFilterName(FILES)}版本更新`
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>{messageValue.user_name} 更新了{currentNounPlanFilterName(FILES)}「{messageValue.file_name}」。</div>
              <div className={NewsListStyle.news_3_time}>{timestampToHM(messageValue.map.create_time)}</div>
            </div>
          )
          break
        case 'removeFolder':
          contain = '移除文件夹到回收站'
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>{messageValue.user_name} 移动文件夹「{messageValue.folder_name}」到回收站。</div>
              <div className={NewsListStyle.news_3_time}>{timestampToHM(messageValue.map.create_time)}</div>
            </div>
          )
          break
        case 'removeFile':
          contain = `移除${currentNounPlanFilterName(FILES)}到回收站`
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>{messageValue.user_name} 移动{currentNounPlanFilterName(FILES)}「{messageValue.file_name}」到回收站。</div>
              <div className={NewsListStyle.news_3_time}>{timestampToHM(messageValue.map.create_time)}</div>
            </div>
          )
          break
        case 'removeFileToOtherFolder':
          contain = `移动${currentNounPlanFilterName(FILES)}到某个文件夹中`
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>{messageValue.user_name} 移动{currentNounPlanFilterName(FILES)}「{messageValue.file_name}」到文件夹「{messageValue.folder_name}」。</div>
              <div className={NewsListStyle.news_3_time}>{timestampToHM(messageValue.map.create_time)}</div>
            </div>
          )
          break
        case 'copyFileToOtherFolder':
          messageContain = (
            <div className={NewsListStyle.news_3}>
              <div className={NewsListStyle.news_3_text}>{messageValue.user_name} 复制{currentNounPlanFilterName(FILES)}「{messageValue.file_name}」到文件夹「{messageValue.folder_name}」。</div>
              <div className={NewsListStyle.news_3_time}>{timestampToHM(messageValue.map.create_time)}</div>
            </div>
          )
          contain = `复制${currentNounPlanFilterName(FILES)}到某个文件夹中`
          break
        case 'restoreFile':
          contain = `还原${currentNounPlanFilterName(FILES)}`
          break
        case 'restoreFolder':
          contain = '还原文件夹'
          break
        default:
          break
      }
      return { contain, messageContain }
    }
    //项目动态
    const projectNews = (value, key) => {
      const { map: { activity_type, full_name, create_time }} = value
      return (
        <div className={NewsListStyle.containr} key={key}>
          <div className={NewsListStyle.top}>
            <div className={NewsListStyle.left}>
              <div className={NewsListStyle.l_l}>
                <div style={{background: '#E6F7FF', width: 40, height: 40, borderRadius: 40}}></div>
                {/*<img src="" />*/}
              </div>
              <div className={NewsListStyle.l_r}>
                <div>{filterTitleContain(activity_type, value).contain}</div>
                <div>{timestampToTime(create_time)}</div>
              </div>
            </div>
            <div className={NewsListStyle.right}>
              <Icon type="pushpin-o" className={NewsListStyle.timer}/><Icon type="check" className={NewsListStyle.check} />
            </div>
          </div>
          <div className={NewsListStyle.bott}>
            <div className={NewsListStyle.news_1}>{filterTitleContain(activity_type, value).messageContain}</div>
          </div>
        </div>
      )
    }
    //任务动态
    const taskNews = (value) =>{
      const { board_name, card_name, list_name} = value[0]
      return (
        <div className={NewsListStyle.containr}>
          <div className={NewsListStyle.top}>
            <div className={NewsListStyle.left}>
              <div className={NewsListStyle.l_l}>
                <div style={{background: '#E6F7FF', width: 40, height: 40, borderRadius: 40}}></div>
                {/*<img src="" />*/}
              </div>
              <div className={NewsListStyle.l_r}>
                <div>{card_name}</div>
                <div>{currentNounPlanFilterName(PROJECTS)}：{board_name}<Icon type="caret-right" style={{fontSize: 8}}/> 分组 {list_name}</div>
              </div>
            </div>
            <div className={NewsListStyle.right}>
              <Icon type="pushpin-o" className={NewsListStyle.timer}/><Icon type="check" className={NewsListStyle.check} />
            </div>
          </div>
          <div className={NewsListStyle.bott}>
            {value.map((val, key) => {
              const { map: { activity_type }} = val
              return(
                <div className={NewsListStyle.news_1} key={key}>{filterTitleContain(activity_type, val).messageContain}</div>
              )
            })}
          </div>
        </div>
      )
    }
    //评论动态
    const commentNews = (value, parentKey, childrenKey) => {
      const { list_name, board_name, card_name='任务', cardComment} = value[0]
      if(!cardComment) {
        return false
      }
      const { card_id } = cardComment
      return (
        <div className={NewsListStyle.containr}>
          <div className={NewsListStyle.top}>
            <div className={NewsListStyle.left}>
              <div className={NewsListStyle.l_l}>
                <div style={{background: '#E6F7FF', width: 40, height: 40, borderRadius: 40}}></div>
                {/*<img src="" />*/}
              </div>
              <div className={NewsListStyle.l_r}>
                <div>{card_name}</div>
                <div>{currentNounPlanFilterName(PROJECTS)}：{board_name} <Icon type="caret-right" style={{fontSize: 8}}/> 分组 {list_name}</div>
              </div>
            </div>
            <div className={NewsListStyle.right}>
              <Icon type="pushpin-o" className={NewsListStyle.timer}/><Icon type="check" className={NewsListStyle.check} />
            </div>
          </div>
          <div className={NewsListStyle.bott}>
            {/*{news_4}*/}
            <div className={NewsListStyle.news_4}>
              {value.map((val, key) => {
                const { cardComment } = val
                if(!cardComment) {
                  return false
                }
                const { cardComment: { text, create_time }, user_name, avatar } = val
                return (
                  <div className={NewsListStyle.news_4_top} key={key}>
                    <div className={NewsListStyle.news_4_left}>
                      {/*<img src="" />*/}
                      {avatar?(
                        <img src={avatar} />
                      ): (
                        <div style={{width: 40, height: 40, borderRadius: 40, backgroundColor: '#f5f5f5', textAlign: 'center'}}>
                          <Icon type={'user'} style={{fontSize: 18, marginTop: 12, color: '#8c8c8c'}}/>
                        </div>
                      )}
                    </div>
                    <div className={NewsListStyle.news_4_right}>
                      <div className={NewsListStyle.r_t}>
                        <div className={NewsListStyle.r_t_l}>{user_name}</div>
                        <div className={NewsListStyle.r_t_r}>{timestampToHM(create_time)}</div>
                      </div>
                      <div className={NewsListStyle.r_b}>
                        {text}
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
                <Comment {...this.props} parentKey={parentKey} childrenKey={childrenKey} card_id={card_id} />
              </div>
            </div>
          </div>
        </div>
      )
    }
    //流程动态
    const processNews = (value) => {
      const { map: { activity_type, full_name, create_time}, flow_instance_name, board_name} = value
      return (
        <div className={NewsListStyle.containr}>
          <div className={NewsListStyle.top}>
            <div className={NewsListStyle.left}>
              <div className={NewsListStyle.l_l}>
                <div style={{background: '#E6F7FF', width: 40, height: 40, borderRadius: 40}}></div>
                {/*<img src="" />*/}
              </div>
              <div className={NewsListStyle.l_r}>
                <div>{flow_instance_name}</div>
                <div>{currentNounPlanFilterName(PROJECTS)}： {board_name}</div>
              </div>
            </div>
            <div className={NewsListStyle.right}>
              <Icon type="pushpin-o" className={NewsListStyle.timer}/><Icon type="check" className={NewsListStyle.check} />
            </div>
          </div>
          <div className={NewsListStyle.bott}>
            <div className={NewsListStyle.news_1}>{filterTitleContain(activity_type, value).messageContain}</div>
          </div>
        </div>
      )
    }
    //文档动态
    const fileNews = (value, key) => {
      const { map: { activity_type, full_name, create_time }, board_name} = value
      return (
        <div className={NewsListStyle.containr}>
          <div className={NewsListStyle.top}>
            <div className={NewsListStyle.left}>
              <div className={NewsListStyle.l_l}>
                <div style={{background: '#E6F7FF', width: 40, height: 40, borderRadius: 40}}></div>
                {/*<img src="" />*/}
              </div>
              <div className={NewsListStyle.l_r}>
                <div>{filterTitleContain(activity_type, value).contain}</div>
                <div>{currentNounPlanFilterName(PROJECTS)}： {board_name}</div>
              </div>
            </div>
            <div className={NewsListStyle.right}>
              <Icon type="pushpin-o" className={NewsListStyle.timer}/><Icon type="check" className={NewsListStyle.check} />
            </div>
          </div>
          <div className={NewsListStyle.bott}>
            <div className={NewsListStyle.news_1}>{filterTitleContain(activity_type, value).messageContain}</div>
          </div>
        </div>
      )
    }

    //具体详细信息
    const filterNewsType = (type, value, parentKey, childrenKey) => {
      let containner = (<div></div>)
      switch (type) {
        case '1':
          containner = ( value.map((val, key) => (<div key={key}>{projectNews(val)}</div>)) )
          break
        case '2':
          containner = ( taskNews(value) )
          break
        case '3':
          containner = ( commentNews(value, parentKey, childrenKey))
          break
        case '4':
          containner = ( value.map((val, key) => (<div key={key}>{processNews(val)}</div>)) )
          break
        case '5':
          containner = ( value.map((val, key) => (<div key={key}>{fileNews(val)}</div>)) )
          break
        case '6':
          containner = ( value.map((val, key) => (<div key={key}>{processNews(val)}</div>)) )
          break
        default:
          break
      }
      return containner
    }

    return (
      <div style={{paddingBottom: 100, transform: 'none', display: 'inline'}} >
        {/*{isHasNewDynamic?(*/}
          {/*<div className={NewsListStyle.newsConfirm} onClick={this.updateNewsDynamic.bind(this)}>您有新消息，点击更新查看</div>*/}
        {/*): ('')}*/}
        {newsDynamicList.map((value, parentkey)=> {
          const { date, dataList = [], newDataList = []} = value
          return (
            <div className={NewsListStyle.itemOut} key={parentkey}>
              <div className={NewsListStyle.head}>
                <div>{date}</div>
                {/*全部标为已读*/}
                {/*<div onClick={this.allSetReaded.bind(this)}>全部标为已读</div>*/}
              </div>
              {newDataList.map((value, childrenKey) => {
                const { type, TypeArrayList = [] } = value
                return (
                  <div key={childrenKey}>{filterNewsType(type, TypeArrayList, parentkey, childrenKey)}</div>
                )
              })}
            </div>
          )
        })}
        <div style={{marginBottom: 20}}>
          {isHasMore?(
            <div onClick={this.getNewsDynamicListNext.bind(this, next_id)} style={{height: 30, maxWidth: 770, minWidth: 600, margin: '0 auto', lineHeight: '30px', textAlign: 'center', backgroundColor: '#e5e5e5', borderRadius: 4, marginTop: 20, cursor: 'pointer'}}>点击加载更多<Icon type="arrow-down" theme="outlined" /></div>
          ):(
            <div style={{height: 30, maxWidth: 770, minWidth: 600, margin: '0 auto', lineHeight: '30px', textAlign: 'center', marginTop: 20, color: '#8c8c8c'}}>没有更多了...</div>
          )}
        </div>
      </div>
    )
  }
}




