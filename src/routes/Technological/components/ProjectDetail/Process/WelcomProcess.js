import React from 'react'
import indexStyles from './index.less'
import { Button, Icon, Input, Dropdown, Menu } from 'antd'
import MenuSearchStyles from '../../TecPublic/MenuSearch.less'
import MenuSearchTemplate from './MenuSearchTemplate'
import {ORGANIZATION, TASKS, FLOWS, DASHBOARD, PROJECTS, FILES, MEMBERS, CATCH_UP} from "../../../../../globalset/js/constant";
import {currentNounPlanFilterName} from "../../../../../utils/businessFunction";

export default class WelcomProcess extends React.Component {
 state = {}
  handleMenuReallyClick = (e) => {
    const { key } = e
    if(!key) {
      return false
    }
    const { datas: { processTemplateList = [] } } = this.props.model
    const { template_name, template_id, template_no } = processTemplateList[Number(key)]
    //此处为启动流程界面查询逻辑(查询模板信息)
    this.props.getTemplateInfo && this.props.getTemplateInfo(template_id)
  }
  startEdit() {
    this.props.updateDatasProcess({
      processPageFlagStep: '2'
    })
  }
  render() {
    const { datas: { processTemplateList = [] } } = this.props.model
    const MenuSearch = (processTemplateList) => {
      return (
        <Menu style={{padding: 8}} onClick={this.handleMenuReallyClick.bind(this)}>
          <Input placeholder={`搜索${currentNounPlanFilterName(FLOWS)}模板`} />
          {
            processTemplateList.map((value, key) => {
              const { template_name, template_id, template_no } = value
              return (
                <Menu.Item style={{height: 32, lineHeight: '22px'}} key={key} >
                  {template_name}
                </Menu.Item>
              )
            })
          }
        </Menu>
      )
    }
    return (
      <div className={indexStyles.welcomProcessOut}>
        <h1>欢迎使用{currentNounPlanFilterName(FLOWS)}功能</h1>
        <div className={indexStyles.description}>我们倾力打造一款易用的{currentNounPlanFilterName(FLOWS)}管理工具为你的项目带来更直观高效的风险把控体验，使用本功能可将项目范围内的{currentNounPlanFilterName(FLOWS)}统一展示并实时同步进度给相关参与人，避免信息滞后带来的成本耗损与不良后果。</div>
        <div className={indexStyles.description}>在开始管理一个{currentNounPlanFilterName(FLOWS)}之前，我们必须知道这个{currentNounPlanFilterName(FLOWS)}的具体步骤和流转要求，请选择一种方式来开启你的{currentNounPlanFilterName(FLOWS)}：</div>

        <div className={indexStyles.open}>
          <div className={indexStyles.openLeft}>
            <div className={indexStyles.title}>直接以现有的{currentNounPlanFilterName(FLOWS)}模板开始管理...</div>
            <div className={indexStyles.listItem}>
              <div></div>
              <div>适用于你希望管理的事情已存在配置好{currentNounPlanFilterName(FLOWS)}模板的事情；</div>
            </div>
            <div className={indexStyles.listItem}>
              <div></div>
              <div>你之前创建过跟这件事情相关的{currentNounPlanFilterName(FLOWS)}模板；</div>
            </div>
            {/* </MenuSearchTemplate>MenuSearch(processTemplateList)*/}
            <Dropdown overlay={<MenuSearchTemplate {...this.props}/>}>
              <Button style={{width: 110, marginTop: 20}}>选择模板<Icon type={'down'} style={{fontSize: 12}}/></Button>
            </Dropdown>
          </div>

          <div className={indexStyles.openRight}>
            <div className={indexStyles.title}>没有模板或不了解{currentNounPlanFilterName(FLOWS)}模板是什么...</div>
            <div className={indexStyles.listItem}>
              <div></div>
              <div>跟随指引配置跟此时相关的{currentNounPlanFilterName(FLOWS)}；</div>
            </div>
            <div className={indexStyles.listItem}>
              <div></div>
              <div>按需选择是否保存为模板便于后续管理同类事情；</div>
            </div>
            <Button type={'primary'} style={{width: 190, marginTop: 20}} onClick={this.startEdit.bind(this)}>引导我开始创建新的{currentNounPlanFilterName(FLOWS)}</Button>
          </div>
        </div>
      </div>
    )
  }
}
