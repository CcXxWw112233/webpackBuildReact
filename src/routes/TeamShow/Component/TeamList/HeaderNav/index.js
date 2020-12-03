import React from 'react'
import indexStyle from './index.less'
import { Link } from 'dva/router'
import {
  Input,
  Icon,
  Menu,
  Dropdown,
  Tooltip,
  Tabs,
  Card,
  Modal,
  Button,
  message
} from 'antd'
import Cookies from 'js-cookie'

const TabPane = Tabs.TabPane
const SubMenu = Menu.SubMenu
export default class HeaderNav extends React.Component {
  constructor(props) {
    super(props)
  }
  state = {
    menuVisible: false,
    createOrganizationVisable: false,
    ShowAddMenberModalVisibile: false
  }
  setShowAddMenberModalVisibile() {
    this.setState({
      ShowAddMenberModalVisibile: !this.state.ShowAddMenberModalVisibile
    })
  }
  addMembers(data) {
    const { users } = data
    const { datas = {} } = this.props.model
    const { currentSelectOrganize = {} } = datas
    const { id } = currentSelectOrganize
    this.props.inviteJoinOrganization({
      members: users
      // org_id: id
    })
  }
  queryTeamListWithType(id) {
    this.props.updateDatas({
      teamShowTypeId: id
    })
    // const url = id ? `/teamShow/teamList?teamShowTypeId=${id}` : `/teamShow/teamList`
    // this.props.routingJump(url)
  }
  render() {
    const {
      datas: { teamShowTypeList = [], teamShowTypeId }
    } = this.props.model
    return (
      <div>
        <div className={indexStyle.out}>
          <div className={indexStyle.out_left}>
            <div className={indexStyle.out_left_left}></div>
            <div className={indexStyle.out_left_right}>
              <div>团队展示</div>
              <div></div>
              {teamShowTypeList.map((value, key) => {
                const { name, id } = value
                return (
                  <div
                    onClick={this.queryTeamListWithType.bind(this, id)}
                    key={id}
                    style={{
                      color: teamShowTypeId === id ? '#1890FF' : '#595959'
                    }}
                  >
                    {name}
                  </div>
                )
              })}
              <div
                onClick={this.queryTeamListWithType.bind(this, null)}
                style={{ color: !teamShowTypeId ? '#1890FF' : '#595959' }}
              >
                全部
              </div>
              <div style={{ marginLeft: 30 }}>
                <Icon
                  type="appstore"
                  style={{ display: 'inline-block', marginTop: 6 }}
                />
              </div>
            </div>
          </div>
          <div className={indexStyle.out_right}></div>
        </div>
        {/*<CreateOrganizationModal {...this.props} createOrganizationVisable={this.state.createOrganizationVisable} setCreateOrgnizationOModalVisable={this.setCreateOrgnizationOModalVisable.bind(this)}/>*/}
      </div>
    )
  }
}
