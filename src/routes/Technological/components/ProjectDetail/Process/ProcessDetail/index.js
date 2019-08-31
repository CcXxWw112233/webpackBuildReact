import React from 'react'
import indexStyles from './index.less'
import { Icon } from 'antd'
import DetailConfirmInfoTwo from './DetailConfirmInfoTwo'
import DetailConfirmInfoOne from './DetailConfirmInfoOne'
import DetailConfirmInfoThree from './DetailConfirmInfoThree'
import DetailConfirmInfoFour from './DetailConfirmInfoFour'
import DetailConfirmInfoFive from './DetailConfirmInfoFive'

import sssimg from '../../../../../../assets/yay.jpg'
import {timestampToHM} from "../../../../../../utils/util";
import {currentNounPlanFilterName} from "../../../../../../utils/businessFunction";
import {FLOWS} from "../../../../../../globalset/js/constant";

const bodyHeight = document.querySelector('body').clientHeight
export default class ProcessDetail extends React.Component {
  state = {
     isShowAll: false, //是否查看全部
  }
  constructor(props) {
    super(props)
    this.initCanvas = this.initCanvas.bind(this)
  }
  componentDidMount() {
    this.initCanvas()
  }
  componentDidUpdate() {
    this.initCanvas()
  }

  setIsShowAll() {
    this.setState({
      isShowAll: !this.state.isShowAll
    })
  }

  initCanvas() {
    const { datas: { processInfo = {}, processEditDatas=[] }} = this.props.model
    const { curr_node_sort } = processInfo
    const defaultProps = {
      canvaswidth: 210, // 画布宽度
      canvasheight: 210, // 画布高度
      x0: 105,
      y0: 105,
      r: 96,
      lineWidth: 16,
      strokeStyle: '#ffffff',
      LinearGradientColor1: '#3EECED',
      LinearGradientColor2: '#499BE6'
    }
    const {
      x0, //原点坐标
      y0,
      r, // 半径
      lineWidth, // 画笔宽度
      strokeStyle, //画笔颜色
      LinearGradientColor1, //起始渐变颜色
      LinearGradientColor2, //结束渐变颜色
      Percentage, // 进度百分比
    } = defaultProps
    let ele = document.getElementById("time_graph_canvas")
    let circle = ele.getContext("2d");
    circle.clearRect(0, 0, 210, 210);//清空
    //创建多个圆弧
    const length = processEditDatas.length
    for (let i = 0; i < length; i++) {
      circle.beginPath();//开始一个新的路径
      circle.save()
      circle.lineWidth = lineWidth;
      let color = 'rgba(83,196,26,1)'
      if( Number(curr_node_sort) === Number(processEditDatas[i].sort)){
        color = 'rgba(24,144,255,1)'
      }else if(Number(processEditDatas[i].sort) < Number(curr_node_sort)){
        color = 'rgba(83,196,26,1)'
      }else if(Number(processEditDatas[i].sort) > Number(curr_node_sort)){
        color = '#f2f2f2'
      }
      circle.strokeStyle = color; //curr_node_sort
      circle.arc(x0, y0, r, 0.6* Math.PI + i*1.83/length* Math.PI, 0.6* Math.PI + i*1.83/length* Math.PI + 1.83/length* Math.PI - 0.03*Math.PI, false);///用于绘制圆弧context.arc(x坐标，y坐标，半径，起始角度，终止角度，顺时针/逆时针)
      circle.stroke();//对当前路径进行描边
      circle.restore()
      circle.closePath()
    }
  }

