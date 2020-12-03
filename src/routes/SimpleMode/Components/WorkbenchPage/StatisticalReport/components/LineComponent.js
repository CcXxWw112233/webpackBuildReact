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
import { getReportBoardGrowth } from '../../../../../../services/technological/statisticalReport'
import { isApiResponseOk } from '../../../../../../utils/handleResponseData'
import echartTheme from '../echartTheme.json'
@connect(mapStateToProps)
class LineComponent extends Component {
  state = {
    noData: false
  }

  getChartOptions = props => {
    const { time = [], number = [] } = props
    let option = {
      tooltip: {
        data: 'value',
        trigger: 'axis',
        axisPointer: {
          // 坐标轴指示器，坐标轴触发有效
          type: 'line' // 默认为直线，可选为：'line' | 'shadow'
        }
      },
      xAxis: {
        type: 'category',
        data: time,
        axisTick: {
          alignWithLabel: true,
          interval: 0
        }
      },
      yAxis: {
        type: 'value',
        name: '(个)', //坐标名字
        nameLocation: 'end', //坐标位置，支持start,end，middle
        nameTextStyle: {
          //字体样式
          fontSize: 12 //字体大小
        },
        nameGap: 5
      },
      series: [
        {
          data: number,
          type: 'line'
        }
      ],
      dataZoom:
        time.length > 6
          ? [
              {
                type: 'slider',
                show: true, //flase直接隐藏图形
                xAxisIndex: [0],
                left: '9%', //滚动条靠左侧的百分比
                bottom: -2,
                start: 50, //滚动条的起始位置
                end: 100 //滚动条的截止位置（按比例分割你的柱状图x轴长度）
              }
            ]
          : null
    }
    return option
  }

  getReportBoardGrowth = () => {
    echarts.registerTheme('walden', echartTheme)
    let myChart = echarts.init(
      document.getElementById('lineComponent'),
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
    getReportBoardGrowth().then(res => {
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
      document.getElementById('lineComponent'),
      'walden'
    )
    myChart.resize()
  }

  componentDidMount() {
    this.getReportBoardGrowth()
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
      this.getReportBoardGrowth()
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeTTY)
  }

  render() {
    return (
      <div style={{ position: 'relative' }}>
        <div
          id="lineComponent"
          style={{ width: '100%', height: 580, padding: '0px 2px' }}
        ></div>
        {this.state.noData && (
          <div className={indexStyles.chart_noData}>暂无数据</div>
        )}
      </div>
    )
  }
}

export default LineComponent

function mapStateToProps({
  simplemode: { simplemodeCurrentProject = {}, chatImVisiable }
}) {
  return {
    simplemodeCurrentProject,
    chatImVisiable
  }
}
