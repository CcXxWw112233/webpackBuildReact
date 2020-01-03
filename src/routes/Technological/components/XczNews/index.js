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


@connect(({xczNews = {}}) => ({
    xczNews, 
}))
export default class index extends Component {

    render() {
        // console.log(this.props)
				const { location } = this.props;
        return (
            <div>
                <Header location={location} />
								{/* <div
								 onScroll={this.onScroll}
								 id="xczContentWrapper" 
								 ref="xczContentWrapper" 
								 style={{maxHeight: windowHeight, overflowY: 'auto', marginTop: '16px'}} className={globalStyles.global_vertical_scrollbar}> */}
								 <div>
									<Switch>
											{/* <Route path="/technological/xczNews" exact component={ SearchArticlesList } /> */}
											<Route path="/technological/xczNews/hot" component={ Hot } />
											<Route path="/technological/xczNews/highRise" component={ HighRise } />
											<Route path="/technological/xczNews/authority" component={ Authority } />
											<Route path="/technological/xczNews/area" component={ Area } />
											<Route path="/technological/xczNews/database" component={ DataBase } />
											
											{/* 重定向 */}
											<Redirect from="/technological/xczNews" to="/technological/xczNews/hot" />
									</Switch>
                </div>
                
            </div>
        )
    }
}
