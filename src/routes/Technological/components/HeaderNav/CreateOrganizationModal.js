//重命名组件
import React from 'react'
import { Modal, Form, Button, Input, message, Select, Spin } from 'antd'
import styles from './CreateOrganizationModal.less'
import { INPUT_CHANGE_SEARCH_TIME } from '../../../../globalset/js/constant'
import { getSearchOrganizationList } from '../../../../services/technological/organizationMember'
import CustormModal from '../../../../components/CustormModal'
import { isApiResponseOk } from '../../../../utils/handleResponseData'
import { ENV_ANDROID_APP } from '../../../../globalset/clientCustorm'

const Option = Select.Option
const FormItem = Form.Item
const TextArea = Input.TextArea

class CreateOrganizationModal extends React.Component {
  state = {
    name: '', //名称
    stepContinueDisabled: true, //确认按钮
    operateType: '0', //0默认申请加入 ‘1’创建组织
    createButtonVisible: false, //输入框里面的按钮
    seachAreaVisible: false, //查询所得到的结果是否显示
    searchTimer: null,
    searchOrganizationList: [], //搜索列表
    spinning: false
  }
  descriptionChange(e) {
    const value = e.target.value
  }
  nameChange(e) {
    const value = e.target.value
    const that = this
    this.setState({
      name: value
    })
    let flag = true
    if (value) {
      flag = false
    }
    this.setState({
      stepContinueDisabled: this.state.operateType === '1' ? flag : true,
      createButtonVisible: this.state.operateType === '0' ? !flag : false, //如果是申请加入界面，那就根据输入，如果是创建组织，则隐藏
      seachAreaVisible: this.state.operateType === '0' ? !flag : false
    })

    //延时调用查询
    const { searchTimer, operateType } = this.state
    if (operateType === '0') {
      if (searchTimer) {
        clearTimeout(searchTimer)
      }
      this.setState({
        searchTimer: setTimeout(function() {
          //  此处调用请求
          // that.props.getSearchOrganizationList({name: value})
          that.setState({
            spinning: true
          })
          getSearchOrganizationList({ name: value })
            .then(res => {
              that.setState({
                searchOrganizationList: res.data,
                spinning: false
              })
            })
            .catch(err => {
              that.setState({
                spinning: false
              })
            })
        }, INPUT_CHANGE_SEARCH_TIME)
      })
    }
  }
  nameBlur() {
    const that = this
    setTimeout(function() {
      that.setState({
        seachAreaVisible: false
      })
    }, 500)
  }
  setOperateType(type) {
    this.setState({
      operateType: type,
      seachAreaVisible: type === '1' ? false : true,
      createButtonVisible: false,
      stepContinueDisabled: this.state.name ? false : true
    })
  }
  //查询所得到的点击
  searchResultItemClick(data) {
    const { name, id } = data
    this.setState({
      name,
      org_id: id, //请求加入组织id
      seachAreaVisible: false,
      stepContinueDisabled: false
    })
  }
  onCancel = () => {
    this.props.setCreateOrgnizationOModalVisable()
    this.clearChange()
  }
  //清空所有元素
  clearChange() {
    this.setState({
      name: '',
      stepContinueDisabled: true,
      operateType: '0',
      createButtonVisible: false,
      seachAreaVisible: false,
      searchTimer: null,
      org_id: ''
    })
  }
  // 提交表单
  handleSubmit = e => {
    e.preventDefault()
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { dispatch } = this.props
        this.props.setCreateOrgnizationOModalVisable()
        const { operateType, name, org_id } = this.state
        values['name'] = name
        if (operateType === '0') {
          dispatch({
            type: 'technological/applyJoinOrganization',
            payload: {
              org_id,
              remarks: values['remarks']
            }
          })
          // this.props.applyJoinOrganization({org_id, remarks: values['remarks']})
        } else if (operateType === '1') {
          // 新创建的组织未付费, 需要跳转至极简模式
          let params = { ...values }
          if (ENV_ANDROID_APP) {
            params = {
              ...values,
              apply_scenes: '1'
            }
          }
          Promise.resolve(
            dispatch({
              type: 'technological/createOrganization',
              payload: {
                ...params
              }
            })
          ).then(res => {
            let userInfo = localStorage.getItem('userInfo')
              ? JSON.parse(localStorage.getItem('userInfo'))
              : {}
            let { is_simple_model } = userInfo.user_set
            if (isApiResponseOk(res)) {
              return
              if (is_simple_model == '0') {
                dispatch({
                  type: 'technological/setShowSimpleModel',
                  payload: {
                    is_simple_model: '1',
                    calback: () => {
                      dispatch({
                        type: 'technological/routingJump',
                        payload: {
                          route: '/technological/simplemode/home'
                        }
                      })
                    }
                  }
                })
              }
            }
          })
          // this.props.createOrganization(values)
        }
        this.clearChange()
      }
    })
  }
  render() {
    const {
      stepContinueDisabled,
      operateType,
      createButtonVisible,
      name,
      seachAreaVisible,
      spinning,
      searchOrganizationList = []
    } = this.state
    const { createOrganizationVisable } = this.props //reName_Add_type操作类型1重命名 2添加
    const { getFieldDecorator } = this.props.form

    const formContain = (
      <Form
        onSubmit={this.handleSubmit}
        style={{ margin: '0 auto', width: 336 }}
      >
        <div
          style={{
            fontSize: 20,
            color: '#595959',
            marginTop: 28,
            marginBottom: 28
          }}
        >
          创建或加入组织
        </div>
        <FormItem style={{ width: 336 }}>
          {getFieldDecorator('name', {
            rules: [{ required: false, message: '', whitespace: true }]
          })(
            <div style={{ position: 'relative' }}>
              <Input
                placeholder={'请输入'}
                onBlur={this.nameBlur.bind(this)}
                value={name}
                onChange={this.nameChange.bind(this)}
                maxLength={50}
                style={{ paddingRight: 120, height: 40 }}
              />
              {createButtonVisible ? (
                <Button
                  type={'primary'}
                  size={'small'}
                  style={{ position: 'absolute', right: 10, top: 8 }}
                  onClick={this.setOperateType.bind(this, '1')}
                >
                  创建组织
                </Button>
              ) : (
                ''
              )}
              {searchOrganizationList.length ? (
                <div
                  style={{
                    ...seachAreaStyles,
                    display: !seachAreaVisible ? 'none' : 'block'
                  }}
                >
                  <Spin spinning={spinning} size={'small'}>
                    {searchOrganizationList.map((value, key) => (
                      <div
                        className={styles.searChItem}
                        key={value.key}
                        onClick={this.searchResultItemClick.bind(this, {
                          name: value.name,
                          id: value.id
                        })}
                      >
                        {value.name}
                      </div>
                    ))}
                  </Spin>
                </div>
              ) : (
                <div
                  style={{
                    ...seachAreaStyles,
                    display: !seachAreaVisible ? 'none' : 'block'
                  }}
                >
                  <div>未找到符合搜索条件的组织</div>
                </div>
              )}
            </div>
          )}
        </FormItem>

        {operateType === '0' ? (
          <FormItem style={{ width: 336 }}>
            {getFieldDecorator('remarks', {
              rules: [{ required: false, message: '', whitespace: true }]
            })(
              <TextArea
                style={{ height: 208, resize: 'none' }}
                onChange={this.descriptionChange.bind(this)}
                placeholder="申请加入说明"
                maxLength={300}
              />
            )}
          </FormItem>
        ) : (
          <div>
            {/*组织性质*/}
            <FormItem style={{ width: 336 }}>
              {getFieldDecorator('property', {
                initialValue: '1',
                rules: [{ required: false, message: '', whitespace: true }]
              })(
                <Select
                  style={{ height: 40 }}
                  size={'large'}
                  placeholder={'请选择'}
                >
                  <Option value="1">投资商</Option>
                  <Option value="2">设计院</Option>
                  <Option value="3">学校</Option>
                  <Option value="4">专家</Option>
                  <Option value="5">政府</Option>
                  <Option value="6">其他</Option>
                </Select>
              )}
            </FormItem>
            {/*人数*/}
            <FormItem style={{ width: 336 }}>
              {getFieldDecorator('scale', {
                initialValue: '1',
                rules: [{ required: false, message: '', whitespace: true }]
              })(
                <Select
                  style={{ height: 40 }}
                  size={'large'}
                  placeholder={'请选择'}
                >
                  <Option value="1">1~30人</Option>
                  <Option value="2">31~100人</Option>
                  <Option value="3">101~300人</Option>
                  <Option value="4">301~1000人</Option>
                  <Option value="5">1000人以上</Option>
                </Select>
              )}
            </FormItem>
            <div
              style={{
                marginTop: -8,
                textAlign: 'left',
                fontSize: 13,
                color: '#8c8c8c'
              }}
            >
              准确填写信息有助于我们为你安排专属顾问，协助你与你的组织成员快速上手使用。
            </div>
          </div>
        )}

        {/* 确认 */}
        <FormItem>
          <Button
            type="primary"
            disabled={stepContinueDisabled}
            htmlType={'submit'}
            onClick={this.nextStep}
            style={{ marginTop: 20, width: 208, height: 40 }}
          >
            {operateType === '0' ? '发送请求' : '创建组织'}
          </Button>
        </FormItem>
      </Form>
    )

    return (
      <div>
        <CustormModal
          visible={createOrganizationVisable} //createOrganizationVisable
          width={472}
          zIndex={1006}
          footer={null}
          maskClosable={false}
          destroyOnClose={true}
          style={{ textAlign: 'center' }}
          onCancel={this.onCancel}
          overInner={formContain}
        >
          {/*{formContain}*/}
        </CustormModal>
      </div>
    )
  }
}
const seachAreaStyles = {
  position: 'absolute',
  top: 46,
  width: '100%',
  zIndex: 2,
  height: 'auto',
  padding: '10px 0 10px 0',
  borderRadius: 4,
  background: '#FFFFFF',
  border: '1px solid rgba(0,0,0,0.15)',
  boxShadow: `0px 2px 15px 0px rgba(0,0,0,0.08)`,
  overflow: 'hidden'
}

export default Form.create()(CreateOrganizationModal)
