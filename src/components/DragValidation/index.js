import React from 'react'
import indexStyles from './index.less'
import { Icon } from 'antd'

export default class DragValidation extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      /*定义两个值用来存放当前元素的left和top值*/
      needX: 0,
      blockMaxLeft: 0,
      completeValidation: false //是否已经完成验证，初始默认未完成
    }
    /*定义两个值用来存放鼠标按下的地方距离元素上侧和左侧边界的值*/
    this.disX = 0
    this.disY = 0
  }
  componentDidMount() {
    const slideWidth = this.refs.dragOuter.offsetWidth //整个滑条的宽度
    const slideBlockWidth = this.refs.dragSlideBlock.offsetWidth //滑块的宽度
    const slideStripWidth = this.refs.dragSlideStrip.offsetWidth //绿色滑动条的宽度
    const blockMaxLeft = slideWidth - slideBlockWidth //滑块最多能滑动到距离左边的位置
    this.setState({
      blockMaxLeft,
      slideBlockWidth,
      slideStripWidth
    })
  }
  //定义鼠标下落事件
  mouseDown(e) {
    e.stopPropagation()
    if (this.state.completeValidation) {
      //如果验证完成了就没有以下操作了
      return false
    }
    /*事件兼容*/
    let event = e || window.event
    /*事件源对象兼容*/
    let target = event.target || event.srcElement
    /*获取鼠标按下的地方距离元素左侧和上侧的距离*/
    this.disX = event.clientX - target.offsetLeft
    this.disY = event.clientY - target.offsetTop
    /*定义鼠标移动事件*/
    document.onmousemove = this.mouseMove.bind(this)
    /*定义鼠标抬起事件*/
    document.onmouseup = this.mouseUp.bind(this)
  }
  //鼠标移动事件
  mouseMove(e) {
    e.stopPropagation()
    /*事件兼容*/
    let event = e || window.event
    /*事件源对象兼容*/
    let target = event.target || event.srcElement
    this.handleNeedX(event, 'move')
  }
  //鼠标放开
  mouseUp(e) {
    e.stopPropagation()
    document.onmousemove = null
    document.onmuseup = null
    this.handleNeedX('', 'up')
  }
  handleNeedX = (event, type) => {
    let needX
    if (type === 'move') {
      //滑动过程中
      const positionSubstract = event.clientX - this.disX //元素距离父元素坐边距离
      if (positionSubstract <= 0) {
        //点击拖动做位置边界判断
        needX = 0
      } else if (positionSubstract >= this.state.blockMaxLeft) {
        needX = this.state.blockMaxLeft
      } else {
        needX = event.clientX - this.disX
      }
    } else if (type === 'up') {
      //鼠标放开, 拉到固定的位置表示验证成功了
      needX =
        this.state.needX === this.state.blockMaxLeft
          ? this.state.blockMaxLeft
          : 0
      this.setState({
        completeValidation: !!(this.state.needX === this.state.blockMaxLeft)
      })
      this.props.listenCompleteValidation(this.state.completeValidation)
    } else {
    }
    this.setState({
      needX
    })
  }

  //手势按下
  touchDown(e) {
    if (this.state.completeValidation) {
      //如果验证完成了就没有以下操作了
      return false
    }
    /*事件兼容*/
    let event = e || window.event
    /*事件源对象兼容*/
    let target = event.target || event.srcElement
    /*获取鼠标按下的地方距离元素左侧和上侧的距离*/
    this.disX = event.touches[0].clientX - target.offsetLeft
    /*定义鼠标移动事件*/
    document.ontouchmove = this.touchMove.bind(this)
    /*定义鼠标抬起事件*/
    document.ontouchend = this.mouseUp.bind(this)
  }
  //鼠标移动事件
  touchMove(e) {
    /*事件兼容*/
    let event = e || window.event
    /*事件源对象兼容*/
    let target = event.target || event.srcElement
    this.handleNeedXTouch(event, 'move')
  }
  //鼠标放开
  ontouchend() {
    document.ontouchmove = null
    document.ontouchend = null
    this.handleNeedXTouch('', 'up')
  }
  handleNeedXTouch = (event, type) => {
    let needX = 0
    if (type === 'move') {
      //滑动过程中
      const positionSubstract = event.touches[0].clientX - this.disX //元素距离父元素坐边距离
      if (positionSubstract <= 0) {
        //点击拖动做位置边界判断
        needX = 0
      } else if (positionSubstract >= this.state.blockMaxLeft) {
        needX = this.state.blockMaxLeft
      } else {
        needX = event.touches[0].clientX - this.disX
      }
    } else if (type === 'up') {
      //鼠标放开, 拉到固定的位置表示验证成功了
      needX =
        this.state.needX === this.state.blockMaxLeft
          ? this.state.blockMaxLeft
          : 0
      this.setState({
        completeValidation: !!(this.state.needX === this.state.blockMaxLeft)
      })
      this.props.listenCompleteValidation(this.state.completeValidation)
    } else {
    }
    this.setState({
      needX
    })
  }

  render() {
    /*返回元素*/
    return (
      <div className={indexStyles.dragOuter} ref="dragOuter">
        <div className={indexStyles.dragBack}>请按住滑块，拖动到最右边</div>
        <div
          className={indexStyles.dragSlideBlock}
          style={{ left: this.state.needX, top: 0 }}
          onMouseDown={this.mouseDown.bind(this)}
          onTouchStart={this.touchDown.bind(this)}
          ref="dragSlideBlock"
        >
          {!this.state.completeValidation ? (
            <Icon
              type="double-right"
              style={{ fontSize: 16, color: '#8c8c8c', display: 'none' }}
            />
          ) : (
            <Icon
              type="check-circle"
              style={{ fontSize: 16, color: '#52C41B' }}
            />
          )}
        </div>
        <div
          className={indexStyles.dragSlideStrip}
          style={{
            top: 0,
            width: this.state.needX + this.state.slideBlockWidth || 0,
            background: '#52C41B'
          }}
          ref="dragSlideStrip"
        >
          {this.state.completeValidation ? '验证成功' : ''}
        </div>
      </div>
    )
  }
}

// left: (-this.state.slideStripWidth + this.state.slideBlockWidth+ this.state.needX) || 0,
