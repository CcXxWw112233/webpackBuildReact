import React, { Component } from 'react'
import mainStyles from './hot.less'
import { Icon } from 'antd'

export default class HotArticlesList extends Component {

    // 时间戳转换日期格式
    getdate() {
        var now = new Date(),
            y = now.getFullYear(),
            m = ("0" + (now.getMonth() + 1)).slice(-2),
            d = ("0" + now.getDate()).slice(-2);
        return y + "-" + m + "-" + d + " "
     }
     
    render() {
        // console.log(this.props)
        const { hotArticlesList = [] } = this.props;
        return (
            <div>
                {
                    hotArticlesList.map(item => {
                        // console.log(item)
                        return (
                            <div className={mainStyles.info}>
                                <div className={mainStyles.title}>
                                    <h2 id={item.id}>{item.name}</h2>
                                    <a href="#">
                                        更多
                                        <Icon type="right" />
                                    </a>
                                </div>
                                <div className={mainStyles.news}>
                                    <ul>
                                        {
                                            item.articles.map((item, index) => {
                                                if (!item.hasImg) {
                                                    return (
                                                        <li>
                                                            <div className={mainStyles.right}>
                                                                <div className={mainStyles.message}>
                                                                    <i className={mainStyles.dot}></i>
                                                                    <a className={mainStyles.text} target="_blank" href={item.origin_url}>{item.title}</a>
                                                                </div>
                                                                <div className={mainStyles.dot_note}>
                                                                    <span>{item.origin_name}</span>
                                                                    <span>{this.getdate(item.publish_time)}</span>
                                                                </div>
                                                            </div>
                                                        </li>
                                                    )
                                                } else {
                                                    return (
                                                        <li>
                                                            <div className={mainStyles.left}>
                                                                <img src="" />
                                                            </div>
                                                            <div className={mainStyles.right}>
                                                                <div className={mainStyles.message}>
                                                                    <a className={mainStyles.img_text} target="_blank" href={item.origin_url}>{item.title}</a>
                                                                </div>
                                                                <div className={mainStyles.img_note}>
                                                                    <span>{item.origin_name}</span>
                                                                    <span>{this.getdate(item.publish_time)}</span>
                                                                </div>
                                                            </div>
                                                        </li>
                                                    )
                                                }
                                                
                                            })
                                        }   
                                    </ul>
                                </div>
                            </div>
                        )
                    })
                }
            </div>
        )
    }
}
