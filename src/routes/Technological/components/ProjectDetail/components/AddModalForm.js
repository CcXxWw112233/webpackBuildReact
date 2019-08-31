import React from 'react'
import { Modal, Form, Button, Input, message } from 'antd'
import DragValidation from '../../../../../components/DragValidation'
import AddModalFormStyles from './AddModalForm.less'
import AppSwitch from './AppSwitch'
import { validateTel, validateEmail } from '../../../../../utils/verify'
import {MESSAGE_DURATION_TIME, PROJECTS} from "../../../../../globalset/js/constant";
import {currentNounPlanFilterName} from "../../../../../utils/businessFunction";
import CustormModal from '../../../../../components/CustormModal'
import EditAppList from './EditAppList'

const FormItem = Form.Item
const TextArea = Input.TextArea


class AddModalForm extends React.Component {

  onCancel = () => {
    // this.initialSet()
    this.props.setAddModalFormVisibile()
  }

  render() {

    const { modalVisible, } = this.props;

    return(
      <div>
        <CustormModal
          visible={modalVisible} //modalVisible
          maskClosable={false}
          width={472}
          footer={null}
          destroyOnClose={true}
          style={{textAlign: 'center'}}
          onCancel={this.onCancel}
          overInner={<EditAppList {...this.props} />}
        >
          {/*{step_2}*/}
        </CustormModal>
      </div>
    )
  }
}
export default Form.create()(AddModalForm)
