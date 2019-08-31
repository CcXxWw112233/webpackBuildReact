import React, { Component } from 'react'
import { connect } from 'dva'
import { checkIsHasPermissionInBoard, checkIsHasPermission } from "@/utils/businessFunction";
import {
    MESSAGE_DURATION_TIME, NOT_HAS_PERMISION_COMFIRN, ORG_TEAM_BOARD_JOIN, PROJECT_FILES_FILE_INTERVIEW,
    PROJECT_TEAM_CARD_INTERVIEW,
    UPLOAD_FILE_SIZE, PROJECT_TEAM_BOARD_EDIT, PROJECT_TEAM_BOARD_ARCHIVE, PROJECT_TEAM_BOARD_DELETE, PROJECT_TEAM_BOARD_MEMBER,
    ORG_TEAM_BOARD_QUERY, PROJECT_FLOW_FLOW_ACCESS,
    PROJECT_FILES_FILE_UPLOAD, PROJECT_FILES_FILE_DOWNLOAD, PROJECT_FILES_FOLDER, ORG_UPMS_ORGANIZATION_DELETE, PROJECT_FILES_FILE_DELETE, PROJECT_FILES_FILE_EDIT,
} from '@/globalset/js/constant'
import { Icon, Menu, Dropdown, Tooltip, Modal, Checkbox, Upload, Button, message, Input } from 'antd'
import { REQUEST_DOMAIN_FILE } from "@/globalset/js/constant";
import Cookies from 'js-cookie'
import { setUploadHeaderBaseInfo } from '@/utils/businessFunction'
import indexStyle from './index.less'

@connect(({ informRemind: { historyList, is_history, is_add_remind } }) => ({
    historyList, is_history, is_add_remind
}))
export default class BoarderfilesHeader extends Component {
    state = {

    }
    //文件上传


    getUploadProps = () => {
        //console.log(this.props, "hhhhhh");
        //console.log(this.props.model, "hhhhhh");
        const that = this;
        const currentParrentDirectoryId = this.props.model.datas.currentParrentDirectoryId; 
        return {
            name: 'file',
            withCredentials: true,
            multiple: true,
            action: `${REQUEST_DOMAIN_FILE}/file/upload`,
            data: {
                board_id: this.props.board_id,
                folder_id: currentParrentDirectoryId,
                type: '1',
                upload_type: '1'
            },
            headers: {
                Authorization: Cookies.get('Authorization'),
                refreshToken: Cookies.get('refreshToken'),
                ...setUploadHeaderBaseInfo({}),
            },
            beforeUpload(e) {
                if (!checkIsHasPermissionInBoard(PROJECT_FILES_FILE_UPLOAD)) {
                    message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
                    return false
                }
                if (e.size == 0) {
                    message.error(`不能上传空文件`)
                    return false
                } else if (e.size > UPLOAD_FILE_SIZE * 1024 * 1024) {
                    message.error(`上传文件不能文件超过${UPLOAD_FILE_SIZE}MB`)
                    return false
                }
                let loading = message.loading('正在上传...', 0)
            },
            onChange({ file, fileList, event }) {
                if (file.status === 'uploading') {

                } else {
                    // message.destroy()
                }
                if (file.status === 'done') {

                    if (file.response && file.response.code == '0') {
                        message.success(`上传成功。`);
                        that.props.getFileList({ folder_id: currentParrentDirectoryId })
                    } else {
                        message.error(file.response && file.response.message || '上传失败');
                    }
                } else if (file.status === 'error') {
                    message.error(`上传失败。`);
                    setTimeout(function () {
                        message.destroy()
                    }, 2000)
                }
            },
        };
    }

