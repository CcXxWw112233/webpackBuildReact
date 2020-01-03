import React from "react";
import indexStyles from "./index.less";
import { Avatar, Modal, Menu, Dropdown, Icon } from "antd";
import { color_4, min_page_width } from "../../../../../globalset/js/styles";
import { currentNounPlanFilterName } from "../../../../../utils/businessFunction";
import { ORGANIZATION } from "../../../../../globalset/js/constant";
import Cookies from "js-cookie";
import CreateOrganizationModal from "../../HeaderNav/CreateOrganizationModal";
import NewsListNewDatas from "../../NewsDynamic/NewsListNewDatas";
import InitialNews from "./component/InitialNews";

export default class PersonNews extends React.Component {
  state = {
    createOrganizationVisable: false,
    width: document.getElementById("technologicalOut").clientWidth - 20,
    isShowBottDetail: false,

    clientHeight: document.documentElement.clientHeight, //获取页面可见高度
    clientWidth: document.documentElement.clientWidth, //获取页面可见高度
    siderRightWidth: 56 //右边栏宽度
  };

  componentDidMount() {
    window.addEventListener(
      "resize",
      this.resizeTTY
    );
    this.listenSiderRightresize();
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeTTY)
  }
  resizeTTY = (type) => {
    if (!document.getElementById("technologicalOut")) {
      return
    }
    const width = document.getElementById("technologicalOut").clientWidth; //获取页面可见高度
    const clientHeight = document.documentElement.clientHeight; //获取页面可见高度
    const clientWidth = document.documentElement.clientWidth + 16; //获取页面可见高度

    this.setState({
      width,
      clientHeight,
      clientWidth
    });
  }

  routingJump(route) {
    this.props.routingJump("");
  }
  logout(e) {
    e.stopPropagation();
    const that = this;
    Modal.confirm({
      title: "确定退出登录？",
      okText: "确认",
      zIndex: 2000,
      onOk: that.props.logout,
      cancelText: "取消"
    });
  }

  //创建或加入组织
  setCreateOrgnizationOModalVisable() {
    this.setState({
      createOrganizationVisable: !this.state.createOrganizationVisable
    });

  }

  handleOrgListMenuClick = e => {
    const { key } = e;
    if ("10" == key) {
      this.setCreateOrgnizationOModalVisable();
      return;
    }
    const {
      datas: { currentUserOrganizes = [] }
    } = this.props.model;
    for (let val of currentUserOrganizes) {
      if (key === val["id"]) {
        Cookies.set("org_id", val.id, { expires: 30, path: "" });
        localStorage.setItem("currentSelectOrganize", JSON.stringify(val));
        this.props.updateDatas({ currentSelectOrganize: val });
        this.props.changeCurrentOrg({ org_id: val.id });
        break;
      }
    }
  };

  //展开与关闭
  setIsShowBottDetail() {
    const element = document.getElementById("dynamicsContainer");
    const that = this;
    this.setState(
      {
        isShowBottDetail: !this.state.isShowBottDetail
      },
      function () {
        setTimeout(function () {
          that.setState({
            isShowBottDetailStyleSet: that.state.isShowBottDetail
          });
        }, 200);
        this.funTransitionHeight(element, 200, this.state.isShowBottDetail);
      }
    );
  }
  funTransitionHeight = function (element, time, type) {
    // time, 数值，可缺省
    if (typeof window.getComputedStyle === "undefined") return;
    const height = window.getComputedStyle(element).height;
    element.style.transition = "none"; // mac Safari下，貌似auto也会触发transition, 故要none下~
    element.style.height = "auto";
    const targetHeight = window.getComputedStyle(element).height;
    element.style.height = height;
    element.offsetWidth;
    if (time) element.style.transition = "height " + time + "ms";
    element.style.height = !!type ? targetHeight : 0;
  };

  newsOutScroll(e) {
    e.stopPropagation();
  }

  maskScroll(e) {
    e.stopPropagation();
  }
  maskOver(bool, e) {
    // document.querySelector('body').style.overflow = bool?'':'hidden'
  }

  //监听右边栏宽高变化
  listenSiderRightresize() {
    const that = this;
    // Firefox和Chrome早期版本中带有前缀
    const MutationObserver =
      window.MutationObserver ||
      window.WebKitMutationObserver ||
      window.MozMutationObserver;
    // 选择目标节点
    const target = document.getElementById("siderRight");
    if (!target) {
      return
    }
    // 创建观察者对象
    const observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        that.setState({
          siderRightWidth:
            document.getElementById("siderRight").clientWidth === 56 ? 300 : 56
        });
      });
    });
    // 配置观察选项:
    const config = {
      attributes: true, //检测属性变动
      subtree: true
      // childList: true,//检测子节点变动
      // characterData: true//节点内容或节点文本的变动。
    };
    // 传入目标节点和观察选项
    observer.observe(target, config);
    // /停止观察
    // observer.disconnect();
    //https://blog.csdn.net/zfz5720/article/details/83095535
  }
  render() {
    const {
      width,
      isShowBottDetail,
      isShowBottDetailStyleSet,
      clientHeight,
      clientWidth,
      siderRightWidth
    } = this.state;
    let transWidth = width < min_page_width ? min_page_width : width;
    transWidth = isShowBottDetail ? transWidth - siderRightWidth : transWidth;

    const { datas = {} } = this.props.model;
    const { currentUserOrganizes = [], currentSelectOrganize = {} } = datas; //currentUserOrganizes currentSelectOrganize组织列表和当前组织
    const { current_org = {}, name, avatar } = localStorage.getItem('userInfo')
      ? JSON.parse(localStorage.getItem('userInfo'))
      : {};
    const { identity_type } = current_org; //是否访客 1不是 0是
    const orgnizationName =
      currentSelectOrganize.name || currentNounPlanFilterName(ORGANIZATION);

    const orgListMenu = (
      <Menu onClick={this.handleOrgListMenuClick.bind(this)} selectable={true}>
        {currentUserOrganizes.map((value, key) => {
          const { name, id } = value;
          return <Menu.Item key={id}>{name}</Menu.Item>;
        })}
        <Menu.Item key="10">
          <div className={indexStyles.itemDiv} style={{ color: color_4 }}>
            <Icon
              type="plus-circle"
              theme="outlined"
              style={{ margin: 0, fontSize: 16 }}
            />{" "}
            创建或加入新{currentNounPlanFilterName(ORGANIZATION)}
          </div>
        </Menu.Item>
      </Menu>
    );

    const maskWidth = clientWidth - siderRightWidth - 16; //16是margin的值

    return (
      <div>
        {isShowBottDetail ? (
          <div
            className={indexStyles.mask}
            onMouseOver={this.maskOver.bind(this, false)}
            onMouseOut={this.maskOver.bind(this, true)}
            onScroll={this.maskScroll.bind(this)}
            style={{ width: maskWidth, height: clientHeight }}
          />
        ) : (
            ""
          )}
        <div
          className={indexStyles.person_news_out}
          style={{
            width: transWidth,
            position: !isShowBottDetail ? "relative" : "fixed",
            zIndex: !isShowBottDetail ? 1 : 100
          }}
        >
          {/* <div className={indexStyles.contain1}>
            <div className={indexStyles.contain1_one}>
              <Avatar size={32} src={avatar}>
                u
              </Avatar>
            </div>
            <Dropdown overlay={orgListMenu}>
              <div className={indexStyles.contain1_one}>
                您好,{orgnizationName}
              </div>
            </Dropdown>
            <div
              className={indexStyles.contain1_one}
              onClick={(() => {
                this.props.dispatch({
                  type: 'technological/routingJump',
                  payload: {
                    route: "/technological/accoutSet"
                  }
                })
              })}
            >
              {name}
            </div>
            <div
              className={indexStyles.contain1_one}
              onClick={this.logout.bind(this)}
            >
              退出
            </div>
          </div> */}
          <div
            id={"dynamicsContainer"}
            onScroll={this.newsOutScroll.bind(this)}
            className={
              isShowBottDetail
                ? indexStyles.contain2
                : indexStyles.contain2_hide
            }
            style={{
              maxHeight: clientHeight * 0.8,
              overflow: !isShowBottDetail ? "hidden" : "auto"
            }}
          >
            {!isShowBottDetail ? (
              <InitialNews {...this.props} />
            ) : (
                <NewsListNewDatas {...this.props} />
              )}
          </div>
          <div
            className={indexStyles.spin_turn}
            onClick={this.setIsShowBottDetail.bind(this)}
          >
            <Icon type={!isShowBottDetail ? "down" : "up"} />
          </div>
          <div className={indexStyles.bott_opacity} />
          <CreateOrganizationModal
            {...this.props}
            createOrganizationVisable={this.state.createOrganizationVisable}
            setCreateOrgnizationOModalVisable={this.setCreateOrgnizationOModalVisable.bind(
              this
            )}
          />
        </div>
      </div>
    );
  }
}
