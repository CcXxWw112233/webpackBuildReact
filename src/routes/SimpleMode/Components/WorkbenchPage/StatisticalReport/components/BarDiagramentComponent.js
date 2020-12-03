import React, { Component } from 'react'
import indexStyles from '../index.less'
import { connect } from 'dva'

// 引入 ECharts 主模块
import echarts from 'echarts'
// 引入柱状图
import 'echarts/lib/chart/bar'
// 引入提示框和标题组件
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/title'
import 'echarts/lib/component/legend'
import { getReportCardNumber } from '../../../../../../services/technological/statisticalReport'
import { isApiResponseOk } from '../../../../../../utils/handleResponseData'
import echartTheme from '../echartTheme.json'
@connect(mapStateToProps)
class BarDiagramentComponent extends Component {
  state = {
    noData: false
  }

  getChartOptions = props => {
    const { legend = [], users = [], series = [] } = props
    let newSeries = [...series]
    newSeries = newSeries.map(item => {
      // 将字符串data转换成number
      let data = item.data.map(chgStr => {
        let n = Number(chgStr)
        return n
      })
      let new_item = {
        ...item,
        type: 'bar',
        stack: '项目',
        label: {
          show: true,
          position: 'inside',
          formatter: function(params) {
            if (params.value > 0) {
              return params.value
            } else {
              return ''
            }
          }
        },
        data: data,
        barMaxWidth: newSeries.length <= 5 ? 30 : null
      }
      return new_item
    })
    let option = {
      tooltip: {
        trigger: 'item',
        axisPointer: {
          // 坐标轴指示器，坐标轴触发有效
          type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
        },
        extraCssText:
          'max-width:200px;max-height:200px;overflow:auto;white-space:pre-wrap;word-break:break-all;',
        enterable: true
        // position: function (pos, params, dom, rect, size) {
        //   // 鼠标在左侧时 tooltip 显示到右侧，鼠标在右侧时 tooltip 显示到左侧。
        //   // var obj = { top: 60 };
        //   // obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 5;
        //   return pos;
        // }
      },
      legend: {
        data: legend,
        type: 'scroll',
        left: 16,
        formatter: function(params) {
          //标签输出形式 ---请开始你的表演
          var index = 10
          var newstr = ''
          for (var i = 0; i < params.length; i += index) {
            var tmp = params.substring(i, i + index)
            newstr += tmp + '\n'
          }
          if (newstr.length > 20) return newstr.substring(0, 20) + '...'
          else return '\n' + newstr
        },
        triggerEvent: true,
        tooltip: {
          show: true,
          enterable: true
        },
        animation: true
        // formatter: function (params) {
        //   let tip1 = "";
        //   let tip = "";
        //   let le = params.length  //图例文本的长度
        //   if (le > 9) {   //几个字换行大于几就可以了
        //     let l = Math.ceil(le / 9)  //有些不能整除，会有余数，向上取整
        //     for (let i = 1; i <= l; i++) { //循环
        //       if (i < l) { //最后一段字符不能有\n
        //         tip1 += params.slice(i * 9 - 9, i * 9) + '\n'; //字符串拼接
        //       } else if (i === l) {  //最后一段字符不一定够9个
        //         tip = tip1 + params.slice((l - 1) * 9, le) //最后的拼接在最后
        //       }
        //     }
        //     return tip;
        //   } else {
        //     tip = params  //前面定义了tip为空，这里要重新赋值，不然会替换为空
        //     return tip;
        //   }
        // }
      },
      grid: {
        left: '5%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      dataZoom: [
        {
          type: 'slider',
          show: true,
          textStyle: null,
          yAxisIndex: [0],
          left: -2,
          bottom: 30,
          start: 0,
          end: 50 //初始化滚动条
        }
      ],
      xAxis: {
        type: 'value',
        axisLabel: {
          // formatter: '{value} (个)'
        },
        name: '(个)', //坐标名字
        nameLocation: 'end', //坐标位置，支持start,end，middle
        nameTextStyle: {
          //字体样式
          fontSize: 12, //字体大小
          padding: 5
        },
        nameGap: 5
      },
      yAxis: {
        type: 'category',
        data: users
        // axisLabel: true
      },
      series: newSeries
    }
    return option
  }

  getReportCardNumber = () => {
    echarts.registerTheme('walden', echartTheme)
    let myChart = echarts.init(
      document.getElementById('barDiagramContent'),
      'walden'
    )
    myChart.clear()
    myChart.showLoading({
      text: 'loading',
      color: '#5B8FF9',
      textColor: '#000',
      maskColor: 'rgba(255, 255, 255, 0.2)',
      zlevel: 0
    })
    getReportCardNumber().then(res => {
      if (isApiResponseOk(res)) {
        let flag = false
        let data = res.data
        if (data && data instanceof Object) {
          if (Object.keys(data).length) {
            flag = true
          }
        } else if (data instanceof Array) {
          if (data.length) {
            flag = true
          }
        }
        if (flag) {
          let option = this.getChartOptions(res.data)
          // option = newline(option, 3, 'xAxis')
          // 使用刚指定的配置项和数据显示图表。
          myChart.hideLoading()
          myChart.setOption(option)
        } else {
          this.setState({
            noData: true
          })
        }
        myChart.hideLoading()
      }
    })
  }

  resizeTTY = () => {
    echarts.registerTheme('walden', echartTheme)
    let myChart = echarts.init(
      document.getElementById('barDiagramContent'),
      'walden'
    )
    myChart.resize()
  }

  componentDidMount() {
    this.getReportCardNumber()
    window.addEventListener('resize', this.resizeTTY)
  }

  componentDidUpdate(prevProps, prevState) {
    const { chatImVisiable: prev_chatImVisiable } = prevProps
    const { chatImVisiable } = this.props
    if (chatImVisiable != prev_chatImVisiable) {
      this.resizeTTY()
    }
  }

  componentWillReceiveProps(nextProps) {
    const { board_id } = this.props.simplemodeCurrentProject
    const { board_id: next_board_id } = nextProps.simplemodeCurrentProject
    if (board_id != next_board_id) {
      this.getReportCardNumber()
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeTTY)
  }

  render() {
    return (
      <div style={{ position: 'relative' }}>
        <div
          id="barDiagramContent"
          style={{ width: '100%', height: 580, padding: '0px 2px' }}
        ></div>
        {this.state.noData && (
          <div className={indexStyles.chart_noData}>暂无数据</div>
        )}
      </div>
    )
  }
}

export default BarDiagramentComponent

function mapStateToProps({
  simplemode: { simplemodeCurrentProject = {}, chatImVisiable }
}) {
  return {
    simplemodeCurrentProject,
    chatImVisiable
  }
}
