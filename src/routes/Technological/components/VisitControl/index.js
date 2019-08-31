import React, { Component } from 'react';
import {
  Popover,
  Tooltip,
  Switch,
  Menu,
  Dropdown,
  Button,
  Modal,
  message
} from 'antd';
import { connect } from 'dva';
import styles from './index.less';
import globalStyles from './../../../../globalset/css/globalClassName.less';
import AvatarList from './AvatarList/index';
import InviteOthers from './../InviteOthers/index';
import defaultUserAvatar from './../../../../assets/invite/user_default_avatar@2x.png';
import { inviteNewUserInProject } from './../../../../services/technological/index';
import { fetchUsersByIds } from './../../../../services/organization/index';
import classNames from 'classnames/bind';

let cx = classNames.bind(styles);
@connect(({ technological }) => ({
  currentOrgAllMembersList: technological.datas.currentOrgAllMembersList || []
}))
class VisitControl extends Component {
  constructor(props) {
    super(props);
    this.state = {
      addMemberModalVisible: false,
      comfirmRemoveModalVisible: false,
      visible: false,
      selectedOtherPersonId: '', //当前选中的外部邀请人员的 id
      othersPersonList: [], //外部邀请人员的list
      transPrincipalList: [] //外部已有权限人的list
    };
  }
  togglePopoverVisible = e => {
    if (e) e.stopPropagation();
    this.setState(state => {
      const { visible } = state;
      return {
        visible: !visible
      };
    });
  };

  isValidAvatar = (avatarUrl = '') =>
    avatarUrl.includes('http://') || avatarUrl.includes('https://');

