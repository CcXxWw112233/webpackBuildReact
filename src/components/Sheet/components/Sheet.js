import React from 'react'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'
import styles from '../index.less'
import globalStyles from '@/globalset/css/globalClassName.less'

export default class Sheet extends React.Component {
  constructor() {
    super(...arguments)
    this.state = {}
    this.timer = null
    this.loadtimer = null
  }

  resize = () => {
    clearTimeout(this.timer)
    this.timer = setTimeout(() => {
      this.reload(this.getFormatData())
    }, 800)
  }

  componentDidMount() {
    this.reload()
    window.addEventListener('resize', this.resize)
  }
  reload = data => {
    window.luckysheet.method.destroy()
    clearTimeout(this.loadtimer)
    this.loadtimer = setTimeout(() => {
      console.info('加载了,并且设置了数据')
      this.init(data)
    }, 150)
  }
  // 获取数据，包含表格需要的字段
  getFormatData = () => {
    let sheets = window.luckysheet.getluckysheetfile()
    sheets = JSON.parse(JSON.stringify(sheets))
    let arr = []
    sheets.forEach((item, index) => {
      let data = item.data || []
      let celldata = []
      data.forEach((d, r) => {
        let cells = []
        d.forEach((val, c) => {
          if (val && (val.v || val.mc)) {
            // 将所有数据保存到v字段，适用于更新
            val.v = { ...val }
            val.r = r
            val.c = c
            cells.push(val)
          }
        })
        celldata = celldata.concat(cells)
      })
      // 组合成需要的数据
      let obj = {
        row: data.length,
        column: item.visibledatacolumn && item.visibledatacolumn.length,
        name: item.name,
        order: item.order,
        index: index,
        status: item.status,
        config: item.config,
        color: item.color,
        celldata
      }
      arr.push(obj)
    })
    return arr
  }
  // 销毁表格
  destory = () => {
    window.luckysheet.method.destroy()
  }
  componentWillUnmount() {
    window.luckysheet.method.destroy()
    window.removeEventListener('resize', this.resize)
  }

  // 格式化数据字符串的问题
  forMatNumberData = data => {
    let arr = data.map(item => {
      let config = item.config
      let { columlen, merge, rowlen } = config
      let obj = {}
      // 修复列宽的bug
      if (columlen) {
        for (let key in columlen) {
          obj[key] = +columlen[key]
        }
      }

      // 修复行高的bug
      let row = {}
      if (rowlen) {
        for (let key in rowlen) {
          row[key] = +rowlen[key]
        }
      }

      let m = {}
      // 修复合并单元格的bug
      if (merge) {
        for (let key in merge) {
          let d = merge[key]
          let n = {}
          for (let dk in d) {
            n[dk] = +d[dk]
          }
          m[key] = n
        }
      }

      let celldata = item.celldata || []
      item.celldata = celldata.map(cell => {
        // 修复显示合并单元格的bug
        let mc = cell.mc
        cell.r = +cell.r
        cell.c = +cell.c
        if (mc) {
          let obj = {}
          for (let key in mc) {
            obj[key] = +mc[key]
          }
          cell.mc = obj
        }
        let v = cell.v
        if (v && typeof v === 'object') {
          let vmc = v.mc
          if (vmc) {
            let obj = {}
            for (let key in vmc) {
              obj[key] = +vmc[key]
            }
            v.mc = obj
          }
          cell.v = v
        }
        return cell
      })

      config.merge = m
      config.columlen = obj
      config.rowlen = row
      item.config = config
      return item
    })
    return arr
  }

  // 设置单元格的公式
  setFormatFunction = data => {
    data.forEach(item => {
      let celldata = item.celldata || []
      celldata.forEach(cell => {
        if (cell) {
          let v = cell.v
          let f = v.f
          if (f) {
            window.luckysheet.formula.execfunction(f, +cell.r, +cell.c)
          }
        }
      })
    })
  }

  init = data => {
    window.luckysheet.method.destroy()
    let {
      id,
      disabledEdit,
      showinfobar,
      fullscreenmode,
      showtoolbar = true,
      showsheetbar = true,
      showstatisticBar = true
    } = this.props
    data =
      data && data.length
        ? data
        : [
            {
              name: '默认Sheet',
              color: '',
              status: '1',
              order: '0',
              config: {},
              index: 0
            }
          ]
    data = this.forMatNumberData(data)
    window.luckysheet.create({
      container: id || 'luckysheet',
      showinfobar,
      fullscreenmode,
      allowEdit: false,
      showtoolbar,
      showsheetbar,
      showstatisticBar,
      editMode: disabledEdit,
      data
    })
    setTimeout(() => {
      this.setFormatFunction(data)
    }, 500)
  }
  render() {
    let { id } = this.props
    return ReactDOM.createPortal(
      <>
        <span
          className={`${globalStyles.authTheme} ${styles.closeBtn}`}
          onClick={() => {
            this.props.onClose && this.props.onClose()
          }}
        >
          &#xe7fe;
        </span>
        <div
          id={id || 'luckysheet'}
          className={styles.luckysheet}
          style={{
            margin: 0,
            padding: 0,
            position: 'absolute',
            top: '0px',
            left: 0,
            width: '100%',
            height: '100%'
          }}
        ></div>
      </>,
      document.body
    )
  }
}

Sheet.propTypes = {
  id: PropTypes.string, // 构建的sheetID
  data: PropTypes.array, // 构建时，传入的基础数据
  disabledEdit: PropTypes.bool, // 是否可以编辑
  showinfobar: PropTypes.bool,
  fullscreenmode: PropTypes.bool, // 是否全屏模式
  showtoolbar: PropTypes.bool, // 是否显示工具栏 -- 当没有权限的时候，可以不可编辑和隐藏工具栏
  showsheetbar: PropTypes.bool, // 是否显示sheet列表栏
  showstatisticBar: PropTypes.bool //是否显示底层的计数栏
}
