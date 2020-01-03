import react, { Component } from 'react';
import { REQUEST_DOMAIN_FILE, UPLOAD_FILE_SIZE} from "@/globalset/js/constant";
import { setUploadHeaderBaseInfo } from "@/utils/businessFunction";
import { getTemporaryFileData, removeTemporaryFileData } from '@/services/technological/temporaryFile';
import { isApiResponseOk } from "@/utils/handleResponseData";
import Cookies from 'js-cookie';
import TemporaryFilePart from "./TemporaryFilePart";
// import coverIconSrc from '@/assets/simplemode/communication_cover_icon@2x.png';
import temporaryFileIcon from '@/assets/simplemode/temporary_file_icon@2x.png';
import uploadIconSrc from '@/assets/simplemode/cloud-upload_icon@2x.png'
import { Upload, Button, Icon, message } from 'antd';
import indexStyles from './index.less';

const { Dragger } = Upload;

class UploadTemporaryFile extends Component{
    constructor(props){
        super(props);
        this.state={
            allListId: [],
            currentCheckedList: [],
            temporaryData: [
                { id: 'ss1', fileName: '这是文件.pdf' },
                { id: 'ss2', fileName: '这是文件.pdf' },
                { id: 'ss3', fileName: '这是文件文件名过长，文件名过长.pdf' },
                { id: 'ss4', fileName: '这是文件.pdf' },
                { id: 'ss5', fileName: '是文件文件名过长，文件名过长.pdf' },
                { id: 'ss6', fileName: '这是文件.pdf' },
                { id: 'ss7', fileName: '这是文件.pdf' },
                { id: 'ss8', fileName: '这是文件.pdf' },
            ]
        }
    }

    componentDidMount(){
        this.getTemporaryFileData();
    }

    // 获取临时文件目录
    getTemporaryFileData = async () => {
        const params = {
            test: 'test'
        }
        // const res = await getTemporaryFileData(params);
        // if(isApiResponseOk(res)){
        //     console.log('上传成功');
        // } else {
        //     message.warn(res.message)
        // }
        // 这里获取数据成功之后
        this.getAllId();
        this.initData();
    }

    // 获取所有id
    getAllId = () =>{
        const { temporaryData } = this.state;
        const ids = temporaryData.map(item=>item.id);
        this.setState({ allListId: ids });

    }

    // 初始化数据
    initData = () =>{
        const { temporaryData } = this.state;
        temporaryData.forEach(item => {
            item.checked = false;
        });
        this.setState({temporaryData});
    }