    //文档操作----start
    quitOperateFile() {
        this.props.updateDatasFile({
            selectedRowKeys: [],
        })
    }
    reverseSelection() {
        const { datas: { selectedRowKeys = [], fileList = [] } } = this.props.model
        const newSelectedRowKeys = []
        for (let i = 0; i < fileList.length; i++) {
            for (let val of selectedRowKeys) {
                if (val !== i) {
                    // console.log(i)
                    newSelectedRowKeys.push(i)
                }
            }
        }
        this.props.updateDatasFile({ selectedRowKeys: newSelectedRowKeys })
    }
    createDirectory() {
        if (!checkIsHasPermissionInBoard(PROJECT_FILES_FOLDER)) {
            message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
            return false
        }
        const { datas: { fileList = [], filedata_1 = [], isInAddDirectory = false } } = this.props.model
        if (isInAddDirectory) { //正在创建的过程中不能添加多个
            return false
        }
        const obj = {
            file_id: '',
            file_name: '',
            file_size: '-',
            update_time: '-',
            creator: `-`,
            type: '1',
            isInAdd: true
        }
        fileList.unshift(obj)
        filedata_1.unshift(obj)
        this.props.updateDatasFile({ fileList, filedata_1, isInAddDirectory: true })
    }
    collectionFile() {

    }
    downLoadFile() {
        if (!checkIsHasPermissionInBoard(PROJECT_FILES_FILE_DOWNLOAD)) {
            message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
            return false
        }
        const { datas: { fileList, selectedRowKeys } } = this.props.model
        let chooseArray = []
        for (let i = 0; i < selectedRowKeys.length; i++) {
            chooseArray.push(fileList[selectedRowKeys[i]].file_resource_id)
        }
        const ids = chooseArray.join(',')
        this.props.fileDownload({ ids })

        //将要进行多文件下载的mp3文件地址，以组数的形式存起来（这里只例了3个地址）
        // let mp3arr = ["http://pe96wftsc.bkt.clouddn.com/ea416183ad91220856c8ff792e5132e1.zip?e=1536660365&token=OhRq8qrZN_CtFP_HreTEZh-6KDu4BW2oW876LYzj:XK9eRCWcG8yDztiL7zct2jrpIvc=","http://pe96wftsc.bkt.clouddn.com/2fc83d8439ab0d4507dc7154f3d50d3.pdf?e=1536659325&token=OhRq8qrZN_CtFP_HreTEZh-6KDu4BW2oW876LYzj:DGertCGKCr3Y407F6fY9ZGgkP4M=", "http://pe96wftsc.bkt.clouddn.com/ec611c887680f9264bb5db8e4cb33141.docx?e=1536659379&token=OhRq8qrZN_CtFP_HreTEZh-6KDu4BW2oW876LYzj:9IkALD1DjOBvQtv3uAvtzk5y694=",];

        // const download = (name, href) => {
        //   var a = document.createElement("a"), //创建a标签
        //     e = document.createEvent("MouseEvents"); //创建鼠标事件对象
        //   e.initEvent("click", false, false); //初始化事件对象
        //   a.href = href; //设置下载地址
        //   a.download = name; //设置下载文件名
        //   a.dispatchEvent(e); //给指定的元素，执行事件click事件
        // }
        // let iframes = ''
        // for (let index = 0; index < mp3arr.length; index++) {
        // const iframe = '<iframe style="display: none;" class="multi-download"  src="'+mp3arr[index]+'"></iframe>'
        // iframes += iframe
        // window.open(mp3arr[index])
        // download('第'+ index +'个文件', mp3arr[index]);
        // }
        // this.setState({
        //   iframes
        // })
    }
    moveFile() {
        if (!checkIsHasPermissionInBoard(PROJECT_FILES_FILE_EDIT)) {
            message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
            return false
        }
        this.props.updateDatasFile({
            copyOrMove: '0', //copy是1
            openMoveDirectoryType: '1',
            moveToDirectoryVisiblie: true
        })
    }
    copyFile() {
        if (!checkIsHasPermissionInBoard(PROJECT_FILES_FILE_EDIT)) {
            message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
            return false
        }
        this.props.updateDatasFile({
            copyOrMove: '1', //copy是1
            openMoveDirectoryType: '1',
            moveToDirectoryVisiblie: true
        })
    }
    deleteFile() {
        if (!checkIsHasPermissionInBoard(PROJECT_FILES_FILE_DELETE)) {
            message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
            return false
        }
        const { datas: { fileList, selectedRowKeys, projectDetailInfoData = {} } } = this.props.model
        const { board_id } = projectDetailInfoData
        let chooseArray = []
        for (let i = 0; i < selectedRowKeys.length; i++) {
            chooseArray.push({ type: fileList[selectedRowKeys[i]].type, id: fileList[selectedRowKeys[i]].file_id })
        }
        this.props.fileRemove({
            board_id,
            arrays: JSON.stringify(chooseArray),
        })
    }
    //文档操作 ---end

