import React, { Component } from 'react'
import globalStyles from '@/globalset/css/globalClassName.less'
import indexStyles from '../../index.less'
import { TreeSelect, Button } from 'antd'
import { connect } from 'dva'

const { SHOW_PARENT } = TreeSelect;
  
@connect(mapStateToProps)
export default class ContentFilter extends Component {

    constructor(props) {
        super(props)
        this.state = {
           local_group_view_filter_boards: [],
           local_group_view_filter_users: []
        }
    }

    componentDidMount() {
        this.getBoardsTreeData()
        this.getUsersTreeData()
        const { group_view_filter_boards, group_view_filter_users } = this.props
        this.setState({
            local_group_view_filter_boards: group_view_filter_boards,
            local_group_view_filter_users: group_view_filter_users
        })
    }
    getBoardsTreeData = () =>{
       const { dispatch } = this.props
       dispatch({
           type: 'gantt/getContentFiterBoardTree',
           payload: {

           }
       })
    }
    getUsersTreeData = () =>{
        const { dispatch } = this.props
       dispatch({
           type: 'gantt/getContentFiterUserTree',
           payload: {
               
           }
       })
    }
    componentWillReceiveProps(nextProps) {
        const { dropdownVisible, group_view_filter_boards, group_view_filter_users } = nextProps
        if(!dropdownVisible) { //当触发关闭的时候，保存下当前选中的值，作为button disabled的比较
            this.setState({
                local_group_view_filter_boards: group_view_filter_boards,
                local_group_view_filter_users: group_view_filter_users
            })
        }
    }

    handleTreeSelectChange = ({treeType}, value) => {
        const local_gold_name = treeType == 'boards'? 'local_group_view_filter_boards' : 'local_group_view_filter_users'
        this.setState({
            [local_gold_name]: value
        })
    }
   
    resetTreeSelected = ({treeType}) => {
        const local_gold_name = treeType == 'boards'? 'local_group_view_filter_boards' : 'local_group_view_filter_users'
        this.setState({
            [local_gold_name]: []
        })
    }

    renderTreeSelect = ({ treeType }) => {
        const { local_group_view_filter_boards, local_group_view_filter_users, } = this.state
        const { group_view_users_tree = [], group_view_boards_tree = [] } = this.props

        const value = treeType == 'boards'? local_group_view_filter_boards : local_group_view_filter_users
        const treeDatas = treeType == 'boards'? group_view_boards_tree: group_view_users_tree
        return (
            <TreeSelect 
                treeData={treeDatas}
                value={value}
                showSearch={false}
                treeCheckable={true}
                showCheckedStrategy= {SHOW_PARENT}
                size={'large'}
                maxTagCount={1}
                dropdownStyle={{ 
                    maxHeight: 120, 
                    overflowX: 'hidden',
                    width: 217,
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'}}
                dropdownClassName={`${indexStyles.treeSelectDropDown} ${globalStyles.global_vertical_scrollbar}`}
                style={{ width: '100%' }}
                searchPlaceholder={`选择${ treeType == 'boards'? '项目': '成员'}`}
                onChange={(value) => this.handleTreeSelectChange({treeType}, value)} />
        )
    }
    renderFilter = (treeType) => {
        return (
            <div className={indexStyles.filter_item}>
                <div className={indexStyles.filter_item_top}>
                    <div className={indexStyles.filter_item_title}>
                        {treeType == 'boards'? '项目': '成员'}
                    </div>
                    <div className={`${indexStyles.filter_item_reset} ${globalStyles.link_mouse}`} onClick={() => this.resetTreeSelected({ treeType })}>重置</div>
                </div>
                <div className={indexStyles.filter_item_bott}>
                    {this.renderTreeSelect({ treeType })}
                </div>
            </div>
        )
    }
    equar = (a, b) => {
        // 判断数组的长度
        if (a.length !== b.length) {
            return false
        } else {
            // 循环遍历数组的值进行比较
            for (let i = 0; i < a.length; i++) {
                if (a[i] !== b[i]) {
                    return false
                }
            }
            return true;
        }
    }
    Button_disabled = () => {
        const { local_group_view_filter_boards = [], local_group_view_filter_users = [] } = this.state
        const { group_view_filter_boards = [], group_view_filter_users = [] } = this.props
        return this.equar(local_group_view_filter_boards, group_view_filter_boards) && 
                 this.equar(local_group_view_filter_users, group_view_filter_users)
    }

    checkButtonClick = () => {
        const { dispatch } = this.props
        const { local_group_view_filter_boards, local_group_view_filter_users } = this.state

        dispatch({
            type: 'gantt/updateDatas',
            payload: {
                group_view_filter_boards: local_group_view_filter_boards,
                group_view_filter_users: local_group_view_filter_users
            }
        })
        dispatch({
            type: 'gantt/getGanttData',
            payload: {}
        })
        this.closeContent(false)
    }
    closeContent = () => {
        this.props.setDropdownVisible(false)
    }
    render() {
        return (
            <div className={`${indexStyles.content_filter_out} ${globalStyles.global_card}`}>
               <div className={`${indexStyles.content_filter_top}`}>
                   <div className={`${indexStyles.content_filter_title}`}>内容过滤</div>
                   <div className={`${globalStyles.authTheme} ${indexStyles.content_filter_close}`} onClick={this.closeContent}>&#xe7fe;</div>
               </div>
               <div className={`${indexStyles.content_filter_bott}`}>
                  {this.renderFilter('boards')}
                  {this.renderFilter('users')}
               </div>
               <div className={`${indexStyles.content_filter_footer}`}>
                   <Button onClick={this.checkButtonClick} type="primary" disabled={this.Button_disabled()} className={`${!this.Button_disabled() && indexStyles.button_nomal_background} ${indexStyles.check_button}`}>确定</Button>
               </div>
            </div>
        )
    }
}
function mapStateToProps({ gantt: { datas: { group_view_filter_boards = [], group_view_filter_users = [], group_view_boards_tree = [], group_view_users_tree, } }, }) {
    return { group_view_filter_boards, group_view_filter_users, group_view_boards_tree, group_view_users_tree }
}