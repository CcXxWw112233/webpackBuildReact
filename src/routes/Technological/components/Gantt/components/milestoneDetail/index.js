import React from 'react'
import PublicDetailModal from '../../../../../../components/PublicDetailModal'
import MainContent from './MainContent'
import { connect } from 'dva'
import HeaderContent from './HeaderContent'
import { isApiResponseOk } from '../../../../../../utils/handleResponseData'
@connect(mapStateToProps)
export default class GanttDetail extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      milestone_id_local: ''
    }
  }

  componentDidMount() {
    this.getMilestoneDetail(this.props)
  }

  componentWillReceiveProps(nextProps) {
    if (
      this.props.milestone_id == nextProps.milestone_id ||
      this.props.miletone_detail_modal_visible ==
        nextProps.miletone_detail_modal_visible
    )
      return
    if (!nextProps.milestone_id) return
    // console.log({
    //   this: this.props.milestone_id,
    //   next: nextProps.milestone_id,
    //   state: this.state.milestone_id_local
    // });
    this.getMilestoneDetail(nextProps)
  }

  //获取里程碑详情
  getMilestoneDetail = props => {
    const { dispatch, milestone_id, miletone_detail_modal_visible } = props
    const { milestone_id_local } = this.state
    if (!miletone_detail_modal_visible) return
    if (!milestone_id || milestone_id_local == milestone_id) {
      return
    }
    dispatch({
      type: 'milestoneDetail/getMilestoneDetail',
      payload: {
        id: milestone_id
      }
    }).then((res = {}) => {
      if (isApiResponseOk(res)) {
        const { board_id } = res
        dispatch({
          type: 'projectDetail/projectDetailInfo',
          payload: {
            id: board_id
          }
        })
        this.setState({
          milestone_id_local: milestone_id
        })
      }
    })
  }

  onCancel = () => {
    const { dispatch } = this.props
    this.setState({
      milestone_id_local: ''
    })
    dispatch({
      type: 'milestoneDetail/updateDatas',
      payload: {
        milestone_detail: {},
        milestone_id: ''
      }
    })
    this.props.set_miletone_detail_modal_visible &&
      this.props.set_miletone_detail_modal_visible()
  }

  //评论
  commentSubmitPost = data => {
    // console.log(data, 'ssssss')
    let { text } = data
    const { dispatch, milestone_id, isShowAllDynamic } = this.props
    if (text) {
      text = text.replace(/\r|\n/gim, '')
    }
    if (!text) {
      return
    }
    dispatch({
      type: 'publicModalComment/submitPublicModalDetailComment',
      payload: {
        origin_type: '4',
        comment: text,
        id: milestone_id,
        flag: isShowAllDynamic ? '0' : '1'
      }
    })
  }
  deleteComment = data => {
    const { id } = data
    const { dispatch, milestone_id, isShowAllDynamic } = this.props
    dispatch({
      type: 'publicModalComment/deletePublicModalDetailComment',
      payload: {
        id,
        common_id: milestone_id,
        flag: isShowAllDynamic ? '0' : '1'
      }
    })
  }
  render() {
    const {
      miletone_detail_modal_visible,
      milestone_id,
      handleMiletonesChange,
      deleteMiletone,
      deleteRelationContent
    } = this.props
    const { users } = this.props
    const commentUseParams = {
      //公共评论模块所需要的参数
      commentSubmitPost: this.commentSubmitPost,
      deleteComment: this.deleteComment,
      content_detail_use_id: milestone_id,
      origin_type: '4' //	string评论来源类型 1=任务 2=流程 3=文件 4=里程碑
      // flag: '1', //0或不传：评论和动态，1只显示评论，2只动态
    }
    return (
      <div>
        <PublicDetailModal
          modalVisible={miletone_detail_modal_visible}
          onCancel={this.onCancel}
          commentUseParams={commentUseParams}
          mainContent={
            <MainContent
              users={users}
              handleMiletonesChange={handleMiletonesChange}
              deleteRelationContent={deleteRelationContent}
            />
          }
          headerContent={
            <HeaderContent
              onCancel={this.onCancel}
              deleteMiletone={deleteMiletone}
              users={users}
            />
          }
        />
      </div>
    )
  }
}
GanttDetail.defaultProps = {
  set_miletone_detail_modal_visible: false, // 里程碑详情是否显示
  set_miletone_detail_modal_visible: function() {}, //设置里程碑详情弹窗是否显示
  milestone_id: '', //里程碑id
  users: [], //用户列表
  handleMiletonesChange: function() {},
  deleteRelationContent: function() {} //删除关联内容
}
//  建立一个从（外部的）state对象到（UI 组件的）props对象的映射关系
function mapStateToProps({
  milestoneDetail: { milestone_id },
  publicModalComment: { isShowAllDynamic }
}) {
  return { milestone_id, isShowAllDynamic }
}
