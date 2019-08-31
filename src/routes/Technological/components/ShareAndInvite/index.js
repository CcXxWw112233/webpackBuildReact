import React, { Component } from "react";
import { Modal, Dropdown, Menu, Button, message, Input } from "antd";
import DrawerContentStyles from "./index.less";
import {
  timestampToTimeNormal2,
  timeToTimestamp
} from "./../../../../utils/util";

class ShareAndInvite extends Component {
  constructor(props) {
    super(props);
    this.linkRef = React.createRef();
    this.pwdRef = React.createRef();
    this.state = {
      expMenuValue: "forever",
      is_shared: props.is_shared === "1" ? "1" : "0"
    };
  }
  handleConfirmOnlyReadingShare = e => {
    if (e) e.stopPropagation();
    message.success("复制成功");
    this.shutOnlyReadingShareModal();
  };
  handleCancelOnlyReadingShare = e => {
    if (e) e.stopPropagation();
    this.shutOnlyReadingShareModal();
  };
  shutOnlyReadingShareModal = () => {
    const { handleChangeOnlyReadingShareModalVisible } = this.props;
    handleChangeOnlyReadingShareModalVisible();
  };
  copyContentToClipBoard = content => {
    if (!content) {
      message.error("没有可复制内容");
    }
    const input = document.createElement("input");
    //ios 呼出虚拟键盘，造成屏幕闪烁一下
    input.setAttribute("readonly", "readyonly");
    input.setAttribute("value", content);
    document.body.appendChild(input);
    input.setSelectionRange(0, 9999);
    input.select();
    if (document.execCommand("copy")) {
      document.execCommand("copy");
      message.success("复制成功");
    }
    document.body.removeChild(input);
  };
  getCopyContent = () => {
    const { data } = this.props;
    if (!data.short_link || !data.password) return "";
    const link = data.short_link;
    const password = data.password;
    const format = `${link}
    ${password}`;
    return format;
  };
  handleOnlyReadingShareCopyLinkAndPwd = () => {
    const content = this.getCopyContent();
    this.copyContentToClipBoard(content);
    this.shutOnlyReadingShareModal();
  };
  handleOnlyReadingShareStopShare = () => {
    const { data, handleOnlyReadingShareExpChangeOrStopShare } = this.props;
    const obj = {
      id: data.id,
      status: "0"
    };
    this.setShareStop();
    handleOnlyReadingShareExpChangeOrStopShare(obj);
    this.shutOnlyReadingShareModal();
  };
  setShareStop = () => {
    this.setState({
      is_shared: "0"
    });
  };
  transDaysToExpiretime = key => {
    const now = Date.now();
    const dayToSec = 1000 * 60 * 60 * 24;
    const stations = {
      day1: now + dayToSec,
      day3: now + dayToSec * 3,
      day7: now + dayToSec * 7,
      forever: "0"
    };
    return stations[key] ? stations[key] : "0";
  };
  handleOnlyReadingShareEXPMenuClick = ({ item, key }) => {
    const { data, handleOnlyReadingShareExpChangeOrStopShare } = this.props;
    const expiretime = this.transDaysToExpiretime(key);
    const obj = {
      id: data.id,
      expiretime
    };
    handleOnlyReadingShareExpChangeOrStopShare(obj);
    this.setState({
      expMenuValue: key
    });
  };
  handleShareMenuClick = ({ item, key }) => {
    const { handleChangeOnlyReadingShareModalVisible } = this.props;
    const shareMenuMap = new Map([
      ["onlyReadingShare", () => handleChangeOnlyReadingShareModalVisible()]
    ]);
    const action = shareMenuMap.get(key);
    if (action) action();
  };
  formatExp = (timestamp = "") => {
    const timeStr = timestampToTimeNormal2(timestamp);
    const formatStr = `至${timeStr}`;
    return formatStr;
  };
  render() {
    const {
      onlyReadingShareModalVisible,
      data,
      handleChangeOnlyReadingShareModalVisible
    } = this.props;
    const { expMenuValue, is_shared } = this.state;

    let renderOnlyReadingShareEXPMenu = (
      <Menu
        openKeys={[expMenuValue]}
        onClick={this.handleOnlyReadingShareEXPMenuClick}
      >
        <Menu.Item key="day1">1天</Menu.Item>
        <Menu.Item key="day3">3天</Menu.Item>
        <Menu.Item key="day7">7天</Menu.Item>
        <Menu.Item key="forever">永久</Menu.Item>
      </Menu>
    );

    const shareMenu = (
      <Menu onClick={this.handleShareMenuClick}>
        <Menu.Item key="onlyReadingShare">
          <span>只读分享</span>
        </Menu.Item>
        <Menu.Item key="inviteNewMember">
          <span>邀请新成员</span>
        </Menu.Item>
      </Menu>
    );
    return (
      <div className={DrawerContentStyles.wrapper}>
        {is_shared === "1" ? (
          <p
            className={DrawerContentStyles.right__shareIndicator}
            onClick={() => handleChangeOnlyReadingShareModalVisible()}
          >
            <span className={DrawerContentStyles.right__shareIndicator_icon} />
            <span className={DrawerContentStyles.right__shareIndicator_text}>
              正在分享
            </span>
          </p>
        ) : null}
        <Dropdown overlay={shareMenu}>
          <span className={DrawerContentStyles.right__share} />
        </Dropdown>
        {onlyReadingShareModalVisible && (
          <Modal
            footer={null}
            zIndex={1007}
            maskClosable={false}
            width={626}
            title="只读分享"
            visible={onlyReadingShareModalVisible}
            onOk={this.handleConfirmOnlyReadingShare}
            onCancel={this.handleCancelOnlyReadingShare}
          >
            <p className={DrawerContentStyles.onlyReadingShareModal__spec}>
              无需加入团队，每次通过密码查看，适合分享给客户、合作方等外部人员
            </p>
            <p
              className={
                DrawerContentStyles.onlyReadingShareModal__linkAndPasswordWrapper
              }
            >
              <span
                className={
                  DrawerContentStyles.onlyReadingShareModal__linkWrapper
                }
              >
                <span
                  className={
                    DrawerContentStyles.onlyReadingShareModal__link_title
                  }
                >
                  链接
                </span>
                <span
                  className={
                    DrawerContentStyles.onlyReadingShareModal__link_input
                  }
                >
                  <Input readOnly value={data.short_link} ref={this.linkRef} />
                </span>
              </span>
              <span
                className={
                  DrawerContentStyles.onlyReadingShareModal__passwordWrapper
                }
              >
                <span
                  className={
                    DrawerContentStyles.onlyReadingShareModal__password_title
                  }
                >
                  密码
                </span>
                <span
                  className={
                    DrawerContentStyles.onlyReadingShareModal__password_input
                  }
                >
                  <Input readOnly value={data.password} ref={this.pwdRef} />
                </span>
              </span>
            </p>
            <div
              className={
                DrawerContentStyles.onlyReadingShareModal__operatorWrapper
              }
            >
              <p
                className={
                  DrawerContentStyles.onlyReadingShareModal__operatorEXPWrapper
                }
              >
                <span
                  className={
                    DrawerContentStyles.onlyReadingShareModal__operatorEXP_title
                  }
                >
                  有效期
                </span>
                <span
                  className={
                    DrawerContentStyles.onlyReadingShareModal__operatorEXP_selected
                  }
                >
                  {data.expiretime === "0"
                    ? "永久"
                    : this.formatExp(data.expiretime)}
                </span>
                <Dropdown overlay={renderOnlyReadingShareEXPMenu}>
                  <span
                    className={
                      DrawerContentStyles.onlyReadingShareModal__operatorEXP_select
                    }
                  >
                    更改
                  </span>
                </Dropdown>
              </p>
              <p
                className={
                  DrawerContentStyles.onlyReadingShareModal__operatorShareWrapper
                }
              >
                <span
                  className={
                    DrawerContentStyles.onlyReadingShareModal__operatorShareStopShare
                  }
                  onClick={this.handleOnlyReadingShareStopShare}
                >
                  停止分享
                </span>
                <Button onClick={this.handleOnlyReadingShareCopyLinkAndPwd}>
                  复制链接和密码
                </Button>
              </p>
            </div>
          </Modal>
        )}
      </div>
    );
  }
}

export default ShareAndInvite;
