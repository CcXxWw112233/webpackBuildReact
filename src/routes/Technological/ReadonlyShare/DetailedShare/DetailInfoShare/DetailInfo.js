import React from 'react'
import detailInfoStyle from './DetailInfo.less'
import {
  Icon,
  Menu,
  Dropdown,
  Tooltip,
  Modal,
  Checkbox,
  Card,
  Progress,
  Input,
  Button
} from 'antd'
import ShowAddMenberModal from '../../Project/ShowAddMenberModal'
import { isHasOrgMemberQueryPermission } from './../../../../../utils/businessFunction'
import NoPermissionUserCard from './../../../../../components/NoPermissionUserCard/index'
import UserCard from './../../../../../components/UserCard/index'

const TextArea = Input.TextArea

const detaiDescription =
  '欢迎使用ProductName，为了帮助你更好的上手使用好ProductName，我们为你提前预置了这个项目并放置一些帮助你理解每项功能特性的任务卡片。不会耽误你特别多时间，只需要抽空点开卡片并跟随里面的内容提示进行简单操作，即可上手使用。此处显示的文字为项目的介绍信息，旨在帮助参与项目的成员快速了解项目的基本概况，点击可编辑。d如果使用中需要问题，可以随时联系我们进行交流或反馈：app.di-an.com'

export default class DetailInfo extends React.Component {
  state = {
    isSoundsEvrybody: false, //confirm是否通知项目所有人
    isSoundsEvrybody_2: false, //edit是否通知项目所有人
    editDetaiDescription: false, //是否处于编辑状态
    detaiDescriptionValue: '',
    ShowAddMenberModalVisibile: false
  }
  componentWillReceiveProps(props) {
    const {
      datas: { projectDetailInfoData = {} }
    } = props.model
    const { description } = projectDetailInfoData
    this.setState({
      detaiDescriptionValue: description || detaiDescription
    })
  }
  //出现confirm-------------start
  setIsSoundsEvrybody(e) {
    this.setState({
      isSoundsEvrybody: e.target.checked
    })
  }
  confirm(data) {
    const that = this
    Modal.confirm({
      title: '确认将他移出项目吗？',
      content: (
        <div style={{ color: 'rgba(0,0,0, .8)', fontSize: 14 }}>
          <span>退出后将无法获取该项目的相关动态</span>
          {/*<div style={{marginTop:20,}}>*/}
          {/*<Checkbox style={{color:'rgba(0,0,0, .8)',fontSize: 14, }} onChange={this.setIsSoundsEvrybody.bind(this)}>通知项目所有参与人</Checkbox>*/}
          {/*</div>*/}
        </div>
      ),
      okText: '确认',
      cancelText: '取消',
      onOk() {
        that.props.removeMenbers(data)
      }
    })
  }
  //出现confirm-------------end

  //点击区域描述可编辑区域-----------start
  setEditDetaiDescriptionShow() {
    this.setState({
      editDetaiDescription: true
    })
  }
  setEditIsSoundsEvrybody(e) {
    this.setState({
      isSoundsEvrybody_2: e.target.checked
    })
  }
  textAreaChange(e) {
    this.setState({
      detaiDescriptionValue: e.target.value
    })
  }
  editSave(board_id, e) {
    const obj = {
      isSoundsEvrybody_2: this.state.isSoundsEvrybody_2,
      description: this.state.detaiDescriptionValue,
      board_id
    }
    this.props.updateProject(obj)
    this.setState({
      editDetaiDescription: false
    })
  }
  //点击区域描述可编辑区域-----------end

  //点击添加成员操作
  setShowAddMenberModalVisibile() {
    this.setState({
      ShowAddMenberModalVisibile: !this.state.ShowAddMenberModalVisibile
    })
  }

