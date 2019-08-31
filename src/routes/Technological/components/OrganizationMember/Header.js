import React from 'react'
import indexStyle from './index.less'
import { Icon, Menu, Dropdown, Tooltip } from 'antd'
import ShowAddMenberModal from './ShowAddMenberModal'
import Cookies from 'js-cookie'
import {
  ORGANIZATION, TASKS, FLOWS, DASHBOARD, PROJECTS, NOT_HAS_PERMISION_COMFIRN, MEMBERS, CATCH_UP, ORG_UPMS_ORGANIZATION_MEMBER_ADD,
  ORG_TEAM_BOARD_QUERY, MESSAGE_DURATION_TIME
} from "../../../../globalset/js/constant";
import {checkIsHasPermission, currentNounPlanFilterName} from "../../../../utils/businessFunction";
import {message} from "antd/lib/index";

export default class Header extends React.Component {
  state = {
    ShowAddMenberModalVisibile: false,
  };
  addMembers(data) {
    const { users } = data
    this.props.inviteJoinOrganization({
      members: users,
      // org_id: Cookies.get('org_id')
    })
  }
  setShowAddMenberModalVisibile() {
    if(!checkIsHasPermission(ORG_UPMS_ORGANIZATION_MEMBER_ADD)){
      message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
      return false
    }
    this.setState({
      ShowAddMenberModalVisibile: !this.state.ShowAddMenberModalVisibile
    })
  }

  render() {
    const { datas: { member_count = 0}} = this.props.model
    const menu = () => (
      <Menu>
        <Menu.Item key={'1'}>
          全部{currentNounPlanFilterName(MEMBERS)}
        </Menu.Item>
        <Menu.Item key={'2'} disabled>
          {/*<Tooltip placement="top" title={'即将上线'}>*/}
            管理层
          {/*</Tooltip>*/}
        </Menu.Item>
        <Menu.Item key={'3'} disabled>
          {/*<Tooltip placement="top" title={'即将上线'}>*/}
          停用的{currentNounPlanFilterName(MEMBERS)}
          {/*</Tooltip>*/}
        </Menu.Item>
      </Menu>
    );
    const menu_2 = (
      <Menu>
        <Menu.Item key={'1'}>
          按项目排序
        </Menu.Item>
        <Menu.Item key={'2'} disabled>
          <Tooltip placement="top" title={'即将上线'}>
            按起止时间排序
          </Tooltip>
        </Menu.Item>
        <Menu.Item key={'3'} disabled>
          <Tooltip placement="top" title={'即将上线'}>
            按状态排序
          </Tooltip>
        </Menu.Item>
        <Menu.Item key={'4'} disabled>
          <Tooltip placement="top" title={'即将上线'}>
            手动排序
          </Tooltip>
        </Menu.Item>
      </Menu>
    );
    return (
      <div>
      <div className={indexStyle.headerOut}>
        <div className={indexStyle.left}>
          <div>全部{currentNounPlanFilterName(MEMBERS)} · {member_count}</div>
          <Dropdown overlay={menu()}>
             <div><Icon type="down" style={{fontSize: 14, color: '#595959'}}/></div>
          </Dropdown>
        </div>

        <div className={indexStyle.right}>
          {checkIsHasPermission(ORG_UPMS_ORGANIZATION_MEMBER_ADD) && (
            <div style={{marginRight: 12}} onClick={this.setShowAddMenberModalVisibile.bind(this)}>添加{currentNounPlanFilterName(MEMBERS)}</div>
          )}
          {/*<Tooltip title={'该功能尚未上线，敬请期待！'}>*/}
            {/*<div>批量导入{currentNounPlanFilterName(MEMBERS)}</div>*/}
          {/*</Tooltip>*/}
          <Icon type="appstore-o" style={{fontSize: 14, marginTop: 18, marginLeft: 16, color: '#e5e5e5'}}/>
        </div>
      </div>
        <ShowAddMenberModal {...this.props} addMembers={this.addMembers.bind(this)} modalVisible={this.state.ShowAddMenberModalVisibile} setShowAddMenberModalVisibile={this.setShowAddMenberModalVisibile.bind(this)}/>

      </div>
    )
  }
}
