//重命名组件
import React from 'react'
import { Modal, Form, Button, Input, message, Select, Spin } from 'antd'
import styles from './CreateOrganizationModal.less'
import { INPUT_CHANGE_SEARCH_TIME } from '../../../../../globalset/js/constant'
const Option = Select.Option
const FormItem = Form.Item
const TextArea = Input.TextArea

class SaveModal extends React.Component {
  state = {
    name: '1', //名称
  }

  // 提交表单
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.props.setSaveModalVisible(false)
        this.props.updateDatas({
          editTeamShowPreview: false,
          editTeamShowSave: false
        })
        const html = document.getElementById('editContent').innerHTML
        const { datas: {name, summary, cover_img, content, currentTeamShowShowId} } = this.props.model
        this.props.addTeamShow({
          content: html,
          cover_img: cover_img,
          name: name,
          show_type_id: values['show_type_id'],
          summary: summary,
          show_id: currentTeamShowShowId,
          tabtile: '',
        })
      }
    });
  }
  onCancel = () => {
    this.props.setSaveModalVisible(false)
    this.props.updateDatas({
      editTeamShowPreview: false,
      editTeamShowSave: false
    })
  }
  render() {
    const { name } = this.state
    const { saveModalVisible } = this.props
    const { getFieldDecorator } = this.props.form;

    const { datas: {teamShowTypeList = [], currentTeamShowTypeId}} = this.props.model

    const formContain = (
      <Form onSubmit={this.handleSubmit} style={{margin: '0 auto', width: 336}}>
        <div style={{fontSize: 20, color: '#595959', marginTop: 28, marginBottom: 28}}>发布信息</div>
        {/*性质*/}
        <FormItem style={{width: 336}}>
              {getFieldDecorator('show_type_id', {
                initialValue: currentTeamShowTypeId || (teamShowTypeList.length ?teamShowTypeList[0].id: ''),
                rules: [{ required: false, message: '', whitespace: true }],
              })(
                <Select style={{ height: 40 }} size={'large'} placeholder={'请选择'}>
                  {teamShowTypeList.map((value, key) => {
                    const { name, id } = value
                    return (
                      <Option value={id} key={id}>{name}</Option>
                    )
                  })}
                </Select>
              )}
            </FormItem>

        {/* 确认 */}
        <FormItem>
          <Button type="primary" htmlType={'submit'} style={{marginTop: 20, width: 208, height: 40}}>提交</Button>
        </FormItem>
      </Form>
    )

    return(
      <div>
        <Modal
          visible={saveModalVisible} //createOrganizationVisable
          width={472}
          zIndex={1006}
          footer={null}
          maskClosable={false}
          destroyOnClose={true}
          style={{textAlign: 'center'}}
          onCancel={this.onCancel}
        >
          {formContain}
        </Modal>
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

export default Form.create()(SaveModal)
