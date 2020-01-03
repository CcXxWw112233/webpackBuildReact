import React from 'react'
// import MenuSearchStyles from './MenuSearch.less'
import { Icon, Input, Button, DatePicker, Menu, Spin } from 'antd'
import indexStyles from './menuseachNultiple.less'

export default class ExcutorList extends React.Component{

  render(){
    const { listData = []} = this.props
    return (
        <Menu style={{padding: 8, boxShadow: '0px 2px 8px 0px rgba(0,0,0,0.15)', maxWidth: 200}}>
        {
          listData.map((value, key) => {
            const { avatar, name, user_name, user_id } = value
            return (
              <div style={{height: 32, lineHeight: '32px'}} key={user_id} >
                <div style={{display: 'flex', alignItems: 'center'}} key={user_id}>
                  {avatar? (
                    <img style={{ width: 20, height: 20, borderRadius: 20, marginRight: 4}} src={avatar} />
                  ) : (
                    <div style={{width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: '#f5f5f5', marginRight: 4, }}>
                      <Icon type={'user'} style={{fontSize: 12, marginLeft: 0, color: '#8c8c8c'}}/>
                    </div>
                  )}
                  <div style={{overflow: 'hidden', verticalAlign: 'middle', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 90, marginRight: 8}}>{name || user_name || '佚名'}</div>
                </div>
              </div>
            )
          })
        }
      </Menu>
  )
  }

}