    renderHeader = () => {
        const { selectedRowKeys, dispatch } = this.props;
        let operatorConent = '';
        if (selectedRowKeys.length) { //选择文件会改变
            operatorConent = checkIsHasPermissionInBoard(PROJECT_FILES_FILE_INTERVIEW) && (
                <div style={{ display: 'flex', alignItems: 'center', color: '#595959' }} className={indexStyle.fileOperator}>
                    <div dangerouslySetInnerHTML={{ __html: this.state.iframes }}></div>
                    <div style={{ marginTop: 18 }}>
                        <span style={{ color: '#8c8c8c' }}>
                            已选择{selectedRowKeys.length}项
                  </span>
                        <span style={{ marginLeft: 14 }} onClick={this.quitOperateFile.bind(this)}>
                            取消
                  </span>
                        {/*<span style={{marginLeft:14}} onClick={this.reverseSelection.bind(this)}>*/}
                        {/*反选*/}
                        {/*</span>*/}
                    </div>
                    {/*<Button style={{height: 24, marginTop:16,marginLeft:14}} >*/}
                    {/*<Icon type="star" />收藏*/}
                    {/*</Button>*/}
                    <Button style={{ height: 24, marginTop: 16, marginLeft: 14 }} onClick={this.downLoadFile.bind(this)} >
                        <Icon type="download" />下载
                </Button>
                    <Button style={{ height: 24, marginTop: 16, marginLeft: 14 }} onClick={this.moveFile.bind(this)}>
                        <Icon type="export" />移动
                </Button>
                    <Button style={{ height: 24, marginTop: 16, marginLeft: 14 }} onClick={this.copyFile.bind(this)}>
                        <Icon type="copy" />复制
                </Button>
                    <Button style={{ height: 24, marginTop: 16, marginLeft: 14, backgroundColor: '#f5f5f5', color: 'red' }} onClick={this.deleteFile.bind(this)}>
                        <Icon type="delete" />移动到回收站
                </Button>
                    <div>
                        <Icon type="appstore-o" style={{ fontSize: 14, marginTop: 20, marginLeft: 14 }} />
                        {/*<Icon type="appstore-o" style={{fontSize:14,marginTop:20,marginLeft:16}}/>*/}
                    </div>
                </div>
            )
        } else {
            operatorConent = checkIsHasPermissionInBoard(PROJECT_FILES_FILE_INTERVIEW) && (
                <div style={{ display: 'flex', alignItems: 'center', }}>
                    {checkIsHasPermissionInBoard(PROJECT_FILES_FILE_UPLOAD) && (
                        <Upload {...this.getUploadProps()} showUploadList={false}>
                            <Button style={{ height: 24, marginTop: 16, }} type={'primary'}>
                                <Icon type="upload" />上传
                    </Button>
                        </Upload>
                    )}

                    {checkIsHasPermissionInBoard(PROJECT_FILES_FOLDER) && (
                        <Button style={{ height: 24, marginTop: 16, marginLeft: 14 }} onClick={this.createDirectory.bind(this)}>
                            <Icon type="plus" />创建文件夹
                  </Button>
                    )}

                    <div>
                        <Icon type="appstore-o" style={{ fontSize: 14, marginTop: 20, marginLeft: 14 }} />
                        {/*<Icon type="appstore-o" style={{fontSize:14,marginTop:20,marginLeft:16}}/>*/}
                    </div>
                </div>
            )
        }
        return operatorConent;
    }
    render() {
        return (
            <div>
                {this.renderHeader()}
            </div>
        )
    }
}
