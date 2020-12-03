import React, { Component } from 'react'
import { Menu, Dropdown, Input, Icon, Divider, message } from 'antd'
import { connect } from 'dva/index'
import styles from './index.less'
import { addMenbersInProject } from '../../../../services/technological/project'
import globalStyles from '@/globalset/css/globalClassName.less'
import {
  getOrgIdByBoardId,
  currentNounPlanFilterName
} from '../../../../utils/businessFunction'
import ShowAddMenberModal from '../../../../routes/Technological/components/Project/ShowAddMenberModal'
import { isApiResponseOk } from '../../../../utils/handleResponseData'
import { PROJECTS } from '../../../../globalset/js/constant'

class DropdownSelect extends Component {
  constructor(props) {
    super(props)
    this.state = {
      visible: false,
      addNew: false,
      inputValue: '',
      fuctionMenuItemList: this.props.fuctionMenuItemList,
      menuItemClick: this.props.menuItemClick,
      invite_board_id: '', //邀请加入的项目id
      show_add_menber_visible: false
    }
  }

  handleSeletedMenuItem = item => {}

  renderFunctionMenuItem = itemList => {
    return itemList.map((item, index) => (
      <Menu.Item
        key={item.id}
        style={{
          lineHeight: '30px',
          fontSize: '14px',
          fontWeight: '500',
          color: '#000000',
          boxShadow: 'none',
          borderRadius: '0',
          border: '0',
          borderRight: '0px!important'
        }}
      >
        <span style={{ color: '#1890FF' }}>
          <Icon type={item.icon} style={{ fontSize: '17px' }} />
          <span style={{ paddingLeft: '10px' }}>{item.name}</span>
        </span>
      </Menu.Item>
    ))
  }
  //添加项目成员操作-------
  boardInvitePartner = ({ board_id }, e) => {
    e.stopPropagation()
    this.setState(
      {
        invite_board_id: board_id
      },
      () => {
        this.setShowAddMenberModalVisibile()
      }
    )
  }
  setShowAddMenberModalVisibile = () => {
    this.setState({
      show_add_menber_visible: !this.state.show_add_menber_visible
    })
  }

  addMenbersInProject = values => {
    const { dispatch } = this.props
    const { board_id } = values
    addMenbersInProject({ ...values }).then(res => {
      if (isApiResponseOk(res)) {
        message.success('已成功添加项目成员')
        setTimeout(() => {
          this.handleAddMenberCalback({ board_id })
        }, 1000)
      } else {
        message.error(res.message)
      }
    })
  }
  handleAddMenberCalback = ({ board_id }) => {
    const { currentSelectedWorkbenchBox = {}, dispatch } = this.props
    const { code } = currentSelectedWorkbenchBox
    if ('board:plans' == code) {
      dispatch({
        type: 'gantt/getAboutUsersBoards',
        payload: {}
      })
    } else if ('board:chat' == code) {
      // dispatch({
      //     type: 'workbenchTaskDetail/projectDetailInfo',
      //     payload: {
      //         id: board_id
      //     }
      // })
    } else if ('board:files' == code) {
      // dispatch({
      //     type: 'projectDetail/getAboutUsersBoards',
      //     payload: {
      //         id: board_id
      //     }
      // })
    } else {
    }
  }
  //添加项目成员操作-------end

  renderMenuItem = itemList => {
    return itemList.map((item, index) => (
      <Menu.Item
        key={item.id}
        disabled={item.disabled || false}
        className={
          item.disabled === true
            ? styles.menuItemDisabled
            : styles.menuItemNormal
        }
      >
        <div style={{ display: 'flex' }}>
          <div style={{ flex: 1 }} className={globalStyles.global_ellipsis}>
            {item.name}
            {item.parentName && (
              <span className={styles.parentTitle}>#{item.parentName}</span>
            )}
          </div>
          {item.id != '0' && (
            <div
              onClick={e => this.boardInvitePartner({ board_id: item.id }, e)}
              style={{
                color: '#40A9FF',
                fontSize: 16,
                width: 32,
                marginLeft: 6,
                fontWeight: 'bold',
                textAlign: 'right',
                cursor: 'pointer'
              }}
            >
              <span className={globalStyles.authTheme}>&#xe685;</span>
            </div>
          )}
        </div>
      </Menu.Item>
    ))
  }

  componentWillReceiveProps() {
    const { itemList, fuctionMenuItemList } = this.props
    this.setState({
      itemList: itemList,
      fuctionMenuItemList: fuctionMenuItemList
    })
  }

  renderContent() {
    const { fuctionMenuItemList = [], menuItemClick = () => {} } = this.state
    const { itemList = [], selectedKeys = [] } = this.props
    return (
      <Menu
        className={styles.dropdownMenu}
        onClick={menuItemClick}
        selectedKeys={selectedKeys}
      >
        {this.renderFunctionMenuItem(fuctionMenuItemList)}
        {this.renderMenuItem(itemList)}
      </Menu>
    )
  }
  render() {
    const {
      simplemodeCurrentProject,
      iconVisible = true,
      dropdownStyle = {}
    } = this.props
    const { show_add_menber_visible, invite_board_id } = this.state
    return (
      <div className={styles.wrapper}>
        <Dropdown
          overlay={this.renderContent()}
          trigger={['click']}
          //visible={visible}
          //onVisibleChange={this.handleVisibleChange}
        >
          <div
            className={styles.titleClassName}
            style={{
              display: 'inline-block',
              maxWidth: '248px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {iconVisible && (
              <span>
                <i
                  className={`${globalStyles.authTheme}`}
                  style={{ color: 'rgba(255, 255, 255, 1)', fontSize: '20px' }}
                >
                  &#xe67d;
                </i>
                &nbsp; &nbsp;
              </span>
            )}
            <span style={{ fontWeight: '500', fontSize: '16px' }}>
              {simplemodeCurrentProject && simplemodeCurrentProject.board_id
                ? simplemodeCurrentProject.board_name
                : `我参与的${currentNounPlanFilterName(
                    PROJECTS,
                    this.props.currentNounPlan
                  )}`}
              <Icon type="down" style={{ fontSize: '12px' }} />
            </span>
          </div>
        </Dropdown>

        {show_add_menber_visible && (
          <ShowAddMenberModal
            invitationType="1"
            invitationId={invite_board_id}
            invitationOrg={getOrgIdByBoardId(invite_board_id)}
            show_wechat_invite={true}
            _organization_id={getOrgIdByBoardId(invite_board_id)}
            board_id={invite_board_id}
            addMenbersInProject={this.addMenbersInProject}
            modalVisible={show_add_menber_visible}
            setShowAddMenberModalVisibile={this.setShowAddMenberModalVisibile}
          />
        )}
      </div>
    )
  }
}

export default connect(
  ({
    simplemode: { currentSelectedWorkbenchBox = {} },
    organizationManager: {
      datas: { currentNounPlan }
    }
  }) => ({
    currentSelectedWorkbenchBox,
    currentNounPlan
  })
)(DropdownSelect)
