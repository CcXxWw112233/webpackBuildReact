import React from 'react'
import {
  Layout,
  Popover,
  Select,
  Input,
  Mention,
  Button,
  message,
  Modal
} from 'antd'
import indexStyles from './index.less'
import glabalStyles from '../../../globalset/css/globalClassName.less'
import { connect } from 'dva'
import Cookies from 'js-cookie'
import classNames from 'classnames/bind'
// import GroupChat from './comonent/GroupChat'
// import InitialChat from './comonent/InitialChat'
import VideoMeetingPopoverContent from './comonent/videoMeetingPopoverContent/index'
import LingxiIm, { Im, lx_utils } from 'lingxi-im'
let cx = classNames.bind(indexStyles)

const { Sider } = Layout
const Option = Select.Option
const { TextArea } = Input
const { getMentions, toString, toContentState } = Mention
const Nav = Mention.Nav

@connect(
  ({
    technological: {
      userInfo = {},
      datas: { OrganizationId }
    },
    publicTaskDetailModal: { card_id, drawerVisible },
    publicFileDetailModal: { filePreviewCurrentFileId, isInOpenFile },
    publicProcessDetailModal: { processInfo = {} }
  }) => {
    return {
      userInfo,
      OrganizationId,
      card_id,
      drawerVisible,
      filePreviewCurrentFileId,
      isInOpenFile,
      processInfo
    }
  }
)
class SiderRight extends React.Component {
  state = {
    collapsed: true
  }

  componentWillReceiveProps(nextProps) {
    const { OrganizationId: nextOrg } = nextProps
    const { OrganizationId: lastOrg } = this.props
    if (nextOrg != lastOrg) {
      const filterId = nextOrg == '0' ? '' : nextOrg
      lx_utils.filterUserList(filterId)
    }
  }

  componentDidMount() {
    this.imInitOption()
  }

  imInitOption = () => {
    LingxiIm.hide()

    // 设置组织id过滤
    const { OrganizationId } = this.props
    const filterId = OrganizationId == '0' ? '' : OrganizationId
    lx_utils.filterUserList(filterId)

    const { protocol, host } = window.location
    Im.option({
      baseUrl: `${protocol}//${host}/`
      // APPKEY: "18268e20ae05c4ac49e4c23644aa38c8"
    })
    const clickDynamicFunc = data => {
      setTimeout(() => this.imClickDynamic(data), 100)
    }
    const visibleFunc = visible => {
      this.handleImToggle(visible)
    }
    const { dispatch } = this.props
    if (Im) {
      Im.on('visible', visibleFunc)
      Im.on('clickDynamic', clickDynamicFunc)
      Im.on('hasNewImMsg', ({ data, unread }) => {
        //最新一条未读消息推送过来
        if (!data.hasOwnProperty('action')) {
          //首次进入不处理
          // console.log('ssss_初始化首次', unread)
          dispatch({
            type: 'imCooperation/getImUnReadAllMessages',
            payload: {
              messages: unread
            }
          })
          return
        }
        dispatch({
          type: 'imCooperation/listenImUnReadLatestMessage',
          payload: {
            message_item: data
          }
        })
        // console.log('ssss_最新未读', data)
      })
      Im.on('readImMsg', data => {
        //最新已读消息推送过来
        dispatch({
          type: 'imCooperation/listenImLatestAreadyReadMessages',
          payload: {
            messages: data
          }
        })
        // console.log('ssss_最新已读', data)
      })
      Im.on('fileCancel', ({ id }) => {
        if (id == this.props.card_id) {
          dispatch({
            type: 'publicTaskDetailModal/updateDatas',
            payload: {
              drawerVisible: false,
              drawContent: {},
              card_id: '',
              boardTagList: []
            }
          })
        }
        if (id == this.props.filePreviewCurrentFileId) {
          dispatch({
            type: 'publicFileDetailModal/updateDatas',
            payload: {
              filePreviewCurrentFileId: '',
              fileType: '',
              isInOpenFile: false,
              filePreviewCurrentName: ''
            }
          })
        }
        if (id == this.props.processInfo.id) {
          dispatch({
            type: 'publicProcessDetailModal/updateDatas',
            payload: {
              processPageFlagStep: '1', //"1""2""3""4"分别对应新建，编辑，启动，详情界面,默认1
              templateInfo: {}, //所选择的流程模板的信息数据
              processInfo: {}, //所选中的流程的信息
              currentProcessInstanceId: '', // 当前查看的流程实例名称
              currentTempleteIdentifyId: '', // 当前查看的模板编号凭证ID
              currentFlowTabsStatus: '1',
              process_detail_modal_visible: false,
              processDoingList: [], // 进行中的流程
              processStopedList: [], // 已中止的流程
              processComepletedList: [], // 已完成的流程
              processNotBeginningList: [], // 未开始的流程
              processEditDatas: [],
              not_show_create_node_guide: '1',
              not_show_create_form_guide: '1'
            }
          })
        }
      })
    }
  }

  onCollapse(bool) {
    this.setState({
      collapsed: bool
    })
  }

  setCollapsed() {
    this.setState({
      collapsed: !this.state.collapsed
    })
    this.props.dispatch({
      type: 'technological/updateDatas',
      payload: {
        siderRightCollapsed: this.state.collapsed
      }
    })
  }

