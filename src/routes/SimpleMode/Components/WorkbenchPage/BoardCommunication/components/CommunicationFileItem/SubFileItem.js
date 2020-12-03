import React, { Component } from 'react'
import { getOrgNameWithOrgIdFilter } from '../../../../../../../utils/businessFunction'
import FolderList from './FolderList'
import { Icon } from 'antd'
import styles from './index.less'

export default class SubFileItem extends Component {
  constructor(props) {
    super(props)
    this.state = {
      fileData: []
    }
  }

  componentDidMount() {
    // this.initChange
  }

  render() {
    const {
      folderId,
      boardId,
      boardName = '',
      bread_paths = [],
      fileData,
      isShowCompanyName,
      currentOrg_id,
      currentUserOrganizes,
      isShowSub
    } = this.props
    // const { fileData } = this.state;
    return (
      <div className={`${styles.CommunicationFileItem} ${styles.cubFileItem} `}>
        <div className={styles.subHeader}>
          <div
            className={styles.callBackIcon}
            onClick={() => this.props.goBackPrev(folderId)}
          >
            <Icon type="left" />
          </div>
          <div className={styles.boardName}>
            <div className={styles.name}>{boardName}</div>
            {/* {
                            isShowCompanyName &&
                            (
                                <div className={styles.org_name}>
                                    #{getOrgNameWithOrgIdFilter(currentOrg_id, currentUserOrganizes)}
                                </div>
                            )
                        } */}
          </div>
        </div>
        <FolderList
          isShowSub={isShowSub}
          file_data={fileData}
          current_folder_id={folderId}
          board_id={boardId}
          bread_paths={bread_paths}
          getSubFileData={this.props.getSubFileData}
          showWhatComponent={this.props.showWhatComponent}
          queryCommunicationFileData={this.props.queryCommunicationFileData}
          showUpdatedFileDetail={this.props.showUpdatedFileDetail}
          hideUpdatedFileDetail={this.props.hideUpdatedFileDetail}
          setPreviewFileModalVisibile={this.props.setPreviewFileModalVisibile}
        />
      </div>
    )
  }
}
