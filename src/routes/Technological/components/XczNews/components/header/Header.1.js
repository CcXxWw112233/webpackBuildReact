import React, { Component } from 'react'
import headerStyles from './header.less'
import { Input } from 'antd';
import { Link } from 'dva/router'
import { connect } from 'dva'

@connect(({xczNews = []}) => ({xczNews}))
export default class Header extends Component {

    state = {
        searchTimer: null
    }

    constructor(props) {
        super(props)
        this.searchTimer = null
    }

    // onSearch 搜索框
    onSearch = (value, onSearchButton) => {
        const { dispatch } = this.props;
        // console.log(onSearchButton)
        dispatch({
            type: "xczNews/getHeaderSearch",
            payload: {
                value: value,
                onSearchButton: true,
            }
        })
    }

    // 一开始想的思路
    // onChange = (e) => {
    //     const value = e.target.value
    //     const { dispatch } = this.props
    //     dispatch({
    //         type: 'xczNews/updateDatas',
    //         payload: {
    //             inputValue: value,
    //             // onSearchButton: false,
    //         }
    //     })
    // }

    onChange = (e) => {
        const value = e.target.value
        const { dispatch } = this.props
        console.log('sss', value)
        dispatch({
            type: "xczNews/updateDatas",
            payload: {
                inputValue: value
            }
        })

        const { searchTimer } = this.state
        if(searchTimer) {
            clearTimeout(searchTimer)
        }
        this.setState({
            searchTimer: setTimeout(() => {
                 this.getHeaderSearch()
                }, 300)
        })
      
    }
    getHeaderSearch = () => {
        const { dispatch } = this.props;
        // console.log(onSearchButton)
        dispatch({
            type: "xczNews/getHeaderSearch",
            payload: {
               
            }
        })
    }
    
    render() {
        const { xczNews, location } = this.props;
        const { onSearchButton, inputValue } = xczNews;
        return (
            <div className={headerStyles.header}>
                <div className={headerStyles.mainContainer}>
                    <div className={headerStyles.nav}>
                        <div className={headerStyles.tab}>
                            {
                                xczNews.topTabs.map((item, index) => {
                                    // console.log(item)
                                    if (item.path == location.pathname) {
                                        return (
                                            <Link className={headerStyles.active} to={item.path}>{item.text}</Link>
                                        )
                                    } else {
                                        return (
                                            <Link to={item.path}>{item.text}</Link>
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
                                    onChange={this.onChange}
                                    onSearch={(inputValue) => this.onSearch(inputValue, onSearchButton)}
                                />
                            </div>
                        )
                    }
                </div>   
            </div>
        )
    }
}
