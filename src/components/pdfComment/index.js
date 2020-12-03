import React, { Fragment, useState } from 'react'
import ReactDOM from 'react-dom'
import Cookies from 'js-cookie'
// import { connect } from 'dva';
import styles from './index.less'
import globalStyles from '@/globalset/css/globalClassName.less'
// import { HandleCanvas } from '../utils/test'
import { fabric } from 'fabric'
import {
  Input,
  Button,
  message,
  Slider,
  Popconfirm,
  Popover,
  Progress,
  notification,
  BackTop,
  Icon,
  Dropdown,
  Menu,
  Modal,
  Spin,
  Avatar
} from 'antd'
import ColorPicker from 'react-color'
import jsPDF from 'jspdf'
import Action from './action'
import { dateFormat } from '@/utils/util'
import ChooseColor from './component/colorChoose'
import { NoteIcon } from './component/noteIcon'
import axios from 'axios'
import { setRequestHeaderBaseInfo } from '../../utils/businessFunction'
import { REQUEST_DOMAIN_FILE } from '@/globalset/js/constant'
import DEvent from '../../utils/event'
import { ENV_ANDROID_APP } from '../../globalset/clientCustorm'
// import scr from './worker'
const DefineIcon = Icon.createFromIconfontCN({
  scriptUrl: '//at.alicdn.com/t/font_779568_41vfncsv7yu.js'
})
// 设定选中的样式
fabric.Object.prototype.transparentCorners = false
fabric.Object.prototype.cornerColor = 'blue'
fabric.Object.prototype.cornerStyle = 'circle'

