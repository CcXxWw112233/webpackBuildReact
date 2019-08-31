import React from 'react'
import CreateTaskStyle from './CreateTask.less'
import TaskItem from './TaskItem'
import CreateItem from './CreateItem'
import DrawerContent from './DrawerContent'
import { Drawer } from 'antd'
import {stopPropagation} from "../../../../../utils/util";
import DrawContentModal from './components/DrawContentModal'

const documentWidth = document.querySelector('body').offsetWidth
function changeClientHeight() {
  const clientHeight = document.documentElement.clientHeight;//获取页面可见高度
  return clientHeight
}
export default class CreateTask extends React.Component {

  state = {
    // drawerVisible: false,
    taskGroupListMouseOver: true,
    clientHeight: changeClientHeight(), //分组列表高度

  }
  constructor(){
    super();
    this.state = {
      /*定义两个值用来存放当前元素的left和top值*/
      needX: 0,
      needY: 0
    }
    /*定义两个值用来存放鼠标按下的地方距离元素上侧和左侧边界的值*/
    this.disX = 0;
    this.disY = 0;

    //横向滚动条位置
    this.scrollLeft = 0
    this.resizeTTY.bind(this)
  }
  componentDidMount() {
    window.addEventListener('resize', this.resizeTTY.bind(this, 'ing'))
  }
  componentWillUnmount() {
    // window.removeEventListener('resize', this.resizeTTY.bind(this,'ed'))
  }
  resizeTTY(type) {
    const clientHeight = document.documentElement.clientHeight;//获取页面可见高度
    this.setState({
      clientHeight
    })
  }

  /*定义鼠标下落事件*/
  fnDown(e){
    stopPropagation(e)
    /*事件兼容*/
    let event = e || window.event;
    /*事件源对象兼容*/
    let target = this.refs.outerMost//event.target || event.srcElement;
    /*获取鼠标按下的地方距离元素左侧和上侧的距离*/
    this.disX = event.clientX - target.offsetLeft;
    this.disY = event.clientY - target.offsetTop;
    /*定义鼠标移动事件*/
    document.onmousemove = this.fnMove.bind(this);
    /*定义鼠标抬起事件*/
    document.onmouseup = this.fnUp.bind(this);
  }
  /*定义鼠标移动事件*/
  fnMove(e){
    /*事件兼容*/
    let event = e|| window.event ;
    /*事件源对象兼容*/
    let target = event.target || event.srcElement;

    //在查看任务时不可挪动
    const { datas: { drawerVisible } } = this.props.model
    if(drawerVisible) {
      return false
    }

    //可以改变position位置的判断
    if(!this.props.model.datas.taskGroupList) {
      return false
    }
    if(this.state.needX < 0 && (event.clientX - this.disX) < -(this.props.model.datas.taskGroupList.length * 314)){
       return false
    }
    if(this.state.needX > documentWidth / 2 && (event.clientX - this.disX) > documentWidth / 2){
      return false
    }
    this.setState({
      needX: event.clientX - this.disX,
      needY: event.clientY - this.disY
    });
  }
  fnUp(){
    document.onmousemove = null;
    document.onmuseup = null;
  }

  //鼠标滚轮
  fnWheel(e) {
    stopPropagation(e)
    /*事件兼容*/
    const event = e|| window.event ;
    /*事件源对象兼容*/
    const target = this.refs.outerMost
    const target_2 = this.refs.outerMostListContainer
    const step = 40
    const leftBoundray = target_2.clientWidth - target.clientWidth + 104
    if(target_2.clientWidth + 104 < target.clientWidth) {
      return false
    }
    // console.log(event.deltaY)
    if(event.deltaY < 0){
      //向上滚动鼠标滚轮，屏幕滚动条左移
      if( this.scrollLeft > 0) {
        if(this.scrollLeft > step) {
          this.scrollLeft -= step
        } else {
          this.scrollLeft = 0
        }
      } else {
        this.scrollLeft = 0
      }
    } else if(event.deltaY > 0){
      //向下滚动鼠标滚轮，屏幕滚动条右移
      //104为target的paddingLeft
      //滚动到最右边边界【判定
      if(leftBoundray > target.scrollLeft) {
        this.scrollLeft += step
      }else {
        this.scrollLeft = leftBoundray + step
      }
    } else {
      return false
    }
    if(target.scrollTo) {
      target.scrollTo(this.scrollLeft, 0)
    }
  }
  fnScroll(e) {
    this.scrollLeft = e.target.scrollLeft
  }
  // 右方抽屉弹窗---start
  setDrawerVisibleOpen(data) {
    // this.setState({
    //   drawerVisible: true,
    // })
    this.props.updateDatas({
      drawerVisible: true,
    })
    const { drawContent: { card_id }} = data
    this.props.getCardCommentList(card_id)
    
    this.props.updateDatas(data)
  }
  setDrawerVisibleClose() {
    // this.setState({
    //   drawerVisible: false,
    // })
    this.props.updateDatas({
      drawerVisible: false,
    })
  }
  //右方抽屉弹窗---end

  render() {
    const { clientHeight=changeClientHeight() } = this.state
    const { datas: { taskGroupList = [], drawerVisible = false, getTaskGroupListArrangeType='1' } } = this.props.model
    let corretDegree = 0 //  修正度，媒体查询变化两条header高度
    if(clientHeight < 900) {
      corretDegree = 44
    }
    return (
      <div>
        <div className={CreateTaskStyle.outerMost}
             // style={{left:this.state.needX,}}
             // onMouseDown={this.fnDown.bind(this)}
             onWheel={this.fnWheel.bind(this)}
             onScroll={this.fnScroll.bind(this)}
             style={{height: clientHeight - 172 + corretDegree}}
             ref={'outerMost'}
        >
          <div className={CreateTaskStyle.outerMostListContainer} ref={'outerMostListContainer'}>
            {taskGroupList.map((value, key) => {
                return (
                  <div style={{ width: 'auto', marginRight: 40}}
                    key={key}>
                    <TaskItem taskItemValue={value}
                              clientHeight={clientHeight}
                              itemKey={key}
                              taskGroupListIndex={key}
                              {...this.props}
                              setDrawerVisibleOpen={this.setDrawerVisibleOpen.bind(this)} ></TaskItem>
                  </div>
                )
              })}
            {getTaskGroupListArrangeType==='1'?(
              <CreateItem {...this.props} ></CreateItem>
            ):('')}
          </div>
        </div>
        {/*<Drawer*/}
          {/*placement="right"*/}
          {/*closable={false}*/}
          {/*onClose={this.setDrawerVisibleClose.bind(this)}*/}
          {/*visible={drawerVisible} //this.state.drawerVisible*/}
          {/*width={520}*/}
          {/*destroyOnClose*/}
          {/*zIndex={1}*/}
          {/*maskStyle={{top: clientHeight<900?48:64}}*/}
          {/*style={{marginTop: clientHeight<900?48:64,}}*/}
        {/*>*/}
          {/*<DrawerContent*/}
            {/*{...this.props}*/}
            {/*setDrawerVisibleClose={this.setDrawerVisibleClose.bind(this)}*/}
          {/*/>*/}
        {/*</Drawer>*/}
        {/*任务详细弹窗*/}
        <DrawContentModal
          {...this.props}
          visible={drawerVisible}
          setDrawerVisibleClose={this.setDrawerVisibleClose.bind(this)} />
      </div>
    )
  }
}
