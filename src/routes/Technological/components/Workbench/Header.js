import React from "react";
import indexStyle from "./index.less";
import { Icon, Menu, Dropdown, Tooltip } from "antd";
import { PROJECTS } from "../../../../globalset/js/constant";
import { currentNounPlanFilterName } from "../../../../utils/businessFunction";
import EditCardDrop from "./HeaderComponent/EditCardDrop";
import globalStyles from "../../../../globalset/css/globalClassName.less";
import Cookies from "js-cookie";

export default class Header extends React.Component {
  state = {
    visibleEdit: false
  };
  onVisibleChangeEdit(bool) {
    this.setState({
      visibleEdit: bool
    });
  }

  setCardGroupKey(key) {
    this.props.updateDatas({
      cardGroupKey: key
    });
  }

  render() {
    const { visibleEdit } = this.state;
    const menu = (
      <Menu>
        <Menu.Item key={"1"}>
          全部{currentNounPlanFilterName(PROJECTS)}
        </Menu.Item>
        <Menu.Item key={"2"} disabled>
          <Tooltip placement="top" title={"即将上线"}>
            已归档{currentNounPlanFilterName(PROJECTS)}
          </Tooltip>
        </Menu.Item>
      </Menu>
    );
    const menu_2 = (
      <Menu>
        <Menu.Item key={"1"}>
          按{currentNounPlanFilterName(PROJECTS)}排序
        </Menu.Item>
        <Menu.Item key={"2"} disabled>
          <Tooltip placement="top" title={"即将上线"}>
            按起止时间排序
          </Tooltip>
        </Menu.Item>
        <Menu.Item key={"3"} disabled>
          <Tooltip placement="top" title={"即将上线"}>
            按状态排序
          </Tooltip>
        </Menu.Item>
        <Menu.Item key={"4"} disabled>
          <Tooltip placement="top" title={"即将上线"}>
            手动排序
          </Tooltip>
        </Menu.Item>
      </Menu>
    );

    const {
      datas: { cardGroupKey = 0 }
    } = this.props.model;
    const userInfo = localStorage.getItem('userInfo')
      ? JSON.parse(localStorage.getItem('userInfo'))
      : {};
    const { current_org = {} } = userInfo;
    const { role_name } = current_org;
    //前端根据当前用户的组织角色返回对应tab名称
    const roleNameRetureTabName = role_name => {
      let arr = ["工作内容", "我的文档", "我的生活", "我的展示"];
      switch (role_name) {
        case "项目负责人":
          arr = ["项目工作", "我的文档", "我的生活", "我的展示"];
          break;
        case "设计师":
          arr = ["项目工作", "我的文档", "我的生活", "我的展示"];
          break;
        case "老师":
          arr = ["我的教学", "我的课件", "我的生活", "我的展厅"];
          break;
        case "学生":
          arr = ["我的学习", "我的文档", "我的生活", "我的展厅"];
          break;
        default:
          arr = ["工作内容", "我的文档", "我的生活", "我的展示"];
          break;
      }
      return arr;
    };
    let tabArr = [];
    tabArr = roleNameRetureTabName(role_name);

    return (
      <div className={indexStyle.headerOut}>
        <div className={indexStyle.left}>
          {tabArr.map((value, key) => {
            let contain = <div />;
            if (key == 0 && cardGroupKey == 0) {
              contain = (
                <Dropdown
                  visible={visibleEdit}
                  // trigger={['click']}
                  key={key}
                  onVisibleChange={this.onVisibleChangeEdit.bind(this)}
                  overlay={
                    <EditCardDrop {...this.props} visibleEdit={visibleEdit} />
                  }
                >
                  <div
                    onClick={this.setCardGroupKey.bind(this, key)}
                    key={key}
                    className={
                      cardGroupKey == key
                        ? indexStyle.groupSelect
                        : indexStyle.groupnoSelect
                    }
                  >
                    {value}
                    {/*<i className={globalStyles.authTheme} style={{fontSize: 12, transform:'rotate(10deg)'}}>&#xe701;</i>*/}
                    <Icon type="down" />
                  </div>
                </Dropdown>
              );
            } else {
              contain = (
                <div
                  onClick={this.setCardGroupKey.bind(this, key)}
                  key={key}
                  className={
                    cardGroupKey == key
                      ? indexStyle.groupSelect
                      : indexStyle.groupnoSelect
                  }
                >
                  {value}
                </div>
              );
            }
            return contain;
          })}
        </div>

        {/*<div className={indexStyle.right}>*/}
        {/*/!*<div style={{marginRight: 12}}>按{currentNounPlanFilterName(PROJECTS)}排序 <Icon type="down"  style={{fontSize:14,color:'#595959'}}/></div>*!/*/}
        {/*/!*<div>全部{currentNounPlanFilterName(PROJECTS)} <Icon type="down"  style={{fontSize:14,color:'#595959'}}/></div>*!/*/}
        {/*<div>全部项目  <Icon type="down"  style={{fontSize:14,color:'#595959'}}/></div>*/}
        {/*<Icon type="appstore-o" style={{fontSize:14,marginTop:18,marginLeft:16}}/>*/}
        {/*</div>*/}
      </div>
    );
  }
}