  handleGetAddNewMember = members => {
    const { handleAddNewMember } = this.props;
    const filterPlatformUsersId = users =>
      users.filter(u => u.type === 'platform').map(u => u.id);
    this.handleNotPlatformMember(members)
      .then(usersId => [...usersId, ...filterPlatformUsersId(members)])
      .then(ids => handleAddNewMember(ids));
  };
  async handleNotPlatformMember(members) {
    const isNotPlatformMember = m => m.type === 'other';
    const users = members
      .filter(m => isNotPlatformMember(m))
      .reduce((acc, curr) => {
        if (!acc) return curr.user;
        return `${acc},${curr.user}`;
      }, '');
    if (!users) return Promise.resolve([]);
    let res = await inviteNewUserInProject({ data: users });
    if (!res || res.code !== '0') {
      message.error('注册平台外用户失败.');
      return Promise.resolve([]);
    }
    let usersId = res.data.map(u => u.id);
    return Promise.resolve(usersId);
  }
  handleInviteMemberReturnResult = members => {
    this.handleGetAddNewMember(members);
    this.setState({
      addMemberModalVisible: false
    });
  };
  handleToggleVisitControl = checked => {
    const { handleVisitControlChange } = this.props;
    handleVisitControlChange(checked);
  };
  onPopoverVisibleChange = visible => {
    const { handleVisitControlPopoverVisible } = this.props;
    const isClose = visible === false;
    const { addMemberModalVisible, comfirmRemoveModalVisible } = this.state;
    //关闭页面中的其他 弹窗 会影响到 popover 的状态，这里以示区分。
    if (isClose && !addMemberModalVisible && !comfirmRemoveModalVisible) {
      this.setState(
        {
          visible: false
        },
        () => {
          handleVisitControlPopoverVisible(false);
        }
      );
    }
  };
  handleClickedOtherPersonListItem = item => {
    this.setState({
      selectedOtherPersonId: item
    });
  };
  handleSelectedOtherPersonListOperatorItem = ({ _, key }) => {
    const operatorType = key;
    const { handleClickedOtherPersonListOperatorItem } = this.props;
    const { selectedOtherPersonId } = this.state;

    if (operatorType === 'remove') {
      return this.setState({
        comfirmRemoveModalVisible: true
      });
    }
    handleClickedOtherPersonListOperatorItem(
      selectedOtherPersonId,
      operatorType
    );
  };
  handleComfirmRemoveModalOk = e => {
    if (e) e.stopPropagation();
    const { handleClickedOtherPersonListOperatorItem } = this.props;
    const { selectedOtherPersonId } = this.state;
    this.setState(
      {
        comfirmRemoveModalVisible: false
      },
      () => {
        handleClickedOtherPersonListOperatorItem(
          selectedOtherPersonId,
          'remove'
        );
      }
    );
  };
  handleCloseComfirmRemoveModal = e => {
    if (e) e.stopPropagation();
    this.setState({
      comfirmRemoveModalVisible: false
    });
  };
  handleCloseAddMemberModal = e => {
    if (e) e.stopPropagation();
    this.setState({
      addMemberModalVisible: false
    });
  };
  handleAddNewMember = () => {
    this.setState({
      addMemberModalVisible: true
    });
  };
  genPrincipalList = (principalList = []) => {
    const isStr = str => typeof str === 'string'
    const isArrEleAllStr = arr => arr.every(i => isStr(i))
    if(!isArrEleAllStr(principalList)) {
      this.setState({
        transPrincipalList: principalList
      })
      return
    }
    const { currentOrgAllMembersList = []} = this.props;
    const isEachMemberInPrincipalListCanFoundInCurrentOrgAllMembersList = currentOrgAllMembersList =>
      principalList.every(item =>
        currentOrgAllMembersList.find(each => each.id === item)
      );
    let allMember = [...currentOrgAllMembersList]
    const getOthersPersonList = allMember =>
      principalList.reduce((acc, curr) => {
        const id = curr;
        const currPerson = allMember.find(item => item.id === id);
        if(!currPerson) {
          return [...acc]
        }
        const obj = {
          id: currPerson.id,
          name: currPerson.full_name,
          avatar:
            currPerson.avatar && this.isValidAvatar(currPerson.avatar)
              ? currPerson.avatar
              : defaultUserAvatar,
        };
        return [...acc, obj];
      }, []);
      if (
        !isEachMemberInPrincipalListCanFoundInCurrentOrgAllMembersList(
          currentOrgAllMembersList
        )
      ) {
        const notFoundInOrgAllMembersListMembers = principalList.filter(
          item => !currentOrgAllMembersList.find(each => each.id === item)
        );
        fetchUsersByIds({
          ids: notFoundInOrgAllMembersListMembers.reduce((acc, curr) => {
            if (!acc) return curr;
            return `${acc},${curr}`;
          }, '')
        }).then(res => {
          const isApiOk = res => res && res.code === '0';
          if (isApiOk(res)) {
            const getName = user =>
              user.full_name
                ? user.full_name
                : user.mobile
                ? user.mobile
                : user.email
                ? user.email
                : user.name
                ? user.name
                : 'unknown';
            const otherMemberList = res.data.map(u => ({
              id: u.id,
              avatar: u.avatar ? u.avatar : '',
              full_name: getName(u)
            }));
            allMember = [...otherMemberList, ...allMember];
            this.setState({
              transPrincipalList: getOthersPersonList(allMember)
            })

          } else {
            message.error('访问控制中有非该组织成员的人');
            this.setState({
              transPrincipalList: getOthersPersonList(allMember)
            })
            return
          }
        });
      } else {

        this.setState({
          transPrincipalList: getOthersPersonList(allMember)
        })
      }

  }
  parseOtherPrivileges = otherPrivilege => {
    const { currentOrgAllMembersList = [] } = this.props;
    const isEachMemberInOtherPrivilegeCanFoundInCurrentOrgAllMembersList = currentOrgAllMembersList =>
      Object.keys(otherPrivilege).every(item =>
        currentOrgAllMembersList.find(each => each.id === item)
      );
    //如果现有的组织成员列表，不包括所有的人，那么就更新组织成员列表
    let allMember = [...currentOrgAllMembersList];
    const getOthersPersonList = allMember =>
      Object.entries(otherPrivilege).reduce((acc, curr) => {
        const [id, privilageType] = curr;
        const currPerson = allMember.find(item => item.id === id);
        const obj = {
          id: currPerson.id,
          name: currPerson.full_name,
          avatar:
            currPerson.avatar && this.isValidAvatar(currPerson.avatar)
              ? currPerson.avatar
              : defaultUserAvatar,
          privilege: privilageType
        };
        return [...acc, obj];
      }, []);
    if (
      !isEachMemberInOtherPrivilegeCanFoundInCurrentOrgAllMembersList(
        currentOrgAllMembersList
      )
    ) {
      const notFoundInOrgAllMembersListMembers = Object.keys(
        otherPrivilege
      ).filter(
        item => !currentOrgAllMembersList.find(each => each.id === item)
      );
      fetchUsersByIds({
        ids: notFoundInOrgAllMembersListMembers.reduce((acc, curr) => {
          if (!acc) return curr;
          return `${acc},${curr}`;
        }, '')
      }).then(res => {
        const isApiOk = res => res && res.code === '0';
        if (isApiOk(res)) {
          const getName = user =>
            user.full_name
              ? user.full_name
              : user.mobile
              ? user.mobile
              : user.email
              ? user.email
              : user.name
              ? user.name
              : 'unknown';
          const otherMemberList = res.data.map(u => ({
            id: u.id,
            avatar: u.avatar ? u.avatar : '',
            full_name: getName(u)
          }));
          allMember = [...otherMemberList, ...allMember];
          return this.setState({
            othersPersonList: getOthersPersonList(allMember)
          });
        } else {
          message.error('访问控制中有非该组织成员的人');
          return;
        }
      });
    } else {
      this.setState({
        othersPersonList: getOthersPersonList(allMember)
      });
    }
  };
  compareOtherPrivilegeInPropsAndUpdateIfNecessary = nextProps => {
    const { otherPrivilege: nextOtherPrivilege } = nextProps;
    const { otherPrivilege } = this.props;
    const isTheSameOtherPrivilege = (otherPrivilege1, otherPrivilege2) => {
      const objToEntries = obj => Object.entries(obj);
      const isTheSameLength = (arr1 = [], arr2 = []) =>
        arr1.length === arr2.length;
      const isEntriesSubset = (arr1 = [], arr2 = []) =>
        arr1.every(([key1, value1]) =>
          arr2.find(([key2, value2]) => key1 === key2 && value1 === value2)
        );
      const otherPrivilege1Entries = objToEntries(otherPrivilege1);
      const otherPrivilege2Entries = objToEntries(otherPrivilege2);
      if (
        isTheSameLength(otherPrivilege1Entries, otherPrivilege2Entries) &&
        isEntriesSubset(otherPrivilege1Entries, otherPrivilege2Entries)
      ) {
        return true;
      }
      return false;
    };
    if (!isTheSameOtherPrivilege(otherPrivilege, nextOtherPrivilege)) {
      this.parseOtherPrivileges(nextOtherPrivilege);
    }
  };
  handleClickedInVisitControl = e => {
    if (e) e.stopPropagation();
    const { handleVisitControlPopoverVisible } = this.props;
    handleVisitControlPopoverVisible(true);
  };
  componentDidMount() {
    //将[id]:privilageType 对象转化为数组
    const { otherPrivilege = [], principalList = [] } = this.props;
    this.parseOtherPrivileges(otherPrivilege);
    this.genPrincipalList(principalList)
  }
  componentWillReceiveProps(nextProps) {
    this.compareOtherPrivilegeInPropsAndUpdateIfNecessary(nextProps);
  }
  renderPopoverTitle = () => {
    const { isPropVisitControl } = this.props;
    const unClockIcon = (
      <i className={`${globalStyles.authTheme} ${styles.title__text_icon}`}>
        &#xe86b;
      </i>
    );
    const clockIcon = (
      <i className={`${globalStyles.authTheme} ${styles.title__text_icon}`}>
        &#xe86a;
      </i>
    );
    return (
      <div className={styles.title__wrapper}>
        <span className={styles.title__text_wrapper}>
          {isPropVisitControl ? clockIcon : unClockIcon}
          <span className={styles.title__text_content}>访问控制</span>
        </span>
        <span className={styles.title__operator}>
          <Switch
            checked={isPropVisitControl}
            onChange={this.handleToggleVisitControl}
          />
        </span>
      </div>
    );
  };
  renderOtherPersonOperatorMenu = privilege => {
    const { otherPersonOperatorMenuItem } = this.props;
    const { Item } = Menu;
    return (
      <Menu onClick={this.handleSelectedOtherPersonListOperatorItem}>
        {otherPersonOperatorMenuItem.map(({ key, value, style }) => {
          const itemClass = cx({
            content__othersPersonList_Item_operator_dropdown_menu_item: true,
            content__othersPersonList_Item_operator_dropdown_menu_item_disabled:
              value === privilege ? true : false
          });
          return (
            <Item key={value}>
              <div
                onClick={
                  value === privilege ? e => e.stopPropagation() : () => {}
                }
                className={itemClass}
                style={style ? style : {}}
              >
                <span>{key}</span>
              </div>
            </Item>
          );
        })}
      </Menu>
    );
  };
  renderPopoverContentPrincipalList() {
    const { principalInfo } = this.props;
    const {transPrincipalList} = this.state
    return (
      <div className={styles.content__principalList_wrapper}>
        <span className={styles.content__principalList_icon}>
          <AvatarList
            size="mini"
            maxLength={10}
            excessItemsStyle={{
              color: '#f56a00',
              backgroundColor: '#fde3cf'
            }}
          >
            {transPrincipalList.map(({ name, avatar }, index) => (
              <AvatarList.Item
                key={index}
                tips={name}
                src={this.isValidAvatar(avatar) ? avatar : defaultUserAvatar}
              />
            ))}
          </AvatarList>
        </span>
        <span className={styles.content__principalList_info}>
          {`${transPrincipalList.length}${principalInfo}`}
        </span>
      </div>
    );
  };
  renderPopoverContentOthersPersonList = () => {
    const { otherPersonOperatorMenuItem } = this.props;
    const { othersPersonList } = this.state;
    return (
      <div className={styles.content__othersPersonList_wrapper}>
        {othersPersonList.map(({ id, name, avatar, privilege }) => (
          <div
            key={id}
            className={styles.content__othersPersonList_Item_wrapper}
          >
            <span className={styles.content__othersPersonList_Item_info}>
              <img
                width="20"
                height="20"
                src={avatar}
                alt=""
                className={styles.content__othersPersonList_Item_avatar}
              />
              <span className={styles.content__othersPersonList_Item_name}>
                {name}
              </span>
            </span>
            <Dropdown
              trigger={['click']}
              overlay={this.renderOtherPersonOperatorMenu(privilege)}
            >
              <span
                onClick={() => this.handleClickedOtherPersonListItem(id)}
                className={styles.content__othersPersonList_Item_operator}
              >
                <span
                  className={
                    styles.content__othersPersonList_Item_operator_text
                  }
                >
                  {
                    otherPersonOperatorMenuItem.find(
                      item => item.value === privilege
                    ).key
                  }
                </span>
                <span
                  className={`${globalStyles.authTheme} ${
                    styles.content__othersPersonList_Item_operator_icon
                  }`}
                >
                  &#xe7ee;
                </span>
              </span>
            </Dropdown>
          </div>
        ))}
      </div>
    );
  };
  renderPopoverContentAddMemberBtn = () => {
    return (
      <div className={styles.content__addMemberBtn_wrapper}>
        <Button type="primary" block onClick={this.handleAddNewMember}>
          添加成员
        </Button>
      </div>
    );
  };
  renderPopoverContentNoContent = () => {
    return (
      <div className={styles.content__noConten_wrapper}>
        <div className={styles.content__noConten_img} />
        <div className={styles.content__noConten_text}>暂无人员</div>
      </div>
    );
  };
  isCurrentHasNoMember = () => {
    const { principalList } = this.props;
    const { othersPersonList } = this.state;
    return principalList.length === 0 && othersPersonList.length === 0;
  };
  renderPopoverContent = () => {
    const {notShowPrincipal} = this.props
    return (
      <div className={styles.content__wrapper}>
        <div className={styles.content__list_wrapper}>
          {this.isCurrentHasNoMember() ? (
            <>{this.renderPopoverContentNoContent()}</>
          ) : (
            <>
              {!notShowPrincipal && this.renderPopoverContentPrincipalList()}
              {this.renderPopoverContentOthersPersonList()}
            </>
          )}
        </div>
        {this.renderPopoverContentAddMemberBtn()}
      </div>
    );
  };
  render() {
    const {
      tooltipUnClockText,
      tooltipClockText,
      isPropVisitControl,
      removeMemberPromptText,
      popoverPlacement,
      children,
      onlyShowPopoverContent
    } = this.props;
    const {
      addMemberModalVisible,
      visible,
      comfirmRemoveModalVisible
    } = this.state;
    const unClockEle = (
      <Tooltip title={tooltipUnClockText}>
        <i className={`${globalStyles.authTheme} ${styles.trigger__icon}`}>
          &#xe86b;
        </i>
      </Tooltip>
    );
    const clockEle = (
      <Tooltip title={tooltipClockText}>
        <span className={styles.trigger__btn__wrapper}>
          <i
            className={`${globalStyles.authTheme} ${styles.trigger__btn__icon}`}
          >
            &#xe86a;
          </i>
          <span className={styles.trigger__btn_text}>访问控制</span>
        </span>
      </Tooltip>
    );
    return (
      <div
        className={styles.wrapper}
        onClick={e => this.handleClickedInVisitControl(e)}
      >
        {!onlyShowPopoverContent && (
          <Popover
            placement={popoverPlacement}
            title={this.renderPopoverTitle()}
            content={this.renderPopoverContent()}
            trigger="click"
            visible={visible}
            onVisibleChange={this.onPopoverVisibleChange}
          >
            {children ? (
              <span
                style={{ position: 'relative' }}
                className={styles.trigger__wrapper}
                onClick={e => this.togglePopoverVisible(e)}
              >
                {children}
              </span>
            ) : (
              <span
                className={styles.trigger__wrapper}
                onClick={e => this.togglePopoverVisible(e)}
              >
                {isPropVisitControl ? clockEle : unClockEle}
              </span>
            )}
          </Popover>
        )}
        {onlyShowPopoverContent &&(
          <div style={{marginLeft: '-40%', textAlign: 'center'}}>
            <div style={{marginTop: '-24px'}}>{this.renderPopoverTitle()}</div>
            <div>{this.renderPopoverContent()}</div>
          </div>
        )}
        <Modal
          visible={addMemberModalVisible}
          destroyOnClose={true}
          footer={null}
          zIndex={1099}
          onCancel={this.handleCloseAddMemberModal}
        >
          <InviteOthers
            title="邀请他人一起参与"
            isShowTitle={true}
            submitText="确定"
            handleInviteMemberReturnResult={this.handleInviteMemberReturnResult}
            isDisableSubmitWhenNoSelectItem={true}
          />
        </Modal>
        <Modal
          visible={comfirmRemoveModalVisible}
          destroyOnClose={true}
          zIndex={1100}
          onCancel={this.handleCloseComfirmRemoveModal}
          onOk={this.handleComfirmRemoveModalOk}
          title="确定要移出此用户吗?"
        >
          <p>{removeMemberPromptText}</p>
        </Modal>
      </div>
    );
  }
}

