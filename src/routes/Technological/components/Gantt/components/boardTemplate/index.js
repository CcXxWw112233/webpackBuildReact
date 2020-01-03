import React, { Component } from 'react'
import styles from './index.less'
import globalStyles from '@/globalset/css/globalClassName.less'
import { date_area_height } from '../../constants'
import { Dropdown, Menu, message, Tree, Icon, Spin } from 'antd'
import { connect, } from 'dva';
import { getBoardTemplateList, getBoardTemplateInfo, createCardByTemplate } from '../../../../../../services/technological/gantt'
import { isApiResponseOk } from '../../../../../../utils/handleResponseData'
import { createMilestone } from '../../../../../../services/technological/prjectDetail'
import { getGlobalData } from '../../../../../../utils/businessFunction'
import BoardTemplateManager from '@/routes/organizationManager/projectTempleteScheme/index.js'

const MenuItem = Menu.Item
const TreeNode = Tree.TreeNode;

@connect(mapStateToProps)
export default class BoardTemplate extends Component {
    constructor(props) {
        super(props)
        this.state = {
            show_type: '0', // 0 1 2 //默认关闭 / 出现动画 / 隐藏动画
            drag_node_data: {
                data_id: '',
                data_type: '',
                data_name: ''
            },
            spinning: false,
            selected_template_id: '',
            selected_template_name: '请选择模板',
            template_list: [],
            template_data: [], //模板数据
        }
        this.drag_init_inner_html = ''
    }
    getHeight = () => {
        const target = document.getElementById('gantt_card_out_middle')
        if (target) {
            return target.clientHeight - date_area_height
        }
        return '100%'
    }
    // 初始化数据
    initState = (is_new_board) => {
        this.setState({
            show_type: is_new_board ? '1' : '0', // 0 1 2 //默认关闭 / 出现动画 / 隐藏动画
            drag_node_data: {
                data_id: '',
                data_type: '',
                data_name: ''
            },
            selected_template_id: '',//已选择的项目模板
            selected_template_name: '请选择模板',
            template_list: [],
            template_data: [], //模板数据
        })
    }
    componentDidMount() {
        this.initState(this.props.is_new_board)
        this.getBoardTemplateList()
        this.listenDrag()
    }
    componentWillReceiveProps(nextProps) {
        const { gantt_board_id: last_gantt_board_id } = this.props
        const { gantt_board_id: next_gantt_board_id, is_new_board } = nextProps
        if ((last_gantt_board_id != next_gantt_board_id) && next_gantt_board_id != '0') { //当项目变化并且进入具体项目时
            this.initState(is_new_board)
            this.getBoardTemplateList()
        }
    }
    componentWillUnmount() {
        this.removeEvent()
    }
    // 获取模板列表
    getBoardTemplateList = async () => {
        const OrganizationId = localStorage.getItem('OrganizationId')
        const aboutBoardOrganizationId = getGlobalData('aboutBoardOrganizationId')
        if (
            !OrganizationId ||
            (OrganizationId == '0' && (!aboutBoardOrganizationId || aboutBoardOrganizationId == '0'))
        ) {
            return
        }
        const _organization_id = OrganizationId != '0' ? OrganizationId : aboutBoardOrganizationId
        const res = await getBoardTemplateList({ _organization_id })
        if (isApiResponseOk(res)) {
            const { data } = res
            this.setState({
                template_list: data
            })
            const { selected_template_id } = this.state
            if (!!selected_template_id) {
                this.getTemplateInfo(selected_template_id)
                this.setState({
                    selected_template_name: (data.find(item => item.id == selected_template_id) || {}).name || '请选择模板',
                })
                return
            }
            if (data && data.length) {
                this.setState({
                    selected_template_name: data[0].name,
                    selected_template_id: data[0].id
                })
                if (data.length) {
                    this.getTemplateInfo(data[0].id)
                }
            }
        } else {
            message.error(res.message)
        }
    }
    // 获取特定模板内容
    getTemplateInfo = async (template_id) => {
        this.setState({
            spinning: true
        })
        const res = await getBoardTemplateInfo({ template_id })
        this.setState({
            spinning: false
        })
        if (isApiResponseOk(res)) {
            this.setState({
                template_data: res.data
            })
        } else {
            message.error(res.message)
        }
    }
    // 是否显示去到组织管理的界面
    isShowSetting = () => {
        const OrganizationId = localStorage.getItem('OrganizationId')
        return true//OrganizationId && (OrganizationId != '0')
    }
    // 去到新建的管理后台界面
    routingJumpToOrgManager = () => {
        const { dispatch } = this.props
        this.setProjectTempleteSchemeModal() //全组织下
        return
        if (localStorage.getItem('OrganizationId') == '0') {
            this.setProjectTempleteSchemeModal() //全组织下
            return
        }
        if (window.location.hash.indexOf('/technological/simplemode/workbench') != -1) {
            window.sessionStorage.setItem('simplemode_home_open_key', 'org')
            window.sessionStorage.setItem('orgManagerTabSelectKey', '6')
            dispatch({
                type: 'technological/routingJump',
                payload: {
                    route: `/technological/simplemode/home`
                }
            })
        } else {
            window.sessionStorage.setItem('orgManagerTabSelectKey', '6')
            dispatch({
                type: 'technological/routingJump',
                payload: {
                    route: `/organizationManager?nextpath=${window.location.hash.replace('#', '')}`
                }
            })
        }

    }
    selectTemplate = (e) => {
        const { key } = e
        const { template_list = [] } = this.state
        if ('0_0' == key) {
            this.routingJumpToOrgManager()
        } else {
            this.setState({
                selected_template_id: key,
                selected_template_name: template_list.find(item => item.id == key).name || '请选择模板'
            })
            this.getTemplateInfo(key)
        }
    }
    // 设置管理模板弹窗是否出现
    setProjectTempleteSchemeModal = () => {
        const { project_templete_scheme_visible } = this.state
        if (!!project_templete_scheme_visible) {
            this.getBoardTemplateList()
        }
        this.setState({
            project_templete_scheme_visible: !project_templete_scheme_visible
        })
    }

