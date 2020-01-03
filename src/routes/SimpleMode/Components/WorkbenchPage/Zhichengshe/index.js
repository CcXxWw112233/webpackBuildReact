import React, { Component } from 'react';
import { connect } from 'dva';
import indexStyles from './index.less';

@connect(({ xczNews = {}, xczNews: { XczNewsOrganizationList }, }) => ({
    xczNews, XczNewsOrganizationList,
}))
export default class index extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
        }
    }
    componentDidMount() {
        window.addEventListener('resize', this.setHeight)
    }
    componentWillUnmount() {
        window.removeEventListener('resize', this.setHeight)
    }
    setHeight = () => {
        const height = document.querySelector('body').clientHeight
        this.setState({
            height
        })
    }

    render() {

        const src_url = 'https://www.di-an.com/zhichengshe?simplemode=true'
        // const src_url = 'http://192.168.1.50:8001/zhichengshe?simplemode=true'

        const workbenchBoxContentElementInfo = document.getElementById('container_workbenchBoxContent');
        let contentHeight = workbenchBoxContentElementInfo ? workbenchBoxContentElementInfo.offsetHeight : 0;

        return (
            <div className={indexStyles.mapsContainer} style={{ height: contentHeight + 'px' }}>
                <iframe src={src_url} overflow-x='no' overflow-y='auto' frameborder="0" width='100%' height={'100%'}></iframe>
            </div>
        );
    }
}

