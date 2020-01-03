import React, { Component } from 'react'
import { Switch, Redirect, Route } from 'dva/router'
import { connect } from 'dva'
import Header from './components/header/Header'
import Hot from './components/hot/Hot'
import HighRise from './components/highRise/HighRise'
import Authority from './components/authority/Authority'
import Area from './components/area/Area'
import DataBase from './components/database/DataBase'
import globalStyles from '@/globalset/css/globalClassName.less'
import indexStyles from './index.less';

@connect(({ xczNews = {}, xczNews: { XczNewsOrganizationList }, }) => ({
	xczNews, XczNewsOrganizationList,
}))
export default class index extends Component {
	state = {
		selectOrganizationVisible: false,
	}
	constructor(props) {
		super(props)
	}

	// 分页加载操作
	onScroll = () => {
		const { xczNews = {} } = this.props
		const { hotFlag, highRiseFlag, authorityFlag, dataBaseFlag, areaFlag } = xczNews
		if (!((!hotFlag && !highRiseFlag && !authorityFlag && !dataBaseFlag) || !areaFlag)) {
			return
		}
		// console.log('滚动')
		// 滚动条在Y轴上的滚动距离
		// const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
		const scrollTop = (this.refs && this.refs.xczContentWrapper && this.refs.xczContentWrapper.scrollTop) && this.refs.xczContentWrapper.scrollTop
		// console.log(scrollTop, '滚动条在Y轴上的滚动距离')
		// 文档的总高度
		// const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
		const scrollHeight = (this.refs && this.refs.xczContentWrapper && this.refs.xczContentWrapper.scrollHeight) && this.refs.xczContentWrapper.scrollHeight
		// console.log(scrollHeight, '文档高度')
		// 浏览器视口高度
		// const windowHeight = document.documentElement.clientHeight || document.body.clientHeight;
		const windowHeight = (this.refs && this.refs.xczContentWrapper && this.refs.xczContentWrapper.clientHeight) && this.refs.xczContentWrapper.clientHeight
		// console.log(windowHeight, '浏览器视口高度')

		const { dispatch, location } = this.props;
		const { is_onscroll_do_paging, page_no, searchList = {}, defaultArr = [] } = xczNews;
		let new_page_no = page_no || 0;

		// scrollTop >= (scrollHeight - windowHeight)
		if (scrollHeight - 40 <= (scrollTop + windowHeight)) {
			// console.log('page_no', page_no)

			if (!is_onscroll_do_paging) {
				return false
			}

			dispatch({
				type: 'xczNews/updateDatas',
				payload: {
					is_onscroll_do_paging: false,
					page_no: ++new_page_no,
					// defaultArr: defaultArr.concat([...defaultArr], [...searchList.records])
				}
			})
			if (location.pathname != "/technological/xczNews/area") {
				setTimeout(() => {
					dispatch({
						type: 'xczNews/getHeaderSearch',
						payload: {

						}
					})
				}, 300)
			} else {
				setTimeout(() => {
					dispatch({
						type: 'xczNews/getAreasArticles',
						payload: {

						}
					})
				}, 300)
			}

		}
	}

	componentDidMount() {
		const { dispatch } = this.props
		dispatch({
			type: 'xczNews/getXczNewsQueryUser',
			payload: {}
		})
	}
	seeXczNews(params) {
		this.setState({
			selectOrganizationVisible: true
		})
		localStorage.setItem('isRegulations', 'no');
	}
	render() {
		const { user_set = {} } = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : {};
		const { XczNewsOrganizationList = [] } = this.props
		const { selectOrganizationVisible } = this.state
		const { location } = this.props;
		const workbenchBoxContentElementInfo = document.getElementById('container_workbenchBoxContent');
		let contentHeight = workbenchBoxContentElementInfo ? workbenchBoxContentElementInfo.offsetHeight : 0
		let isRegulations = localStorage.getItem('isRegulations');

		return (
			<div className={indexStyles.xczNewContainer} >
				{user_set.current_org === '0' && selectOrganizationVisible === false && isRegulations === 'yes' && XczNewsOrganizationList.length > 1 ? (
					<div className={indexStyles.boardSelectWapper} style={{ height: contentHeight + 'px' }}>
						<div className={indexStyles.groupName}>请选择一个组织进行查看政策法规</div>
						<div className={indexStyles.boardItemWapper}>
							{
								XczNewsOrganizationList && XczNewsOrganizationList.map((value, key) => {
									return (
										<div key={key} className={indexStyles.boardItem} onClick={e => this.seeXczNews(value)}>
											<i className={`${globalStyles.authTheme} ${indexStyles.boardIcon}`}>&#xe69c;</i>
											<span className={indexStyles.boardName}>{value.name}</span>
										</div>
									)
								})
							}
						</div>
					</div>
				) : (
						<div
							// className={`${indexStyles.xczNewContainer} ${globalStyles.global_vertical_scrollbar}`} 
							className={indexStyles.xczNewContainer}
						// style={{ maxHeight: contentHeight + 'px' }}
						// id="xczContentWrapper"
						// ref="xczContentWrapper" 
						// onScroll={this.onScroll}
						>
							<Header location={location} />
							<div
								onScroll={this.onScroll}
								id="xczContentWrapper"
								ref="xczContentWrapper"
								style={{ maxHeight: contentHeight + 'px', overflowY: 'auto', marginTop: '16px' }} className={globalStyles.global_vertical_scrollbar}
							>
								<Switch>
									{/* <Route path="/technological/xczNews" exact component={ SearchArticlesList } /> */}
									<Route path="/technological/simplemode/workbench/xczNews/hot" component={Hot} />
									<Route path="/technological/simplemode/workbench/xczNews/highRise" component={HighRise} />
									<Route path="/technological/simplemode/workbench/xczNews/authority" component={Authority} />
									<Route path="/technological/simplemode/workbench/xczNews/area" component={Area} />
									<Route path="/technological/simplemode/workbench/xczNews/database" component={DataBase} />

									{/* 重定向 */}
									<Redirect from="/technological/simplemode/workbench/xczNews" to="/technological/simplemode/workbench/xczNews/hot" />
								</Switch>
							</div>
						</div>
					)}
			</div>
		)
	}
}

