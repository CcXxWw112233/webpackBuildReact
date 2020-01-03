import React, { Component } from 'react'
import ProjectTempleteSchemeModal from './ProjectTempleteSchemeModal'
import { Modal } from 'antd'
import CustormModal from '@/components/CustormModal'

export default class index extends Component {

  onCancel = () => {
    this.props.setProjectTempleteSchemeModal && this.props.setProjectTempleteSchemeModal()
  }

  render() {
    const { project_templete_scheme_visible, style, _organization_id } = this.props
    // console.log('sssssss__organization_id', _organization_id)
    return (
      <div>
        <Modal
          visible={project_templete_scheme_visible} //modalVisible
          width={'714px'}
          zIndex={1006}
          footer={null}
          destroyOnClose={true}
          style={{ width: '714px', height: '860px', ...style }}
          maskClosable={false}
          bodyStyle={{height: '860px'}}
          onCancel={this.onCancel}
        >
          <ProjectTempleteSchemeModal _organization_id={_organization_id} />
        </Modal>
      </div>
    )
  }
}