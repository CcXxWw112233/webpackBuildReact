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
  }
  // 托盘
  elseOperateMenuClick({ key }) {
    switch (key) {
      case '1':
        this.props.routingJump('/teamShow/teamList')
        break
      case '2':
        this.props.routingJump('/technological/newsDynamic')
        break
      case '3':
        this.props.routingJump('/technological/workbench')
        break
      case '4':
        this.props.routingJump('/technological/project')
        break
      default:
        break
    }
  }
  render() {
    const {
      datas: { teamShowTypeList = [], teamShowTypeId }
    } = this.props.model
    const elseOperateMenu = (
      <Card className={indexStyle.menuDiv} style={{ margin: 0 }}>
        <div
          className={indexStyle.triangle}
          style={{ left: '50%', marginLeft: -8 }}
        ></div>
        <Menu onClick={this.elseOperateMenuClick.bind(this)} selectable={false}>
          {window.location.hash.indexOf('/teamShow/teamList') !== -1 ? (
            ''
          ) : (
            <Menu.Item key="1" style={{ padding: 0, margin: 0 }}>
              <div className={indexStyle.itemDiv}>
                <span className={indexStyle.specificalItem}>
                  <span className={indexStyle.specificalItemText}>
                    团队展示
                  </span>
                </span>
              </div>
            </Menu.Item>
          )}
          <Menu.Item key="2" style={{ padding: 0, margin: 0 }}>
            <div className={indexStyle.itemDiv}>
              <span className={indexStyle.specificalItem}>
                <span className={indexStyle.specificalItemText}>动态</span>
              </span>
            </div>
          </Menu.Item>
          <Menu.Item key="3" style={{ padding: 0, margin: 0 }}>
            <div className={indexStyle.itemDiv}>
              <span className={indexStyle.specificalItem}>
                <span className={indexStyle.specificalItemText}>工作台</span>
              </span>
            </div>
          </Menu.Item>
          <Menu.Item key="4" style={{ padding: 0, margin: 0 }}>
            <div className={indexStyle.itemDiv}>
              <span className={indexStyle.specificalItem}>
                <span className={indexStyle.specificalItemText}>项目</span>
              </span>
            </div>
          </Menu.Item>
        </Menu>
      </Card>
    )
    return (
      <div>
        <div className={indexStyle.out}>
          <div className={indexStyle.out_left}>
            <div className={indexStyle.out_left_left}></div>
            <div className={indexStyle.out_left_right}>
              <div>团队展示</div>
              <div></div>
              {/*{teamShowTypeList.map((value, key) => {*/}
              {/*const {name, id} = value*/}
              {/*return(*/}
              {/*<div onClick={this.queryTeamListWithType.bind(this,id)} key={id} style={{color: teamShowTypeId === id? '#1890FF': '#595959'}}>{name}</div>*/}
              {/*)*/}
              {/*})}*/}
              {/*<div onClick={this.queryTeamListWithType.bind(this,null)} style={{color: !teamShowTypeId? '#1890FF': '#595959'}}>全部</div>*/}
              <Dropdown overlay={elseOperateMenu} placement={'bottomCenter'}>
                <div style={{ marginLeft: 30 }}>
                  <Icon
                    type="appstore"
                    style={{
                      display: 'inline-block',
                      marginTop: 6,
                      fontSize: 16,
                      color: '#262626'
                    }}
                  />
                </div>
              </Dropdown>
            </div>
          </div>
          <div className={indexStyle.out_right}></div>
        </div>
        {/*<CreateOrganizationModal {...this.props} createOrganizationVisable={this.state.createOrganizationVisable} setCreateOrgnizationOModalVisable={this.setCreateOrgnizationOModalVisable.bind(this)}/>*/}
      </div>
    )
  }
}
