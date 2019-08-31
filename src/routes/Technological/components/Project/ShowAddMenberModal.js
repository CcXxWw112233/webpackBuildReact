import React from 'react'
import { Form, Input } from 'antd'
import { PROJECTS } from "../../../../globalset/js/constant";
import { currentNounPlanFilterName, getGlobalData } from "../../../../utils/businessFunction";
import CustormModal from '../../../../components/CustormModal'
import InviteOthers from './../InviteOthers/index'
import globalStyles from '@/globalset/css/globalClassName.less'
import WechatInviteToboard from './components/WechatInviteToboard'
class ShowAddMenberModal extends React.Component {

  state = {
    users: '',
    wechat_invite_visible: false,
  }

  usersChange(e) {
    this.setState({
      users: e.target.value
    })
  }
  onCancel = () => {
    this.props.setShowAddMenberModalVisibile()
  }
  // 提交表单
  handleSubmit = (usersStr) => {
    // e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        values['board_id'] = this.props.board_id
        values['users'] = usersStr
        this.props.setShowAddMenberModalVisibile()
        this.props.addMenbersInProject ? this.props.addMenbersInProject(values) : false
      }
    });
  }
  handleUsersToUsersStr = (users = []) => {
    return users.reduce((acc, curr) => {
      const isCurrentUserFromPlatform = () => curr.type === 'platform' && curr.id
      if (isCurrentUserFromPlatform()) {
        if (acc) {
          return acc + "," + curr.id
        }
        return curr.id
      } else {
        if (acc) {
          return acc + ',' + curr.user
        }
        return curr.user
      }
    }, '')
  }
  handleInviteMemberReturnResult = (selectedMember = []) => {
    this.handleSubmit(this.handleUsersToUsersStr(selectedMember))
  }

  setWechatInviteVisible = () => {
    const { wechat_invite_visible } = this.state
    this.setState({
      wechat_invite_visible: !wechat_invite_visible
    })
  }

  renderUsersList = () => {
    const { _organization_id, show_wechat_invite } = this.props
    const container = (
      <Form style={{ margin: '0 auto', width: 336 }}>
        <div style={{ fontSize: 20, color: '#595959', marginTop: 28, marginBottom: 28 }}>邀请他人一起参加{currentNounPlanFilterName(PROJECTS)}</div>
        <div>
          <InviteOthers isShowTitle={false} _organization_id={_organization_id || getGlobalData('aboutBoardOrganizationId')} submitText='邀请加入' handleInviteMemberReturnResult={this.handleInviteMemberReturnResult} isDisableSubmitWhenNoSelectItem={true}></InviteOthers>
        </div>
        {
          show_wechat_invite && (
            <div style={{ marginTop: -18, marginBottom: 16, color: '#1890FF', cursor: 'pointer' }} onClick={this.setWechatInviteVisible}>
              <i className={globalStyles.authTheme} style={{ color: '#46A318', marginRight: 4 }}>&#xe634;</i>
              通过微信连接邀请
            </div>
          )
        }
      </Form>
    )
    return container
  }

  render() {
    const { modalVisible, show_wechat_invite, board_id } = this.props;
    const { wechat_invite_visible } = this.state

    return (
      <div>
        <CustormModal
          visible={modalVisible}
          width={472}
          zIndex={1006}
          maskClosable={false}
          footer={null}
          destroyOnClose
          style={{ textAlign: 'center' }}
          onCancel={this.onCancel}
          overInner={this.renderUsersList()}
        >
        </CustormModal>
        {
          show_wechat_invite && (
            <WechatInviteToboard board_id={board_id} modalVisible={wechat_invite_visible} setModalVisibile={this.setWechatInviteVisible} />
          )
        }
      </div>
    )
  }
}
export default Form.create()(ShowAddMenberModal)

ShowAddMenberModal.defaultProps = {
  _organization_id: undefined, //传递进来的组织id
  board_id: '', //传递进来的项目id
  show_wechat_invite: false, //显示微信邀请
  addMenbersInProject: function () { //提交回调

  },
  setShowAddMenberModalVisibile: function () { }, //设置显示隐藏
} 