  render() {
    const { isShowAll } = this.state
    const { datas: { processInfo = {}, processEditDatas=[], processDynamics = [] }} = this.props.model
    const { name, description, status } = processInfo //status 1 正在进行 2,暂停 3完成
    // console.log('processDynamics', processDynamics)
    // const
    //过滤消息内容
    const filterTitleContain = (messageValue) => {
      const { action } = messageValue
      let contain = ''
      let messageContain = (<div></div>)
      let pin = action.split('.')
      let nodeName = `${pin[1]}_${pin[2]}`
      switch (action) {
        case 'board.flow.tpl.add.or.delete':
          contain = `创建${currentNounPlanFilterName(FLOWS)}模板`
          break
        case 'board.flow.instance.initiate':
          messageContain=(
            <div className={indexStyles.newsItem}>
              <div className={indexStyles.newsItem_left}>
                <div className={indexStyles.newsItem_left_l}></div>
                <div className={indexStyles.newsItem_left_r}>{messageValue.creator.name} 启动{currentNounPlanFilterName(FLOWS)}「{messageValue.content[nodeName].name}」。</div>
              </div>
              <div className={indexStyles.newsItem_right}>{timestampToHM(messageValue.created)}</div>
            </div>
          )
          break
        case 'board.flow.task.reject':
          contain = `拒绝${currentNounPlanFilterName(FLOWS)}任务`
          messageContain=(
            <div className={indexStyles.newsItem}>
              <div className={indexStyles.newsItem_left}>
                <div className={indexStyles.newsItem_left_l}></div>
                <div className={indexStyles.newsItem_left_r}>{messageValue.creator.name} 拒绝{currentNounPlanFilterName(FLOWS)}「{messageValue.content.board.name}」节点「{messageValue.content.flow_node_instance.name}」。</div>
              </div>
              <div className={indexStyles.newsItem_right}>{timestampToHM(messageValue.created)}</div>
            </div>
          )
          break
        case 'board.flow.task.recall':
          contain = `撤回${currentNounPlanFilterName(FLOWS)}任务`
          messageContain=(
            <div className={indexStyles.newsItem}>
              <div className={indexStyles.newsItem_left}>
                <div className={indexStyles.newsItem_left_l}></div>
                <div className={indexStyles.newsItem_left_r}>{messageValue.creator.name} 撤回{currentNounPlanFilterName(FLOWS)}「{messageValue.content.board.name}」节点「{messageValue.content.flow_node_instance.name}」。</div>
              </div>
              <div className={indexStyles.newsItem_right}>{timestampToHM(messageValue.created)}</div>
            </div>
          )
          break
        case 'board.flow.task.reassign':
          contain = '重新指派审批人'
          messageContain=(
            <div className={indexStyles.newsItem}>
              <div className={indexStyles.newsItem_left}>
                <div className={indexStyles.newsItem_left_l}></div>
                <div className={indexStyles.newsItem_left_r}>{messageValue.creator.name} 在{currentNounPlanFilterName(FLOWS)}「{messageValue.content.board.name}」节点「{messageValue.content.flow_node_instance.name}」中重新指定审批人 {messageValue.assignee}。</div>
              </div>
              <div className={indexStyles.newsItem_right}>{timestampToHM(messageValue.created)}</div>
            </div>
          )
          break
        case 'board.flow.instance.discontinue':
          contain = `${currentNounPlanFilterName(FLOWS)}文件上传`
          messageContain=(
            <div className={indexStyles.newsItem}>
              <div className={indexStyles.newsItem_left}>
                <div className={indexStyles.newsItem_left_l}></div>
                <div className={indexStyles.newsItem_left_r}>{messageValue.user_name} 在{currentNounPlanFilterName(FLOWS)}「{messageValue.flow_instance_name}」 上传了文件「{messageValue.file_name}」。</div>
              </div>
              <div className={indexStyles.newsItem_right}>{timestampToHM(messageValue.create_time)}</div>
            </div>
          )
          break
        case 'board.flow.task.pass':
          messageContain=(
            <div className={indexStyles.newsItem}>
              <div className={indexStyles.newsItem_left}>
                  <div className={indexStyles.newsItem_left_l}></div>
                  <div className={indexStyles.newsItem_left_r}>{messageValue.creator.name} 在{currentNounPlanFilterName(FLOWS)}「{messageValue.content.board.name}」 中完成了任务「{messageValue.content.flow_node_instance.name}」。</div>
                </div>
              <div className={indexStyles.newsItem_right}>{timestampToHM(messageValue.created)}</div>
            </div>
          )
          contain = `完成${currentNounPlanFilterName(FLOWS)}任务`
          break
        // case 'waitingWorkflowTaskNotice':
        //   messageContain=(
        //     <div className={indexStyles.newsItem}>
        //       <div className={indexStyles.newsItem_left}>
        //         <div className={indexStyles.newsItem_left_l}></div>
        //         <div className={indexStyles.newsItem_left_r}>您有一个流程任务待处理。</div>
        //       </div>
        //       <div className={indexStyles.newsItem_right}>{timestampToHM(messageValue.create_time)}</div>
        //     </div>
        //   )
        //   contain = '流程待处理任务通知'
        //   break
        default:
          break
      }
      return messageContain
    }

    const filterForm = (value, key) => {
      const { node_type } = value
      let container = (<div></div>)
      switch (node_type) {
        case '1':
          container = (<DetailConfirmInfoOne {...this.props} itemKey={key} itemValue={value} />)
          break;
        case '2':
          container = (<DetailConfirmInfoTwo {...this.props} itemKey={key} itemValue={value} />)
          break;
        case '3':
          container = (<DetailConfirmInfoThree {...this.props} itemKey={key} itemValue={value} />)
          break;
        case '4':
          container = (<DetailConfirmInfoFour {...this.props} itemKey={key} itemValue={value} />)
          break;
        case '5':
          container = (<DetailConfirmInfoFive {...this.props} itemKey={key} itemValue={value} />)
          break;
        default:
          container = (<div></div>)
          break
      }
      return container
    }

    return (
      <div className={indexStyles.processDetailOut_out} style={{minHeight: bodyHeight}}>
        <div className={indexStyles.processDetailOut}>
        <div className={indexStyles.topTitle}>
          <div className={indexStyles.topTitle_left}>
            <div></div>
            <div>{name}</div>
          </div>
        </div>
          {/*参与人*/}
          <div>
        </div>
          {/*描述*/}
        <div className={indexStyles.description} dangerouslySetInnerHTML = {{ __html: description }}></div>

        <div className={indexStyles.bottContainer}>
          <div className={indexStyles.bottContainer_left}>
            <div className={indexStyles.circle} style={{position: 'relative'}}>
              <div style={{ width: 210, height: 210}}>
                <canvas id="time_graph_canvas" width={210} height={210}></canvas>
              </div>
              <img id="node_img" src={sssimg} style={{position: 'absolute', width: 20, height: 20, bottom: 0, left: 95}}/>
            </div>
          </div>
          <div className={indexStyles.bottContainer_right} >
            <div className={indexStyles.news}>
              <div className={indexStyles.newsTitle}>最新动态</div>
              <div className={indexStyles.newsList} >
                {processDynamics.map((value, key) => {
                  return(
                    <div key={key} value={value}>
                      {filterTitleContain(value)}
                    </div>
                  )
                })}
                <div className={indexStyles.seeAllList}>
                  <div></div>
                  {/* <div onClick={this.setIsShowAll.bind(this)}>{!isShowAll? '查看全部': '收起部分'}</div> */}
                  <div></div>
                </div>
              </div>
            </div>
            <div className={indexStyles.processPoint}>
              <div className={indexStyles.processPointTitle}>
                 步骤详情
              </div>
              {processEditDatas.map((value, key) => {
                return (
                  <div className={indexStyles.processPointItem} key={key}>
                    {filterForm(value, key)}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

      </div>

      </div>
    )
  }
}
