import React from 'react'
import indexStyle from './index.less'
import { Icon, Menu, Dropdown, Tooltip } from 'antd'
import {currentNounPlanFilterName} from "../../../../utils/businessFunction";
import { PROJECTS } from '../../../../globalset/js/constant'

export default class Header extends React.Component {
  render() {
    const menu = (
      <Menu>
        <Menu.Item key={'1'}>
          全部{currentNounPlanFilterName(PROJECTS)}
        </Menu.Item>
        <Menu.Item key={'2'} disabled>
          <Tooltip placement="top" title={'即将上线'}>
            已归档{currentNounPlanFilterName(PROJECTS)}
          </Tooltip>
        </Menu.Item>
      </Menu>
    );
    const menu_2 = (
      <Menu>
        <Menu.Item key={'1'}>
          按参与关系排序
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
      <div className={indexStyle.out}>
        <Dropdown overlay={menu}>
           <div className={indexStyle.left}>全部{currentNounPlanFilterName(PROJECTS)} <Icon type="down" style={{fontSize: 14, color: '#595959'}}/></div>
        </Dropdown>
        <div className={indexStyle.right}>
          <Dropdown overlay={menu_2}>
            <div>按参与关系排序 <Icon type="down" style={{fontSize: 14, color: '#595959'}}/></div>
          </Dropdown>
          {/*<Icon type="appstore-o"  style={{fontSize:14,marginTop:18,marginLeft:14}}/>*/}
          {/*<Icon type="appstore-o" style={{fontSize:14,marginTop:18,marginLeft:16}}/>*/}
          {/*<Icon type="appstore-o" style={{fontSize:14,marginTop:18,marginLeft:16}}/>*/}
        </div>
      </div>
    )
  }
}