  handleImToggle = toggle => {
    this.props.dispatch({
      type: 'technological/updateDatas',
      payload: {
        siderRightCollapsed: toggle
      }
    })
  }
  // 圈子点击
  imClickDynamic = (data = {}) => {
    const { dispatch } = this.props
    const { orgId, boardId, type, relaDataId, cardId, relaDataName } = data
    let else_params = ''
    switch (type) {
      case 'board':
        break
      case 'folder':
        break
      case 'file':
        else_params = `&appsSelectKey=4&file_id=${relaDataId}&file_name=${relaDataName}`
        break
      case 'card':
        else_params = `&appsSelectKey=3&card_id=${cardId}`
        break
      case 'flow':
        else_params = `&appsSelectKey=2&flow_id=${relaDataId}`
        break
      default:
        break
    }
    dispatch({
      type: 'projectDetailFile/updateDatas',
      payload: {
        isInOpenFile: false
      }
    })
    dispatch({
      type: 'technological/routingReplace',
      payload: {
        route: `/technological/projectDetail?board_id=${boardId}${else_params}`
      }
    })
  }
  render() {
    // const {
    //   collapsed,
    // } = this.state;
    // const ImMaskWhencollapsed = cx({
    //   [indexStyles.ImMaskCollapsed]: collapsed,
    //   [indexStyles.ImMaskExpand]: !collapsed
    // });

    const {
      userInfo: { user_set = {} }
    } = this.props
    const { is_simple_model } = user_set

    return (
      <div
        style={{
          flex: 'none',
          paddingBottom: '50px',
          position: 'relative',
          backgroundColor: '#fff',
          zIndex: '1010'
        }}
      >
        <LingxiIm token={Cookies.get('Authorization')} width="400px" />
        <div
          className={indexStyles.videoMeetingWapper}
          style={{ position: 'absolute', bottom: '10px' }}
        >
          <VideoMeetingPopoverContent />
        </div>
      </div>

      // <div id={"siderRight"} className={indexStyles.siderRight}>
      //   <Sider
      //     collapsible
      //     onCollapse={this.onCollapse.bind(this)}
      //     className={indexStyles.siderRight}
      //     defaultCollapsed={true}
      //     collapsed={collapsed}
      //     trigger={null}
      //     collapsedWidth={56}
      //     width={300}
      //     theme={"light"}
      //   >
      //     <div
      //       className={indexStyles.siderRightInner}
      //       style={{ width: collapsed ? 56 : 300 }}>
      //       <div
      //         className={indexStyles.handleBar}
      //         onClick={this.setCollapsed.bind(this)}
      //       >
      //         <p className={collapsed ? "" : indexStyles.rotate180} />
      //       </div>
      //       <div
      //         className={indexStyles.contain_1}
      //         onClick={this.setCollapsed.bind(this)}
      //       >
      //         <div className={`${glabalStyles.authTheme} ${indexStyles.left}`}>
      //           &#xe795;
      //         </div>
      //         <div className={indexStyles.right}>通知</div>
      //       </div>
      //       <div
      //         style={{
      //           height: document.documentElement.clientHeight - 58,
      //           padding: "20px 12px",
      //           paddingBottom: "40px",
      //           position: "relative"
      //         }}
      //         onClick={this.setCollapsed.bind(this)}
      //       >
      //         <div
      //           style={{ height: document.documentElement.clientHeight - 108 }}
      //           className={ImMaskWhencollapsed}
      //         />
      //         {NODE_ENV != 'development' && (
      //           <iframe
      //           title="im"
      //           src={IM_HTTP_PATH}
      //           frameBorder="0"
      //           width="100%"
      //           height="100%"
      //           id={"iframImCircle"}/>

      //         ) }

      //       </div>
      //       <div className={indexStyles.videoMeetingWapper}>
      //         <VideoMeetingPopoverContent />
      //       </div>
      //       {/* <Popover
      //         visible={videoMeetingPopoverVisible}
      //         placement="leftBottom"
      //         content={videoMeetingPopoverContent}
      //         onVisibleChange={this.handleVideoMeetingPopoverVisibleChange}
      //         trigger="click"
      //       >
      //         <div
      //           className={indexStyles.videoMeeting__icon}
      //           onMouseEnter={this.handleShowVideoMeeting}
      //           onClick={this.handleToggleVideoMeetingPopover}
      //         />
      //       </Popover> */}
      //       {/*<div className={indexStyles.contain_2} style={{display:collapsed?'none':'flex'}}>*/}
      //       {/*<div className={`${glabalStyles.authTheme} ${indexStyles.left}`}>*/}
      //       {/*&#xe710;*/}
      //       {/*</div>*/}
      //       {/*<div className={indexStyles.right}>*/}
      //       {/*<input className={indexStyles.input} placeholder={'查找团队成员或项目'} />*/}
      //       {/*</div>*/}
      //       {/*</div>*/}
      //       {/*<div className={`${indexStyles.contain_3}`} style={{display: collapsed?'block': 'none'}}>*/}
      //       {/*{data.map((value, key) => {*/}
      //       {/*return (*/}
      //       {/*<div key={key}>*/}
      //       {/*<InitialChat itemValue={value} />*/}
      //       {/*</div>*/}
      //       {/*)*/}
      //       {/*})}*/}
      //       {/*</div>*/}
      //       {/*<div className={`${indexStyles.contain_3}`} style={{display: !collapsed?'block': 'none'}}>*/}
      //       {/*{data.map((value, key) => {*/}
      //       {/*return (*/}
      //       {/*<div key={key}>*/}
      //       {/*<GroupChat collapsed={collapsed} itemValue={value} />*/}
      //       {/*</div>*/}
      //       {/*)*/}
      //       {/*})}*/}
      //       {/*</div>*/}
      //     </div>
      //   </Sider>
      // </div>
    )
  }
}

export default SiderRight
