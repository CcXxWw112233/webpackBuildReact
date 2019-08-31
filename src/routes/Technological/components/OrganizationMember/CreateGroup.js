import React from 'react'
import CreateTaskStyle from './CreateTask.less'
import CreateGroupItem from './CreateGroupItem'
import CreateItem from './CreateItem'
import TreeGroupModal from './TreeGroupModal'
import {checkIsHasPermission} from "../../../../utils/businessFunction";
import {ORG_UPMS_ORGANIZATION_GROUP} from "../../../../globalset/js/constant";
const documentWidth = document.querySelector('body').offsetWidth

export default class CreateGroup extends React.Component {

  state = {
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
  }
  /*定义鼠标下落事件*/
  fnDown(e){
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

    //可以改变position位置的判断
    if(!this.props.model.datas.groupList) {
      return false
    }
    if(this.state.needX < 0 && (event.clientX - this.disX) < -(this.props.model.datas.groupList.length * 314)){
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

  render() {
    const { datas: { groupList = [] }} = this.props.model
    return (
      <div className={CreateTaskStyle.outerMost}
           style={{
             left: this.state.needX,
            }}
           onMouseDown={this.fnDown.bind(this)}
           ref={'outerMost'}
      >
        {groupList.map((value, key) => {
            return (
              <CreateGroupItem key={key} itemValue={value} itemKey={key}
                        {...this.props}></CreateGroupItem>
            )
          })}
        {checkIsHasPermission(ORG_UPMS_ORGANIZATION_GROUP) && (
          <CreateItem {...this.props} ></CreateItem>
        ) }

        <TreeGroupModal {...this.props}/>

      </div>
    )
  }
}
