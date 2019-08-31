import React from 'react'
import indexStyles from './index.less'
import { Table, Button, Menu, Dropdown, Icon, Input, Drawer } from 'antd';
import FileDerailBreadCrumbFileNav from './FileDerailBreadCrumbFileNav'
import {stopPropagation} from "../../../../../../../utils/util";
import Comment from './Comment/Comment'
import Comment2 from './Comment/Comment2'
import CommentListItem2 from './Comment/CommentListItem2'
import {getRelations, JoinRelation} from "../../../../../../../services/technological/task";
import {isApiResponseOk} from "../../../../../../../utils/handleResponseData";
import ContentRaletion from '../../../../../../../components/ContentRaletion'
import { timestampToHM, judgeTimeDiffer, judgeTimeDiffer_ten } from '../../../../../../../utils/util'
import {checkIsHasPermissionInBoard, currentNounPlanFilterName} from '../../../../../../../utils/businessFunction'
import {FLOWS, PROJECT_FLOWS_FLOW_COMMENT} from '../../../../../../../globalset/js/constant'
import ProcessDetail from './proccessComps'

export default class FileDetailContent extends React.Component {
  state = {
    isShowAll: false, //是否查看全部
    commentList: []
  }

  versionItemClick({value, key}){
    const { file_resource_id, file_id } = value
    this.setState({
      imgLoaded: false
    })
    this.props.updateFileDatas({filePreviewCurrentVersionKey: key, filePreviewCurrentId: file_resource_id, filePreviewCurrentFileId: file_id})
    this.props.filePreview({id: file_resource_id, file_id})
    this.setState({
      imgLoaded: false,
      editMode: true,
      currentRect: { x: 0, y: 0, width: 0, height: 0 },
      isInAdding: false,
      isInEdditOperate: false,
      mentionFocus: false,
    })
  }

  state = {
    // rects: [{"x":288,"y":176,"width":59,"height":58,"isAready":false},{"x":556,"y":109,"width":48,"height":48,"isAready":false},{"x":477,"y":308,"width":118,"height":123,"isAready":false}],//[],
    rects: [],
    imgHeight: 0,
    imgWidth: 0, //获取到的图片宽高
    punctuateArea: 48, //点击圈点的
    maxImageWidth: 600, //设置imagload的最大值
    currentRect: { x: 0, y: 0, width: 0, height: 0 }, //当前操作的矩形属性
    isInAdding: false, //用来判断是否显示评论下拉
    isInEdditOperate: false, //用来判断不是点击存在的圈
    mentionFocus: false,
    imgLoaded: false,
    editMode: true,
  }
  constructor() {
    super();
    this.x1 = 0
    this.y1 = 0
    this.isDragging = false
    this.SelectedRect = {x: 0, y: 0 }
  }

  componentWillMount() {
    const { datas: { filePreviewCommitPoints=[]} }= this.props.model

    this.setState({
      rects: filePreviewCommitPoints
    })
  }

  componentDidMount() {

    // this.getRelations()
  }

  //获取关联内容
  async getRelations(data) {
    const { datas: { board_id, filePreviewCurrentFileId } }= this.props.model
    const res = await getRelations({
      board_id,
      link_id: filePreviewCurrentFileId,
      link_local: '4'
    })
    if(isApiResponseOk(res)) {
      this.setState({
        relations: res.data || []
      })
    }else{

    }
  }
  async addRelation(data) {
    const res = await JoinRelation(data)
    if(isApiResponseOk(res)) {
      this.getRelations()
    }else{

    }
  }

