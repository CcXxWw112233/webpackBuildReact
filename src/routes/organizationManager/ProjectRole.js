import React from 'react'
import { Collapse, Checkbox, Row, Col, TreeSelect, Icon, Dropdown, Menu, Modal, Button, Tree, message } from 'antd';
import indexStyles from './index.less'
import RenameModal from './RenameModal'
import {
  MESSAGE_DURATION_TIME, NOT_HAS_PERMISION_COMFIRN, ORG_UPMS_ORGANIZATION_ROLE_CREATE,
  ORG_UPMS_ORGANIZATION_EDIT, ORG_UPMS_ORGANIZATION_ROLE_DELETE, ORG_UPMS_ORGANIZATION_ROLE_EDIT
} from "../../globalset/js/constant";
import {checkIsHasPermission} from "../../utils/businessFunction";
const TreeNode = Tree.TreeNode;

const CheckboxGroup = Checkbox.Group;
const Panel = Collapse.Panel
const SHOW_PARENT = TreeSelect.SHOW_PARENT;


export default class ProjectRole extends React.Component {
  state = {
    renameModalVisable: false, //重命名或添加item modal显示
  };
  // 全选
  onCheckAllChange = ({parentKey, childKey}, e) => {
    const { datas: { project_role_data }} = this.props.model
    let arr = []
    for(let val of project_role_data[parentKey]['function_tree_data'][childKey]['child_data']){
      arr.push(val.id)
    }
    project_role_data[parentKey]['function_tree_data'][childKey]['selects'] = e.target.checked? arr : []
    project_role_data[parentKey]['function_tree_data'][childKey]['indeterminate'] = false
    project_role_data[parentKey]['function_tree_data'][childKey]['checkedAll'] = e.target.checked

    this.props.updateDatas({
      project_role_data
    })
  }
  groupOnChange = ({parentKey, childKey}, checkedList ) => {
    const { datas: { project_role_data }} = this.props.model
    let arr = []
    for(let val of project_role_data[parentKey]['function_tree_data'][childKey]['child_data']){
      arr.push(val.id)
    }
    project_role_data[parentKey]['function_tree_data'][childKey]['selects'] = checkedList
    project_role_data[parentKey]['function_tree_data'][childKey]['checkedAll'] = checkedList.length === arr.length
    project_role_data[parentKey]['function_tree_data'][childKey]['indeterminate'] = !!checkedList.length && (checkedList.length < arr.length)

    this.props.updateDatas({
      project_role_data
    })

  }

  //menu点击项------------------start
  handleMenuClick({parentKey, value}, e ) {
    e.domEvent.stopPropagation();
    this.setState({
      parentKey,
      role_id: value.id,
    })
    const { key } = e
    switch (key) {
      case '1':
        this.setDefaut({parentKey, value})
        break
      case '2':
        if(!checkIsHasPermission(ORG_UPMS_ORGANIZATION_ROLE_CREATE)){
          message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
          return false
        }
        this.copyPanelItem({parentKey, value})
        break
      case '3':
        this.refactorName({parentKey, value})
        break
      case '4':
        this.deleteConfirm({parentKey, value})
        break
      default:
        break
    }
  }
  setDefaut({parentKey, value}) {
    if(!checkIsHasPermission(ORG_UPMS_ORGANIZATION_ROLE_EDIT)){
      message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
      return false
    }
    this.props.setDefaultRole({
      role_id: value.id,
      type: '2'
    })
  }
  copyPanelItem() {
    if(!checkIsHasPermission(ORG_UPMS_ORGANIZATION_ROLE_CREATE)){
      message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
      return false
    }
    this.setState({
      reName_Add_type: '3'
    })
    this.setRenameModalVisable()
  }
  copy(values) {
    const { name } = values
    this.props.copyRole({
      role_id: this.state.role_id,
      name,
    })
  }
  refactorName({parentKey, value}) {
    if(!checkIsHasPermission(ORG_UPMS_ORGANIZATION_ROLE_EDIT)){
      message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
      return false
    }
    this.setState({
      reName_Add_type: '1',
    })
    this.setRenameModalVisable()
  }
  setRenameModalVisable() {
    this.setState({
      renameModalVisable: !this.state.renameModalVisable
    })
  }
  reNamePanelItem(values) {
    const { name } = values
    this.props.updateRole({
      name,
      role_id: this.state.role_id
    })
  }
  deleteConfirm({parentKey, value} ) {
    if(!checkIsHasPermission(ORG_UPMS_ORGANIZATION_ROLE_DELETE)){
      message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
      return false
    }
    const that = this
    Modal.confirm({
      title: '确认删除？',
      okText: '确认',
      cancelText: '取消',
      onOk() {
        that.deletePanelItem({parentKey, value})
      }
    });
  }
  deletePanelItem(parentKey) {
   this.props.deleteRole({
     role_id: this.state.role_id,
     type: '2'
   })
  }
  //menu点击项------------------end
  onCheck = (parentKey, e) => {
    const { datas: { project_role_data }} = this.props.model
    project_role_data[parentKey]['already_has_content_permission_trans'] = e
    this.props.updateDatas({
      project_role_data
    })
  }
  addPanel() {
    if(!checkIsHasPermission(ORG_UPMS_ORGANIZATION_ROLE_CREATE)){
      message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
      return false
    }
    this.setState({
      reName_Add_type: '2'
    })
    this.setRenameModalVisable()
  }
  addPanelItem(values) {
    if(!checkIsHasPermission(ORG_UPMS_ORGANIZATION_ROLE_CREATE)){
      message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
      return false
    }
    const { name } = values
    this.props.createRole({name, type: '2'})
  }

