import React from 'react'
import Excel from 'exceljs'

export default class WriteFile extends React.Component {
  constructor() {
    super(...arguments)
    this.letters = [
      'A',
      'B',
      'C',
      'D',
      'E',
      'F',
      'G',
      'H',
      'I',
      'J',
      'K',
      'L',
      'M',
      'N',
      'O',
      'P',
      'Q',
      'R',
      'S',
      'T',
      'U',
      'V',
      'W',
      'X',
      'Y',
      'Z'
    ]
  }
  componentDidMount() {}
  // loadMsg = () => {
  //     return new Promise((resolve, reject) => {
  //         axios.get('/api/test.json',{headers: {'Access-Control-Allow-Origin':"*"}}).then(res => {
  //         // console.log(res.data);
  //         resolve(res.data);
  //         })
  //     })
  // }
  convertToTitle = n => {
    const arr = this.letters
    let val = ''
    n = n + ''
    while (n > 0) {
      if (n % 26 === 0) {
        val = 'Z' + val
        n = parseInt(n / 26, 10) - 1
      } else {
        val = arr[(n % 26) - 1] + val
        n = parseInt(n / 26, 10)
      }
    }
    return val
  }
  toTransfromData = () => {
    let { data } = this.props
    let workbook = new Excel.Workbook()
    data.forEach(item => {
      const { name, celldata } = item
      // 创建一个sheet
      let sheet = workbook.addWorksheet(name)
      let rowdata = item.data
      let config = item.config
      rowdata.forEach(row => {
        let rows = row.map((r, index) => {
          if (r) {
            if (typeof r.v === 'object') {
              return r.v.m ? r.v.m : r.v.v
            } else {
              return r.m ? r.m : r.v
            }
          }
          return ''
        })
        sheet.addRow(rows).commit()
      })
      // 有合并项
      if (config.merge && Object.keys(config.merge).length) {
        let merge = config.merge
        let keys = Object.keys(merge)
        keys.forEach(key => {
          let m = merge[key]
          let { r, c, rs, cs } = m
          r = r + 1

          c = c + 1
          rs = rs - 1
          cs = cs - 1
          sheet.mergeCells(r, c, r + rs, c + cs)
        })
      }
      this.setCellStyle(celldata, sheet)
      // this.setRowCellWH(config, sheet);
    })
    this.DownLoadFile(workbook)
  }
  // 设置宽高
  setRowCellWH = (config, sheet) => {
    let { rowlen = {}, columlen = {} } = config
    let rowKeys = Object.keys(rowlen)
    let colKeys = Object.keys(columlen)
    colKeys.forEach(item => {
      sheet.getColumn(this.convertToTitle(item + 1)).width = columlen[item]
    })
    rowKeys.forEach(item => {
      sheet.getRow(item + 1).height = rowlen[item]
    })
  }
  // rgb转换成16进制颜色参数
  colorRGBtoHex = color => {
    var rgb = color.split(',')
    var r = parseInt(rgb[0].split('(')[1])
    var g = parseInt(rgb[1])
    var b = parseInt(rgb[2].split(')')[0])
    var hex = '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
    return hex
  }
  // 转换成表格需要导出的样式
  transformColor = (color, defaultColor) => {
    let alpha = 'FF'
    if (!color) return alpha + defaultColor
    let hexColor = ''
    if (color.indexOf('rgb') !== -1 || color.indexOf('rgba') !== -1) {
      hexColor = this.colorRGBtoHex(color)
    } else {
      hexColor = color
    }
    return alpha + hexColor.replace('#', '').toUpperCase()
  }
  // 设置表格样式
  setCellStyle = (celldata, sheet) => {
    celldata &&
      celldata.length &&
      celldata.forEach(cell => {
        let { r, c } = cell
        r = r + 1
        c = c + 1
        // fc 字体颜色 ff 字体 bg 背景颜色
        // bc_x 边框颜色 fs 字体大小 bl 粗体 it 斜体 cl 删除线 ul 下划线 bs 边框样式 vt 垂直对齐
        // ht 水平对齐 f 公式
        let {
          fc,
          ff,
          bg,
          fs = 12,
          bc_t,
          bc_b,
          bc_l,
          bc_r,
          bl = 0,
          it = 0,
          cl = 0,
          ul = 0,
          bs = 0,
          vt,
          ht,
          f
        } = cell
        const font = {
          name: isNaN(+ff) ? ff : '宋体',
          size: fs,
          // vertAlign: vt,
          color: { argb: this.transformColor(fc, '000000') },
          bold: bl === '1',
          italic: it === '1',
          underline: ul === '1',
          strike: cl === '1'
        }
        let fillColor = this.transformColor(bg, '000000')
        const fill = {
          type: 'pattern',
          pattern: bg && fillColor !== 'FFFFFFFF' ? 'solid' : 'none',
          fgColor: bg ? { argb: this.transformColor(bg, '000000') } : 'FF000000'
        }
        const border = {
          top: bc_t ? { style: 'thin', color: this.transformColor(bc_t) } : '',
          left: bc_l ? { style: 'thin', color: this.transformColor(bc_l) } : '',
          bottom: bc_b
            ? { style: 'thin', color: this.transformColor(bc_b) }
            : '',
          right: bc_r ? { style: 'thin', color: this.transformColor(bc_r) } : ''
        }
        const alignment = {
          vertical: vt === '0' ? 'middle' : vt === '1' ? 'top' : 'bottom',
          horizontal: ht === '0' ? 'center' : ht === '1' ? 'left' : 'right'
        }
        let cellName = this.convertToTitle(c) + r

        let sheetCell = sheet.getCell(cellName)
        sheetCell.font = font
        sheetCell.alignment = alignment
        sheetCell.fill = fill
        sheetCell.border = border
      })
  }
  // exportFile = async ()=>{
  //     // let msg = await this.loadMsg();
  //     // console.log(msg)
  //     //cell style