  componentWillReceiveProps(nextProps) {
    const rects = []
    const { datas: { filePreviewCommitPoints=[]} }= nextProps.model
    this.setState({
      rects: filePreviewCommitPoints
    })
    // if(this.state.commentList.length < nextProps.model.datas.workFlowComments)  {
    this.setState({
      commentList: nextProps.model.datas.workFlowComments
    })
    // }
  }
  //评图功能
  previewImgLoad(e) {
    const { maxImageWidth } = this.state
    this.setState({
      imgWidth: e.target.width >= maxImageWidth? maxImageWidth : e.target.width,
      imgHeight: e.target.height,
      imgLoaded: true
    })
  }
  commitReactArea(data, e) {
    e.stopPropagation()
    const { datas: { filePreviewCurrentFileId } } = this.props.model
    this.setState({
      ...data,
      isInEdditOperate: false,
      isInAdding: true
    }, () => {
      const { point_number } = data
      this.props.updateFileDatas({
        filePreviewCommitPointNumber: point_number
      })
      this.props.updateFileDatas({
        filePreviewPointNumCommits: []
      })
      this.props.getPreviewFileCommits({
        id: filePreviewCurrentFileId,
        type: 'point'
      })
    })

  }
  commitReactArea2(e) {
    e.stopPropagation()
  }
  commitClicShowEdit(data) {
    const { flag, coordinates, } = data
    const { datas: { filePreviewCurrentFileId } } = this.props.model
    this.setState({
      currentRect: JSON.parse(coordinates),
      isInAdding: true,
      isInEdditOperate: true
    })
    this.props.updateFileDatas({
      filePreviewCommitPointNumber: flag
    })
    this.props.getPreviewFileCommits({
      type: 'point',
      id: filePreviewCurrentFileId,
    })
  }
  isObj(obj) {
    if(!obj || typeof obj !=='object') {
      return false
    } else {
      return true
    }
  }
  operateAreaClick(e) {
    const target = this.refs.operateArea//event.target || event.srcElement;
    const { clientWidth, modalTop = 20 } = this.props
    const offsetDe = clientWidth * 0.1
    this.x1 = e.clientX - target.offsetLeft - offsetDe;
    this.y1 = e.clientY - target.offsetTop - modalTop;
    this.SelectedRect = {x: 0, y: 0 }
    if(!this.isDragging) {
      const { punctuateArea, imgHeight, imgWidth } = this.state

      let x = this.x1
      let y = this.y1

      if(imgWidth - x < punctuateArea/2) { //右边界
        x = imgWidth - punctuateArea
      } else if(x < punctuateArea/2) { //左边界
        x = 0
      } else {
        x = x - punctuateArea/2
      }
      if(imgHeight - y < punctuateArea/2) { //下边界
        y = imgHeight - punctuateArea
      } else if(y < punctuateArea/2) { //上边界
        y = 0
      } else {
        y = y - punctuateArea/2
      }
      const property = {
        x: x,
        y: y,
        width: punctuateArea,
        height: punctuateArea,
        isAready: false
      }
      this.props.updateFileDatas({
        filePreviewPointNumCommits: []
      })

      this.props.updateFileDatas({
        filePreviewCommitPointNumber: ''
      })
      this.setState({
        currentRect: property,
        isInEdditOperate: true,
      })
    }
  }
  operateAreaBlur(e) {
    const that = this
    setTimeout(function () {
      if(that.state.mentionFocus) {
        return false
      }
      that.setState({
        isInAdding: false,
        currentRect: { x: 0, y: 0, width: 0, height: 0 }
      })
      that.props.updateFileDatas({
        filePreviewPointNumCommits: []
      })
    }, 100)

  }

  //deleteCommitSet
  deleteCommitSet(e) {
    this.setState({
      isInAdding: false,
      currentRect: { x: 0, y: 0, width: 0, height: 0 }
    })
  }

