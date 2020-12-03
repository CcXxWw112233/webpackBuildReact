import React from 'react'
import { Modal, Form, Button, Input, message, Icon } from 'antd'
import DrawDetailInfo from './DrawDetailInfo'
import DetailMember from './DetailMember'
import { min_page_width } from '../../../../../globalset/js/styles'
import CustormModal from '../../../../../components/CustormModal'
import DrawDetailInfoStyle from './DrawDetailInfo.less'
import { currentNounPlanFilterName } from '@/utils/businessFunction'
import { PROJECTS } from '@/globalset/js/constant'
import { connect } from 'dva'
const FormItem = Form.Item
const TextArea = Input.TextArea

@connect(mapStateToProps)
class DetailInfoModal extends React.Component {
  state = {
    is_show_all_member: false // 是否显示全部成员, 默认为 false, 不显示
  }

  componentDidMount() {}

  componentWillReceiveProps(nextProps) {}

  onCancel() {
    // const { dispatch } = this.props
    // this.props.dispatch({
    //   type: 'projectDetail/updateDatas',
    //   payload: {
    //     projectDetailInfoData: {}
    //   }
    // })
    this.props.setProjectDetailInfoModalVisible &&
      this.props.setProjectDetailInfoModalVisible()
    this.setState({
      is_show_all_member: false
    })
  }

  // 切换头部的标题
  handleTriggetModalTitle = () => {
    this.setState({
      is_show_all_member: true
    })
  }

  // 点击返回按钮
  handleBack() {
    this.setState({
      is_show_all_member: false
    })
  }

  render() {
    const {
      modalVisible,
      invitationType,
      invitationId,
      projectDetailInfoData = []
    } = this.props
    const { is_show_all_member } = this.state
    const { board_id, board_name } = projectDetailInfoData
    return (
      <CustormModal
        title={
          is_show_all_member ? (
            <div
              style={{
                textAlign: 'center',
                fontSize: 16,
                fontWeight: 500,
                color: 'rgba(0,0,0,0.85)',
                display: 'flex'
              }}
            >
              <span>
                <Icon
                  onClick={() => {
                    this.handleBack()
                  }}
                  className={DrawDetailInfoStyle.back}
                  type="left"
                />
              </span>
              <span style={{ flex: '1' }}>全部成员</span>
            </div>
          ) : (
            <div
              style={{
                textAlign: 'center',
                fontSize: 16,
                fontWeight: 500,
                color: '#000',
                marginRight: '16px'
              }}
            >{`${board_name || ''}${currentNounPlanFilterName(
              PROJECTS
            )}信息`}</div>
          )
        }
        visible={modalVisible}
        width={614}
        zIndex={1006}
        maskClosable={false}
        footer={null}
        destroyOnClose
        onCancel={this.onCancel.bind(this)}
        overInner={
          is_show_all_member ? (
            <DetailMember
              invitationType={invitationType}
              invitationId={invitationId}
              is_show_all_member={is_show_all_member}
            />
          ) : (
            <DrawDetailInfo
              invitationType={invitationType}
              invitationId={invitationId}
              is_show_all_member={is_show_all_member}
              handleTriggetModalTitle={this.handleTriggetModalTitle}
            />
          )
        }
      />
    )
  }
}
export default Form.create()(DetailInfoModal)

//  建立一个从（外部的）state对象到（UI 组件的）props对象的映射关系
function mapStateToProps({
  projectDetail: {
    datas: { projectDetailInfoData = {} }
  }
}) {
  return {
    projectDetailInfoData
  }
}
