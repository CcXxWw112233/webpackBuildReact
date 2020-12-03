import React, { Component } from 'react'
import { Menu, Dropdown, Input, Tooltip } from 'antd'
import classNames from 'classnames/bind'
import styles from './index.less'
import MenuItem from 'antd/lib/menu/MenuItem'
import AddModalFormWithExplicitProps from './../../../Project/AddModalFormWithExplicitProps'
import { connect } from 'dva/index'
import Cookies from 'js-cookie'
import {
  MESSAGE_DURATION_TIME,
  NOT_HAS_PERMISION_COMFIRN,
  ORG_TEAM_BOARD_CREATE
} from '../../../../../../globalset/js/constant'
import {
  checkIsHasPermissionInBoard,
  checkIsHasPermission,
  setStorage,
  setBoardIdStorage
} from '../../../../../../utils/businessFunction'
import { message } from 'antd/lib/index'
import CreateProject from './../../../Project/components/CreateProject/index'
import globalStyles from '@/globalset/css/globalClassName.less'

let cx = classNames.bind(styles)

/* eslint-disable */
class DropdownSelectWithSearch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      addNewProjectModalVisible: false,
      inputValue: '',
      filteredList: this.props.list ? this.props.list : []
    };
  }
  handleVisibleChange = flag => {
    const { isShouldDisableDropdown } = this.props
    if (isShouldDisableDropdown) return
    this.setState({
      visible: flag
    });
  };
  handleInputValueChange = e => {
    const { list } = this.props;
    if (!e.target.value) {
      this.setState({
        inputValue: '',
        filteredList: Array.isArray(list) ? list : []
      });
    } else {
      this.setState({
        inputValue: e.target.value,
        filteredList: Array.isArray(list)
          ? list.filter(item => item['board_name'].includes(e.target.value))
          : []
      });
    }
  };
  handleSeletedMenuItem = item => {
    const { handleSelectedItem, list, isProjectGroupMode } = this.props;
    if (isProjectGroupMode) {
      handleSelectedItem(item);
      this.setState({
        visible: false
      });
      return;
    }
    const { board_id } = item;
    setBoardIdStorage(board_id);
    handleSelectedItem(item);
    this.setState({
      inputValue: '',
      visible: false,
      filteredList: Array.isArray(list) ? list : []
    });
  };
  handleClickedNewProjectItem = e => {
    if (e) e.stopPropagation();
    if (!checkIsHasPermission(ORG_TEAM_BOARD_CREATE)) {
      message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME);
      return false;
    }
    this.showModal();
  };
  renderMenuItem = filteredList => {
    return filteredList.map((item, index) => (
      <Menu.Item key={item.board_id}>
        <p onClick={this.handleSeletedMenuItem.bind(this, item)}>
          {item.board_name}
        </p>
      </Menu.Item>
    ));
  };
  renderNoContent = () => {
    const { isCanCreateNew } = this.props;
    if (!isCanCreateNew) {
      return (
        <div className={styles.menuWrapper}>
          <div className={styles.menu_item} style={{ height: 40, fontSize: 12, lineHeight: '40px' }}>
            无更多选项
          </div>
        </div>
      )
    };
    const { current_org: { identity_type } = {} } = this.getUerInfoFromCookie();
    const isVisitor = this.isVisitor(identity_type);
    return (
      <>
        {!isVisitor && checkIsHasPermission(ORG_TEAM_BOARD_CREATE) && (
          <div className={styles.addNewProject__wrapper}>
            <div className={styles.addNewProject__content}>
              <p
                className={styles.addNewProject__content_item}
                onClick={this.handleClickedNewProjectItem}
              >
                <span className={styles.addNewProject__content_item_icon} />
                <span className={styles.addNewProject__content_item_title}>
                  新建项目
                  {/* 该组织无项目 */}
                </span>
              </p>
            </div>
          </div>
        )}
      </>
    );
  };
  showModal = () => {
    const { dispatch } = this.props;
    this.setState(
      {
        addNewProjectModalVisible: true
      },
      // () => {
      //   dispatch({
      //     type: 'project/getAppsList',
      //     payload: {
      //       type: '2'
      //     }
      //   });
      // }
    );
  };
  handleSubmitNewProject = data => {
    const calback = () => {
      dispatch({
        type: 'workbench/getProjectList',
        payload: {}
      });
      this.hideModal();

    }
    const { dispatch } = this.props;
    dispatch({
      type: 'project/addNewProject',
      payload: {
        ...data,
        calback
      }
    })
  };
  hideModal = () => {
    this.setState({
      addNewProjectModalVisible: false
    });
    // const { dispatch } = this.props;
    // dispatch({
    //   type: "modal/hideModal"
    // });
  };
  setAddProjectModalVisible = () => {
    const { addNewProjectModalVisible } = this.state
    this.setState({
      addNewProjectModalVisible: !addNewProjectModalVisible
    })
  }
  componentWillReceiveProps(nextProps) {
    const { list } = nextProps;
    const { filteredList } = this.state;
    const isTwoArrHaveSameLen = (arr1, arr2) => arr1.length === arr2.length;
    if (!isTwoArrHaveSameLen(filteredList, list)) {
      this.setState({
        filteredList: [...list]
      });
    }
  }
  content = () => {
    const { list, selectedItem, isSearch, isShouldDisableDropdown } = this.props;
    const { filteredList, inputValue } = this.state;
    if (isShouldDisableDropdown) {
      return (<div></div>)
    }
    if (!list || !list.length) {
      return <>
        {this.renderNoContent()}
      </>;
    }
    return (
      <div>
        {isSearch && (
          <Input
            placeholder="搜索"
            value={inputValue}
            onChange={this.handleInputValueChange}
          />
        )}
        {/* <div>{this.renderNoContent()}</div> */}
        <div className={styles.menuWrapper}>
          <Menu
            defaultSelectedKeys={
              selectedItem && selectedItem.board_id
                ? [selectedItem.board_id]
                : []
            }
            selectedKeys={
              selectedItem && selectedItem.board_id
                ? [selectedItem.board_id]
                : []
            }
          >
            {this.renderMenuItem(filteredList)}
          </Menu>
        </div>
      </div>
    );
  };
  getUerInfoFromCookie = () => {
    try {
      return JSON.parse(localStorage.getItem('userInfo'));
    } catch (err) {
      return {};
    }
  };
  isVisitor = param => {
    //是否访客 1不是 0是
    const condMap = new Map([['0', true], ['1', false]]);
    if (typeof condMap.get(param) === 'undefined') return false;
    return condMap.get(param);
  };
  render() {
    const { initSearchTitle, selectedItem, project = {}, isShowIcon, isShouldDisableDropdown, iconNode } = this.props;
    const { datas: { appsList } } = project
    const { visible, addNewProjectModalVisible } = this.state;
    let titleClassName = cx({
      title: true,
      active: visible
    });
    return (
      <div className={styles.wrapper}>
        {!addNewProjectModalVisible && (
          <Dropdown
            overlay={this.content()}
            trigger={['click']}
            visible={visible}
            onVisibleChange={this.handleVisibleChange}
          >
            <div className={titleClassName}>
              <div className={styles.org_selected_out}>
                {isShowIcon && (
                  <div className={`${globalStyles.authTheme} ${styles.type_logo}`}>
                    {/* &#xe60a; */}
                    {iconNode}
                  </div>
                )}
                <div>
                  {selectedItem && selectedItem.board_name
                    ? selectedItem.board_name
                    : initSearchTitle}
                </div>
                <div className={`${globalStyles.authTheme} ${styles.down_logo}`}>&#xe7ee;</div>
              </div>
              {/* <p style={{ marginBottom: 0 }}>
                {isShowIcon ? <span /> : <span style={{ display: 'none' }} />}
                <Tooltip
                  title={
                    selectedItem && selectedItem.board_name
                      ? selectedItem.board_name
                      : null
                  }
                >
                  <span
                    style={{
                      display: 'inline-block',
                      maxWidth: '180px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {selectedItem && selectedItem.board_name
                      ? selectedItem.board_name
                      : initSearchTitle}
                  </span>
                </Tooltip>
                <span />
              </p> */}
            </div>
          </Dropdown>
        )}
        {/* {addNewProjectModalVisible && (
          <AddModalFormWithExplicitProps
            addNewProjectModalVisible={addNewProjectModalVisible}
            key="1"
            hideModal={this.hideModal}
            showModal={this.showModal}
            project={project}
            handleSubmitNewProject={this.handleSubmitNewProject}
          />
        )} */}
        {addNewProjectModalVisible && (
          <CreateProject
            setAddProjectModalVisible={this.setAddProjectModalVisible}
            addProjectModalVisible={addNewProjectModalVisible}
            _organization_id={this.props._organization_id}
            addNewProject={this.handleSubmitNewProject}
          />
        )}
      </div>
    );
  }
}

DropdownSelectWithSearch.defaultProps = {
  initSearchTitle: 'default',
  list: [],
  selectedItem: [],
  isShowIcon: true, //是否显示 icon
  isSearch: true, //是否显示搜索input
  isCanCreateNew: true, //是否显示新建
  isProjectGroupMode: false, //如果是项目分组复用这个组件
  isShouldDisableDropdown: false, //设置禁用选择，当已经有当前选中值得时候
};

function mapStateToProps({ modal, project, loading,
  technological: {
    datas: {
      userOrgPermissions,
      userBoardPermissions
    }
  }
}) {
  return { modal, project, userOrgPermissions, userBoardPermissions };
}

export default connect(mapStateToProps)(DropdownSelectWithSearch);
