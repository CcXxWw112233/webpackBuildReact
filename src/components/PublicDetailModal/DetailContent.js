import React from 'react'
import indexStyles from './index.less'
import CommentSubmit from './Comment/CommentSubmit'
import CommentLists from './Comment/CommentLists'
import globalStyles from '../../globalset/css/globalClassName.less'

export default class DetailContent extends React.Component {
  state = {
    isShowAllDynamic: false, //是否查看全部
  }

  constructor() {
    super();
    this.relative_content_ref = React.createRef()
  }

  componentWillMount() {

  }

  componentDidMount() {
  }

  componentWillReceiveProps(nextProps) {
    const rects = []
  }
  setIsShowAll = () => {
    this.setState({
      isShowAllDynamic: !this.state.isShowAllDynamic
    })
  }
  render() {
    const { clientHeight, offsetTopDeviation, isExpandFrame, board_id, currentProcessInstanceId, } =this.props
    const { isShowAllDynamic } = this.state
    const {
      mainContent = <div></div>, //主区域
      viceAreaTopShow = false, //副区域的关联内容能否显示
      viceAreaTopContent = <div></div>, //副区域顶部内容块
      commentSubmitContent = '', //评论提交区域区块
      commentListsContent = '', //评论列表区块
      dynamicsContent = '', //动态列表区块
      commentUseParams = {}, //评论所需要参数
    } = this.props


    return (
      <div className={indexStyles.fileDetailContentOut} ref={'fileDetailContentOut'} style={{height: clientHeight- offsetTopDeviation - 60}}>
        <div className={indexStyles.fileDetailContentLeft} style={{overflowY: 'auto'}}>
          {/*主要内容放置区*/}
          {mainContent}
        </div>

        <div className={indexStyles.fileDetailContentRight} style={{width: isExpandFrame?0:420}}>

          {
            viceAreaTopShow && (
              <div className={indexStyles.fileDetailContentRight_top} ref={this.relative_content_ref}>
                {/*关联内容放置区*/}
                {viceAreaTopContent}
              </div>
            )
          }


          <div className={indexStyles.fileDetailContentRight_middle} style={{height: clientHeight - offsetTopDeviation - 60 - 70 - (this.relative_content_ref?this.relative_content_ref.clientHeight : 0)}}>

            <div
              className={indexStyles.lookAll}
              onClick={this.setIsShowAll.bind(this)}>
              {!isShowAllDynamic? '所有动态': '部分动态'}
              {isShowAllDynamic?(
                <i className={`${globalStyles.authTheme} ${indexStyles.lookAll_logo}`}>&#xe7ee;</i>
              ):(
                <i className={`${globalStyles.authTheme}  ${indexStyles.lookAll_logo}`}>&#xe7ed;</i>
              )}

            </div>
            {/*动态放置区*/}
            <div style={{fontSize: '12px', color: '#595959'}}>
              <div>
                {dynamicsContent}
              </div>
            </div>
            {/*评论放置区*/}
            <div className={indexStyles.fileDetailContentRight_middle} style={{height: clientHeight - offsetTopDeviation - 60 - 70}}>
              {commentListsContent || (
                <CommentLists commentUseParams={commentUseParams} isShowAllDynamic={isShowAllDynamic}/>
              )}
            </div>
          </div>
          <div className={indexStyles.fileDetailContentRight_bott}>
            {commentSubmitContent || <CommentSubmit commentUseParams={commentUseParams}/>}
          </div>

        </div>

      </div>
    )
  }
}
