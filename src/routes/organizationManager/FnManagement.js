import React from 'react'
import Card from '../../components/CardComps'
import { message, Modal, Button } from 'antd'
import MapManage from './MapManage/index'
import { connect } from 'dva'
// import { Button } from 'antd/lib/radio';
@connect(({ FnManagement = {} }) => ({
  FnManagement
}))
export default class FnManagement extends React.Component {
  state = {
    basic_datas: [],
    experiment_datas: [],
    visible: false
  }

  showModal = () => {
    this.setState({
      visible: true
    })
  }

  handleCancel = () => {
    this.setState({ visible: false })
  }

  investmentMapQueryAdministrators = () => {
    const organization_id = localStorage.getItem('OrganizationId')
    const { dispatch } = this.props
    dispatch({
      type: 'organizationManager/investmentMapQueryAdministrators',
      payload: {
        _organization_id: organization_id
      }
    })
  }

  loadFunctionalManagementOfInvestmentMap = () => {
    this.showModal()
    this.investmentMapQueryAdministrators()
  }

  componentDidMount() {
    // this.props.getFnManagementList()
    const { dispatch } = this.props
    dispatch({
      type: 'organizationManager/getFnManagementList',
      payload: {}
    })
  }
  componentWillReceiveProps(nextProps) {
    this.setState({
      basic_datas:
        nextProps.model.datas.fnmanagement_list &&
        nextProps.model.datas.fnmanagement_list.base_function_list,
      experiment_datas:
        nextProps.model.datas.fnmanagement_list &&
        nextProps.model.datas.fnmanagement_list.experiment_function_list
    })
  }
  render() {
    const { visible, basic_datas = [] } = this.state
    const { dispatch } = this.props
    const change = (id, bl) => {
      bl === true
        ? message.success('已开启流程功能')
        : message.warning('已关闭流程功能')
      this.props.setFnManagement({
        id: id,
        status: bl ? 1 : 0,
        calback: function() {
          dispatch({
            type: 'organizationManager/getFnManagementList',
            payload: {}
          })
        }
      })
    }
    return (
      <div>
        <Card title="基础功能" dataSource={basic_datas} change={change}></Card>

        <Card
          loadFunctionalManagementOfInvestmentMap={
            this.loadFunctionalManagementOfInvestmentMap
          }
          title="实验室功能"
          titleSub="实验室是尚不成熟的实验性功能的测试场所。这些功能有可能成为新的功能正式上线， 也随时可能会发生变化、无法正常运行或消失。"
          dataSource={this.state.experiment_datas}
          change={change}
        ></Card>

        <Modal
          visible={visible}
          title="投资地图权限功能"
          footer={null}
          getContainer={() =>
            document.getElementById('org_managementContainer')
          }
          onCancel={this.handleCancel}
        >
          <MapManage {...this.props} />
        </Modal>
      </div>
    )
  }
}
