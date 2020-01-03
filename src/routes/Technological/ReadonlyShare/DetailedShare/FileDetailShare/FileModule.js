import React from 'react'
import indexStyles from './index.less'
import { Table, Button } from 'antd';
import FileList from './FileList'
import MoveToDirectory from './MoveToDirectory'
import BreadCrumbFileNav from './BreadCrumbFileNav'
import FileDetail from './FileDetail'
import FileDetailModal from './FileDetail/FileDetailModal'
import { connect } from 'dva';

@connect(mapStateToProps)
export default class FileIndex extends React.Component {
  render() {
    const { isInOpenFile, dispatch } = this.props
    const { marginTop = '20px' } = this.props;
    return (
      <div>
        {/*{isInOpenFile && <FileDetail {...this.props} />}*/}
        <div className={indexStyles.fileOut} style={{ marginTop: marginTop }}>
          <BreadCrumbFileNav />
          <FileList />
          <MoveToDirectory />
        </div>
        <FileDetailModal {...this.props} visible={isInOpenFile} dispatch={dispatch} />
      </div>
    )
  }
}
function mapStateToProps({
  projectDetailFile: {
    datas: {
      isInOpenFile
    }
  },
}) {
  return {
    isInOpenFile
  }
}