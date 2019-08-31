import React from 'react'
import CreateTaskStyle from './CreateTask.less'
import TaskItem from './TaskItem'
import CreateItem from './CreateItem'
import DrawerContent from './DrawerContent'
import { Drawer } from 'antd'
import {stopPropagation} from "../../../../../utils/util";
import DrawContentModal from './components/DrawContentModal'
import QueryString from 'querystring'
import {checkIsHasPermissionInBoard} from "../../../../../utils/businessFunction";
import {PROJECT_TEAM_CARD_GROUP} from "../../../../../globalset/js/constant";

const documentWidth = document.querySelector('body').offsetWidth
let defaultScrollLeft = 0;
function changeClientHeight() {
  const clientHeight = document.documentElement.clientHeight;//获取页面可见高度
  return clientHeight
}
export default class CreateTask extends React.Component {

  state = {
    drawerVisible: false,
    taskGroupListMouseOver: true,
    clientHeight: changeClientHeight(), //分组列表高度
    /*定义两个值用来存放当前元素的left和top值*/
    needX: 0,
    needY: 0,
    isScrolling: false, //是否正在滚动
  }
  constructor(){
    super();
    // this.state = {
    //   needX: 0,
    //   needY: 0
    // }
    /*定义两个值用来存放鼠标按下的地方距离元素上侧和左侧边界的值*/
    this.disX = 0;
    this.disY = 0;

    //横向滚动条位置
    let task_page_scrollLeft = localStorage.getItem('task_page_scrollLeft')
    this.scrollLeft = task_page_scrollLeft || 0
    this.resizeTTY.bind(this)
  }


  componentDidMount() {
    const target = this.refs.outerMost
    // target.scrollTo(this.scrollLeft, 0)
    if(target.scrollTo) {
      target.scrollTo(this.scrollLeft, 0)
    }else {
      target.scrollLeft = this.scrollLeft
    }

    //在本地监听一个scroll事件，缓存下来持久化，在model
    let latoutNode = document.getElementById("taskAppOuterMost");
    if (latoutNode) {
      latoutNode.addEventListener("scroll", e => {
           //判断是否在滚动
           if(this.timer) {
            clearTimeout(this.timer)
          }
          this.setState({
            isScrolling: true
          })
          this.timer = setTimeout(() => {
            this.setState({
              isScrolling: false
            })
          }, 500)
        localStorage.setItem('task_page_scrollLeft', e.target.scrollLeft);
      });
    }
    // window.addEventListener('resize', this.resizeTTY.bind(this, 'ing'))
  }
  componentWillUnmount() {
    let latoutNode = document.getElementById("taskAppOuterMost");
    if (latoutNode) {

      //如果跳转到其他页面，则重置滚动条位置
      const urlArr = window.location.href.split('?') || []
      let param = {}
      let appsSelectKey = '3'
      if(urlArr[1]) {
        param = QueryString.parse(urlArr[1])
        appsSelectKey = param['appsSelectKey']
      }
      if(!appsSelectKey || appsSelectKey != '3') {
        localStorage.setItem('task_page_scrollLeft', 0);
        latoutNode.removeEventListener("scroll", e => {
          localStorage.setItem('task_page_scrollLeft', e.target.scrollLeft);
        });
      }
    }
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
    } else {
      target.scrollLeft = this.scrollLeft
    }
  }
  fnScroll(e) {
    this.scrollLeft = e.target.scrollLeft
  }
  // 右方抽屉弹窗---start
  setDrawerVisibleOpen(data) {
    const that = this
    const { drawContent: { card_id }, taskGroupListIndex_index, taskGroupListIndex } = data
    //不需要及时更新drawcontent
    this.props.updateDatasTask({taskGroupListIndex, taskGroupListIndex_index, drawerVisible: true})
    this.props.getCardCommentList(card_id)
    // this.props.getCardDetail({id: card_id})
    this.props.dispatch({
      type: 'projectDetailTask/getCardDetail',
      payload: {
        id: card_id
      }
    })
    this.props.dispatch({
      type: 'projectDetailTask/getCardCommentListAll',
      payload: {
        id: card_id
      }
    })
    this.props.dispatch({
      type: 'projectDetailTask/updateDatas',
      payload: {
        card_id
      }
    })
    //添加url
    //  this.props.updateDatasTask(data)
    // this.props.cardItemClickEffect(data)

  }

  setDrawerVisibleClose() {
    // this.setState({
    //   drawerVisible: false,
    // })
    this.props.updateDatasTask({
      drawerVisible: false,
    })
  }
  //右方抽屉弹窗---end
  render() {
    const { clientHeight=changeClientHeight(), isScrolling} = this.state
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
             id={'taskAppOuterMost'}
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
                    <TaskItem
                      isScrolling={isScrolling}
                      taskItemValue={value}
                      clientHeight={clientHeight}
                      itemKey={key}
                      taskGroupListIndex={key}
                      {...this.props}
                      setDrawerVisibleOpen={this.setDrawerVisibleOpen.bind(this)}
                    ></TaskItem>
                  </div>
                )
              })}
            {getTaskGroupListArrangeType==='1' && checkIsHasPermissionInBoard(PROJECT_TEAM_CARD_GROUP)?(
              <CreateItem {...this.props} ></CreateItem>
            ):('')}
          </div>
        </div>

        {/*任务详细弹窗*/}
        <DrawContentModal
          {...this.props}
          visible={drawerVisible}
          setDrawerVisibleClose={this.setDrawerVisibleClose.bind(this)} />
      </div>
    )
  }
}