  finallySave({value, parentKey}) {
    // console.log(parentKey, value)
    const { id, function_tree_data = [], content_tree_data = [], already_has_content_permission_trans = [] } = value

    let function_data = []
    let content_data = []
    for(let i = 0; i < function_tree_data.length; i++) {
      function_data = function_data.concat(function_tree_data[i]['selects'])
    }
    function_data = Array.from(new Set(function_data))

    const obj = {
      role_id: id,
      function_data: function_data,
    }
    this.props.saveRolePermission(obj)
  }
  render(){
    const { datas: { project_role_data }} = this.props.model
    const operateMenu = ({parentKey, value}) => {
      const { is_default } = value
      return (
        <Menu onClick={this.handleMenuClick.bind(this, {parentKey, value})}>
          {is_default !== '1' && checkIsHasPermission(ORG_UPMS_ORGANIZATION_ROLE_EDIT)?(
            <Menu.Item key={'1'} style={{textAlign: 'center', padding: 0, margin: 0}}>
              <div className={indexStyles.elseProjectMemu}>
                设为默认
              </div>
            </Menu.Item>
          ): ('') }
          {checkIsHasPermission(ORG_UPMS_ORGANIZATION_ROLE_CREATE) && (
            <Menu.Item key={'2'} style={{textAlign: 'center', padding: 0, margin: 0}}>
              <div className={indexStyles.elseProjectMemu}>
                复制
              </div>
            </Menu.Item>
          )}
          {checkIsHasPermission(ORG_UPMS_ORGANIZATION_ROLE_EDIT) && (
            <Menu.Item key={'3'} style={{textAlign: 'center', padding: 0, margin: 0}}>
              <div className={indexStyles.elseProjectMemu}>
                重命名
              </div>
            </Menu.Item>
          )}
          {is_default !== '1' && checkIsHasPermission(ORG_UPMS_ORGANIZATION_ROLE_DELETE)?(
            <Menu.Item key={'4'} style={{textAlign: 'center', padding: 0, margin: 0}}>
              <div className={indexStyles.elseProjectDangerMenu}>
                删除
              </div>
            </Menu.Item>
          ): ('') }
        </Menu>
      );
    }
    const loop = data => {
      if(!data || !data.length){
        return
      }
      return data.map((item) => {
        if (item.app_data) {
          return (
            <TreeNode key={item.app_id ? `${item.board_id}__${item.app_id}`: item.board_id } title={2}>
              {loop(item.app_data)}
            </TreeNode>
          );
        }
        return <TreeNode key={item.app_id ? `${item.board_id}__${item.app_id}`: item.board_id } title={1}/>;
      });
    }
    return (
      <div className={indexStyles.TabPaneContent}>
        <Collapse accordion>
          {project_role_data.map((value, parentKey) => {
            const { name, is_default, is_visitor, system_role, function_tree_data =[], content_tree_data = [], already_has_function_permission, already_has_content_permission_trans } = value
            const checkDisabled = !checkIsHasPermission(ORG_UPMS_ORGANIZATION_ROLE_EDIT) || system_role ==='1'

            return (
              <Panel header={
                <div className={indexStyles.parrentPanaelHeader}>
                  <div className={indexStyles.parrentPanaelHeader_l}>
                    <div>{name}</div>
                    {system_role === '1'? (
                      <div>系统角色</div>
                    ):(
                      is_default === '1' ? (<div>默认角色</div>) : ('')
                    )}
                  </div>
                  <div className={indexStyles.parrentPanaelHeader_r} style={{display: 'block'}}>
                    {system_role !== '1' && is_visitor !== '1' ? (
                      <Dropdown overlay={operateMenu({parentKey, value})}>
                        <Icon type="ellipsis" theme="outlined" />
                      </Dropdown>
                    ):('')}
                  </div>
                </div>} key={parentKey}>
                <div style={{color: '#8c8c8c'}}>可行使权限：</div>
                <Collapse bordered={false} >
                  {/*二级折叠*/}
                  {function_tree_data.map((value, childKey) => {
                    const { child_data, checkedAll, indeterminate, selects } = value //indeterminate, checkedAll
                    const { name } = value
                    return(
                      <Panel header={<
                        div style={childrenPanelTitle} key={childKey}>
                        <Checkbox
                          disabled={checkDisabled}
                          indeterminate={indeterminate}
                          onChange={this.onCheckAllChange.bind(this, {parentKey, childKey})}
                          checked={checkedAll}
                          style={{marginRight: 12 }} />
                          {name}</div>}
                             style={{...childrenPanelStyles}} key={childKey}>
                        <div className={indexStyles.childrenPanelContent}>
                          <div style={checkBoxAllStyles}>
                            <Checkbox disabled={checkDisabled} indeterminate={indeterminate} onChange={this.onCheckAllChange.bind(this, {parentKey, childKey})} checked={checkedAll} style={{marginRight: 12 }}></Checkbox>
                          </div>
                          <Checkbox.Group style={{ width: '100%' }} onChange={this.groupOnChange.bind(this, {parentKey, childKey})} value={ selects } disabled={checkDisabled}>
                            <Row style={childrenPanelRowsStyles}>
                              {child_data.map((value, key) => {
                                const { id, name } = value
                                return(
                                  <Col span={8} key={key}><Checkbox value={id}>{name}</Checkbox></Col>
                                )
                              })}
                            </Row>
                          </Checkbox.Group>
                        </div>
                      </Panel>
                    )
                  })}
                </Collapse>
                <div style={{color: '#8c8c8c', marginTop: 16}}>可访问内容：</div>
                <div style={{marginTop: 10}}>
                  {/*<TreeSelect*/}
                    {/*treeData={canVisittreeData}*/}
                    {/*treeValue={treeDataSelects}*/}
                    {/*onChange={this.treeDataonChange.bind(this, parentKey)}*/}
                    {/*treeCheckable = {true}*/}
                    {/*showCheckedStrategy={SHOW_PARENT}*/}
                    {/*searchPlaceholder={'请选择'}*/}
                    {/*style={{width: '100%',}}*/}
                  {/*/>*/}
                  <Tree checkable multiple onCheck={this.onCheck.bind(this, parentKey)} disabled={checkDisabled} checkedKeys={already_has_content_permission_trans}>
                    {/*{loop(content_tree_data)}*/}
                  {content_tree_data.map((value, key) => {
                    const { board_id, board_name, app_data } = value
                      return (
                        <TreeNode key={board_id} title={board_name}>
                          {app_data.map((value2, key) => {
                            const { app_name, app_id } = value2
                            return(
                              <TreeNode key={`${board_id}__${app_id}`} title={app_name} />
                              )
                          })}
                        </TreeNode>
                      )
                    })}
                  </Tree>
                </div>
                {system_role !== '1'? (
                  <div style={{margin: '0 auto', marginTop: 20, textAlign: 'center'}}>
                    <Button type={'primary'} disabled={checkDisabled} onClick={this.finallySave.bind(this, {value, parentKey})}>保存</Button>
                  </div>
                ) : ('')}
              </Panel>
            )
          })}
        </Collapse>
        {checkIsHasPermission(ORG_UPMS_ORGANIZATION_ROLE_CREATE) && (
          <div className={indexStyles.addParrentPanel} onClick={this.addPanel.bind(this)}>
            <Icon type="plus-circle" theme="outlined" />
          </div>
        )}
        {/*重命名,添加*/}
        <RenameModal reName_Add_type={this.state.reName_Add_type} copy={this.copy.bind(this)} renameModalVisable={this.state.renameModalVisable} reNamePanelItem={this.reNamePanelItem.bind(this)} addPanelItem={this.addPanelItem.bind(this)} setRenameModalVisable={this.setRenameModalVisable.bind(this)}/>
      </div>
    )
  }
}

const childrenPanelStyles = { //子panel
  borderBottom: '1px dashed rgba(0,0,0,.2)',
  position: 'relative',
}
const checkBoxAllStyles = { //全选checkbox外层div
  position: 'absolute',
  top: 12,
  left: 40}
const childrenPanelRowsStyles = { //子panel下的Row
   lineHeight: '34px'
}
const childrenPanelTitle = {
  paddingLeft: 0
}

