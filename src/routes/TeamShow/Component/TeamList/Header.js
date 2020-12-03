import React from 'react'
import indexStyle from './index.less'
import { Icon, Menu, Dropdown, Tooltip, Button } from 'antd'
import { color_4 } from '../../../../globalset/js/styles'
import { PAGINATION_PAGE_SIZE } from '../../../../globalset/js/constant'

export default class Header extends React.Component {
  state = {}
  //团队展示发布编辑

  queryTeamListWithType(id) {
    this.props.updateDatas({
      teamShowTypeId: id,
      currentPageNo: 1
    })
    this.props.getTeamShowList({
      show_type_id: id,
      current: '1',
      size: PAGINATION_PAGE_SIZE
    })
  }
  render() {
    const {
      datas: { teamShowTypeList = [], teamShowTypeId }
    } = this.props.model
    return (
      <div className={indexStyle.out}>
        <div className={indexStyle.contain}>
          <div className={indexStyle.left}></div>
          <div className={indexStyle.right}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {teamShowTypeList.map((value, key) => {
                const { name, id } = value
                return (
                  <div
                    onClick={this.queryTeamListWithType.bind(this, id)}
                    key={id}
                    style={{
                      color: teamShowTypeId === id ? '#1890FF' : '#595959',
                      marginRight: 16
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
            </div>
          </div>
        </div>
      </div>
    )
  }
}
