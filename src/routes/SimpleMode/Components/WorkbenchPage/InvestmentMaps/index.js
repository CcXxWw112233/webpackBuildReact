import React, { Component } from 'react';
import Cookies from 'js-cookie';
import { MAP_URL } from "@/globalset/js/constant";
import { connect } from 'dva';
import globalStyles from '@/globalset/css/globalClassName.less'
import indexStyles from './index.less';
import { openImChatBoard } from '@/utils/businessFunction.js'

@connect(({ InvestmentMaps = [],
    investmentMap: { datas: { mapOrganizationList } },
}) => ({
    InvestmentMaps, mapOrganizationList
}))
export default class index extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            height: document.querySelector('body').clientHeight,
            selectOrganizationVisible: false,
            orgId: localStorage.getItem('OrganizationId'),
        }
    }
    componentDidMount() {
        window.addEventListener('resize', this.setHeight)
        const { dispatch } = this.props
        dispatch({
            type: 'investmentMap/getMapsQueryUser',
            payload: {}
        })
        window.addEventListener('message', this.listenMapBoardChange)
    }
    componentWillUnmount() {
        window.removeEventListener('resize', this.setHeight)
        window.removeEventListener('message', this.listenMapBoardChange)
    }
    setHeight = () => {
        const height = document.querySelector('body').clientHeight
        this.setState({
            height
        })
    }
    // 监听地图项目变化
    listenMapBoardChange = (event) => {
        const message = event.data
        const message_head = 'map_board_change_'
        if (!message || typeof message != 'string') {
            return
        }
        if (message.indexOf(message_head) != -1) {
            const board_id = message.replace(message_head, '')
            openImChatBoard({ board_id, autoOpenIm: true })
        }
    }
    seeInvestmentMaps(params) {
        this.setState({
            orgId: params.id,
        }, () => {
            this.setState({
                selectOrganizationVisible: true
            })
        })
    }

    render() {
        const { mapOrganizationList = [] } = this.props
        const { orgId } = this.state
        const accessToken = Cookies.get('Authorization')

        //全组织情况下, 如果只有一个组织有开通该功能, 则直接进入地图, 不需要选择组织页面
        const orgItem = mapOrganizationList && mapOrganizationList[0]
        const id = orgItem && orgItem.id
        const org_Id = mapOrganizationList.length > 1 ? orgId : id
        const src_url = `${MAP_URL}?token=${accessToken}&orgId=${org_Id}`
        const { user_set = {} } = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : {};
        const { selectOrganizationVisible } = this.state
        const workbenchBoxContentElementInfo = document.getElementById('container_workbenchBoxContent');
        let contentHeight = workbenchBoxContentElementInfo ? workbenchBoxContentElementInfo.offsetHeight : 0;

        return (
            <div className={indexStyles.mapsContainer} style={{ height: contentHeight + 'px' }}>
                {user_set.current_org === '0' && selectOrganizationVisible === false && mapOrganizationList.length > 1 ? (
                    <div className={indexStyles.boardSelectWapperOut}>
                        <div className={indexStyles.boardSelectWapper}>
                            <div className={indexStyles.groupName}>请选择一个组织进行查看地图</div>
                            <div className={indexStyles.boardItemWapper}>
                                {
                                    mapOrganizationList && mapOrganizationList.map((value, key) => {
                                        return (
                                            <div key={key} className={indexStyles.boardItem} onClick={e => this.seeInvestmentMaps(value)}>
                                                <i className={`${globalStyles.authTheme} ${indexStyles.boardIcon}`}>&#xe677;</i>
                                                <span className={indexStyles.boardName}>{value.name}</span>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        </div>
                    </div>
                ) : (
                        <iframe src={src_url} scrolling='no' frameborder="0" width='100%' height={'100%'}></iframe>
                    )}
            </div>
        );
    }
}
