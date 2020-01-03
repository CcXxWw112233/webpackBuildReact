import React from 'react';
// import FileDetailModal from './FileDetail/FileDetailModal'
import FileDetailModal from '@/components/FileDetailModal'

import { connect } from 'dva'

@connect(mapStateToProps)
class FileListRightBarFileDetailModal extends React.Component {

	constructor(props) {
		super(props)
		this.state = {
			// currentZoomPictureComponetWidth: null,
			// currentZoomPictureComponetHeight: null,
			filePreviewCurrentFileId: props.filePreviewCurrentFileId,
			fileType: props.fileType
		}
	}


	render() {
		const { currentZoomPictureComponetWidth, currentZoomPictureComponetHeight, filePreviewCurrentFileId, fileType } = this.state
		const { projectDetailInfoData: { board_id } } = this.props
		return (
			<div id="projectList_FileListRightBarFileDetailModal" style={{ width: '100%', height: '100%' }}>
				<FileDetailModal
					// componentHeight={currentZoomPictureComponetHeight}
					// componentWidth={currentZoomPictureComponetWidth}
					filePreviewCurrentFileId={filePreviewCurrentFileId}
					fileType={fileType}
					board_id={board_id}
					currentPreviewFileName={this.props.currentPreviewFileName}
					file_detail_modal_visible={this.props.file_detail_modal_visible}
					setPreviewFileModalVisibile={this.props.setPreviewFileModalVisibile}
					whetherUpdateFolderListData={this.props.whetherUpdateFolderListData}
					shouldUpdateAllFolderListData={this.props.shouldUpdateAllFolderListData} // 这是用来区分项目详情中的详情列表更新状态
				/>
				{/* <FileDetailModal
					{...this.props}
					{...this.props.fileDetailModalDatas}
					componentHeight={currentZoomPictureComponetHeight}
					componentWidth={currentZoomPictureComponetWidth}
					setPreviewFileModalVisibile={this.props.setPreviewFileModalVisibile}
					updateCommunicationFolderListData={this.props.updateCommunicationFolderListData}
					modalTop={20}
				/> */}
			</div>
		);
	}
}
function mapStateToProps({
	simplemode: {
		chatImVisiable = false
	},
	projectDetail: {
		datas: { projectDetailInfoData = {} }
	},
}) {
	return {
		chatImVisiable,
		projectDetailInfoData
	}
}
export default FileListRightBarFileDetailModal;