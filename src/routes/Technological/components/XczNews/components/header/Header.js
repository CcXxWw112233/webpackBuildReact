import React, { Component } from 'react'
import headerStyles from './header.less'
import { Input } from 'antd';
import { Link } from 'dva/router'
import { connect } from 'dva'

@connect(({xczNews = []}) => ({xczNews}))
export default class Header extends Component {
    state = {
        searchTimer: null,
        tabs: [
            {
                "flag": 1,
                "name": "hot",
                "path": "/technological/xczNews/hot",
                "text": "热点"
            },
            {
                "flag": 2,
                "name": "highRise",
                "path": "/technological/xczNews/highRise",
                "text": "高层"
            },
            {   
                "flag": 3,
                "name": "authority",
                "path": "/technological/xczNews/authority",
                "text": "权威"
            },
            {
                "flag": 4,
                "name": "area",
                "path": "/technological/xczNews/area",
                "text": "地区"
            },
            {
                "flag": 5,
                "name": "dataBase",
                "path": "/technological/xczNews/dataBase",
                "text": "资料库"
            }
        ],
    }
    // onSearch 搜索框
    onSearch = () => {
        const { dispatch } = this.props;
        dispatch({
            type: "xczNews/updateDatas",
            payload: {
                // contentVal: value,
                onSearchButton: true,
                hotFlag: false,
                highRiseFlag: false,
                authorityFlag: false, // 权威的开关
                dataBaseFlag: false, // 资料库的开关
                defaultArr: [],
            }
        })
        dispatch({
            type: "xczNews/getHeaderSearch",
            payload: {
            }
        })
    }

    getHeaderSearch = () => {
        const { dispatch } = this.props;
        dispatch({
            type: "xczNews/updateDatas",
            payload: {
                // contentVal: value,
                onSearchButton: true,
                hotFlag: false,
                highRiseFlag: false,
                authorityFlag: false, // 权威的开关
                dataBaseFlag: false, // 资料库的开关
            }
        })
        dispatch({
            type: "xczNews/getHeaderSearch",
            payload: {
            }
        })
    }

    onChange = (e) => {
        const value = e.target.value
        const { dispatch } = this.props
        dispatch({
            type: "xczNews/updateDatas",
            payload: {
                inputValue: value,
                defaultArr: []
            }
        })

        const { searchTimer } = this.state
        if(searchTimer) {
            clearTimeout(searchTimer)
        }
        this.setState({
            searchTimer: setTimeout(() => {
                 this.getHeaderSearch()
            }, 500)
        })
      
    }

    render() {
        const { xczNews, location } = this.props;
        const { tabs } = this.state;
        const { inputValue } = xczNews;
        return (
            <div className={headerStyles.header}>
                <div className={headerStyles.mainContainer}>
                    <div className={headerStyles.nav}>
                        <div className={headerStyles.tab}>
                            {
                                tabs.map((item, index) => {
                                    // console.log(item)
                                    if (item.path == location.pathname) {
                                        return (
                                            <Link id={item.flag} className={headerStyles.active} to={item.path}>{item.text}</Link>
                                        )
                                    } else {
                                        return (
                                            <Link id={item.flag} to={item.path}>{item.text}</Link>
                                        )
                                    }
                                    
                                })
                            }
                        </div>
                    </div>
                    {
                        location.pathname !== '/technological/xczNews/area' && (
                            <div className={headerStyles.Search}>
                                <Input.Search 
                                    type="text"
                                    value={inputValue}
                                    allowClear={true}
                                    placeholder="请输入"
                                    style={{ width: 200, height: 32, marginRight: 16 }}
                                    autocomplete="off"
                                    onChange={this.onChange}
                                    onSearch={this.onSearch}
                                />
                            </div>
                        )
                    }
                </div>   
            </div>
        )
    }
}