    renderTemplateList = () => {
        const { template_list = [] } = this.state
        return (
            <Menu onClick={this.selectTemplate}>
                {
                    this.isShowSetting() &&
                    (
                        <MenuItem key={`0_0`} style={{ color: '#1890FF' }}>
                            <i className={globalStyles.authTheme}>&#xe8fe;</i>
                            &nbsp;
                             新建方案
                        </MenuItem>
                    )
                }
                {
                    template_list.map(item => {
                        const { id, name } = item
                        return (
                            <MenuItem
                                key={`${id}`}
                                className={globalStyles.global_ellipsis}
                                style={{ width: 216 }}>
                                {name}
                            </MenuItem>
                        )
                    })
                }
            </Menu>
        )
    }
    renderTreeItemName = ({ template_data_type, name, parent_content_length = 0, parrent_name }) => {
        let icon = ''
        if (template_data_type == '1') {
            icon = <div className={`${globalStyles.authTheme} main_can_drag_flag`} style={{ color: '#FAAD14', fontSize: 18, marginRight: 6 }}>&#xe6ef;</div>
        } else {
            icon = <div className={`${globalStyles.authTheme} main_can_drag_flag`} style={{ color: '#18B2FF', fontSize: 18, marginRight: 6 }} >&#xe6f0;</div>
        }
        return (
            <div
                className={`main_can_drag_flag`}
                title={name}
                style={{ display: 'flex', alignItems: 'center' }}
                data-propertype={template_data_type}
                data-properlength={parent_content_length}
                data-propername={parrent_name}>
                {icon}
                <div style={{ maxWidth: 112, }} className={`${globalStyles.global_ellipsis} main_can_drag_flag`}>{name}</div>
            </div>
        )
    }
    // 渲染树
    renderTemplateTree = (data, parent_type, parrent_id, parrent_name, parent_content_length = 0, ) => {
        const is_child_task = parent_type == '2'
        return (
            data.map(item => {
                const { name, template_data_type, child_content = [], id } = item
                const params = {
                    template_data_type,
                    name,
                    parrent_name: is_child_task ? parrent_name : name,
                    parent_content_length: is_child_task ? parent_content_length : child_content.length //如果是父类任务，就取子任务长度，如果是子任务，就取父类任务的全部子任务长度
                }
                if (child_content) {
                    return (
                        <TreeNode
                            data_type={template_data_type}
                            data_id={is_child_task ? parrent_id : id} //当父级是任务的时候，默认存储的是父类任务
                            data_name={is_child_task ? parrent_name : name}
                            icon={<i className={globalStyles.authTheme}>&#xe6f0;</i>}
                            key={id}
                            title={this.renderTreeItemName(params)}
                            selectable={false}>
                            {this.renderTemplateTree(child_content, template_data_type, id, name, child_content.length)}
                        </TreeNode>
                    );
                }
                return <TreeNode
                    data_type={template_data_type}
                    data_id={id}
                    data_name={is_child_task ? parrent_name : name}
                    key={id}
                    title={this.renderTreeItemName(params)}
                    selectable={false}
                    icon={<Icon type="caret-down" style={{ fontSize: 20, color: 'rgba(0,0,0,.45)' }} />}
                />;
            })
        )
    }
    setShowType = () => {
        const { show_type } = this.state
        let new_type
        if ('0' == show_type) {
            new_type = '1'
        } else if ('1' == show_type) {
            new_type = '2'
        } else if ('2' == show_type) {
            new_type = '1'
        } else {

        }
        this.setState({
            show_type: new_type
        })
    }
    // 渲染拖拽时子任务
    renderChildTaskUI = ({ propername, properlength, node_width = 130 }) => {
        const task_icon = document.getElementById('save_child_card_icon').children[0].className //编译后的iconfont classname
        // console.log('ssssss_propername', propername)
        let string =
            '<div style="display: flex; align-items: center; min-width:' + node_width + 'px">' +
            '<div style="display: flex; align-items: center;">' +
            '<div class="' + task_icon + '" style="color: rgb(24, 178, 255); font-size: 18px; margin-right: 6px;">' +
            '' +
            '</div>' +
            '<div>' + propername + '</div>' +
            '</div>' +
            '<div>' + `${properlength > 0 ? ('&nbsp; ' + '&nbsp;' + '等' + properlength + '项') : ''}` + '</div>' +
            '</div>'
        // string= '<div>asda</div>'
        return string
    }
    // ==================拖拽任务start
    // 处理document的drag事件
    listenDrag = () => {
        // const that = this
        // let drag_init_inner_html = '' //用来存储所拖拽的对象的内容

        document.body.addEventListener("dragstart", this.dragstart);
        //在拖动元素的同时,改变输出文本的颜色
        // document.addEventListener("drag", function (event) {
        // });
        // 当拖完p元素输出一些文本元素和重置透明度
        document.body.addEventListener("dragend", this.dragend);
        /* 拖动完成后触发 */
        // 当p元素完成拖动进入droptarget,改变div的边框样式
        // document.addEventListener("dragenter", function (event) {
        // });
        // 默认情况下,数据/元素不能在其他元素中被拖放。对于drop我们必须防止元素的默认处理
        document.body.addEventListener("dragover", this.dragover);
        // 当可拖放的p元素离开droptarget，重置div的边框样式
        // document.addEventListener("dragleave", function (event) { });
        /*对于drop,防止浏览器的默认处理数据(在drop中链接是默认打开)*/
        document.body.addEventListener("drop", this.drop);
    }
    removeEvent = () => {
        document.body.removeEventListener("dragstart", this.dragstart);
        document.body.removeEventListener("dragend", this.dragend);
        document.body.removeEventListener("dragover", this.dragover);
        document.body.removeEventListener("drop", this.drop);
    }
    onDragStart = ({ node }) => {
        const { data_id, data_type, data_name } = node.props
        this.setState({
            drag_node_data: {
                data_id,
                data_type,
                data_name,
            }
        })
    }
    dragstart = (event) => {
        // console.log('sssssssssssss', 'dragstart')
        const drag_target = event.target
        // event.target.style.opacity = "0";
        if (!event) return
        if (!drag_target) return
        if (!drag_target.children) return
        if (!drag_target.children[0]) return
        if (!drag_target.children[0].children) return
        if (!drag_target.children[0].children[0]) return
        this.drag_init_inner_html = event.target.innerHTML

        const { propername, propertype, properlength } = event.target.children[0].children[0].dataset || {} //存储在渲染名称的ui里面，拖拽的时候拿出来，做改变ui（仅限于子任务）
        if (propertype == '2') { //当拖拽的是子任务的话，需要改变节点内容为 （‘父任务名称+父任务下的子任务个数’）
            event.target.innerHTML = this.renderChildTaskUI({ propername, propertype, properlength, node_width: event.target.clientWidth - 10 })
            setTimeout(() => {
                event.target.innerHTML = this.drag_init_inner_html
            }, 100)
        }
    }
    dragenter = (event) => {
        // console.log('sssssssssssss', 'dragstart')
    }
    dragleave = (event) => {
        // console.log('sssssssssssss', 'dragleave')
    }
    dragover = (event) => {
        // console.log('sssssssssssss', 'dragover')
        event.preventDefault();
    }
    dragend = (event) => {
        // console.log('sssssssssssss', 'dragend')
        if (!event) return
        if (!event.target) return
        if (!event.target.style) return
        event.target.style.opacity = "1";
    }
    drop = (event) => {
        // console.log('sssssssssssss', 'drop')
        if (!event) return
        if (!event.target) return
        if (!event.target.className) return
        event.preventDefault();
        try {
            if (event.target.className.indexOf('ganttDetailItem') != -1) {
                const { list_id, start_time, end_time } = event.target.dataset
                if (!list_id || !start_time || !end_time) return
                this.handleDragCompleted({ list_id, start_time, end_time })
            }
        } catch (err) {
            // console.log(err)
        }

    }
    // =================拖拽任务end



    handleDragCompleted = ({ list_id, start_time, end_time }) => {
        const { dispatch } = this.props
        dispatch({
            type: 'gantt/updateDatas',
            payload: {
                current_list_group_id: list_id
            }
        })
        const { drag_node_data: { data_type } } = this.state
        // console.log('sssss_目标位置', { list_id, start_time, end_time })
        // console.log('sssss_拖动对象', drag_node_data)
        if (data_type == '1') {
            this.createMilestone({ end_time })
        } else if (data_type == '2') {
            this.createCard({ list_id, start_time, end_time })
        } else {

        }
    }
    // 创建里程碑
    createMilestone = async ({ end_time }) => {
        const { drag_node_data: { data_name } } = this.state
        const { dispatch, gantt_board_id } = this.props
        const params = {
            board_id: gantt_board_id,
            deadline: end_time,
            name: data_name
        }
        if (!end_time) {
            return
        }
        const res = await createMilestone(params)
        if (isApiResponseOk(res)) {
            dispatch({
                type: 'gantt/getGttMilestoneList',
                payload: {

                }
            })
        } else {
            message.error(res.message)
        }
    }
    // 创建任务
    createCard = async ({ list_id, start_time, end_time }) => {
        const { dispatch, gantt_board_id } = this.props
        const { drag_node_data: { data_id } } = this.state

        const params = {
            board_id: gantt_board_id,
            content_id: data_id,
            due_time: end_time,
            start_time,
            list_id: list_id != '0' ? list_id : ''
        }
        // console.log('sssssparams', params)
        const res = await createCardByTemplate({ ...params })
        if (isApiResponseOk(res)) {
            this.props.insertTaskToListGroup && this.props.insertTaskToListGroup(res.data) //创建任务后，返回的数据手动插入
        } else {
            message.error(res.message)
        }
    }

    // 外部拖拽时
    outerMouseDown = (e) => { //在树组件区域内拖动时，如果没有选中某一个选项就直接在空白区域拖动，会产生拖动多个元素的影像
        const { className } = e.target
        if (!className || typeof className != 'string') {
            e.preventDefault()
            return
        }
        const is_tree_node_drag = className.indexOf('main_can_drag_flag') == -1
        if (is_tree_node_drag) {
            e.preventDefault()
            return
        }
    }
    render() {
        const { template_data, show_type, selected_template_name, spinning, project_templete_scheme_visible } = this.state
        const { gantt_board_id } = this.props
        return (
            gantt_board_id && gantt_board_id != '0' ?
                (
                    <div
                        className={`${styles.container_init}   ${show_type == '1' && styles.container_show} ${show_type == '2' && styles.container_hide}`}
                        style={{
                            height: this.getHeight(),
                            top: date_area_height
                        }}>
                        <div className={styles.top}>
                            <Dropdown overlay={this.renderTemplateList()}>
                                <div className={styles.top_left}>
                                    <div className={`${globalStyles.global_ellipsis} ${styles.name}`}>{selected_template_name}</div>
                                    <div className={`${globalStyles.authTheme} ${styles.down}`}>&#xe7ee;</div>
                                </div>
                            </Dropdown>
                            {
                                this.isShowSetting() &&
                                (
                                    <div className={`${globalStyles.authTheme} ${styles.top_right}`} onClick={this.routingJumpToOrgManager}>&#xe78e;</div>
                                )
                            }
                        </div>
                        {/* 拖拽子任务时，用于存放任务图标的ui,做dom操作 */}
                        <div
                            style={{ display: 'none' }}
                            id={'save_child_card_icon'}>
                            <div className={globalStyles.authTheme} style={{ color: '#18B2FF', fontSize: 18, marginRight: 6 }} >&#xe6f0;</div>
                        </div>
                        {/* 主区 */}
                        <Spin spinning={spinning}>
                            <div
                                onMouseDown={this.outerMouseDown}
                                className={styles.main}>
                                <Tree
                                    draggable
                                    onDragStart={this.onDragStart}
                                // onDragEnter={this.onDragEnter}
                                // onDragLeave={this.onDragLeave}
                                // onDragOver={this.onDragOver}
                                // onDragEnd={this.onDragEnd}
                                // onDrop={this.onDrop}
                                // switcherIcon={
                                //     <Icon type="caret-down" style={{ fontSize: 20, color: 'rgba(0,0,0,.45)' }} />
                                // }
                                >
                                    {this.renderTemplateTree(template_data)}
                                </Tree>

                            </div>
                        </Spin>
                        <div
                            onClick={this.setShowType}
                            className={`${styles.switchSpin_init} ${show_type == '1' && styles.switchSpinShow} ${show_type == '2' && styles.switchSpinClose}`}
                            style={{
                                top: (this.getHeight() + date_area_height) / 2
                            }} >
                            <div className={`${styles.switchSpin_top}`}></div>
                            <div className={`${styles.switchSpin_bott}`}></div>
                        </div>
                        <BoardTemplateManager
                            _organization_id={localStorage.getItem('OrganizationId') != '0' ? localStorage.getItem('OrganizationId') : getGlobalData('aboutBoardOrganizationId')}
                            project_templete_scheme_visible={project_templete_scheme_visible}
                            setProjectTempleteSchemeModal={this.setProjectTempleteSchemeModal}></BoardTemplateManager>
                    </div >
                ) : (
                    <></>
                )
        )
    }
}
function mapStateToProps({
    gantt: {
        datas: {
            gantt_board_id,
            is_new_board
        }
    }
}) {
    return {
        gantt_board_id,
        is_new_board
    }
}