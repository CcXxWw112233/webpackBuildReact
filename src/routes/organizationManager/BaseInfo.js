import React from 'react'
import indexStyles from './index.less'
import { Input, Radio, Button, message, Upload, Icon } from 'antd'
import {
  MESSAGE_DURATION_TIME, NOT_HAS_PERMISION_COMFIRN, ORG_UPMS_ORGANIZATION_MEMBER_QUERY, REQUEST_DOMAIN,
  ORG_UPMS_ORGANIZATION_EDIT,
  UPLOAD_FILE_SIZE, PROJECTS, ORGANIZATION, MEMBERS
} from "../../globalset/js/constant";
import Cookies from 'js-cookie'
import {validateEmail, validateEmailSuffix} from "../../utils/verify";
import {checkIsHasPermission, currentNounPlanFilterName} from "../../utils/businessFunction";
import { setUploadHeaderBaseInfo } from '@/utils/businessFunction'

const RadioGroup = Radio.Group;
//
export default class BaseInfo extends React.Component {
  state = {
    name: '',
    member_join_model: '1',
    member_join_content: '',
    logo: '',
    logo_id: '',
    uploading: false,
    saveButtonDisabled: false, //确认按钮是否可点击
  }
  storeChange(key, value) {
    const { datas: { currentOrganizationInfo = {} }} = this.props.model
    currentOrganizationInfo[key] = value
    this.props.updateDatas({
      currentOrganizationInfo
    })
  }
  nameChange(e) {
    const value = e.target.value
    this.storeChange('name', value)
    let flag = true
    if(value) {
      flag = false
    }
    this.setState({
      saveButtonDisabled: flag
    })
  }
  ratioOnChange = (e) => {
    this.storeChange('member_join_model', e.target.value)
  }
  memberJoinContent(e) {
    const newvalue = e.target.value? e.target.value.replace(/\s/gim, ',') : ''
    this.storeChange('member_join_content', newvalue)
  }
  deleteUpload() {
    const { datas: { currentOrganizationInfo = {} }} = this.props.model
    currentOrganizationInfo['logo'] = ''
    currentOrganizationInfo['logo_id'] = ''
    this.props.updateDatas({
      currentOrganizationInfo
    })
  }
  finallySave() {
    if(!checkIsHasPermission(ORG_UPMS_ORGANIZATION_EDIT)){
      message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
      return false
    }
    const { datas: { currentOrganizationInfo = {} }} = this.props.model
    const { name, logo_id, member_join_model, member_join_content, id } = currentOrganizationInfo

    //将邮箱后缀转化
    let new_member_join_content = member_join_content
    if(member_join_model === '3'){
      let memberArr = member_join_content.split(',') //转成数组
      let newMemberArr = []
      for (let val of memberArr) {
        if (val !== ''){
          newMemberArr.push(val)
        }
      }
      if(!member_join_content) {
        message.warn('请输入邮箱后缀名。', MESSAGE_DURATION_TIME)
        return false
      }
      for(let val of newMemberArr ) {
        if(!validateEmailSuffix(val)) {
          message.warn('请正确输入邮箱后缀名。', MESSAGE_DURATION_TIME)
          return false
        }
      }
      new_member_join_content = newMemberArr.join(',')
    }
    const obj = {
      name,
      member_join_model,
      member_join_content: new_member_join_content,
      logo: logo_id,
      org_id: id
    }
    this.props.updateOrganization(obj)
  //  请求
  }
  render() {
    const { uploading, saveButtonDisabled } = this.state
    const { datas: { currentOrganizationInfo = {} }} = this.props.model
    const { logo, name, logo_id, member_join_model, member_join_content } = currentOrganizationInfo
    const newMember_join_content = member_join_content? member_join_content.replace(/\,/gim, ' ') : ''
    const that = this
    const uploadProps = {
      name: 'file',
      withCredentials: true,
      action: `${REQUEST_DOMAIN}/organization/logo_upload`,
      headers: {
        Authorization: Cookies.get('Authorization'),
        refreshToken: Cookies.get('refreshToken'),
        ...setUploadHeaderBaseInfo({}),
      },
      beforeUpload(e) {
        if(!checkIsHasPermission(ORG_UPMS_ORGANIZATION_EDIT)){
          message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
          return false
        }
        if(e.size == 0) {
          message.error(`不能上传空文件`)
          return false
        }else if(e.size > UPLOAD_FILE_SIZE * 1024 * 1024) {
          message.error(`上传文件不能文件超过${UPLOAD_FILE_SIZE}MB`)
          return false
        }
      },
      onChange({ file, fileList, event }) {
        // console.log(file)
        if (file.status === 'uploading') {
          that.setState({
            uploading: true
          })
        }
        if (file.status !== 'uploading') {
          that.setState({
            uploading: false
          })
          if (file.response && file.response.data) {
            that.storeChange('logo', file.response.data.logo)
            that.storeChange('logo_id', file.response.data.logo_id)
          }
        }
        if (file.status === 'done') {
          message.success(`上传成功。`);
          that.setState({
            uploading: false
          })
        } else if (file.status === 'error') {
          message.error(`上传失败。`);
          that.setState({
            uploading: false
          })
        }
        if (file.response && file.response.code == '0') {
          const obj = {...currentOrganizationInfo}
          obj.logo = file.response.data.url
          that.props.updateDatas({
            currentOrganizationInfo: obj
          })
        }
      },
    };

    return (
      <div className={indexStyles.baseInfoOut}>
        <div className={indexStyles.baseInfo_title}>
          {currentNounPlanFilterName(ORGANIZATION)}名称
        </div>
        <Input placeholder={`输入${currentNounPlanFilterName(ORGANIZATION)}名称`} value={name} style={{marginTop: 8}} onChange={this.nameChange.bind(this)}/>
        <div className={indexStyles.baseInfo_title_2}>
          {currentNounPlanFilterName(ORGANIZATION)}LOGO
        </div>
        <div className={indexStyles.baseInfo_des}>你的企业标识会一直显示在协作平台的左上方，为了达到更好的显示效果，上传尺寸请保持在64像素以上的正方形。</div>
        <div className={indexStyles.UploadOut}>
          {logo? (
            <img src={logo} />
          ) : (
            <div className={indexStyles.instepImg}></div>
          )}
          <div className={indexStyles.delete} onClick={this.deleteUpload.bind(this)}>删除</div>
          <Upload {...uploadProps} showUploadList={false} accept={"image/jpg, image/jpeg,  image/png"}>
            <Button>
              <Icon type="upload" /> Click to Upload
            </Button>
          </Upload>
          <div style={{width: 120}} >
            {uploading?(
              <span><Icon type="loading" style={{fontSize: 20, marginLeft: 12}}/>'上传中...'</span>
            ):('')}
          </div>
        </div>

        <div className={indexStyles.baseInfo_title_2}>
          {currentNounPlanFilterName(MEMBERS)}加入模式
        </div>
        <div className={indexStyles.baseInfo_des}>设置新{currentNounPlanFilterName(MEMBERS)}以何种方式加入或找到{currentNounPlanFilterName(ORGANIZATION)}。</div>
        <RadioGroup onChange={this.ratioOnChange} value={member_join_model} style={{marginTop: 8}}>
          <Radio style={radioStyle} value={'1'}>仅能通过邀请加入</Radio>
          <Radio style={radioStyle} value={'2'}>申请加入者需通过许可</Radio>
          <Radio style={radioStyle} value={'3'}>任意满足以下邮箱后缀名并完成邮件认证的用户可自动加入。</Radio>
        </RadioGroup>
        <Input placeholder={'@examlpe.com'} style={{marginTop: 8}} onChange={this.memberJoinContent.bind(this)} value={newMember_join_content}/>
        <div className={indexStyles.baseInfo_des} style={{color: '#BFBFBF'}}>请使用空格符号分隔多个后缀名</div>
        <div style={{margin: '0 auto', marginTop: 20, textAlign: 'center'}}>
          <Button type={'primary'} onClick={this.finallySave.bind(this)} disabled={saveButtonDisabled}>保存</Button>
        </div>
      </div>
    )
  }
}
const radioStyle = {
  display: 'block',
  height: '30px',
  lineHeight: '30px',
};
