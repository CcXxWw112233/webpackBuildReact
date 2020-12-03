import React from 'react'
import { Icon, Menu, Dropdown, Button } from 'antd'

export default ({ dataSource, item, status }) => {
  let getStatus = s => {
    let disabledEnd, disabledDel
    switch (s) {
      case '1':
        disabledEnd = false
        disabledDel = true
        break
      case '3':
        disabledEnd = true
        disabledDel = false
        break
      case '4':
        disabledEnd = true
        disabledDel = false
        break
      default:
        disabledEnd = false
        disabledDel = true
        break
    }
    return {
      disabledEnd,
      disabledDel
    }
  }
  const { disabledEnd, disabledDel } = getStatus(status)
  let menu = (
    <Menu>
      {dataSource.reduce((r, c, i) => {
        return [
          ...r,
          c.content === '终止流程' ? (
            <Menu.Item disabled={disabledEnd}>
              <div
                key={`key${i}`}
                onClick={c.click}
                style={{
                  cursor: 'pointer',
                  textAlign: 'center',
                  height: '38px',
                  lineHeight: '38px'
                }}
              >
                {c.content === '移入回收站'
                  ? [
                      <Icon style={{ marginRight: '5px' }} type="delete" />,
                      c.content
                    ]
                  : c.content}
              </div>
            </Menu.Item>
          ) : (
            <Menu.Item disabled={disabledDel}>
              <div
                key={`key${i}`}
                onClick={c.click}
                style={{
                  cursor: 'pointer',
                  textAlign: 'center',
                  height: '38px',
                  lineHeight: '38px'
                }}
              >
                {c.content === '移入回收站'
                  ? [
                      <Icon style={{ marginRight: '5px' }} type="delete" />,
                      c.content
                    ]
                  : c.content}
              </div>
            </Menu.Item>
          )
        ]
      }, [])}
    </Menu>
  )

  return (
    <Dropdown overlay={menu} trigger={['click']}>
      {item}
    </Dropdown>
  )
}
