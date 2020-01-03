import React, { Component } from "react";
import { connect } from "dva/index"
import indexStyles from './index.less'
import MiniBoxNavigations from '../MiniBoxNavigations/index'
import BoardCommunication from './BoardCommunication/index'
import BoardFiles from './BoardFiles/index'
import BoardPlan from './BoardPlan/index'
import InvestmentMaps from './InvestmentMaps/index'
import XczNews from './XczNews/index'
import Zhichengshe from './Zhichengshe/index'
// import LingxiIm, { Im } from 'lingxi-im'
import { isPaymentOrgUser } from "@/utils/businessFunction"
const { LingxiIm } = global.constants
class WorkbenchPage extends Component {
    constructor(props) {
        // console.log("WorkbenchPage组件初始化");
        super(props);
        this.state = {
            BoardPlanVisible: false,
            BoardCommunicationVisible: false,
            BoardFilesVisible: false,
            InvestmentMapsVisible: false,
            XczNewsVisible: false,
            ZhichengsheVisible: false,
        }
    }
    componentWillMount() {
        const { dispatch, currentSelectedWorkbenchBox = {} } = this.props;
        if (!currentSelectedWorkbenchBox.id) {
            // dispatch({
            //     type: 'simplemode/routingJump',
            //     payload: {
            //         route: '/technological/simplemode/home'
            //     }
            // });
        }

        dispatch({
            type: 'simplemode/updateDatas',
            payload: {
                leftMainNavIconVisible: false
            }
        });
    }

    componentDidMount() {
        const { currentSelectedWorkbenchBox = {} } = this.props;
        this.setWorkbenchVisible(currentSelectedWorkbenchBox);
    }
    componentWillReceiveProps(nextProps) {
        const { currentSelectedWorkbenchBox } = this.props;
        const { currentSelectedWorkbenchBox: newCurrentSelectedWorkbenchBox = {} } = nextProps;
        if (!currentSelectedWorkbenchBox || currentSelectedWorkbenchBox.id != newCurrentSelectedWorkbenchBox.id) {
            this.setWorkbenchVisible(newCurrentSelectedWorkbenchBox);
        }

    }
    initSimpleWorkbenchboxCommData(dispatch) {
        dispatch({
            type: 'simpleWorkbenchbox/initSimpleWorkbenchboxCommData',
            payload: {}
        });
    }

    setWorkbenchVisible(currentSelectedWorkbenchBox) {
        const { dispatch, chatImVisiable } = this.props;
        if (currentSelectedWorkbenchBox.id && currentSelectedWorkbenchBox.code) {
            if (currentSelectedWorkbenchBox.code != 'board:chat') {
                const width = document.body.scrollWidth;
                let workbenchBoxContentWapperModalStyle = chatImVisiable ? { width: (width - 400) + 'px' } : { width: '100%' }
                dispatch({
                    type: 'simplemode/updateDatas',
                    payload: {
                        workbenchBoxContentWapperModalStyle: workbenchBoxContentWapperModalStyle
                    }
                });
            }

            switch (currentSelectedWorkbenchBox.code) {
                case 'board:archives': {
                    this.setState({
                        BoardCommunicationVisible: false,
                        BoardFilesVisible: false,
                        BoardPlanVisible: false,
                        InvestmentMapsVisible: false,
                        XczNewsVisible: false,
                        ZhichengsheVisible: false,
                    });
                }
                    break;
                case 'board:plans': {
                    this.setState({
                        BoardCommunicationVisible: false,
                        BoardFilesVisible: false,
                        InvestmentMapsVisible: false,
                        XczNewsVisible: false,
                        ZhichengsheVisible: false,
                    }, () => {
                        setTimeout(() => {
                            this.setState({
                                BoardPlanVisible: true,
                            })
                        }, 100)
                    });
                }
                    break;
                case 'board:chat': {
                    this.setState({
                        BoardCommunicationVisible: true,
                        BoardFilesVisible: false,
                        BoardPlanVisible: false,
                        InvestmentMapsVisible: false,
                        XczNewsVisible: false,
                        ZhichengsheVisible: false,
                    });
                    const width = document.body.scrollWidth;
                    let workbenchBoxContentWapperModalStyle = { width: (width - 400) + 'px' }
                    dispatch({
                        type: 'simplemode/updateDatas',
                        payload: {
                            chatImVisiable: true,
                            workbenchBoxContentWapperModalStyle: workbenchBoxContentWapperModalStyle
                        }
                    });
                    LingxiIm.show();

                }
                    break;
                case 'board:files': {
                    this.setState({
                        BoardCommunicationVisible: false,
                        BoardFilesVisible: true,
                        BoardPlanVisible: false,
                        InvestmentMapsVisible: false,
                        XczNewsVisible: false,
                        ZhichengsheVisible: false,
                    });
                }
                    break;
                case 'maps': {
                    this.setState({
                        BoardCommunicationVisible: false,
                        BoardFilesVisible: false,
                        BoardPlanVisible: false,
                        InvestmentMapsVisible: true,
                        XczNewsVisible: false,
                        ZhichengsheVisible: false,
                    })
                }
                    break;
                case 'regulations': {
                    this.setState({
                        BoardCommunicationVisible: false,
                        BoardFilesVisible: false,
                        BoardPlanVisible: false,
                        InvestmentMapsVisible: false,
                        XczNewsVisible: true,
                        ZhichengsheVisible: false,
                    });
                }
                    break;
                case 'cases': {
                    this.setState({
                        BoardCommunicationVisible: false,
                        BoardFilesVisible: false,
                        BoardPlanVisible: false,
                        InvestmentMapsVisible: false,
                        XczNewsVisible: false,
                        ZhichengsheVisible: true,
                    });
                }
                    break;
                default: {
                    this.setState({
                        BoardCommunicationVisible: false,
                        BoardFilesVisible: false,
                        BoardPlanVisible: false,
                        InvestmentMapsVisible: false,
                        XczNewsVisible: false,
                        ZhichengsheVisible: false,
                    });
                }

            }
        }
    }