export default class PdfComment extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      drawColor: '',
      pdfViews: [],
      isDoing: [],
      unDoing: [],
      isDraw: false, // 是否启动画笔
      activeObject: null, // 当前选中的元素
      activeElement: 1,
      allPdfElement: 1,
      loadendElement: 0,
      displayColorPicker: false,
      isHand: false,
      loadend: false,
      version_list: [],
      // 默认的样式
      drawStyles: {
        activeType: 'mouse',
        mouse: {
          color: '#86B3FF'
        },
        pen: {
          width: 4,
          color: '#FF4E3B',
          hexColor: '#FF4E3B',
          alpha: 1,
          maxSize: 28,
          minSize: 1
        },
        box: {
          width: 2,
          color: '#FF4E3B',
          hexColor: '#FF4E3B',
          alpha: 1,
          maxSize: 10,
          minSize: 1
        },
        ellipse: {
          width: 2,
          color: '#FF4E3B',
          hexColor: '#FF4E3B',
          alpha: 1,
          maxSize: 10,
          minSize: 1
        },
        arrow: {
          width: 2,
          color: '#FF4E3B',
          hexColor: '#FF4E3B',
          alpha: 1,
          maxSize: 10,
          minSize: 1
        },
        text: {
          size: 20,
          borderColor: '#0095ff',
          color: '#FF4E3B',
          hexColor: '#FF4E3B',
          alpha: 1,
          maxSize: 46,
          minSize: 1
        },
        select: {
          size: 20,
          color: '#000000',
          hexColor: '#000000',
          alpha: 1,
          width: 2,
          maxSize: 10,
          minSize: 1
        },
        note: {
          color: '#93D276'
        }
      },
      loadProcess: 0, // 加载进度
      versionMsg: {}, // 当前版本
      exportProcess: 0, //导出进度
      version_history: [], // 历史记录列表
      isHistoryIn: false, // 是否查看历史记录
      noteData: {
        color: '',
        description: '',
        left: 0,
        top: 0
      } // 便签数据
    }
    this.isBreak = false // 是否中断导出
    this.drawCanvas = [] // 保存所有的画板
    // this.defaultSetting = {
    //   color: "#ff0000", // 画笔颜色
    //   width: 8, // 画笔粗细
    // }
    this.W = '80%' // 视图大小
    this.isDoing = [] // 绘制的数据缓存
    this.unDoing = [] // 点击重绘的缓存
    this.drawType = null // 绘制的类型
    this.mouseEvent = {} // 初始位置
    this.mouseToEvent = {} // 移动位置
    this.moveCount = 1 // 绘制频率
    this.doDrawing = false // 绘制状态
    this.drawingObject = null // 当前正在绘制的元素
    this.saveObject = {}
    this.defaultElementId = '_pdf_canvas_'
    this.prevWeelY = 0
    this.drawTools = [
      { label: '鼠标', key: 'mouse', icon: 'icon-xuanze' },
      // { label: '移动', key: 'move', icon: 'icon-yidong' },
      { label: '画笔', key: 'pen', icon: 'icon-ziyouxian' },
      { label: '文字', key: 'text', icon: 'icon-wenben1' },
      { label: '矩形', key: 'box', icon: 'icon-juxing' },
      { label: '圆形', key: 'ellipse', icon: 'icon-yuanxing' },
      { label: '箭头', key: 'arrow', icon: 'icon-jiantou' },
      { label: '便签', key: 'note', icon: 'icon-bianqianzhi' }
      // {label: "json",key:"json", icon: "icon-JSON"}
    ]
    this.loadPDF = null
    this.timer = null
    this.noloadCanvas = []
    this.file_id = '' // 当前打开的文件id
    this.mounted = false // 是否退出了pdf圈评
    this.historyLast = null // 分页时，用到的最后一个数据
    this.loadTimer = null //滚动加载延时
    this.scrollTimer = null //触屏端加载延时
    this.historyContainerRef = React.createRef() // 滚动内容
    this.user = localStorage.getItem('userInfo')
      ? JSON.parse(localStorage.getItem('userInfo'))
      : {}
    this.errormsg = '加载失败，请重试'
    this.isChangeVersion = false
    this.blobUrls = []
    this.noteIconColor = null
    this.noteColors = [
      '#FFE566',
      '#FF9D48',
      '#C9DF56',
      '#F16C7F',
      '#93D276',
      '#67C6C0',
      '#BE88C7',
      '#6CD8FA',
      '#EA94BB',
      '#A6CCF5',
      '#7B92FF'
    ]
    this.editTimer = null
    this.allObjects = []
    this.pdf = null
  }
  async componentDidMount() {
    this.mounted = true
    let res = await Action.getVersion({ file_id: this.props.file_id })
    this.setState({
      versionMsg: res.data
    })
    // console.log(res.data, 'versionMsg')
    if (!this.mounted) return
    this.InitAllData(true)

    DEvent.on('pdfSave', () => {
      this.exportPdf('export')
    })

    DEvent.on('pdfSaveAs', () => {
      this.exportPdf('save')
    })
  }
  // 将hex颜色转成rgb
  hexToRgba(hex, opacity) {
    var RGBA =
      'rgba(' +
      parseInt('0x' + hex.slice(1, 3)) +
      ',' +
      parseInt('0x' + hex.slice(3, 5)) +
      ',' +
      parseInt('0x' + hex.slice(5, 7)) +
      ',' +
      opacity +
      ')'
    return {
      red: parseInt('0x' + hex.slice(1, 3)),
      green: parseInt('0x' + hex.slice(3, 5)),
      blue: parseInt('0x' + hex.slice(5, 7)),
      rgba: RGBA
    }
  }
  // 将rgb颜色转成hex
  colorRGB2Hex(color) {
    var rgb = color.split(',')
    var r = parseInt(rgb[0].split('(')[1])
    var g = parseInt(rgb[1])
    var b = parseInt(rgb[2].split(')')[0])

    var hex = '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
    return hex
  }
  // 构建版本数据加载
  InitAllData = isFirst => {
    this.mounted = false
    this.drawCanvas = []
    this.isDoing = [] // 绘制的数据缓存
    this.unDoing = [] // 点击重绘的缓存
    this.setState(
      {
        loadProcess: 0,
        pdfViews: [],
        noloadCanvas: [],
        isDoing: [],
        unDoing: [],
        isDraw: false,
        activeElement: 1,
        allPdfElement: 1,
        loadendElement: 1,
        loadend: false
      },
      () => {
        this.mounted = true
        if (this.props.fileType === 'img') {
          this.loadImgFile()
        } else this.loadFile()

        // console.log(this.props.fileType)
        // console.log(pdfjsLib, 'pdf')
        // 初始拖拽状态
        this.initDragEvent()
        window.removeEventListener('resize', this.setResize)
        window.addEventListener('resize', this.setResize)
        // document.removeEventListener('visibilitychange', this.documentChange)
        document.onvisibilitychange = this.documentChange
        // document.addEventListener('visibilitychange', this.documentChange)
      }
    )
  }

  documentChange = () => {
    if (!document.hidden) {
      // 如果页面切换了，则重新渲染
      this.loadIsDocumentHiddenIngCanvas()
    }
  }
  componentWillUnmount() {
    this.mounted = false
    window.removeEventListener('resize', this.setResize)
    document.onvisibilitychange = () => {}
    this.blobUrls.forEach(item => {
      window.URL.revokeObjectURL(item)
    })
    this.blobUrls = []
  }

  // 加载的进度
  loadFilesXHR = (url, callback) => {
    return new Promise(resolve => {
      let xhr = new XMLHttpRequest()
      xhr.open('GET', url, true)
      xhr.responseType = 'blob'
      xhr.addEventListener('progress', e => {
        // console.log(e)
        let process = 0
        if (e.lengthComputable) {
          process = Math.round(e.loaded / e.total)
        }
        callback && callback(process * 100)
      })
      xhr.send(null)
      xhr.onload = e => {
        // console.log(e)
        resolve(e.target)
      }
      xhr.onerror = () => {
        message.warn(this.errormsg)
      }
    })
  }

  // 加载图片数据
  loadImgFile = async () => {
    let url = this.props.url
    let response = await this.loadFilesXHR(
      url + '&_t' + new Date().getTime(),
      process => {
        this.setState({
          loadProcess: process
        })
      }
    )
    if (!this.mounted) return
    this.setState(
      {
        loadend: true,
        pdfViews: [this.defaultElementId + 1]
      },
      () => {
        // console.log()
        let blob = response.response
        let image = new Image()
        image.src = window.URL.createObjectURL(blob)
        this.blobUrls.push(image.src)
        image.crossOrigin = 'anonymous'
        image.onload = () => {
          this.loadImage(image)
          // window.URL.revokeObjectURL(image.src)
        }
      }
    )
  }
  // 窗口变化
  setResize = () => {
    clearTimeout(this.timer)
    this.timer = setTimeout(() => {
      this.resize()
    }, 500)
  }
  getOffsetTop(elm) {
    var mOffsetTop = elm.offsetTop
    var mOffsetParent = elm.offsetParent
    while (mOffsetParent) {
      mOffsetTop += mOffsetParent.offsetTop
      mOffsetParent = mOffsetParent.offsetParent
    }
    return mOffsetTop
  }
  // 检查目前显示的是哪一页
  viewScroll = e => {
    let children = e.target.querySelectorAll('.fabric_defualt_container')
    let scrollTop = e.target.scrollTop + window.innerHeight / 2
    // let step = this.prevWeelY - scrollTop;
    // this.prevWeelY = scrollTop;
    // step 小于0 是向下滚动  反之
    for (let i = 0; i < children.length; i++) {
      let item = children[i]
      let offsetTop = this.getOffsetTop(item)
      let offsetBottom = offsetTop + item.clientHeight
      if (scrollTop >= offsetTop && scrollTop <= offsetBottom) {
        this.setState({
          activeElement: i + 1
        })
        // console.log(item.firstElementChild.id, i + 1)
        break
      }
    }
  }
  createArray = num => {
    let arr = []
    for (let i = 0; i < num; i++) {
      arr.push(i)
    }
    return arr
  }

  setDrawType = type => {
    if (this.drawType !== type) {
      this.drawType = type
    }
    // 重复点击，不进行处理
    // if (type && this.drawType === type) return

    if (this.drawType) {
      // this.toogleHand(false)
    }
    this.setState({
      drawStyles: { ...this.state.drawStyles, activeType: this.drawType }
    })
    this.isActiveDraw()
  }

  // 绘制场景中，不允许有其他交互
  isActiveDraw = () => {
    // if(this.drawType){
    // console.log(this.drawType)
    ;(async () => {
      for (let i = 0; i < this.drawCanvas.length; i++) {
        await this.setAwaitTime(1)
        let item = this.drawCanvas[i]
        if (this.drawType) {
          item.skipTargetFind = true
          item.forEachObject(obj => {
            obj.set('selectable', false)
          })
          item.selectable = true
          item.discardActiveObject()
        } else {
          item.skipTargetFind = false
          item.forEachObject(obj => {
            obj.set('selectable', true)
          })
          item.selectable = false
        }
        item.requestRenderAll()
      }
    })()
    // }
  }

  createBox = () => {
    let style = this.state.drawStyles.box
    let rect = new fabric.Rect({
      top: this.mouseEvent.y,
      left: this.mouseEvent.x,
      width: 4,
      height: 4,
      stroke: style.color,
      strokeWidth: style.width,
      fill: 'rgba(255, 255, 255, 0)',
      opacity: style.alpha,
      drawType: 'box'
    })
    return rect
  }
  // 箭头
  createArrowPath = (start, move) => {
    var x1 = start.x,
      x2 = move.x,
      y1 = start.y,
      y2 = move.y
    var w = x2 - x1,
      h = y2 - y1,
      sh = Math.cos(Math.PI / 4) * 16
    var sin = h / Math.sqrt(Math.pow(w, 2) + Math.pow(h, 2))
    var cos = w / Math.sqrt(Math.pow(w, 2) + Math.pow(h, 2))
    var w1 = (16 * sin) / 4,
      h1 = (16 * cos) / 4,
      centerx = sh * cos,
      centery = sh * sin
    var path = ' M ' + x1 + ' ' + y1
    path += ' L ' + (x2 - centerx + w1) + ' ' + (y2 - centery - h1)
    path += ' L ' + (x2 - centerx + w1 * 2) + ' ' + (y2 - centery - h1 * 2)
    path += ' L ' + x2 + ' ' + y2
    path += ' L ' + (x2 - centerx - w1 * 2) + ' ' + (y2 - centery + h1 * 2)
    path += ' L ' + (x2 - centerx - w1) + ' ' + (y2 - centery + h1)
    path += ' Z'
    return path
  }
  // 箭头对象
  createArrow = (a1, b1) => {
    let style = this.state.drawStyles.arrow
    let a = a1,
      b = b1
    let path = this.createArrowPath(a, b)
    let arrow = new fabric.Path(path, {
      stroke: style.color,
      fill: style.color,
      strokeWidth: style.width,
      opacity: style.alpha,
      drawType: 'arrow'
    })
    return arrow
  }
  // 圆
  createCllipse = (start, m) => {
    let style = this.state.drawStyles.ellipse
    let left = start.x,
      top = start.y
    return new fabric.Ellipse({
      left: (m.x - left) / 2 + left,
      top: (m.y - top) / 2 + top,
      stroke: style.color,
      fill: 'rgba(255, 255, 255, 0)',
      originX: 'center',
      originY: 'center',
      rx: Math.abs(left - m.x) / 2,
      ry: Math.abs(top - m.y) / 2,
      strokeWidth: style.width,
      opacity: style.alpha,
      drawType: 'ellipse'
    })
  }
  // 文本
  createText = () => {
    let style = this.state.drawStyles.text
    let text = new fabric.Textbox('', {
      left: this.mouseEvent.x,
      top: this.mouseEvent.y,
      width: 50,
      fill: style.color,
      fontSize: style.size,
      borderColor: style.color,
      opacity: style.alpha,
      drawType: 'text'
    })
    return text
  }
  // 鼠标按下
  startCreateDraw = (e, canvas) => {
    // console.log(e);
    this.mouseEvent = e.pointer
    if (this.drawType === 'box') {
      let box = this.createBox()
      canvas.add(box).setActiveObject(box)
    }
    if (this.drawType === 'arrow') {
      let arrow = this.createArrow(this.mouseEvent, {
        x: this.mouseEvent.x + 1,
        y: this.mouseEvent.y + 1
      })
      canvas.add(arrow).setActiveObject(arrow)
    }
    if (this.drawType === 'ellipse') {
      let ellipse = this.createCllipse(this.mouseEvent, {
        x: this.mouseEvent.x + 1,
        y: this.mouseEvent.y + 1
      })
      canvas.add(ellipse).setActiveObject(ellipse)
    }
    if (this.drawType === 'text') {
      let text = this.createText()
      canvas.add(text).setActiveObject(text)
      text.enterEditing()
      text.hiddenTextarea.focus()
      text.set('_newText', true)
    }
    // 便签
    if (this.drawType === 'note') {
      this.setState({
        noteData: { description: '' }
      })
      let number = canvas.get('note_number') || 0
      let color = this.state.drawStyles[this.state.drawStyles.activeType]?.color
      let url = NoteIcon({ fillStyle: color, text: number + 1 })
      fabric.Image.fromURL(url, img => {
        // console.log(img)
        img.set({
          left: this.mouseEvent.x - 24 / 2,
          top: this.mouseEvent.y - 24 / 2,
          record_id: 'addImg',
          hoverCursor: 'pointer',
          drawType: 'note',
          hasBorders: false,
          hasControls: false,
          color: color
        })
        this.ObjectAddEvent(img)
        canvas.setActiveObject(img)
        canvas.add(img)
        this.allObjects.push(img)
        // this.allEvent(img, 'add')
        canvas.set('note_number', number + 1)
        this.setState({
          activeObject: img
        })
      })
    }
    if (this.drawType === 'pen') {
      let s = this.state.drawStyles[this.drawType] || {}
      let c = ''
      if (s.color) {
        if (s.color.indexOf('#') !== -1) {
          c = this.hexToRgba(s.color, s.alpha || 1).rgba
        }
        if (s.color.indexOf('rgba') !== -1) {
          var rgb = s.color.split(',')
          var r = parseInt(rgb[0].split('(')[1])
          var g = parseInt(rgb[1])
          var b = parseInt(rgb[2])
          var a = s.alpha || 1
          c = `rgba(${r},${g},${b},${a})`
        }
      }
      // console.log(canvas.freeDrawingBrush)
      canvas.freeDrawingBrush.color = c
    }
    if (this.drawType) {
      this.doDrawing = true
    }
  }
  // 鼠标移动
  drawMoveEvent = (e, canvas) => {
    if (this.moveCount % 2 && !this.doDrawing) {
      return
    }
    this.moveCount++
    this.mouseToEvent = e.pointer
    let mouseFrom = this.mouseEvent,
      mouseTo = this.mouseToEvent
    if (this.drawType) {
      // if(this.drawingObject){
      //   canvas.remove(this.drawingObject)
      // }
    }
    switch (this.drawType) {
      case 'arrow':
        let arrow = canvas.getActiveObject()
        arrow.statefullCache = true
        if (arrow) {
          let x = Math.min(mouseTo.x, mouseFrom.x),
            y = Math.min(mouseTo.y, mouseFrom.y),
            w = Math.abs(mouseTo.x - mouseFrom.x),
            h = Math.abs(mouseTo.y - mouseFrom.y)
          if (!w || !h) {
            return false
          }
          let path = this.createArrow(mouseFrom, mouseTo).get('path')
          arrow.initialize(path)
          arrow
            .set('width', w)
            .set('height', h)
            .set('left', x)
            .set('top', y)
            .setCoords()
          canvas.requestRenderAll()
        }
        break
      case 'ellipse': //椭圆
        let ellipse = canvas.getActiveObject()
        if (ellipse) {
          let w = Math.abs(mouseTo.x - mouseFrom.x),
            h = Math.abs(mouseTo.y - mouseFrom.y)
          if (!w || !h) {
            return false
          }
          ellipse
            .set('left', (mouseTo.x - mouseFrom.x) / 2 + mouseFrom.x)
            .set('top', (mouseTo.y - mouseFrom.y) / 2 + mouseFrom.y)
            .set('rx', w / 2)
            .set('ry', h / 2)
            .setCoords()
        }
        canvas.requestRenderAll()
        break
      case 'box': //矩形
        let activeObject = canvas.getActiveObject()
        if (activeObject) {
          let x = Math.min(mouseTo.x, mouseFrom.x),
            y = Math.min(mouseTo.y, mouseFrom.y),
            w = Math.abs(mouseTo.x - mouseFrom.x),
            h = Math.abs(mouseTo.y - mouseFrom.y)
          if (!w || !h) {
            return false
          }
          activeObject
            .set('width', w)
            .set('height', h)
            .set('left', x)
            .set('top', y)
            .setCoords()
        }
        canvas.requestRenderAll()
        break
      default:
    }
  }
  // 鼠标抬起
  drawEnd = (e, canvas) => {
    // let { drawStyles } = this.state;
    if (this.drawType !== 'pen') {
      // drawStyles.activeType = "";
      // this.setState({
      //   drawStyles:{...drawStyles}
      // })
      this.drawType = null
    }
    if (this.doDrawing) {
      this.isActiveDraw()
    }
    this.mouseToEvent = e.pointer
    this.doDrawing = false
    this.moveCount = 1
    this.drawingObject = null
    // this.isActiveDraw();
  }

  // 构建图片的编辑画布
  initPictureCanvas = async img => {
    let canvas = document.querySelector('#' + this.defaultElementId + '1')
    let container = document.querySelector('#allCanvas')
    let ctx = canvas.getContext('2d')
    let w, h
    if (img.height > img.width) {
      // 竖着的
      let pixo = 1
      if (img.height > container.clientHeight) {
        pixo = container.clientHeight / img.height
      }
      canvas.isSmall = true
      // console.log();
      w = img.width * pixo
      h = img.height * pixo
      canvas.width = w
      canvas.height = h
      ctx.drawImage(img, 0, 0, w, h)
    } else {
      // 横着的
      let pixo = 1
      if (img.width > container.clientWidth) {
        pixo = container.clientWidth / img.width
      } else canvas.isSmall = true
      // console.log();
      w = img.width * pixo
      h = img.height * pixo
      canvas.width = w
      canvas.height = h
      ctx.drawImage(img, 0, 0, w, h)
    }
    return canvas
  }

  initCanvas = async index => {
    let page = await this.loadPDF.getPage(index)
    let scale = 2
    await page.getTextContent()
    let viewport = page.getViewport({ scale })
    let c = document.querySelector('#' + this.defaultElementId + index)
    if (!c) return null
    let context = c.getContext('2d')
    // let pixo = document.body.clientWidth / viewport.width ;
    let pixo = document.querySelector('#allCanvas').clientWidth / viewport.width
    var renderContext = {
      canvasContext: context,
      viewport: viewport
    }
    c.width = Math.round(viewport.width * pixo)
    c.height = Math.round(viewport.height * pixo)
    page.render(renderContext)
    context.scale(pixo, pixo)
    return c
  }

  // 制定一个等待定时器
  setAwaitTime = (time = 0) => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve()
      }, time)
    })
  }

  // 所有调用和处理的方法
  allEvent = (object, eventType) => {
    if (object) {
      let addType
      let json = object.toJSON()
      if (!object || !object.canvas || !object.canvas.get) return
      let canvas_id = object.canvas.get('_id')
      json.path = json.path ? JSON.stringify(json.path) : null
      json.styles = json.styles ? JSON.stringify(json.styles) : null
      json.drawType = object.get('drawType') || null
      let dom = {
        clientWidth: object.canvas.getWidth(),
        clientHeight: object.canvas.getHeight()
      } // document.querySelector('#allCanvas');
      let width = dom.clientWidth,
        height = dom.clientHeight
      switch (eventType) {
        // 新增的
        case 'add':
          // 确定是新建的才允许保存
          if (!object.get('record_id')) {
            let params = canvas_id
              ? {
                  file_postil_id: canvas_id,
                  postil_type: 1,
                  container_size: [Math.round(width), Math.round(height)].join(
                    ','
                  )
                }
              : {
                  file_id: this.props.file_id || '1173838945335775232',
                  page_number: object.canvas.get('page_number') || 1,
                  postil_type: 1,
                  version_id: this.state.versionMsg.id || '1173838946543675232',
                  container_size: [Math.round(width), Math.round(height)].join(
                    ','
                  )
                }
            this.lockObject(object, true)
            Action.saveObject({ ...json, ...params })
              .then(res => {
                // console.log()
                addType = '1'
                this.updateHistoryForType(
                  addType,
                  object.canvas.get('page_number'),
                  res.data
                )
                object.set('record_id', res.data)
                if (object.type === 'textbox') {
                  object.set('_newText', false)
                }
                this.allObjects.push(object)
                setTimeout(() => {
                  this.lockObject(object, false)
                })
              })
              .catch(_ => {
                setTimeout(() => {
                  this.lockObject(object, false)
                })
              })
          } else if (
            object.get('record_id') === 'addImg' &&
            object.get('drawType') === 'note'
          ) {
            // console.log(object)
            let param = {
              postil_type: 2,
              page_number: object.canvas.get('page_number') || 1,
              file_id: this.props.file_id,
              container_size: [Math.round(width), Math.round(height)].join(','),
              version_id: this.state.versionMsg.id
            }
            let j = {
              left: object.get('left'),
              top: object.get('top'),
              color: object.get('color'),
              content: object.get('description')
            }
            Action.saveObject({ ...param, ...j }).then(res => {
              addType = '1'
              this.updateHistoryForType(
                addType,
                object.canvas.get('page_number'),
                res.data
              )
              object.set('record_id', res.data)
              this.allObjects.push(object)
              setTimeout(() => {
                this.lockObject(object, false)
              })
            })
          }
          break
        case 'edit':
          // 移动的
          // console.log(object)
          this.lockObject(object, true)
          if (object.get('drawType') === 'note') {
            let j = {
              left: object.get('left'),
              top: object.get('top'),
              color: object.get('color'),
              content: object.get('description')
            }
            json = j
          }
          let param = {
            ...json,
            record_id: object.get('record_id')
          }
          this.allObjects = this.allObjects.filter(
            item => item.get('record_id') !== param.record_id
          )
          Action.editObject(param)
            .then(res => {
              // console.log(res)
              if (res.code === '0') {
                object.set('record_id', res.data)
                addType = '2'
                this.updateHistoryForType(
                  addType,
                  object.canvas.get('page_number'),
                  res.data
                )
                object.set('_update', false)
              }
              this.allObjects.push(object)
              setTimeout(() => {
                this.lockObject(object, false)
              }, 5)
            })
            .catch(_ => {
              setTimeout(() => {
                this.lockObject(object, false)
              })
            })
          break
        default:
      }
    }
  }

  // 锁定对象
  lockObject = (object, flag) => {
    if (object) {
      object.selectable = !flag
      object.set('lockMovementX', flag)
      object.set('lockMovementY', flag)
      object.set('lockRotation', flag)
      object.set('lockScalingFlip', flag)
      object.set('lockScalingX', flag)
      object.set('lockScalingY', flag)
      object.set('lockSkewingX', flag)
      object.set('lockSkewingY', flag)
    }
  }
  // 对象添加整体事件的方法
  ObjectAddEvent = object => {
    object.on('selection:cleared', this.addSelectEvent)

    object.on('deselected', () => {
      clearTimeout(this.editTimer)
      this.editTimer = setTimeout(() => {
        this.setState({
          activeObject: null,
          drawStyles: { ...this.state.drawStyles, activeType: '' }
        })
        // 如果是新增的text，则不更新
        if (object.type === 'textbox' && object.get('_newText')) {
          return this.allEvent(object, 'add')
        }
        if (object.get('_update')) {
          this.allEvent(object, 'edit')
        }
      }, 100)
    })
  }

  // 图层添加事件的方法
  fabricAddEvent = canvas => {
    canvas.on('object:added', v => {
      this.ObjectAddEvent(v.target)
      // this.allEvent(v.target, 'add')
      // v.target.on('selection:cleared', this.addSelectEvent)
      this.setState({
        isDoing: this.state.isDoing.concat([{ canvas, object: v }])
      })
    })
    canvas.on('object:modified', e => {
      e.target.set('_update', true)
    })
    canvas.on('object:moved', e => {
      // console.log(e,'moved')
      this.allEvent(e.target, 'edit')
    })

    canvas.on('mouse:down', option => {
      this.startCreateDraw(option, canvas)
      if (option.target) {
        this.addSelectEvent(option.target)
      } else {
        this.setState({
          activeObject: null
        })
      }
    })
    canvas.on('mouse:move', e => {
      this.drawMoveEvent(e, canvas)
    })
    canvas.on('mouse:up', e => {
      if (canvas.isDrawingMode && !e.target) {
        let object = canvas.getObjects()
        let obj = object[object.length - 1]
        obj.set('drawType', 'pen')
        this.allEvent(obj, 'add')
      }
      // console.log(this.drawType)
      if (
        canvas.getActiveObject() &&
        this.drawType &&
        this.drawType !== 'text'
      ) {
        // console.log(e.target)
        this.allEvent(canvas.getActiveObject(), 'add')
      }
      this.drawEnd(e, canvas)
    })
  }

  // 构建绘图底层
  initFabricCanvas = async (pdfPage, index) => {
    await this.setAwaitTime(1800)
    if (!this.mounted) return null
    let style = this.state.drawStyles.pen
    pdfPage.toBlob(blob => {
      let url = window.URL.createObjectURL(blob)
      this.blobUrls.push(url)
      let canvas = new fabric.Canvas(this.defaultElementId + index, {
        containerClass: 'fabric_defualt_container',
        isDrawingMode: this.state.isDraw,
        perPixelTargetFind: true,
        prepareObjectStacking: true,
        selectionFullyContained: true,
        targetFindTolerance: 8,
        // 控件不能被选择，不会被操作
        selectable: false,
        // 是否显示选中
        allowTouchScrolling: true,
        selection: false,
        // 元素是否不可以选中
        skipTargetFind: false
      })
      canvas.freeDrawingBrush.color = style.color
      canvas.freeDrawingBrush.width = style.width
      // 添加事件
      canvas.set('page_number', index)
      canvas.set('bg_url', url)
      if (pdfPage.isSmall) {
        canvas.set('small_size', true)
      }
      this.fabricAddEvent(canvas)
      canvas.setBackgroundImage(url, canvas.renderAll.bind(canvas), {})
      this.drawCanvas.push(canvas)
      // 如果没切换版本，则继续请求，如果更换了版本，则不请求 -- 逻辑重新考虑
      // if(!this.isChangeVersion)
      let postil_numbners = this.state.versionMsg.postil_numbners || []
      postil_numbners = postil_numbners.map(numb => +numb)
      if (postil_numbners.length && postil_numbners.includes(index)) {
        this.loadDataToCanvas(index, canvas, url)
      }
    })
  }
  // 检查是否是数字
  checkIsNumber = val => {
    let number = +val
    if (!isNaN(number) && typeof number === 'number') {
      return true
    }
    return false
  }
  // 检查是否是Boolean
  checkIsBoolen = val => {
    if (val === 'false') {
      return false
    }
    if (val === 'true') {
      return true
    }
    return undefined
  }

  // 加载页面的数据
  loadDataToCanvas = (index, canvas, url) => {
    return new Promise((resolve, reject) => {
      let params = {
        file_id: this.props.file_id,
        page_number: index,
        version_id: this.state.versionMsg.id
      }
      Action.getObjects(params)
        .then(res => {
          // console.log(res);
          resolve(res.data)
          canvas.forEachObject(o => {
            canvas.remove(o)
          })
          let data = res.data
          if (data && data.id) {
            let records = data.records || []
            // console.log(records)
            // 格式化页面需要的数据
            records = records.map(item => {
              if (item.postil_type == 1) {
                let keys = Object.keys(item.detail)
                let d = {}
                keys.forEach(key => {
                  let obj = item.detail[key]
                  let value = obj
                  if (key === 'path' && obj) {
                    value = JSON.parse(obj)
                  }
                  if (this.checkIsNumber(obj)) {
                    value = +obj
                  }
                  let n = this.checkIsBoolen(obj)
                  if (n !== undefined) {
                    value = n
                  }
                  if (key === 'id') value = obj
                  if (key === 'text') value = obj.toString()
                  d[key] = value
                })
                if (!d['fill']) {
                  d['fill'] = null
                }
                d['record_id'] = item.id
                d['container_size'] = item.container_size
                return d
              }
            })
            data.records
              .filter(item => item.postil_type == 2)
              .forEach((obj, index) => {
                let src = NoteIcon({
                  fillStyle: obj.detail.color,
                  text: index + 1
                })
                fabric.Image.fromURL(src, img => {
                  // console.log(img)
                  img.set({
                    left: +obj.detail.left,
                    top: +obj.detail.top,
                    record_id: obj.id,
                    hoverCursor: 'pointer',
                    drawType: 'note',
                    hasBorders: false,
                    hasControls: false,
                    color: obj.detail.color,
                    description: obj.detail.content
                  })
                  this.ObjectAddEvent(img)
                  canvas.add(img)
                  this.allObjects.push(img)
                  canvas.set('note_number', index + 1)
                })
              })
            // console.log(records)
            let obj = {
              objects: records.filter(itm => itm),
              version: '4.1.0'
            }
            // console.log(data.data)
            // 更新不同分辨率下，每个数据所在的位置
            canvas.loadFromJSON(obj, null, (c, object) => {
              this.allObjects.push(object)
              let container = {
                clientWidth: canvas.getWidth(),
                clientHeight: canvas.getHeight()
              } // document.querySelector('#allCanvas');
              // 保存每次画的时候，当前的页面大小，用来计算偏移量
              let dataContainer = object.get('container_size')
              if (dataContainer) {
                dataContainer = dataContainer.split(',').map(item => +item)
                let scale = container.clientWidth / dataContainer[0]
                object.scaleX = object.scaleX * scale
                object.scaleY = object.scaleY * scale
                object.left = object.left * scale
                object.top = object.top * scale
                object.setCoords()
              }
            })
            canvas.requestRenderAll()
            canvas.calcOffset()
            // 设定此页的id
            canvas.set('_id', data.id)
            // 更新背景图
            canvas.setBackgroundImage(url, canvas.renderAll.bind(canvas), {})
            // setTimeout(()=> {
            //   // 优化内存
            //   window.URL.revokeObjectURL(url);
            // }, 100)
          } else {
            canvas.forEachObject(o => {
              canvas.remove(o)
            })
          }
        })
        .catch(err => {
          reject()
        })
    })
  }
  // 渲染因为浏览器把整个页面隐藏了的渲染器
  loadIsDocumentHiddenIngCanvas = () => {
    if (this.noloadCanvas.length) {
      ;(async () => {
        if (!this.mounted) return
        for (let i = 0; i < this.noloadCanvas.length; i++) {
          if (!this.mounted) break
          if (document.hidden) continue
          let { loadendElement } = this.state
          let numb = this.noloadCanvas[i]
          let c = await this.initCanvas(numb)
          if (!c) continue
          await this.initFabricCanvas(c, numb)
          this.setState({
            loadendElement: loadendElement + 1
          })
          this.noloadCanvas.splice(i, 1)
          i--
        }
      })()
    }
  }
  // 加载图片画布
  loadImage = async img => {
    let canvas = await this.initPictureCanvas(img)
    await this.initFabricCanvas(canvas, 1)
    this.setState({
      loadendElement: 1,
      allPdfElement: 1
    })
  }
  // 第一次加载pdf
  loadPage = () => {
    let pdf = this.loadPDF
    // let style = this.state.drawStyles.pen;
    // 异步循环
    ;(async () => {
      if (!this.mounted) return
      for (let i = 0; i < pdf.numPages; i++) {
        if (!this.mounted) break
        let { loadendElement } = this.state
        let item = i + 1
        let c = await this.initCanvas(item)
        if (document.hidden) {
          this.noloadCanvas.push(item)
          continue
        }
        if (!c) continue
        await this.initFabricCanvas(c, item)
        // console.log(loadendElement)
        this.setState({
          loadendElement: loadendElement + 1
        })
      }
    })()
  }

  convertDataURIToBinary(dataURI) {
    var BASE64_MARKER = ';base64,'
    var base64Index = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length
    var base64 = dataURI.substring(base64Index)
    var raw = window.atob(base64)
    var rawLength = raw.length
    var array = new Uint8Array(new ArrayBuffer(rawLength))

    for (let i = 0; i < rawLength; i++) {
      array[i] = raw.charCodeAt(i)
    }
    return array
  }

  // 加载文件
  loadFile = async () => {
    // let url = 'api/2.pdf';
    let url = this.props.url + '&_t=' + new Date().getTime()

    let pdfFile = pdfjsLib.getDocument({
      url,
      httpHeaders: {
        // "Access-Control-Allow-Origin": "*",
      }
    })
    // console.log(pdfFile)
    pdfFile.onProgress = e => {
      let percent = e.loaded / e.total
      let p = Math.round(percent * 100)
      this.setState({
        loadProcess: p
      })
    }
    await this.setAwaitTime(800)
    pdfFile.promise
      .then(pdf => {
        this.loadPDF = pdf
        let numPages = this.createArray(
          pdf.numPages
          // 3
        )
        let arr = numPages.map(item => this.defaultElementId + (item + 1))
        this.setState(
          {
            pdfViews: arr,
            allPdfElement: pdf.numPages,
            // allPdfElement: 3,
            loadend: true
          },
          () => {
            this.loadPage()
          }
        )
      })
      .catch(err => {
        message.warn(this.errormsg)
      })
  }

  rgbaNum(rgba) {
    let val = rgba.match(/(\d(\.\d+)?)+/g)
    return val
  }
  // 选中元素
  addSelectEvent = val => {
    this.drawCanvas.forEach(item => {
      if (item !== val.canvas) item.discardActiveObject()
      item.requestRenderAll()
    })
    let { drawStyles } = this.state
    let type = this.checkType(val)
    console.log(type)
    if (!type) {
      this.setState({
        activeObject: val
      })
      return
    }
    let color = ''
    let width = 2
    if (type === 'arrow' || type === 'text') {
      color = val.get('fill')
    } else if (type !== 'note') {
      color = val.get('stroke')
    } else color = val.get('color')
    width = val.get('strokeWidth') || 2
    if (type === 'text') {
      width = val.get('size')
      drawStyles[type].width = null
      drawStyles[type].size = width
    } else if (type !== 'note') {
      drawStyles[type].width = width
      drawStyles[type].size = null
    }
    drawStyles[type].color = color
    if (type === 'pen') {
      let c = val.get('stroke')
      let cl = this.rgbaNum(c)
      let rgb = `rgb(${cl[0]}, ${cl[1]}, ${cl[2]})`
      let alpha = cl[3]
      let hex = this.colorRGB2Hex(rgb)
      drawStyles['pen'].color = hex
      drawStyles['pen'].alpha = +alpha
    }
    if (type === 'note') {
      this.setState({
        noteData: {
          ...this.state.noteData,
          description: val.get('description')
        }
      })
    }
    this.setState({
      activeObject: val,
      drawStyles: { ...drawStyles, activeType: type }
    })
  }

  setNoteDescription = val => {
    let { activeObject } = this.state
    let text = val.target.value.trim()
    activeObject.set('description', text)
    activeObject.set('_update', true)
    this.setState({
      noteData: {
        ...this.state.noteData,
        description: text
      },
      activeObject
    })
  }

  // setNote = id => {
  //   let cla = 'note_' + id
  //   let dom = document.querySelector('.' + cla)
  //   dom.innerHTML = this.state.activeObject.get('description')
  // }
  // 渲染便签内容
  renderNoteContent = ({ id }) => {
    let { noteData, activeObject, drawStyles } = this.state
    let s = {}
    if (
      id === this.state.activeObject?.canvas?.lowerCanvasEl.id &&
      this.state.activeObject?.get('drawType') === 'note'
    ) {
      s = {
        display: 'block',
        zIndex: 15,
        opacity: 1,
        left: activeObject.get('left') + 40,
        top: activeObject.get('top') + 40,
        backgroundColor: drawStyles[drawStyles.activeType].color
      }
    } else {
      s = {}
    }
    return (
      <textarea
        className={`${styles.noteBox} ${'note_' + id}`}
        style={s}
        placeholder="输入文本"
        value={noteData.description}
        onInput={this.setNoteDescription}
      />
    )
  }

  fileSaveAs = () => {
    this.exportPdf('save')
  }
  // 初始渲染所有canvas
  renderAllCanvas = () => {
    let { pdfViews = [] } = this.state
    return pdfViews.map(item => {
      return (
        <Fragment key={item}>
          {this.props.fileType === 'img' ? (
            <div className={styles.imgCanvas} key={item}>
              <this.renderOperationDelete id={item} />
              <this.renderNoteContent id={item} />
              <canvas key={item} id={item} />
            </div>
          ) : (
            <div style={{ position: 'relative' }} key={item}>
              <this.renderOperationDelete id={item} />
              <this.renderNoteContent id={item} />
              <canvas key={item} id={item} style={{ width: '100%' }} />
            </div>
          )}
        </Fragment>
      )
    })
  }
  // 设置笔的颜色
  setPenColor = e => {
    if (!e) return
    // InputColor.blur();
    this.drawCanvas.map(item => {
      item.freeDrawingBrush.color = e.rgba
      return item
    })
  }
  // 设置笔的粗细
  setPenWidth = val => {
    this.drawCanvas.map(item => {
      item.freeDrawingBrush.width = val
      return item
    })
  }
  // 撤回
  undo = () => {
    if (!this.state.isDoing.length) return

    let arr = Array.from(this.state.isDoing)
    let obj = arr.pop()
    if (obj) {
      this.setState({
        unDoing: this.state.unDoing.concat([obj]),
        isDoing: arr
      })
      obj.canvas.remove(obj.object.target)
      obj.canvas.renderAll()
    }
  }
  // 取消撤回
  redo = () => {
    if (!this.state.unDoing.length) return
    let arr = Array.from(this.state.unDoing)
    let obj = arr.pop()
    if (obj) {
      obj.canvas.add(obj.object.target)
      obj.canvas.renderAll()
      this.setState({
        unDoing: arr
      })
    }
  }
  // 是否开启笔画
  changePen = (flag, from) => {
    this.setState(
      {
        isDraw: flag
      },
      () => {
        this.drawCanvas.map(item => {
          item.isDrawingMode = this.state.isDraw
          return item
        })
      }
    )
  }
  // 删除遮罩层
  removeModal = () => {
    if (this.modal) {
      this.modal.parentElement.removeChild(this.modal)
      this.modal = null
    }
  }

  // 添加一个遮罩层，可以让页面滚动
  addModalToMobile = () => {
    this.modal = document.createElement('div')
    this.modal.className = styles.dragModal
    document.querySelector('#allCanvas').appendChild(this.modal)
  }
  // 删除选中对象
  removeObject = () => {
    let { activeObject } = this.state
    this.drawType = null
    this.changePen(false)
    if (activeObject) {
      let canvas = activeObject.canvas
      // console.log(activeObject)
      // 调用接口删除
      Action.removeObject({ record_id: activeObject.get('record_id') }).then(
        res => {
          this.updateHistoryForType(
            '3',
            canvas?.get('page_number'),
            activeObject.get('record_id')
          )
          this.allObjects = this.allObjects.filter(
            item => item.get('record_id') !== activeObject.get('record_id')
          )
        }
      )
      if (activeObject.get('drawType') === 'note') {
        activeObject.canvas.set(
          'note_number',
          activeObject.canvas.get('note_number') - 1
        )
      }
      activeObject.canvas.remove(activeObject)
      canvas.renderAll()
      this.setState({
        activeObject: null,
        isDoing: this.state.isDoing.filter(
          item => item.object.target !== activeObject
        ),
        unDoing: this.state.unDoing.filter(
          item => item.object.target !== activeObject
        )
      })
    }
  }
  // 删除全部画的数据
  clear = () => {
    this.drawCanvas.forEach(item => {
      item.forEachObject(obj => {
        item.remove(obj)
      })
    })
    this.setState({
      isDoing: [],
      unDoing: []
    })
  }
  // 转出数据
  toJSON = () => {
    this.drawCanvas.forEach(item => {
      let id = item.lowerCanvasEl.id
      let j = item.toJSON()
      if (j.objects.length) this.saveObject[id] = j
    })
  }
  // 加载数据
  loadJson = () => {
    this.drawCanvas.map(item => {
      let id = item.lowerCanvasEl.id
      if (this.saveObject[id]) {
        item.loadFromJSON(this.saveObject[id])
      }
      return item
    })
  }
  // base64转file
  dataURLtoFile = (dataurl, filename) => {
    var arr = dataurl.split(','),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n)
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }
    return new File([u8arr], filename, { type: mime })
  }
  // 导出图片
  exportImg = type => {
    this.drawCanvas.forEach(async item => {
      let url = item.toDataURL()
      if (type === 'save') {
        let file_name = await this.confirmFileName(this.props.file_name).catch(
          err => err
        )
        if (file_name) {
          let file = this.dataURLtoFile(url, file_name)
          this.uploadFile(file)
        }

        return
      }
      if (!ENV_ANDROID_APP) {
        let a = document.createElement('a')
        a.href = url
        let index = this.props.file_name.lastIndexOf('.')
        let name = this.props.file_name
        if (index === -1) {
          name = name + '.png'
        }
        a.download = name
        a.click()
        a = null
      } else {
        if (window.mapAndroid) {
          let file = this.dataURLtoFile(url, this.props.file_name)
          let data = new FormData()
          data.append('file', file)
          this.axiosForSend('/api/projects/file/upload/public', data).then(
            res => {
              // console.log(res)
              let d = res.data.data || res.data
              window.open(d)
            }
          )
          let reader = new FileReader()
          reader.onload = () => {
            let blobUrl = window.URL.createObjectURL(new Blob([reader.result]))
            window.mapAndroid.boardImage(blobUrl, this.props.file_name)
            window.URL.revokeObjectURL(blobUrl)
          }
          reader.readAsArrayBuffer(file)
        }
      }
    })
  }

  ExportProgress = percent => {
    return <Progress percent={percent} />
  }

  // 导出进度查看
  setExportProcess = () => {
    this.exportModal = Modal.success({
      title: '进度',
      zIndex: 10003,
      content: this.ExportProgress(),
      okText: '中断',
      cancelText: '隐藏',
      okButtonProps: {
        type: 'danger'
      },
      onOk: () => {
        this.isBreak = true
      }
    })
  }

  // 导出pdf
  exportPdf = (type = 'export') => {
    this.isBreak = false
    if (!this.drawCanvas.length) return
    if (this.props.fileType === 'img') {
      return this.exportImg(type)
    }

    // console.log(this.state.loadendElement)
    if (this.state.loadendElement < this.state.allPdfElement)
      return notification.warning({
        zIndex: 10003,
        message: '提示',
        description: '加载未完成，请稍后'
      })
    // 显示导出进度
    this.setExportProcess()
    //a4纸的尺寸[595.28,841.89]，html页面生成的canvas在pdf中图片的宽高
    let minWidth = 841.89
    let fW = this.drawCanvas[0].width * (minWidth / this.drawCanvas[0].width)
    let fH = this.drawCanvas[0].height * (minWidth / this.drawCanvas[0].width)
    // message.success('导出中...',0);
    var pdf = new jsPDF({
      orientation: fW > fH ? 'l' : 'p',
      unit: 'pt',
      format: [fW, fH]
    })
    this.pdf = pdf
    // setTimeout(() => {
    ;(async () => {
      for (let i = 0; i < this.drawCanvas.length; i++) {
        if (this.isBreak) break
        let item = this.drawCanvas[i]
        let w = item.width,
          h = item.height
        let pixo = minWidth / w
        let url = item.toDataURL({
          format: 'jpeg', // pixo > 1 ? 'png' : 'jpeg',
          quality: 0.5
        })
        let width = w * pixo
        let height = h * pixo
        pdf.addImage(url, 'JPEG', 0, 0, width, height, null, 'SLOW')

        if (i < this.drawCanvas.length - 1) {
          pdf.addPage([width, height], width > height ? 'l' : 'p')
        }
        let percent = Math.round((i / this.drawCanvas.length) * 100)
        // console.log(i, percent);
        // 更新导出进度
        this.exportModal.update({
          content: this.ExportProgress(percent)
        })
        // 添加等待时间，防止全速导出内存泄露
        await this.setAwaitTime(10)
      }
      // console.log(pdf.__private__.out('#1123334'))
      message.destroy()
      if (this.isBreak) {
        return
      }
      // message.success('导出成功');
      this.exportModal.destroy()
      let blob = pdf.output('blob')
      if (type === 'export') {
        let url = window.URL.createObjectURL(blob)
        if (!ENV_ANDROID_APP) {
          let a = document.createElement('a')
          a.href = url
          a.download =
            this.props.file_name.substr(
              0,
              this.props.file_name.lastIndexOf('.')
            ) + '.pdf'
          a.click()
          a = null
        } else {
          if (window.mapAndroid) {
            let file = new File([blob], this.props.file_name, {
              type: blob.type
            })
            let data = new FormData()
            data.append('file', file)
            this.axiosForSend('/api/projects/file/upload/public', data).then(
              res => {
                message.success('正在下载')
                // console.log(res)
                let d = res.data.data || res.data
                window.open(d)
              }
            )
            window.mapAndroid.boardImage(url, this.props.file_name)
          }
        }
        window.URL.revokeObjectURL(blob)
      } else if (type === 'save') {
        this.saveOutput(blob)
      }
    })()

    // }, 50)
  }

  axiosForSend = (url, data) => {
    const Authorization = Cookies.get('Authorization')
    let a = axios.post(url, data, {
      headers: {
        Authorization,
        ...setRequestHeaderBaseInfo({ data, headers: {}, params: {} })
      }
    })
    a.onchange = e => {
      console.log(e)
    }
    return a
  }

  uploadFile = file => {
    let data = new FormData()
    data.append('board_id', this.props.board_id)
    data.append('folder_id', this.props.folder_id)
    data.append('type', 1)
    data.append('upload_type', 1)
    data.append('file', file)
    this.axiosForSend(`${REQUEST_DOMAIN_FILE}/file/upload`, data)
      .then(res => {
        // console.log(res)
        if (res.status === 200) {
          if (res.data.code == 0) {
            message.success('保存成功')
          } else {
            message.warn(res.data.message)
          }
        }
      })
      .catch(err => message.warn('保存失败，请稍后重试'))
  }

  confirmFileName = name => {
    return new Promise((resolve, reject) => {
      let file_name = name
      Modal.confirm({
        title: '另存为',
        zIndex: 1007,
        content: (
          <Input
            placeholder="请输入文件名"
            defaultValue={file_name}
            onChange={val => {
              file_name = val.target.value.trim()
            }}
          />
        ),
        okText: '确认',
        onOk: () => {
          if (file_name) {
            resolve(file_name)
          } else {
            message.warn('文件名不能为空')
            return Promise.reject()
          }
        },
        cancelText: '取消',
        onCancel: () => {
          reject()
        }
      })
    })
  }
  // 另存文件
  saveOutput = async blob => {
    // this.pdfFile
    let file_name = await this.confirmFileName(this.props.file_name).catch(
      err => err
    )
    if (file_name) {
      let file = new File([blob], file_name, { type: blob.type })
      message.success('正在保存，请稍后')
      this.uploadFile(file)
    }
  }

  // 当前第几页
  pageToElementNumber = number => {
    let id = this.defaultElementId + number
    let dom = document.querySelector('#' + id)
    dom && dom.scrollIntoView(/**{ behavior: 'smooth' }*/)
  }
  // 翻页
  changePage = type => {
    let { activeElement, allPdfElement } = this.state
    switch (type) {
      case 'add':
        activeElement += 1
        break
      case 'reduce':
        activeElement -= 1
        break
      default:
    }
    if (activeElement < 1 && type === 'reduce') return
    if (activeElement > allPdfElement && type === 'add') return
    this.setState(
      {
        activeElement: activeElement
      },
      () => {
        this.pageToElementNumber(activeElement)
      }
    )
  }
  setColorAlpha = val => {
    // console.log(val)
    let { drawStyles } = this.state
    drawStyles[drawStyles.activeType].alpha = val / 100
    this.setState({
      drawStyles: { ...drawStyles }
    })
    let t = drawStyles[drawStyles.activeType]
    this.transfromColor(t.hexColor, t.alpha)
  }
  transfromColor = (color, alpha) => {
    let { drawStyles } = this.state
    if (color) {
      let c = color.colorRgb(alpha)
      drawStyles[drawStyles.activeType].color = c
      this.setState({
        drawStyles: {
          ...drawStyles
        }
      })
      if (drawStyles.activeType === 'pen') {
        this.setPenColor({ rgba: c })
      }
      return c
    }
  }

  // 判断是箭头还是线段
  checkType = object => {
    return object.get('drawType')
    // if (object.type === 'path') {
    //   let { path, strokeLineCap } = object
    //   if (path.length !== 7 && strokeLineCap === 'round') {
    //     return 'pen'
    //   } else return 'arrow'
    // }
    // switch (object.type) {
    //   case 'ellipse':
    //     return 'ellipse'
    //   case 'textbox':
    //     return 'text'
    //   case 'rect':
    //     return 'box'
    //   default:
    //     return object.get('drawType')
    // }
  }

  setActiveColor = (hex, color) => {
    let { drawStyles } = this.state
    if (!drawStyles.activeType) return
    // let alpha = drawStyles[drawStyles.activeType].alpha;
    drawStyles[drawStyles.activeType].color = color
    drawStyles[drawStyles.activeType].hexColor = hex
    this.setState({
      drawStyles: { ...drawStyles }
    })
    // let c = this.transfromColor(color, alpha);
    let c = color
    // console.log(drawStyles.activeType, c)
    if (c && drawStyles.activeType === 'pen') {
      this.setPenColor({ rgba: c })
    }
    // this.drawCanvas.map(item => {
    let obj = this.state.activeObject
    if (obj) {
      if (obj.type === 'textbox' && obj.get('__created')) {
        obj.set('_update', true)
      } else if (obj.type !== 'textbox') {
        obj.set('_update', true)
      }

      let type = this.checkType(obj)
      switch (type) {
        case 'text':
          obj.set('fill', c)
          break
        case 'pen':
        case 'ellipse':
        case 'box':
          obj.set('stroke', c)
          break
        case 'arrow':
          obj.set('fill', c)
          obj.set('stroke', c)
          break
        default:
      }
      // obj.setColor(c);
      obj?.canvas.requestRenderAll()
    }
    //   return item
    // })
  }

  changeWidth = val => {
    let { drawStyles } = this.state
    let active = drawStyles.activeType
    if (active === 'pen') {
      this.setPenWidth(val)
    }
    if (drawStyles[active]?.width && active !== 'text')
      drawStyles[active].width = val
    else drawStyles[active] && (drawStyles[active].size = val)
    this.setState({
      drawStyles: { ...drawStyles }
    })
    // this.drawCanvas.map(item => {
    let obj = this.state.activeObject
    if (obj && obj.type) {
      if (obj.type === 'textbox' && obj.get('__created')) {
        obj.set('_update', true)
      } else if (obj.type !== 'textbox') {
        obj.set('_update', true)
      }
      let type = this.checkType(obj)
      if (type === 'text') {
        obj.set('fontSize', val)
      } else obj.set('strokeWidth', val)
      obj.canvas.requestRenderAll()
    }
    // })
  }

  setActiveDraw = key => {
    if (this.state.activeObject && this.state.drawStyles.activeType === key) {
      // this.setDrawType(key)
      return
    }

    if (key === 'json') {
      this.drawCanvas.forEach(item => {
        console.log(JSON.stringify(item.toJSON(), null, '\t'))
      })
      return
    }
    if (key === 'pen') {
      this.changePen(true, 'setActiveDraw')
      this.setDrawType(key)
    } else {
      this.changePen(false)
      this.setDrawType(key)
    }
  }
  // 更新颜色
  changeC = e => {
    // let { drawStyles } = this.state;
    // let active = drawStyles.activeType;
    let color = e.rgb
    let text = `rgba(${color.r},${color.g},${color.b},${color.a})`
    this.setActiveColor(e.hex, text)
  }

  // 切换抓手状态
  initDragEvent = () => {
    // if(this.state.isHand){
    if (this.state.isHand) this.addModalToMobile()
    else this.removeModal()
    this.drawCanvas = this.drawCanvas.map(item => {
      // 控件不能被选择，不会被操作
      item.selectable = this.state.isHand
      // 元素是否不可以选中
      item.skipTargetFind = this.state.isHand
      return item
    })
    // }
  }

  // 切换抓手
  toogleHand = flag => {
    if (flag) this.changePen(false, 'toogleHand')
    this.setState(
      {
        isHand: flag
      },
      () => {
        this.initDragEvent()
      }
    )
  }

  // 退出
  onClose = () => {
    const { onClose } = this.props
    onClose && onClose()
  }

  // 获取版本列表
  getVersionList = () => {
    Action.getVersionList({ file_id: this.props.file_id }).then(res => {
      // console.log(res);
      this.setState({
        version_list: res.data
      })
    })
  }

  // 版本设置
  VersionOperation = ({ data }) => {
    const [visible, setvisible] = useState(false)
    const { versionMsg, version_list } = this.state
    let text = data.name
    const handleMenu = ({ key, domEvent }) => {
      setvisible(false)
      if (key === 'edit') {
        Modal.confirm({
          title: '编辑版本描述',
          zIndex: 10003,
          content: (
            <Input
              defaultValue={text}
              onChange={e => {
                text = e.target.value.trim()
              }}
              placeholder="请输入描述文字"
            />
          ),
          okText: '保存',
          cancelText: '取消',
          onOk: () => {
            if (!text) {
              message.warn('版本名称不能为空')
              return Promise.reject()
            }
            if (versionMsg.id === data.id) {
              this.setState({
                versionMsg: { ...versionMsg, name: text }
              })
            }
            let arr = Array.from(version_list)
            // 编辑版本信息
            Action.editVersion({
              id: data.id,
              name: text
            }).then(res => {
              message.success(res.message)
            })
            this.setState({
              version_list: arr.map(item => {
                if (item.id === data.id) {
                  item.name = text
                }
                return item
              })
            })
          }
        })
      }
      if (key === 'remove') {
        if (this.state.version_list.length === 1) {
          return message.warn('版本不允许删除')
        }
        Modal.confirm({
          title: '提示',
          content: `确定删除批注版本 ${data.name ||
            dateFormat(+data.create_time + '000', 'yyyy/MM/dd HH:mm')}`,
          okText: '删除',
          zIndex: 10003,
          okButtonProps: {
            type: 'danger'
          },
          cancelText: '取消',
          onOk: () => {
            // 删除批注
            Action.removeVersion({ id: data.id }).then(async res => {
              if (res.code === '0') {
                message.success(res.message)
                let arr = Array.from(version_list)
                this.setState({
                  version_list: arr.filter(item => item.id !== data.id)
                })
                if (data.id === this.state.versionMsg.id) {
                  // 说明删除的是当前选中的版本 则需要获取最新版本，然后更新整个文件批注
                  let v = await Action.getVersion({
                    file_id: this.props.file_id
                  })
                  this.setState(
                    {
                      versionMsg: v.data
                    },
                    () => {
                      this.getVersion2Render()
                    }
                  )
                }
              }
            })
          }
        })
      }
    }

    return (
      <Dropdown
        visible={visible}
        trigger={['click']}
        overlayStyle={{
          zIndex: 10001
        }}
        onVisibleChange={val => setvisible(val)}
        overlay={
          <div onClick={e => e.stopPropagation()}>
            <Menu onClick={handleMenu}>
              <Menu.Item key="edit">
                <div>编辑版本信息</div>
              </Menu.Item>
              <Menu.Item key="remove">
                <div>删除</div>
              </Menu.Item>
            </Menu>
          </div>
        }
      >
        <span
          className={`${styles.operation} ${globalStyles.authTheme}`}
          onClick={e => e.stopPropagation()}
        >
          &#xe66f;
        </span>
      </Dropdown>
    )
  }

  // 切换更新版本数据 只更新已加载的，未加载的会在显示canvas的时候自动加载
  getVersion2Render = () => {
    let canvasList = this.drawCanvas
    ;(async () => {
      if (!this.mounted) return
      for (let i = 0; i < canvasList.length; i++) {
        if (document.hidden) continue
        if (!this.mounted) break
        let canvas = canvasList[i]
        let postil_numbners = this.state.versionMsg.postil_numbners || []
        postil_numbners = postil_numbners.map(numb => +numb)
        if (postil_numbners.length && postil_numbners.includes(i + 1)) {
          await this.loadDataToCanvas(i + 1, canvas, canvas.get('bg_url'))
        }
        await this.setAwaitTime(100)
      }
    })()
  }

  // 切换版本
  setActionVersion = async (val = {}) => {
    if (this.state.versionMsg.id === val.id) return
    this.isChangeVersion = true
    this.allObjects = []
    let res = await Action.getVersion({ file_id: this.props.file_id })
    this.setState(
      {
        versionMsg: { ...val, postil_numbners: res.data.postil_numbners }
      },
      () => {
        // 重新构建所有数据
        this.getVersion2Render()
        if (this.state.isHistoryIn) this.fetchHistory(this.state.isHistoryIn)
      }
    )
  }

  // 版本列表
  VersionRender = ({ data }) => {
    const { VersionOperation } = this
    let { versionMsg } = this.state
    return data.map(item => {
      return (
        <div
          className={`${styles.version_item} ${
            versionMsg.id === item.id ? styles.version_active : ''
          }`}
          key={item.id}
          onClick={this.setActionVersion.bind(this, item)}
        >
          {item.name
            ? item.name
            : dateFormat(+item.create_time + '000', 'yyyy/MM/dd HH:mm')}
          <VersionOperation data={item} />
        </div>
      )
    })
  }
  // 本地更新实时同步
  updateHistoryForType = (type, index, id) => {
    let addParam = {
      creator: this.user,
      opera_type: type,
      id: id,
      postil_record_id: id,
      createTime: new Date().getTime(),
      page_number: index
    }
    let arr = Array.from(this.state.version_history)
    arr.unshift(addParam)
    this.setState({
      version_history: arr
    })
  }
  // 另存新版本
  saveVersionAs = () => {
    let { versionMsg } = this.state
    let text =
      versionMsg.name ||
      dateFormat(+versionMsg.create_time + '000', 'yyyy/MM/dd HH:mm')
    let modal = Modal.confirm({
      title: '保存版本',
      content: (
        <Input
          defaultValue={text}
          onChange={val => {
            text = val.target.value.trim()
          }}
          allowClear
        />
      ),
      okText: '保存',
      zIndex: 10003,
      cancelText: '取消',
      onOk: () => {
        if (!text) {
          message.warn('版本名称不能为空')
          return Promise.reject()
        }
        let param = {
          name: text,
          id: versionMsg.id
        }
        modal.update({
          content: '保存中...',
          okButtonProps: {
            disabled: true
          },
          cancelButtonProps: {
            disabled: true
          }
        })

        Action.saveVersion(param)
          .then(res => {
            // message.success(res.message);
            modal.update({
              content: '保存成功'
            })
            this.setState({
              versionMsg: {
                ...this.state.versionMsg,
                name: text,
                id: res.data
              }
            })
            setTimeout(() => {
              modal.destroy()
            }, 1000)
          })
          .catch(err => {
            modal.update({
              content: '保存失败'
            })
            setTimeout(() => {
              modal.destroy()
            }, 1000)
          })
        return Promise.reject()
      }
    })
  }

  // 更新数据列表
  getHistory = async param => {
    let res = await Action.fetchHistory(param)
    return res.data
  }

  // 获取历史记录
  fetchHistory = flag => {
    let { versionMsg, isHistoryIn } = this.state
    let param = {
      next_id: '',
      version_id: versionMsg.id
    }
    this.setState(
      {
        isHistoryIn: flag === undefined ? !isHistoryIn : flag
      },
      () => {
        if (this.state.isHistoryIn) {
          this.scrollToLoad(this.historyContainerRef)
        }
        // if(this.props.fileType !== 'img')
        // this.resize();
      }
    )
    if (!isHistoryIn || flag)
      this.getHistory(param).then(data => {
        this.historyLast = data.next_id || ''
        this.setState({
          version_history: data.records || []
        })
      })
  }
  // 按照操作类型转换文字
  transformText = type => {
    switch (type) {
      case '1':
        return '新增一条记录'
      case '2':
        return '修改一条记录'
      case '3':
        return '删除了一条记录'
      case '4':
        return '保存了新的批注版本'
      default:
    }
  }
  getCurrentDom = target => {
    while (target.id !== 'history_list') {
      target = target.parentElement
    }
    return target
  }
  // 滚动加载
  scrollToLoad = ({ current }) => {
    current.onwheel = e => {
      // console.log(e)
      if (e.deltaY < 0) return
      let target = this.getCurrentDom(e.target)
      let { scrollTop, scrollHeight, clientHeight } = target
      if (clientHeight + scrollTop >= scrollHeight) {
        clearTimeout(this.loadTimer)
        this.loadTimer = setTimeout(() => {
          this.updateVersionList()
        }, 500)
      }
    }
    current.onpointerdown = evt => {
      this.pointerdown(evt)
      current.onpointermove = this.pointermove
      current.onpointerup = e => {
        current.onpointermove = null
        this.pointerup(e)
      }
    }
  }
  // 加载数据
  updateVersionList = () => {
    this.getHistory({
      next_id: this.historyLast,
      version_id: this.state.versionMsg.id
    }).then(res => {
      let arr = Array.from(this.state.version_history)
      if (!res.records) return message.warn('没有更多数据了')
      this.historyLast = res.next_id
      let list = res.records || []
      list.forEach(item => {
        arr.push(item)
      })
      this.setState({
        version_history: arr
      })
    })
  }
  getXY = e => {
    return { x: e.clientX, y: e.clientY }
  }
  pointerdown = e => {
    this.startEvent = this.getXY(e)
  }
  pointermove = e => {
    let target = this.getCurrentDom(e.target)
    let moveEvent = this.getXY(e)
    let step = this.startEvent.y - moveEvent.y
    if (step <= 0) return
    this.startEvent = moveEvent
    let { scrollTop, scrollHeight, clientHeight } = target
    if (scrollTop + clientHeight >= scrollHeight) {
      clearTimeout(this.scrollTimer)
      this.scrollTimer = setTimeout(() => {
        this.updateVersionList()
      }, 500)
    }
  }
  pointerup = e => {}

  // 点击历史记录
  handleHistory = val => {
    // console.log(val)
    let obj = this.allObjects.find(
      item => item.get('record_id') === val.postil_record_id
    )
    // console.log(obj)
    if (obj) {
      let id = obj.canvas.lowerCanvasEl.id
      document.getElementById(id).scrollIntoView()
      obj.canvas.discardActiveObject()
      obj.canvas.setActiveObject(obj)
      obj.canvas.requestRenderAll()
    } else {
      message.warn('该记录已经不存在')
    }
    this.setState({
      activeObject: null
    })
  }
  // 渲染历史记录
  renderForHistory = () => {
    let { version_history = [] } = this.state
    return version_history.map(item => {
      return (
        <div
          key={item.id}
          className={styles.history_item}
          onClick={() => this.handleHistory(item)}
        >
          <div>
            <Avatar src={item.creator?.avatar} />
          </div>
          <div className={styles.history_msg}>
            <div className={styles.creator_name}>
              {item.creator?.name} &nbsp;
              {item.opera_type !== '4' && (
                <span>在第({item.page_number})页</span>
              )}{' '}
              <span className={styles.actionType}>
                {this.transformText(item.opera_type)}
              </span>
            </div>
            <div>
              {dateFormat(
                item.createTime.length === 10
                  ? item.createTime + '000'
                  : item.createTime,
                'yyyy/MM/dd HH:mm'
              )}
            </div>
          </div>
        </div>
      )
    })
  }
  setObjectOpacity = val => {
    let { activeObject, drawStyles } = this.state
    // console.log(val)
    if (activeObject) {
      if (drawStyles.activeType === 'pen') {
        let color = this.hexToRgba(drawStyles['pen'].color, val)
        activeObject.set('stroke', color.rgba)
      } else activeObject.set('opacity', val)
      activeObject.set('_update', true)
      this.setState({
        activeObject
      })
      activeObject.canvas.requestRenderAll()
    }
    let obj = {}
    if (drawStyles.activeType) {
      obj = {
        [drawStyles.activeType]: {
          ...drawStyles[drawStyles.activeType],
          alpha: val
        }
      }
    }
    this.setState({
      drawStyles: { ...drawStyles, ...obj }
    })
  }

  // 渲染删除按钮
  renderOperationDelete = ({ id }) => {
    let { activeObject } = this.state
    let s = {}
    if (
      activeObject &&
      activeObject.get &&
      id === activeObject?.canvas?.lowerCanvasEl.id
    ) {
      let coor = activeObject.getCoords()[1]
      s = {
        opacity: 1,
        zIndex: 10,
        left: coor.x,
        top: coor.y - 40 < 0 ? 10 : coor.y - 40
      }
    } else s = {}
    return (
      <div
        className={styles.removeOperation}
        style={s}
        onClick={this.removeObject}
      >
        <DefineIcon type="icon-xiangpica" />
      </div>
    )
  }

  setObjectSize = val => {}
  // 渲染颜色选择
  renderChooseColor = ({ children }) => {
    let { activeObject, drawStyles } = this.state
    return (
      <Popover
        content={
          <div className={styles.setColorAndSize}>
            <div className={styles.operation_item}>
              <div>透明度</div>
              <Slider
                min={0.1}
                max={1}
                step={0.05}
                value={
                  drawStyles[drawStyles.activeType]
                    ? drawStyles[drawStyles.activeType].alpha
                    : 1
                }
                onChange={this.setObjectOpacity}
              />
            </div>
            <div>
              <div>大小</div>
              <Slider
                min={
                  this.state.drawStyles[this.state.drawStyles.activeType]
                    ?.minSize || 1
                }
                max={
                  this.state.drawStyles[this.state.drawStyles.activeType]
                    ?.maxSize || 10
                }
                step={1}
                value={
                  this.state.drawStyles[this.state.drawStyles.activeType]
                    ?.size ||
                  this.state.drawStyles[this.state.drawStyles.activeType]
                    ?.width ||
                  1
                }
                onChange={this.changeWidth}
              />
            </div>
            <div className={styles.operation_item}>
              <div>颜色</div>
              <ChooseColor
                onChange={this.setDrawColor}
                color={
                  this.state.drawStyles[this.state.drawStyles.activeType]?.color
                }
              />
            </div>
          </div>
        }
        trigger={['click']}
      >
        {children}
      </Popover>
    )
  }

  setDrawColor = (val, hex) => {
    // console.log(val, hex)
    this.setActiveColor(hex, val)
  }
  // 不操作任何绘制的时候
  setHandActive = key => {
    this.changePen(false)
    this.setActiveDraw(key)
  }

  renderPageSize = () => {
    let { activeElement, allPdfElement, loadendElement } = this.state
    return (
      <div className={styles.pageBox}>
        <span onClick={() => this.changePage('reduce')}>
          <DefineIcon type="icon-bianzu17" />
        </span>
        <span>{activeElement}</span> / <span>{allPdfElement}</span>{' '}
        <span>加载中 {loadendElement - 1}</span>
        <span onClick={() => this.changePage('add')}>
          <DefineIcon type="icon-xiayiye" />
        </span>
      </div>
    )
  }

  setNoteColor = val => {
    let { drawStyles } = this.state
    this.setState({
      drawStyles: { ...drawStyles, [drawStyles.activeType]: { color: val } }
    })
  }

  render() {
    let {
      // activeElement,
      // allPdfElement,
      // loadendElement,
      // drawStyles,
      isHistoryIn
    } = this.state
    const drawT = ['pen', 'text', 'box', 'ellipse', 'arrow']
    const { VersionRender } = this
    return (
      // ReactDOM.createPortal(
      <div
        className={styles.pdfCanvasBox}
        style={{ paddingLeft: isHistoryIn ? '20vw' : '' }}
      >
        {isHistoryIn && (
          <div className={styles.historyContainer}>
            <div className={styles.history_title}>修改记录</div>
            <div
              id="history_list"
              className={styles.history_list}
              ref={this.historyContainerRef}
            >
              {this.renderForHistory()}
            </div>
          </div>
        )}
        <div className={styles.tools}>
          <span
            className={`${styles.history} ${globalStyles.authTheme}`}
            onClick={this.fetchHistory.bind(this, undefined)}
          >
            &#xe7b4;
          </span>
          <div className={styles.tools_items}>
            {this.drawTools.map(item => {
              if (drawT.includes(item.key)) {
                return (
                  <this.renderChooseColor key={item.key}>
                    <span
                      className={styles.tools_item}
                      key={item.key}
                      style={{
                        color:
                          item.key === this.state.drawStyles.activeType
                            ? this.state.drawStyles[
                                this.state.drawStyles.activeType
                              ]?.color
                            : ''
                      }}
                      onClick={() => {
                        this.setActiveDraw(item.key)
                      }}
                    >
                      <DefineIcon type={item.icon} />
                    </span>
                  </this.renderChooseColor>
                )
              }
              if (item.key === 'note') {
                return (
                  <Popover
                    trigger={['click']}
                    content={
                      <div>
                        <div>颜色</div>
                        <ChooseColor
                          needHex={true}
                          onChange={this.setNoteColor}
                          color={
                            this.state.drawStyles[
                              this.state.drawStyles.activeType
                            ]?.color
                          }
                          colors={this.noteColors}
                        />
                      </div>
                    }
                  >
                    <span
                      className={`${styles.tools_item}`}
                      style={{
                        color:
                          this.state.drawStyles.activeType === item.key
                            ? this.state.drawStyles[
                                this.state.drawStyles.activeType
                              ]?.color
                            : ''
                      }}
                      key={item.key}
                      onClick={() => this.setHandActive(item.key)}
                    >
                      <DefineIcon type={item.icon} />
                    </span>
                  </Popover>
                )
              }
              return (
                <span
                  className={`${styles.tools_item}`}
                  style={{
                    color:
                      this.state.drawStyles.activeType === item.key
                        ? this.state.drawStyles[
                            this.state.drawStyles.activeType
                          ]?.color
                        : ''
                  }}
                  key={item.key}
                  onClick={() => this.setHandActive(item.key)}
                >
                  <DefineIcon type={item.icon} />
                </span>
              )
            })}
            <div className={styles.version}>
              <span className={styles.version_n}>批注版本：</span>
              <Popover
                trigger="click"
                placement="bottom"
                content={<VersionRender data={this.state.version_list} />}
                title={<span>版本</span>}
              >
                <a className={styles.version_v} onClick={this.getVersionList}>
                  {this.state.versionMsg.name
                    ? this.state.versionMsg.name
                    : this.state.versionMsg.create_time &&
                      dateFormat(
                        +(this.state.versionMsg.create_time + '000'),
                        'yyyy/MM/dd HH:mm'
                      )}
                </a>
              </Popover>
              <Button
                size="small"
                className={styles.saveAs}
                onClick={this.saveVersionAs}
                ghost
                type="primary"
              >
                保存
              </Button>
            </div>
            {/* <span onClick={this.fileSaveAs}>另存</span> */}
          </div>
          {/* <span></span> */}
        </div>
        {/* <div className={styles.tools}>
          <div
            className={`${styles.history} ${globalStyles.authTheme}`}
            onClick={this.fetchHistory.bind(this, undefined)}
          >
            &#xe7b4;
          </div>
          <div className={`${styles.toolsItem} ${styles.pages}`}>
            <div className={styles.toolsItem_pages}>
              <div className={styles.toolsPages_box}>
                <span>页</span>
                <Button
                  onClick={() => this.changePage('reduce')}
                  disabled={activeElement <= 1}
                >
                  <DefineIcon type="icon-sanjiaojiantoushangcopy-copy" />
                </Button>
                <Input
                  className={styles.pageNumber}
                  style={{ width: 60 }}
                  value={activeElement}
                  onChange={val => {
                    let num = +val.target.value
                    if ((num >= 1 && num <= +loadendElement) || !num) {
                      this.setState({ activeElement: num })
                    } else {
                      this.setState({ activeElement: activeElement })
                    }
                  }}
                  min={1}
                  max={loadendElement}
                  onPressEnter={() => this.pageToElementNumber(activeElement)}
                  onBlur={() => {
                    this.pageToElementNumber(activeElement)
                  }}
                />
                <Button
                  onClick={() => this.changePage('add')}
                  disabled={activeElement >= loadendElement}
                >
                  <DefineIcon type="icon-sanjiaojiantoushangcopy" />
                </Button>
                <span>共</span>
                <span>{allPdfElement} 页</span>
                {loadendElement < allPdfElement ? (
                  <span>已加载:{loadendElement}页</span>
                ) : (
                  <span>加载完成</span>
                )}
              </div>
            </div>
          </div>
          <div className={`${styles.toolsItem} ${styles.redoUndo}`}>
            <div className={styles.version}>
              <span className={styles.version_n}>批注版本：</span>
              <Popover
                trigger="click"
                content={<VersionRender data={this.state.version_list} />}
                title={<span>版本</span>}
              >
                <a className={styles.version_v} onClick={this.getVersionList}>
                  {this.state.versionMsg.name
                    ? this.state.versionMsg.name
                    : dateFormat(
                        +(this.state.versionMsg.create_time + '000'),
                        'yyyy/MM/dd HH:mm'
                      )}
                </a>
              </Popover>
              <Button
                size="small"
                className={styles.saveAs}
                onClick={this.saveVersionAs}
                ghost
                type="primary"
              >
                另存为
              </Button>
            </div>
          </div>
          <div className={`${styles.toolsItem} ${styles.colorSetting}`}>
            {drawStyles.activeType && (
              <div>
                <Popover
                  trigger="click"
                  content={
                    <ColorPicker
                      color={drawStyles[drawStyles.activeType].color}
                      type="sketch"
                      onChange={this.changeC}
                    />
                  }
                >
                  <span>
                    <span>颜色:</span>
                    <span
                      className={styles.selectColors}
                      // onClick={this.setActiveColor}
                      style={{
                        background: drawStyles[drawStyles.activeType].color
                      }}
                    />
                  </span>
                </Popover>

                <span>大小:</span>
                <Slider
                  defaultValue={
                    drawStyles[drawStyles.activeType].width ||
                    drawStyles[drawStyles.activeType].size
                  }
                  value={
                    drawStyles[drawStyles.activeType].width ||
                    drawStyles[drawStyles.activeType].size
                  }
                  onChange={this.changeWidth}
                  max={
                    drawStyles.activeType === 'text' ||
                    drawStyles[drawStyles.activeType].width === null
                      ? 60
                      : 20
                  }
                  min={1}
                  step={1}
                  style={{
                    width: 80,
                    display: 'inline-block',
                    verticalAlign: 'middle'
                  }}
                />
                <input
                  type="color"
                  id="setColorId"
                  defaultValue={drawStyles[drawStyles.activeType].hexColor}
                  style={{ display: 'none' }}
                />
              </div>
            )}
          </div>
          <div className={`${styles.toolsItem} ${styles.drawSet}`}>
            <div className={styles.drawSetItem}>
              {this.state.isHand ? (
                <DefineIcon
                  type="icon-shubiao"
                  onClick={() => this.toogleHand(false)}
                />
              ) : (
                <DefineIcon
                  type="icon-zhuashou"
                  onClick={() => this.toogleHand(true)}
                />
              )}
            </div>
            <div className={styles.drawSetItem} onClick={this.exportPdf}>
              <DefineIcon type="icon-download" />
            </div>
            {this.drawTools.map(item => {
              return (
                <div
                  key={item.key}
                  className={`${styles.drawSetItem} ${
                    drawStyles.activeType === item.key ? styles.activity : ''
                  }`}
                  onClick={() => {
                    this.setActiveDraw(item.key)
                  }}
                  title={item.label}
                >
                  <DefineIcon type={item.icon} />
                </div>
              )
            })}
            <div className={styles.drawSetItem} onClick={this.removeObject}>
              <DefineIcon type="icon-gantetu_shanchu" />
            </div>
          </div>
        </div> */}
        <div
          className={styles.canvasList}
          onScroll={this.viewScroll}
          id="canvas_container"
        >
          {/* 我是pdf */}
          <div
            id="allCanvas"
            className={`${styles.canvasBox} ${
              this.props.fileType === 'img' ? styles.isImgCanvas : ''
            }`}
            style={{
              width: this.W,
              height: this.props.fileType === 'img' ? '100%' : 'auto'
            }}
          >
            {!this.state.loadend ? (
              <div className={styles.loadingProcess}>
                <Progress type="circle" percent={this.state.loadProcess} />
              </div>
            ) : (
              this.renderAllCanvas()
            )}
          </div>
        </div>
        {this.props.fileType === 'pdf' && <this.renderPageSize />}
        <BackTop target={() => document.querySelector('#canvas_container')} />
      </div>
      //   ,document.body
      // )
    )
  }
}
// 重新渲染画布大小
PdfComment.prototype.resize = function() {
  let dom = document.querySelector('#allCanvas')
  if (!dom) return
  let width = dom.clientWidth
  ;(async () => {
    for (let i = 0; i < this.drawCanvas.length; i++) {
      const item = this.drawCanvas[i]
      await this.setAwaitTime(1)
      let bg = item.get('backgroundImage')
      if (!bg) return
      let imgW = bg.get('width')
      let imgH = bg.get('height')
      let cwidth = item.getWidth()
      // 如果元素宽度小于所需屏幕宽度，则不进行重新渲染
      if (item.get('small_size')) return item
      let scaleMultiplier = width / cwidth
      item.forEachObject(obj => {
        obj.scaleX = obj.scaleX * scaleMultiplier
        obj.scaleY = obj.scaleY * scaleMultiplier
        obj.left = obj.left * scaleMultiplier
        obj.top = obj.top * scaleMultiplier
        obj.setCoords()
      })
      item.setWidth(cwidth * scaleMultiplier)
      item.setHeight(item.getHeight() * scaleMultiplier)
      bg.set({
        scaleX: item.getWidth() / imgW,
        scaleY: item.getHeight() / imgH
      })
      item.setBackgroundImage(bg, item.renderAll.bind(item))
      item.requestRenderAll()
      item.calcOffset()
    }
  })()
}
