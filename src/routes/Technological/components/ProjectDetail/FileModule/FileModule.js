import React from 'react'
import indexStyles from './index.less'
import { Table, Button } from 'antd'
import FileList from './FileList'
import MoveToDirectory from './MoveToDirectory'
import BreadCrumbFileNav from './BreadCrumbFileNav'
import FileDetail from './FileDetail'
// import FileDetailModal from './FileDetail/FileDetailModal'
import FileListRightBarFileDetailModal from './FileListRightBarFileDetailModal'
// import FileListRightBarFileDetailModal from '@/routes/Technological/components/Workbench/CardContent/Modal/FileListRightBarFileDetailModal';
import FileDetailModal from '@/components/FileDetailModal'
import { connect } from 'dva'

@connect(mapStateToProps)
export default class FileIndex extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      previewFileModalVisibile: false
    }
  }

  componentWillUnmount() {
    this.props.dispatch({
      type: 'projectDetailFile/updateDatas',
      payload: {
        breadcrumbList: [],
        currentParrentDirectoryId: '',
        currentPreviewFileData: {}
      }
    })
  }

  setPreviewFileModalVisibile = () => {
    // this.setState({
    //   previewFileModalVisibile: !this.state.previewFileModalVisibile
    // })
    this.props.dispatch({
      type: 'publicFileDetailModal/updateDatas',
      payload: {
        isInOpenFile: false,
        filePreviewCurrentFileId: '',
        fileType: '',
        filePreviewCurrentName: ''
      }
    })
  }

  whetherUpdateFolderListData = ({ folder_id }) => {
    this.props.dispatch({
      type: 'projectDetailFile/getFileList',
      payload: {
        folder_id: folder_id
      }
    })
  }

  render() {
    const {
      isInOpenFile,
      dispatch,
      filePreviewCurrentFileId,
      fileType
    } = this.props
    const { marginTop = '20px' } = this.props
    return (
      <div>
        {/*{isInOpenFile && <FileDetail {...this.props} />}*/}
        <div className={indexStyles.fileOut} style={{ marginTop: marginTop }}>
          <BreadCrumbFileNav {...this.props} />
          <FileList />
          <MoveToDirectory />
        </div>
        {this.props.isInOpenFile && (
          <FileListRightBarFileDetailModal
            shouldUpdateAllFolderListData={true}
            whetherUpdateFolderListData={this.whetherUpdateFolderListData}
            setPreviewFileModalVisibile={this.setPreviewFileModalVisibile}
            fileType={fileType}
            filePreviewCurrentFileId={filePreviewCurrentFileId}
            file_detail_modal_visible={isInOpenFile}
          />
        )}
      </div>
    )
  }
}
function mapStateToProps({
  // projectDetailFile: {
  //   datas: {
  //     isInOpenFile
  //   }
  // },
  publicFileDetailModal: { filePreviewCurrentFileId, fileType, isInOpenFile }
}) {
  return {
    isInOpenFile,
    filePreviewCurrentFileId,
    fileType
  }
}
