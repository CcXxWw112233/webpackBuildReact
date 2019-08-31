import React from 'react'
import indexStyle from './index.less'
import { Icon, Menu, Dropdown, Tooltip, Button } from 'antd'
import SaveModal from './SaveModal'
import {color_4} from '../../../../../globalset/js/styles'
import BraftEditor from 'braft-editor'

export default class Header extends React.Component {
  state={
    saveModalVisible: false,
  }
  //团队展示发布编辑
  editTeamShowPreview() {
    this.props.updateDatas({
      editTeamShowPreview: true
    })
  }
  editTeamShowSave() {
    this.props.updateDatas({
      editTeamShowSave: true,
    })
    this.setState({
      saveModalVisible: true,
    })
  }
  setSaveModalVisible(bool) {
    this.setState({
      saveModalVisible: bool
    })
  }
  deleteTeam(currentTeamShowShowId) {
    this.props.deleteTeamShow({
      show_id: currentTeamShowShowId
    })
  }
  currentOrgTeamShowListMenuClick({key}) {
    switch (key) {
      case 'add':
        this.props.updateDatas({
          operateType: '1',
          name: '',
          cover_img: '',
          summary: '',
          content: '',
          previewHtml: '',
          currentTeamShowShowId: '',
          currentTeamShowName: '',
          currentTeamShowId: '',
          currentTeamShowTypeId: '',
        })
        break
      default:
        this.props.updateDatas({
          operateType: '2'
        })
        this.props.getTeamShowDetail({
          id: key
        })
        break
    }
  }

  render() {
    const { saveModalVisible } = this.state
    const { datas: {currentOrgTeamShowList = [], operateType, currentTeamShowShowId, currentTeamShowName}} = this.props.model
    const menu = (list) => (
      <Menu onClick={this.currentOrgTeamShowListMenuClick.bind(this)}>
        {list.map((value, key) => {
          const { name, id } =value
          return (
            <Menu.Item key={id}>
              {name}
            </Menu.Item>
          )
        })}
        <Menu.Item key={'add'}>
          <div style={{height: 30, lineHeight: '30px', textAlign: 'center'}}>
            <Icon type={'plus'} style={{color: color_4}} />
          </div>
        </Menu.Item>
      </Menu>
    );

    return (
      <div className={indexStyle.out}>
        <div className={indexStyle.contain}>
          <div className={indexStyle.left}></div>
          <div className={indexStyle.right}>
            <div style={{display: 'flex', alignItems: 'center', }}>
              {operateType === '2'? (
                <Button style={{height: 24, color: '#F5222D', background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(217,217,217,1)'}} onClick={this.deleteTeam.bind(this, currentTeamShowShowId)}>删除</Button>
              ) : ('')}
              <Button type={'primary'} style={{height: 24, marginLeft: 14}} onClick={this.editTeamShowSave.bind(this)}>保存</Button>
            </div>
          </div>
        </div>
        <SaveModal {...this.props} saveModalVisible={saveModalVisible} setSaveModalVisible={this.setSaveModalVisible.bind(this)} />
      </div>
    )
  }
}
