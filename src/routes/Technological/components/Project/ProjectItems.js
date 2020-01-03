import React, { Component } from 'react';
import { Icon, message } from 'antd';
import styles from './ProjectItems.less';
import indexStyle from './index.less';
import { connect } from 'dva';
import {
  checkIsHasPermission,
  currentNounPlanFilterName
} from '../../../../utils/businessFunction';
import {
  MESSAGE_DURATION_TIME,
  NOT_HAS_PERMISION_COMFIRN,
  ORG_TEAM_BOARD_CREATE,
  PROJECTS
} from '../../../../globalset/js/constant';
import AddModalForm from './AddModalForm';
import CreateProject from './components/CreateProject/index';

import ElseProject from './ElseProject';

@connect(({ project }) => ({
  currentProjectGroupProjectList: project.datas.currentProjectGroupProjectList,
}))
class ProjectItems extends Component {

  state = {
    addProjectModalVisible: false,
  }

  setAddProjectModalVisible = (data) => {
    const { addProjectModalVisible } = this.state
    const { visible } = data || {}
    if (data) {
      this.setState({
        addProjectModalVisible: visible
      })
    } else {
      this.setState({
        addProjectModalVisible: !addProjectModalVisible
      })
    }

  }

  addItem = (e) => {
    if (e) e.preventDefault()
    if (!checkIsHasPermission(ORG_TEAM_BOARD_CREATE)) {
      message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME);
      return false;
    }
    // 点击的时候需要重新更新一下当前组织中的项目列表
    // this.props.dispatch({
    //   type: 'technological/getCurrentOrgProjectList',
    //   payload: {
        
    //   }
    // })
    this.setAddProjectModalVisible()
  };

  renderAddProject = () => {
    return (
      <a
        className={indexStyle.addListItem}
        style={{ marginTop: 0, width: '770px', display: 'inline-block' }}
        onClick={(e) => this.addItem(e)}
      >
        <Icon type="plus-circle-o" style={{ fontSize: 18, color: '#8c8c8c' }} />
      </a>
    );
  };
  renderProjectItem = () => {
    const { currentProjectGroupProjectList } = this.props;
    if (!currentProjectGroupProjectList) return null;
    return (
      <div className={indexStyle.projectListOut}>
        {currentProjectGroupProjectList.map(value => {
          const { is_star, board_id } = value;
          return <ElseProject {...this.props} key={`${board_id}_${is_star}`} itemDetailInfo={value} />;
        })}
      </div>
    );
  };
  render() {
    const { addProjectModalVisible } = this.state
    const { model = {}, currentProjectGroupProjectList } = this.props;
    const { datas: { appsList = [] } } = model

    return (
      <div className={styles.wrapper}>
        {this.renderAddProject()}
        {currentProjectGroupProjectList && this.renderProjectItem()}
        {/*<AddModalForm {...this.props} />*/}
        <CreateProject
          addNewProject={this.props.addNewProject}
          setAddProjectModalVisible={this.setAddProjectModalVisible}
          addProjectModalVisible={addProjectModalVisible}
          appsList={appsList}
        />
      </div>
    );
  }
}

export default ProjectItems;