    render() {
        const { workbenchBoxContentWapperModalStyle, currentSelectedWorkbenchBox, simplemodeCurrentProject } = this.props;
        let isPaymentUser = false;
        console.log("simplemodeCurrentProject", simplemodeCurrentProject);
        if (simplemodeCurrentProject && simplemodeCurrentProject.board_id) {

            isPaymentUser = isPaymentOrgUser(simplemodeCurrentProject.org_id);
        } else {
            isPaymentUser = isPaymentOrgUser();
        }

        console.log("isPaymentUser1", isPaymentUser);
        return (
            <div className={indexStyles.workbenchBoxContentModalContainer}>
                <MiniBoxNavigations currentSelectedWorkbenchBox={currentSelectedWorkbenchBox} />
                <div id='container_workbenchBoxContent' className={indexStyles.workbenchBoxContentModalWapper} style={workbenchBoxContentWapperModalStyle ? workbenchBoxContentWapperModalStyle : {}}>
                    <div className={indexStyles.workbenchBoxContentWapper}>

                        {
                            this.state.BoardPlanVisible &&
                            <BoardPlan />
                        }


                        {
                            isPaymentUser && this.state.BoardCommunicationVisible &&
                            <BoardCommunication />
                        }

                        {
                            isPaymentUser && this.state.BoardFilesVisible &&
                            <BoardFiles />
                        }

                        {
                            isPaymentUser && this.state.InvestmentMapsVisible &&
                            <InvestmentMaps />
                        }

                        {
                            isPaymentUser && this.state.XczNewsVisible &&
                            <XczNews {...this.props} />
                        }
                        {
                            isPaymentUser && this.state.ZhichengsheVisible && <Zhichengshe {...this.props} />
                        }

                    </div>
                </div>
            </div>
        )
    }
};

//  建立一个从（外部的）state对象到（UI 组件的）props对象的映射关系
function mapStateToProps({
    simplemode: {
        workbenchBoxContentWapperModalStyle,
        myWorkbenchBoxList,
        currentSelectedWorkbenchBox,
        chatImVisiable,
        leftMainNavIconVisible,
        simplemodeCurrentProject
    }
}) {

    return {
        workbenchBoxContentWapperModalStyle,
        myWorkbenchBoxList,
        currentSelectedWorkbenchBox,
        chatImVisiable,
        leftMainNavIconVisible,
        simplemodeCurrentProject
    }
}
export default connect(mapStateToProps)(WorkbenchPage)

