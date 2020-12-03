import XLSX from 'xlsx'
export function exportFile(data, fileName = new Date().getTime().toString()) {
  let tmpWB = {
    SheetNames: [],
    Sheets: {}
  }
  data.forEach(items => {
    let downOriginData = items.data
    let arr = [] // 所有的单元格数据组成的二维数组
    let bgConfig = {}
    let percentageReg = /%$/
    let cellValue = null
    // 获取单元格的背景色
    function setBackground(row, col, bg) {
      var colA = window.luckysheet.luckysheetchatatABC(col)
      var key = colA + (row + 1)
      bgConfig[key] = bg.replace(/\#?/, '')
    }

    // 判断值类型是否为百分比 %
    function isPercentage(value) {
      return percentageReg.test(value.m) && value.ct && value.ct.t === 'n'
    }

    // 获取二维数组
    for (let row = 0; row < downOriginData.length; row++) {
      let arrRow = []
      for (let col = 0; col < downOriginData[row].length; col++) {
        cellValue = downOriginData[row][col]
        if (cellValue) {
          // console.log(cellValue)
          // 处理单元格的背景颜色
          if (cellValue.bg) {
            // 背景色存在bg，暂不启用
            // setBackground(row, col, cellValue.bg)
          }
          if (cellValue.ct != null && cellValue.ct.t == 'd') {
            //  d为时间格式  2019-01-01   或者2019-01-01 10:10:10
            arrRow.push(new Date(cellValue.m.replace(/\-/g, '/'))) //兼容IE
          } else if (cellValue.m && isPercentage(cellValue)) {
            //百分比问题
            arrRow.push(cellValue.m)
          } else if (typeof cellValue.v === 'object') {
            arrRow.push(cellValue.v.v)
          } else arrRow.push(cellValue.v)
        } else arrRow.push(cellValue)
      }
      arr.push(arrRow)
    }
    let opts = {
      dateNF: 'm/d/yy h:mm',
      cellDates: true,
      cellStyles: true
    }
    let ws = XLSX.utils.aoa_to_sheet(arr, opts)

    let reg = /[\u4e00-\u9fa5]/g
    for (let key in ws) {
      let item = ws[key]
      if (item.t === 'd') {
        if (item.w) {
          //时间格式的设置
          let arr = item.w.split(' ')
          if (arr[1] && arr[1] == '0:00') {
            ws[key].z = 'm/d/yy'
          } else {
            item.z = 'yyyy/m/d h:mm:ss'
          }
        }
      } else if (item.t === 's') {
        //百分比设置格式
        if (item.v && !item.v.match(reg) && item.v.indexOf('%') > -1) {
          item.t = 'n'
          item.z = '0.00%'
          item.v = Number.parseFloat(item.v) / 100
        } else if (item.v && item.v.match(reg)) {
          //含有中文的设置居中样式
          item['s'] = {
            alignment: { vertical: 'center', horizontal: 'center' }
          }
        }
      }
      // 设置单元格样式
      if (bgConfig[key]) {
        ws[key]['s'] = {
          alignment: { vertical: 'center', horizontal: 'center' },
          fill: { bgColor: { indexed: 32 }, fgColor: { rgb: bgConfig[key] } },
          border: {
            top: { style: 'thin', color: { rgb: '999999' } },
            bottom: { style: 'thin', color: { rgb: '999999' } },
            left: { style: 'thin', color: { rgb: '999999' } },
            right: { style: 'thin', color: { rgb: '999999' } }
          }
        }
      }
    }
    let name = items.name
    tmpWB.SheetNames.push(name) // 保存表格标题
    tmpWB.Sheets[name] = Object.assign({}, ws) // 保存表格数据

    let mergeConfig = items.config.merge
    let mergeArr = []
    if (JSON.stringify(mergeConfig) !== '{}') {
      mergeArr = handleMergeData(mergeConfig)
      tmpWB.Sheets[name]['!merges'] = mergeArr
    }
    //处理合并单元格config数据
    function handleMergeData(origin) {
      let result = []
      if (origin instanceof Object) {
        var r = 'r',
          c = 'c',
          cs = 'cs',
          rs = 'rs'
        for (var key in origin) {
          var startR = origin[key][r]
          var endR = origin[key][r]
          var startC = origin[key][c]
          var endC = origin[key][c]

          // 如果只占一行 为1 如果占两行 为2
          if (origin[key][cs] > 0) {
            endC = startC + (origin[key][cs] - 1)
          }
          if (origin[key][rs] > 0) {
            endR = startR + (origin[key][rs] - 1)
          }
          // s为合并单元格的开始坐标  e为结束坐标
          var obj = { s: { r: startR, c: startC }, e: { r: endR, c: endC } }
          result.push(obj)
        }
      }
      return result
    }
  })

  let name = fileName
  // sheetjs js-xlsx 的方法 ，不能设置单元格格式
  XLSX.writeFile(tmpWB, name + '.xlsx')
}