  render() {
    const { editDetaiDescription, detaiDescriptionValue } = this.state
    const {
      datas: { projectInfoDisplay, isInitEntry, projectDetailInfoData = {} }
    } = this.props.model
    let { board_id, board_name, data = [], description } = projectDetailInfoData //data是参与人列表

    data = data || []
    const avatarList = data.concat([1]) //[1,2,3,4,5,6,7,8,9]//长度再加一
    const manImageDropdown = props => {
      const {
        full_name,
        email,
        img,
        mobile,
        user_name,
        user_id,
        we_chat = '无'
      } = props
      if (!isHasOrgMemberQueryPermission()) {
        return <NoPermissionUserCard avatar={img} full_name={full_name} />
      }
      return (
        <UserCard
          avatar={img}
          email={email}
          name={full_name}
          mobile={mobile}
          role_name={''}
        />
      )
      return (
        <div className={detailInfoStyle.manImageDropdown}>
          <div className={detailInfoStyle.manImageDropdown_top}>
            <div className={detailInfoStyle.left}>
              {img ? (
                <img src={img} />
              ) : (
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 32,
                    backgroundColor: '#f2f2f2',
                    textAlign: 'center'
                  }}
                >
                  <Icon
                    type={'user'}
                    style={{ fontSize: 20, color: '#8c8c8c', marginTop: 9 }}
                  />
                </div>
              )}
            </div>
            <div className={detailInfoStyle.right}>
              <div className={detailInfoStyle.name}>{full_name || '佚名'}</div>
              <Tooltip title="该功能即将上线">
                <div className={detailInfoStyle.percent}>
                  <div style={{ width: '0' }}></div>
                  <div style={{ width: '0' }}></div>
                  <div style={{ width: '100%' }}></div>
                </div>
              </Tooltip>
            </div>
          </div>
          <div className={detailInfoStyle.manImageDropdown_middle}>
            <div className={detailInfoStyle.detailItem}>
              <div>姓名：</div>
              <div>{full_name}</div>
            </div>
            <div className={detailInfoStyle.detailItem}>
              <div>组织：</div>
              <div>无</div>
            </div>
            <div className={detailInfoStyle.detailItem}>
              <div>邮箱：</div>
              <div>{email}</div>
            </div>
            <div className={detailInfoStyle.detailItem}>
              <div>手机：</div>
              <div>{mobile}</div>
            </div>
            <div className={detailInfoStyle.detailItem}>
              <div>微信：</div>
              <div>{we_chat}</div>
            </div>
          </div>
          {/*<div className={detailInfoStyle.manImageDropdown_bott}>*/}
          {/*<img src="" />*/}
          {/*</div>*/}
        </div>
      )
    }
    const EditArea = (
      <div>
        <TextArea
          defaultValue={description || detaiDescriptionValue}
          autosize
          className={detailInfoStyle.editTextArea}
          onChange={this.textAreaChange.bind(this)}
        />
        <div style={{ textAlign: 'right' }}>
          <div>
            <Checkbox
              style={{ color: 'rgba(0,0,0, .8)', fontSize: 14, marginTop: 10 }}
              onChange={this.setEditIsSoundsEvrybody.bind(this)}
            >
              通知项目所有参与人
            </Checkbox>
          </div>
          <Button
            type={'primary'}
            style={{ fontSize: 14, marginTop: 10 }}
            onClick={this.editSave.bind(this, board_id)}
          >
            保存
          </Button>
        </div>
      </div>
    )
    return (
      <div className={detailInfoStyle.detailInfoOut}>
        <div
          className={
            projectInfoDisplay
              ? detailInfoStyle.detailInfo
              : detailInfoStyle.detailInfo_2
          }
          style={{ display: isInitEntry ? 'block' : 'none' }}
        >
          <div className={detailInfoStyle.top}>
            <div className={detailInfoStyle.topItem}>
              <div>0</div>
              <div>剩余任务</div>
            </div>
            <div className={detailInfoStyle.topItem}>
              <div style={{ color: '#8c8c8c' }}>0</div>
              <div>已完成</div>
            </div>
            <div className={detailInfoStyle.topItem}>
              <div>0</div>
              <div>距离下一节点</div>
            </div>
          </div>
          <div className={detailInfoStyle.manImageList}>
            {avatarList.map((value, key) => {
              if (key < avatarList.length - 1) {
                const { img, user_id } = value
                return (
                  <div className={detailInfoStyle.manImageItem} key={key}>
                    <div
                      className={detailInfoStyle.delete}
                      onClick={this.confirm.bind(this, { board_id, user_id })}
                    >
                      <Icon type="close" />
                    </div>
                    <Dropdown overlay={manImageDropdown(value)}>
                      {img ? (
                        <img src={img} />
                      ) : (
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 36,
                            backgroundColor: '#f2f2f2',
                            textAlign: 'center'
                          }}
                        >
                          <Icon
                            type={'user'}
                            style={{
                              fontSize: 20,
                              color: '#8c8c8c',
                              marginTop: 9
                            }}
                          />
                        </div>
                      )}
                    </Dropdown>
                  </div>
                )
              } else {
                return (
                  <div
                    className={detailInfoStyle.addManImageItem}
                    key={key}
                    onClick={this.setShowAddMenberModalVisibile.bind(this)}
                  >
                    <Icon
                      type="plus"
                      style={{
                        color: '#8c8c8c',
                        fontSize: 20,
                        fontWeight: 'bold',
                        marginTop: 8
                      }}
                    />
                  </div>
                )
              }
            })}
          </div>
          {!editDetaiDescription ? (
            <div
              className={detailInfoStyle.Bottom}
              onClick={this.setEditDetaiDescriptionShow.bind(this)}
            >
              {detaiDescriptionValue}
            </div>
          ) : (
            EditArea
          )}
        </div>
        <ShowAddMenberModal
          {...this.props}
          board_id={board_id}
          modalVisible={this.state.ShowAddMenberModalVisibile}
          setShowAddMenberModalVisibile={this.setShowAddMenberModalVisibile.bind(
            this
          )}
        />
        <div
          className={
            projectInfoDisplay
              ? detailInfoStyle.maskShow
              : detailInfoStyle.maskHide
          }
        ></div>
      </div>
    )
  }
}
