import React, { Component } from "react";
import { Modal } from "antd";
import styles from "./AddProgressModal.less";
import { connect } from "dva";

@connect(({ workbench }) => ({ workbench }))
class AddProgressModal extends Component {
  constructor(props) {
    super(props);
    const {
      projectList,
      workbench: {
        datas: { projectTabCurrentSelectedProject }
      }
    } = this.props;
    this.state = {
      currentSelectedProject: projectList.find(
        item => item.board_id === projectTabCurrentSelectedProject
      )
        ? projectList.find(
            item => item.board_id === projectTabCurrentSelectedProject
          )
        : {}
    };
  }
  handleAddTaskModalOk = () => {};
  handleAddTaskModalCancel = () => {
    this.setState({
      currentSelectedProject: {}
    });
    const { addProcessModalVisibleChange } = this.props;
    addProcessModalVisibleChange(false);
  };
  render() {
    const { addProcessModalVisible } = this.props;

    return (
      <Modal
        visible={addProcessModalVisible}
        title={<div style={{ textAlign: "center" }}>{"添加内容"}</div>}
        onOk={this.handleAddTaskModalOk}
        onCancel={this.handleAddTaskModalCancel}
        footer={null}
        destroyOnClose={true}
      >
      <div>process modal.</div>
      </Modal>
    );
  }
}

export default AddProgressModal