VisitControl.defaultProps = {
  onlyShowPopoverContent: false, //是否直接显示popover里的内容
  popoverPlacement: 'bottomRight', //popoverplacement
  tooltipUnClockText: '访问控制', //默认的popover包裹元素的tooltip
  tooltipClockText: '关闭访问控制', //默认的popover包裹元素的tooltip
  isPropVisitControl: true, //是否开启访问控制
  handleVisitControlChange: function() {
    //访问控制 change 的回调函数
    message.error('handleVisitControlChange is required. ');
  },
  principalInfo: '位任务负责人', //已有权限人提示信息
  principalList: [
    //负责人列表
    // {
    //   name: 'Jake',
    //   avatar:
    //     'https://gw.alipayobjects.com/zos/rmsportal/zOsKZmFRdUtvpqCImOVY.png'
    // }
  ],
  notShowPrincipal: false, //不显示权限人列表
  otherPersonOperatorMenuItem: [
    //添加人员的菜单操作映射
    {
      key: '仅查看',
      value: 'read'
    },
    {
      key: '可编辑',
      value: 'edit'
    },
    {
      key: '可评论',
      value: 'comment'
    },
    {
      key: '移出',
      value: 'remove',
      style: {
        color: '#f73b45'
      }
    }
  ],
  otherPrivilege: {}, //现有的添加人员列表
  //{'id': 'read'}
  handleClickedOtherPersonListOperatorItem: function() {
    //点击选中邀请进来的外部人员的下拉菜单项目的回调函数
  },
  handleAddNewMember: function() {
    //...          //添加成员返回的 成员id 数组
  },
  removeMemberPromptText: '移出后用户将不能访问此内容',
  handleVisitControlPopoverVisible: function() {} //单击本组件，或者是本组件visible改变的时候，将popover组件的visible状态传达到父组件。
};

export default VisitControl;