    // 上传文件
    uploadProps = ()=>{
        // const { currentBoardId } = this.props;
        return {
            name: 'file',
            withCredentials: true,
            // action: `${REQUEST_DOMAIN}/organization/logo_upload`,
            action: `${REQUEST_DOMAIN_FILE}/file/upload`,
            data: {
                // board_id,
                // folder_id: current_folder_id,
                // type: '1',
                // upload_type: '1'
                // test: 'test'
                board_id: '1187320331644309504',
                folder_id: '1187320332416061442',
                type: '1',
                upload_type: '1'
            },
            headers: {
                Authorization: Cookies.get('Authorization'),
                refreshToken: Cookies.get('refreshToken'),
                ...setUploadHeaderBaseInfo({boardId: '1187320331644309504'}),
            },
            beforeUpload(e) {
                // if (!checkIsHasPermissionInBoard(PROJECT_FILES_FILE_UPLOAD, board_id)) {
                //     message.warn(NOT_HAS_PERMISION_COMFIRN, MESSAGE_DURATION_TIME)
                //     return false
                // }
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
                        // that.props.getFolderFileList({ id: current_folder_id })
                        // isShowSub ? getSubFileData(current_folder_id, board_id) : queryCommunicationFileData();
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
        }

    }


    // 改变选中状态
    onChangeCheckboxGroup = (id) => {
        const { temporaryData } = this.state;
        temporaryData.forEach(item=>{
            if(item.id === id){
                item.checked = !item.checked;
            }
        })
        this.setState({temporaryData}, ()=>{
            this.getCurrentIds();
        });
    };

    // 处理当前选中项,返回选中项ids
    getCurrentIds = () =>{
        const { temporaryData } = this.state;
        const currentCheckList = temporaryData.filter(item=>item.checked);
        const ids = currentCheckList.map(item=>item.id);
        this.setState({currentCheckedList: ids});
        console.log('当前选中ids:', ids);
        // return ids;
    }

    // 转存到项目
    transferToProject = () => {
        // const ids = this.getCurrentIds();
        const { currentCheckedList } = this.state;
    }

    // 删除项目
    deleteProject = async () => {
        // const ids = this.getCurrentIds();
        const { currentCheckedList } = this.state;
        const params = {
            test: '删除',
            ids: currentCheckedList
        }
        const res = await removeTemporaryFileData(params);
        if(isApiResponseOk(res)){
            console.log('删除成功');
        } else {
            message.warn(res.message);
        }
    }


    render(){
        const {
            isVisibleFileList,
            dragEnterCaptureFlag,
        } = this.props;

        const {
            temporaryData,
            currentCheckedList
        } = this.state;

        return(
            <div className={`${indexStyles.temporaryFile} ${isVisibleFileList ? indexStyles.changeContentWidth : null}`}>
                {/* 上传本地文件 */}
                
                {
                    !this.state.previewFileModalVisibile && (
                        <div className={`${indexStyles.draggerContainerStyle} ${isVisibleFileList ? indexStyles.changeDraggerWidth : null}`}>
                            {/* <Dragger multiple={false} {...this.props.getDraggerProps()} beforeUpload={this.props.onBeforeUpload}> */}
                            <Dragger multiple={false} {...this.uploadProps()} openFileDialogOnClick={false}>
                                <div className={`${indexStyles.indexCoverWapper} ${dragEnterCaptureFlag ? indexStyles.draging : ''}`}>

                                    {
                                        dragEnterCaptureFlag ? (
                                            <div className={indexStyles.iconDescription}>
                                                <img src={uploadIconSrc} style={{ width: '48px', height: '48px' }} />
                                                <span className={indexStyles.iconDescription}>松开鼠标左键即可上传文件</span>
                                            </div>
                                        ) : (
                                                <>
                                                    <div className={indexStyles.icon}>
                                                        <img src={temporaryFileIcon} />
                                                    </div>
                                                    <div className={indexStyles.descriptionWapper}>
                                                        <div className={indexStyles.detailDescription}>
                                                            选择或上传图片格式文件、PDF格式文件即可开启圈点交流
                                                        </div>
                                                        {/* <div className={indexStyles.linkTitle} {...this.uploadProps()}>
                                                            // 选择 <a className={indexStyles.alink} onClick={this.selectBoardFile}>项目文件</a> 或  //
                                                            <a className={indexStyles.alink}>点击上传</a> 文件
                                                        </div> */}
                                                        <div className={indexStyles.uploadBtnBox}>
                                                            <Upload
                                                                {...this.uploadProps()}
                                                                showUploadList={false}
                                                                openFileDialogOnClick={true}>
                                                                上传本地文件
                                                            </Upload>
                                                        </div>
                                                    </div>
                                                    <TemporaryFilePart
                                                        temporaryData={temporaryData}
                                                        currentCheckedList={currentCheckedList}
                                                        changeChecked={this.changeChecked}
                                                        onChangeCheckboxGroup={this.onChangeCheckboxGroup}
                                                        transferToProject={this.transferToProject}
                                                        deleteProject={this.deleteProject}
                                                    />
                                                </>
                                            )}

                                </div>
                            </Dragger>
                        </div>
                    )
                }


                {/* <div className={indexStyles.draggerContainerStyle}>
                        <div className={`${indexStyles.indexCoverWapper} ${dragEnterCaptureFlag ? indexStyles.draging : ''}`}>
                            <div className={indexStyles.icon}>
                                <img src={coverIconSrc} style={{ width: '80px', height: '84px' }} />
                            </div>
                            <div className={indexStyles.descriptionWapper}>
                                <div className={indexStyles.detailDescription}>选择或上传图片格式文件、PDF格式文件即可开启圈点交流</div>
                                <div className={indexStyles.uploadBtnBox}>
                                    <Upload {...this.uploadProps()} showUploadList={false}>
                                        上传本地文件
                                    </Upload>
                                </div>
                            </div>
                        </div>

                        
                        <TemporaryFilePart
                            temporaryData={temporaryData}
                            changeChecked={this.changeChecked}
                            onChangeCheckboxGroup={this.onChangeCheckboxGroup}
                        />
                    </div> */}

            </div>
        )
    }
}

export default UploadTemporaryFile;