  setMentionFocus(bool) {
    this.setState({
      mentionFocus: bool
    })
  }
  stopDragging() {
    this.right = false;
    const target = this.refs.operateArea
    target.onmousemove = null;
    target.onmuseup = null;
  }
  onmousedown(e) {
    this.setState({
      isInAdding: false
    })
    // 取得target上被单击的点
    const target = this.refs.operateArea//event.target || event.srcElement;
    const { clientWidth, modalTop = 20 } = this.props
    const offsetDe = clientWidth * 0.1
    this.x1 = e.clientX - target.offsetLeft - offsetDe;
    this.y1 = e.clientY - target.offsetTop - modalTop;
    this.SelectedRect = {x: 0, y: 0 }
    this.isDragging = false

    /*定义鼠标移动事件*/
    target.onmousemove = this.onmousemove.bind(this);
    /*定义鼠标抬起事件*/
    target.onmouseup = this.onmouseup.bind(this);
  }
  onmousemove(e) {
    //mousedown 后开始拖拽时添加
    if(!this.isDragging) {
      const property = {
        x: this.x1,
        y: this.y1,
        width: this.SelectedRect.x,
        height: this.SelectedRect.y,
        isAready: false
      }
      this.setState({
        currentRect: property,
        isInEdditOperate: true,
      })

      this.props.updateFileDatas({
        filePreviewPointNumCommits: [],
        filePreviewCommitPointNumber: ''
      })
    }

    // 判断矩形是否开始拖拽
    const target = this.refs.operateArea//event.target || event.srcElement;
    this.isDragging = true

    // 判断拖拽对象是否存在
    const { clientWidth, modalTop = 20 } = this.props
    const offsetDe = clientWidth * 0.1
    if (this.isObj(this.SelectedRect)) {
      // 取得鼠标位置
      const x = e.clientX - target.offsetLeft - offsetDe;
      const y = e.clientY - target.offsetTop - modalTop;
      //------------------------
      //设置高度
      this.SelectedRect.x= x-this.x1;
      this.SelectedRect.y= y-this.y1;

      const { imgWidth, imgHeight, punctuateArea } = this.state

      // 更新拖拽的最新矩形
      let px = x < this.x1 ? this.x1 - Math.abs(this.SelectedRect.x) : x - Math.abs(this.SelectedRect.x)
      let py = y < this.y1 ? this.y1 - Math.abs(this.SelectedRect.y) : y - Math.abs(this.SelectedRect.y)
      let width = Math.abs(this.SelectedRect.x)
      let height = Math.abs(this.SelectedRect.y)

      if(imgWidth - px - width< 0) { //右边界
        width = imgWidth - px
      } else if(x < punctuateArea/2) { //左边界
        width = 0
      } else {
        width = x - punctuateArea/2
      }
      if(imgHeight - py - height < 0) { //下边界
        height = imgHeight - py
      } else if(y < punctuateArea/2) { //上边界
        height = 0
      } else {
        height = y - punctuateArea/2
      }
      const property ={
        x: px,
        y: py,
        width: Math.abs(this.SelectedRect.x),
        height: Math.abs(this.SelectedRect.y),
        isAready: false
      }

      this.setState({
        currentRect: property
      })
    }
  }
  onmouseup() {
    this.setState({
      isInAdding: true
    })
    this.stopDragging()
  }

  setEditMode(){
    this.setState({
      editMode: !this.state.editMode
    })
  }

