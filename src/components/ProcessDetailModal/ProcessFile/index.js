import React, { Component } from 'react'
import indexStyles from './index.less'
import { isPaymentOrgUser } from '../../../utils/businessFunction'
import { connect } from 'dva'
import { message } from 'antd'
import ShowFileSlider from '../../../routes/Technological/components/Gantt/components/boardFile/ShowFileSlider'
import BoardsFilesArea from '../../../routes/Technological/components/Gantt/components/boardFile/BoardsFilesArea'
import { getGanttBoardsFiles } from '../../../services/technological/gantt'
import { isApiResponseOk } from '../../../utils/handleResponseData'
import { MESSAGE_DURATION_TIME } from '../../../globalset/js/constant'

@connect(mapStateToProps)
export default class index extends Component {
  constructor(props) {
    super(props)
    this.state = {
      siderRightWidth: 56, //右边栏宽度
      clientWidth: document.documentElement.clientWidth, //获取页面可见高度
      layoutClientWidth:
        document.getElementById('technologicalLayoutWrapper') &&
        document.getElementById('technologicalLayoutWrapper').clientWidth
    }
    this.resizeTTY = this.resizeTTY.bind(this)
  }

  getGanttBoardsFiles = board_id => {
    let _this = this
    getGanttBoardsFiles({
      board_id: board_id || '',
      query_board_ids: [],
      _organization_id: localStorage.getItem('OrganizationId') || '0'
    }).then(res => {
      if (isApiResponseOk(res)) {
        _this.props.dispatch({
          type: 'gantt/updateDatas',
          payload: {
            boards_flies: res.data
          }
        })
      } else {
        message.warn(res.message, MESSAGE_DURATION_TIME)
        if (res.code == 4041) {
          message.warn(res.message, MESSAGE_DURATION_TIME)
        }
      }
    })
  }

  handleAutoResize = props => {
    const { clientWidth } = this.state
    const { chatImVisiable } = props
    const technologicalLayoutWrapper = document.getElementById(
      'technologicalLayoutWrapper'
    )
    if (chatImVisiable) {
      let layoutClientWidth = technologicalLayoutWrapper
        ? technologicalLayoutWrapper.offsetWidth - 400
        : clientWidth - 450
      this.setState({
        layoutClientWidth
      })
    } else {
      let layoutClientWidth = technologicalLayoutWrapper
        ? technologicalLayoutWrapper.offsetWidth
        : clientWidth
      this.setState({
        layoutClientWidth
      })
    }
  }

  componentDidMount() {
    this.handleAutoResize(this.props)
    window.addEventListener('resize', this.resizeTTY)
    const {
      simplemodeCurrentProject: { board_id }
    } = this.props
    this.getGanttBoardsFiles(board_id == '0' ? '' : board_id)
  }

  resizeTTY = () => {
    const { chatImVisiable } = this.props
    const clientWidth = document.documentElement.clientWidth
    const layoutClientWidth = chatImVisiable
      ? document.getElementById('technologicalLayoutWrapper').clientWidth - 400
      : document.getElementById('technologicalLayoutWrapper').clientWidth
    this.setState({
      clientWidth,
      layoutClientWidth
    })
  }
  componentWillReceiveProps(nextProps) {
    this.handleAutoResize(nextProps)
    const {
      simplemodeCurrentProject: { board_id }
    } = nextProps
    const {
      simplemodeCurrentProject: { board_id: old_board_id }
    } = this.props
    if (board_id != old_board_id && board_id != '0') {
      this.getGanttBoardsFiles(board_id)
    }
  }

  componentWillUnmount() {
    this.props.dispatch({
      type: 'gantt/updateDatas',
      payload: {
        boards_flies: [],
        is_show_board_file_area: '0'
      }
    })
    window.removeEventListener('resize', this.resizeTTY)
  }

  render() {
    const { is_show_board_file_area } = this.props
    const { layoutClientWidth } = this.state
    return (
      <div>
        <div
          id="process_file_detail_container"
          className={indexStyles.process_file_detail_container}
          style={{
            width: layoutClientWidth,
            height:
              isPaymentOrgUser() && is_show_board_file_area != '1'
                ? '0px'
                : '272px'
          }}
        >
          {isPaymentOrgUser() && is_show_board_file_area != '1' && (
            <div style={{ position: 'relative', left: '22px' }}>
              <ShowFileSlider />
            </div>
          )}
          <BoardsFilesArea />
        </div>
      </div>
    )
  }
}

function mapStateToProps({
  gantt: {
    datas: { is_show_board_file_area }
  },
  simplemode: { simplemodeCurrentProject, chatImVisiable = false }
}) {
  return { is_show_board_file_area, simplemodeCurrentProject, chatImVisiable }
}
