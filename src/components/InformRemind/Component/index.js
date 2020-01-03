// 渲染内容的组件
import React, { Component } from 'react'
import { connect } from 'dva'
import RenderHistory from './RenderHistory'
import infoRemindStyle from '../index.less'
import RenderAdd from './RenderAdd';


@connect(({informRemind: { historyList, is_history, is_add_remind }}) => ({
  historyList, is_history, is_add_remind
}))
export default class RenderContent extends Component {

    render() {
      const { historyList = [], rela_type, rela_id, is_add_remind, user_remind_info, commonExecutors = [], processPrincipalList = [], milestonePrincipals = [] } = this.props;
    
      {
        return (
          <div className={infoRemindStyle.content}>
              { historyList.map((value, index) => {
                const { id } = value
                return <RenderHistory is_add_remind={is_add_remind} rela_type={rela_type} user_remind_info={user_remind_info} rela_id={rela_id} itemValue={value} key={id} />
                }) 
              }
              {
                is_add_remind && <RenderAdd rela_type={rela_type} commonExecutors={commonExecutors} processPrincipalList={processPrincipalList} milestonePrincipals={milestonePrincipals} rela_id={rela_id} user_remind_info={user_remind_info} />
              }
          </div>
        ) 
      }
        
    }
}