  setIsShowAll() {
    this.setState({
      isShowAll: !this.state.isShowAll
    })
  }
  deleteComment(data, e) {
    e.stopPropagation()
    if(window.location.hash.indexOf('projectDetail')!=-1) {
      this.props.dispatch({
        type: 'projectDetailProcess/deleteWorkFlowComment',
        payload: data
      })
    } else {
      this.props.dispatch({
        type: 'workbenchDetailProcess/deleteWorkFlowComment',
        payload: data
      })
    }
  }
  render() {
    const { rects, imgHeight = 0, imgWidth = 0, maxImageWidth, currentRect={}, isInAdding = false, isInEdditOperate = false, imgLoaded, editMode, relations } = this.state
    const { clientHeight, offsetTopDeviation } =this.props

    const fileDetailContentOutHeight = clientHeight - 60 - offsetTopDeviation
    const { datas: { board_id, currentProcessInstanceId, seeFileInput, filePreviewCommitPoints, filePreviewCommits, 
      filePreviewPointNumCommits, isExpandFrame = false, filePreviewUrl, filePreviewIsUsable, filePreviewCurrentId, 
      filePreviewCurrentVersionList=[], filePreviewCurrentVersionKey=0, filePreviewIsRealImage=false } }= this.props.model
    const getIframe = (src) => {
      const iframe = '<iframe style="height: 100%;width: 100%;border:0px;" class="multi-download"  src="'+src+'"></iframe>'
      return iframe
    }

    const getVersionItem = (value, key ) => {
      const { file_name, creator, update_time, file_size } = value
      return (
        <div className={indexStyles.versionInfoListItem} onClick={this.versionItemClick.bind(this, {value, key})}>
          <div className={filePreviewCurrentVersionKey === key ?indexStyles.point : indexStyles.point2}></div>
          <div className={indexStyles.name}>{creator}</div>
          <div className={indexStyles.info}>上传于{update_time}</div>
          <div className={indexStyles.size}>{file_size}</div>
        </div>
      )
    }
    //最新动态
    const filterTitleContain = (messageValue) => {
      const { action } = messageValue
      let contain = ''
      let messageContain = (<div></div>)
      let pin = action.split('.')
      let nodeName = `${pin[1]}_${pin[2]}`
      const { id } = localStorage.getItem('userInfo')?JSON.parse(localStorage.getItem('userInfo')): ''
      switch (action) {
        case 'board.flow.tpl.add.or.delete':
          contain = `创建${currentNounPlanFilterName(FLOWS)}模板`
          break
        case 'board.flow.comment.add':
          let juge = judgeTimeDiffer_ten(messageValue.create_time)
          messageContain = (
            <div>
              <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '20px'}}>
                <div>
                  <img style={{width: '30px', height: '30px', borderRadius: '15px', margin: '0 12px 0 12px', float: 'left'}} src={messageValue.creator.avatar}></img>
                  <div style={{
                    height: '30px',
                    fontSize: '12px',

                    fontFamily: 'PingFangSC-Regular',
                    fontWeight: 400,
                    color: 'rgba(140,140,140,1)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginLeft: '12px',
                    lineHeight: '17px', }}>{messageValue.creator.name}</div>
                </div>
                <div style={{color: '#BFBFBF', fontSize: '12px', marginRight: '12px'}}>{judgeTimeDiffer(messageValue.create_time)}</div>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', margin: '15px 0 15px 55px', color: '#595959', fontSize: '14px', fontFamily: 'PingFangSC-Regular'}}>
                <div>{messageValue.text}</div>
                {id === messageValue.creator.id && !juge?<div onClick={this.deleteComment.bind(this, {id: messageValue.id, flow_instance_id: currentProcessInstanceId})} style={{color: 'red', cursor: 'pointer'}}>删除</div>:''}
              </div>
            </div>
          )
          break
        case 'board.flow.instance.initiate':
          messageContain=(
            <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '12px'}}>
              <div>
                <div></div>
                <div style={{marginLeft: '10px'}}>「{messageValue.creator.name}」 启动{currentNounPlanFilterName(FLOWS)}「{messageValue.content[nodeName].name}」。</div>
              </div>
              <div style={{color: '#BFBFBF', fontSize: '12px', marginRight: '12px'}}>{judgeTimeDiffer(messageValue.create_time)}</div>
            </div>
          )
          break
        case 'board.flow.task.reject':
          contain = `拒绝${currentNounPlanFilterName(FLOWS)}任务`
          messageContain=(
            <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '12px'}}>
              <div >
                <div ></div>
                <div style={{marginLeft: '10px'}}>「{messageValue.creator.name}」 拒绝{currentNounPlanFilterName(FLOWS)}「{messageValue.content.board.name}」节点「{messageValue.content.flow_node_instance.name}」。</div>
              </div>
              <div style={{color: '#BFBFBF', fontSize: '12px', marginRight: '12px'}}>{judgeTimeDiffer(messageValue.create_time)}</div>
            </div>
          )
          break
        case 'board.flow.task.recall':
          contain = `撤回${currentNounPlanFilterName(FLOWS)}任务`
          messageContain=(
            <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '12px'}}>
              <div >
                <div ></div>
                <div style={{marginLeft: '10px'}}>「{messageValue.creator.name}」 撤回{currentNounPlanFilterName(FLOWS)}「{messageValue.content.board.name}」节点「{messageValue.content.flow_node_instance.name}」。</div>
              </div>
              <div style={{color: '#BFBFBF', fontSize: '12px', marginRight: '12px'}}>{judgeTimeDiffer(messageValue.create_time)}</div>
            </div>
          )
          break
        case 'board.flow.task.reassign':
          contain = '重新指派审批人'
          messageContain=(
            <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '12px'}}>
              <div >
                <div ></div>
                <div style={{marginLeft: '10px'}}>「{messageValue.creator.name}」 在{currentNounPlanFilterName(FLOWS)}「{messageValue.content.board.name}」节点「{messageValue.content.flow_node_instance.name}」中重新指定审批人 {messageValue.assignee}。</div>
              </div>
              <div style={{color: '#BFBFBF', fontSize: '12px', marginRight: '12px'}}>{judgeTimeDiffer(messageValue.create_time)}</div>
            </div>
          )
          break
        case 'board.flow.instance.discontinue':
          contain = `${currentNounPlanFilterName(FLOWS)}文件上传`
          messageContain=(
            <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '12px'}}>
              <div >
                <div ></div>
                <div style={{marginLeft: '10px'}}>「{messageValue.creator.name}」 在{currentNounPlanFilterName(FLOWS)}「{messageValue.flow_instance_name}」 上传了文件「{messageValue.file_name}」。</div>
              </div>
              <div style={{color: '#BFBFBF', fontSize: '12px', marginRight: '12px'}}>{judgeTimeDiffer(messageValue.create_time)}</div>
            </div>
          )
          break
        case 'board.flow.task.pass':
          messageContain=(
            <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '12px'}}>
              <div >
                  <div ></div>
                  <div style={{marginLeft: '10px'}}>「{messageValue.creator.name}」 在{currentNounPlanFilterName(FLOWS)}「{messageValue.content.board.name}」 中完成了任务「{messageValue.content.flow_node_instance.name}」。</div>
                </div>
              <div style={{color: '#BFBFBF', fontSize: '12px', marginRight: '12px'}}>{judgeTimeDiffer(messageValue.create_time)}</div>
            </div>
          )
          contain = `完成${currentNounPlanFilterName(FLOWS)}任务`
          break
        default:
          break
      }
      return messageContain
    }
    const punctuateDom = (
      <div style={{height: '100%', width: '100%'}} className={`${indexStyles.fileDetailContentLeft} ${indexStyles.noselect}`} >
        <div style={{margin: '0 auto', marginTop: (fileDetailContentOutHeight - imgHeight) / 2, width: imgWidth, height: imgHeight, overflow: 'hide' }} ref={'operateArea'}>
          <img src={filePreviewUrl} onLoad={this.previewImgLoad.bind(this)} style={{ maxWidth: maxImageWidth}} />
          {imgLoaded && editMode? (
            <div tabIndex="0" hideFocus="true" id={'punctuateArea'} onClick={this.operateAreaClick.bind(this)} onBlur={this.operateAreaBlur.bind(this)} onMouseDown={this.onmousedown.bind(this)} style={{height: imgHeight, top: -imgHeight, left: 0, width: imgWidth, position: 'relative', zIndex: 3, outline: 0}}>
              {rects.map((value, key) => {
                const { flag, coordinates } = value
                const { x, y, width, height } = JSON.parse(coordinates)
                return (
                  <div onClick={this.commitReactArea.bind(this, {currentRect: JSON.parse(coordinates), point_number: flag})} onMouseDown={this.commitReactArea2.bind(this)} key={key} style={{position: 'absolute', left: x, top: y, width: width, height: height, border: '1px solid rgba(24,144,255,.5)', backgroundColor: 'rgba(24,144,255,.2)'}}>
                    <div className={indexStyles.flag}>
                      {flag}
                    </div>
                  </div>
                )
              })}
              {isInEdditOperate?(
                <div onClick={this.commitReactArea2.bind(this)} onMouseDown={this.commitReactArea2.bind(this)}
                     style={{position: 'absolute', left: currentRect.x, top: currentRect.y, width: currentRect.width, height: currentRect.height, border: '1px solid rgba(24,144,255,.5)', backgroundColor: 'rgba(24,144,255,.2)'}} />
              ):('')}

              {isInAdding? (
                <div style={{position: 'absolute', zIndex: 6, left: currentRect.x, top: currentRect.y+ currentRect.height + 10}}>
                  <Comment {...this.props} currentRect={currentRect} setMentionFocus={this.setMentionFocus.bind(this)} ></Comment>
                </div>
              ) : ('')}

            </div>
          ) : ('')}

        </div>
        <div className={indexStyles.pictureEditState} style={{left: (this.props.clientWidth - (isExpandFrame? 0:420)) / 2 }} onClick={this.setEditMode.bind(this)}>
          {!editMode?('添加圈点评论'):('退出圈点模式')}
        </div>
      </div>
    )
    const iframeDom = (
      <div className={indexStyles.fileDetailContentLeft}
      dangerouslySetInnerHTML={{__html: getIframe(filePreviewUrl)}}></div>
    )

    return (
      <div className={indexStyles.fileDetailContentOut} ref={'fileDetailContentOut'} style={{height: clientHeight- offsetTopDeviation - 60}}>
        <div className={indexStyles.fileDetailContentLeft} style={{overflowY: 'scroll'}}>
            <ProcessDetail {...this.props} />
            {/* <h1> hello world </h1> */}
        </div>

        <div className={indexStyles.fileDetailContentRight} style={{width: isExpandFrame?0:420}}>

          {/*width: isExpandFrame?0:420*/}
          {/*从文件卡片查看的时候才有*/}
            <div className={indexStyles.fileDetailContentRight_top} ref={'versionInfoArea'}>
              <ContentRaletion
                {...this.props}
                board_id ={board_id}
                isShowAll = {this.state.isShowAll}
                link_id={currentProcessInstanceId}
                link_local={'2'}
              />
            </div>

          <div className={indexStyles.fileDetailContentRight_middle} style={{height: clientHeight - offsetTopDeviation - 60 - 70 - (this.refs.versionInfoArea?this.refs.versionInfoArea.clientHeight : 0)}}>
            <div style={{fontSize: '12px', color: '#595959'}}>
              <div>
                <div></div>
                {/* <div style={{display: 'flex', justifyContent: 'center',marginTop: '12px' ,fontSize: '14px', cursor: 'pointer', color: '#499BE6'}} onClick={this.setIsShowAll.bind(this)}>{!this.state.isShowAll? '查看全部': '收起部分'}</div> */}
                <div>
                  {
                    //processDynamics
                    this.props.model.datas.workFlowComments.map((item, i) => {
                      return (
                        <div key={i} value={item}>
                          {
                            filterTitleContain(item)
                          }
                        </div>
                      )
                    })
                  }
                </div>
              </div>
            </div>
            <CommentListItem2 {...this.props} commitClicShowEdit={this.commitClicShowEdit.bind(this)} deleteCommitSet={this.deleteCommitSet.bind(this)}/>
          </div>
          {checkIsHasPermissionInBoard(PROJECT_FLOWS_FLOW_COMMENT) && (
            <div className={indexStyles.fileDetailContentRight_bott}>
              <Comment2 {...this.props} ></Comment2>
            </div>
          )}


        </div>

      </div>
    )
  }
}