  //     var fills = {
  //         solid: {type: "pattern", pattern:"solid", fgColor:{argb:"FFFFAAAA"}}
  //     };

  //     //create a workbook
  //     var workbook =  new Excel.Workbook();

  //     //add header
  //     var ws1 = workbook.addWorksheet("测试一");
  //     ws1.addRow(["地址","地面"]);
  //     ws1.addRow(["总人口", "不可计数"]);
  //     ws1.addRow(["类型", "动物", "非动物"]);
  //     ws1.addRow(["统计日期", "1111-11-11 11:11:11"]);
  //     ws1.addRow();

  //     //A6:E6
  //     ws1.addRow(["你", "在", "说些", "神马", "呢？"]);
  //     ws1.getCell("A6").fill = fills.solid;
  //     ws1.getCell("B6").fill = fills.solid;
  //     ws1.getCell("C6").fill = fills.solid;
  //     ws1.getCell("D6").fill = fills.solid;
  //     ws1.getCell("E6").fill = fills.solid;

  //     //7 - 13(A7:A13) - 7
  //     ws1.addRow(["什么跟神马", 10, 1, "凡人修仙传", 7]);
  //     ws1.addRow(["","","","一号遗迹", 2]);
  //     ws1.addRow(["","","","六号遗迹", 0]);
  //     ws1.addRow(["","","","古国一号", 0]);
  //     ws1.addRow(["","","","锻体期", 0]);
  //     ws1.addRow(["","","","合体期", 0]);
  //     ws1.addRow(["","","","没资质", 1]);

  //     ws1.mergeCells("A7:A13")
  //     ws1.mergeCells("B7:B13")
  //     ws1.mergeCells("C7:C13")

  //     //a6-e13 a b c d e
  //     //ws1.getCell('A7').alignment = { vertical: 'middle', horizontal: 'center' };

  //     rowCenter(ws1, 6, 13);
  //     colWidth(ws1, [1,2,3,4,5], 20);

  //     var ws2 = workbook.addWorksheet("测试二");

  //     var ws3 = workbook.addWorksheet("测试三");

  //     //设置　start-end　行单元格水
  //     // 平垂直居中/添加边框
  //     function rowCenter(arg_ws, arg_start, arg_end) {
  //         for(let i = arg_start; i <= arg_end; i++) {
  //             arg_ws.findRow(i).alignment = { vertical: 'middle', horizontal: 'center' };
  //             //循环 row 中的　cell，给每个 cell添加边框
  //             arg_ws.findRow(i).eachCell(function (cell, index) {
  //                 cell.border = {
  //                     top: {style:'thin'},
  //                     left: {style:'thin'},
  //                     bottom: {style:'thin'},
  //                     right: {style:'thin'}
  //                 };
  //             })

  //         }
  //     }

  //     //设置　start-end 列的宽度
  //     function colWidth(arg_ws, arg_cols, arg_width) {
  //         for(let i in arg_cols) {
  //             arg_ws.getColumn(arg_cols[i]).width = arg_width;
  //         }
  //     }
  // }

  DownLoadFile = async workbook => {
    let { fileName = '在线表格' } = this.props
    let buffer = await workbook.xlsx.writeBuffer()
    let blob = new Blob([buffer])
    let url = window.URL.createObjectURL(blob)
    let a = document.createElement('a')
    a.download = fileName + '.xlsx'
    a.href = url
    a.click()
    a = null
  }

  render() {
    let { buttonClass } = this.props
    return (
      <span className={buttonClass} onClick={this.toTransfromData}>
        &#xe6dd;导出
      </span>
    )
  }
}
