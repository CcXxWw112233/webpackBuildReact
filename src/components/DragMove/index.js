import React from 'react';

export default class Drag extends React.Component{
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
    // console.log(e)
    /*事件兼容*/
    let event = e || window.event;
    /*事件源对象兼容*/
    let target = event.target || event.srcElement;
    /*获取鼠标按下的地方距离元素左侧和上侧的距离*/
    this.disX = event.clientX - target.offsetLeft;
    this.disY = event.clientY - target.offsetTop;
    /*定义鼠标移动事件*/
    document.onmousemove = this.fnMove.bind(this);
    document.ontouchmove = this.fnMove.bind(this);
    /*定义鼠标抬起事件*/
    document.onmouseup = this.fnUp.bind(this);
    document.ontouchend = this.fnUp.bind(this);

  }
  /*定义鼠标移动事件*/
  fnMove(e){
    /*事件兼容*/
    let event = e|| window.event ;
    /*事件源对象兼容*/
    let target = event.target || event.srcElement;
    this.setState({
      needX: event.clientX - this.disX,
      needY: event.clientY - this.disY
    });
  }
  fnUp(){
    document.onmousemove = null;
    document.onmuseup = null;
    document.ontouchmove = null;
    document.ontouchend = null;
  }
  render(){
    /*返回元素*/
    return (
      <div style={{width: this.props.style.width,
        height: this.props.style.height,
        backgroundColor: this.props.style.backgroundColor,
        position: this.props.style.position,
        left: this.state.needX,
        top: this.state.needY}}
           onMouseDown={this.fnDown.bind(this)}
           onTouchStart={this.fnDown.bind(this)}
      ></div>
    )
  }
}

//使用方法
{/*<DragMove style={{width:'100px',height:'100px',backgroundColor:'green',position:'absolute'}}/>*/}
