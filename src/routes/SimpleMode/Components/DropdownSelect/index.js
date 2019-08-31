import React, { Component } from 'react';
import { Menu, Dropdown, Input, Icon, Divider } from 'antd';
import { connect } from 'dva/index';
import styles from './index.less';

import globalStyles from '@/globalset/css/globalClassName.less'

class DropdownSelect extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            addNew: false,
            inputValue: '',
            fuctionMenuItemList: this.props.fuctionMenuItemList,
            menuItemClick: this.props.menuItemClick,
        };
    }

    handleSeletedMenuItem = (item) => {

    }

    renderFunctionMenuItem = (itemList) => {
        return itemList.map((item, index) => (
            <Menu.Item key={item.id} style={{
                lineHeight: '30px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#000000',
                boxShadow: 'none',
                borderRadius: '0',
                border: '0',
                borderRight: '0px!important',
            }}>
                <span style={{ color: '#1890FF' }}>
                    <Icon type={item.icon} style={{ fontSize: '17px' }} /><span style={{ paddingLeft: '10px' }}>{item.name}</span>
                </span>
            </Menu.Item>
        ));

    }

    renderMenuItem = (itemList) => {
        return itemList.map((item, index) => (
            <Menu.Item key={item.id} style={{
                lineHeight: '30px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#000000',
                boxShadow: 'none',
                borderRadius: '0',
                border: '0',
                borderRight: '0px!important',
            }}>
                <span>
                    {item.name}
                    {item.parentName && <span style={{ fontSize: '12px', color: 'rgba(0,0,0,0.65)' }}>#{item.parentName}</span>}

                </span>
            </Menu.Item>
        ));
    };

    componentWillReceiveProps() {
        const { itemList, fuctionMenuItemList } = this.props;
        this.setState({
            itemList: itemList,
            fuctionMenuItemList: fuctionMenuItemList,
        })
    }

    renderContent() {
        const { fuctionMenuItemList = [], menuItemClick = () => { }} = this.state;
        const { itemList = [], selectedKeys = []} = this.props;
        console.log("selectedKeys", selectedKeys);
        
        return (
            <Menu className={styles.dropdownMenu}
                onClick={menuItemClick}
                selectedKeys={selectedKeys}>
                {this.renderFunctionMenuItem(fuctionMenuItemList)}
                {this.renderMenuItem(itemList)}

            </Menu>
        );
    }
    render() {
        const { simplemodeCurrentProject, iconVisible = true, dropdownStyle = {} } = this.props;
        return (
            <div className={styles.wrapper}>

                <Dropdown
                    overlay={this.renderContent()}
                    trigger={['click']}
                //visible={visible}
                //onVisibleChange={this.handleVisibleChange}
                >
                    <div className={styles.titleClassName}
                        style={{
                            display: 'inline-block',
                            maxWidth: '248px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}>
                        {
                            iconVisible && (
<span>
                                <i className={`${globalStyles.authTheme}`} style={{ color: 'rgba(255, 255, 255, 1)', fontSize: '20px' }}>&#xe67d;</i>
                                &nbsp;
                                &nbsp;
                            </span>
)}
                        <span style={{ fontWeight: '500', fontSize: '16px' }}>
                            {(simplemodeCurrentProject && simplemodeCurrentProject.board_id) ?
                                simplemodeCurrentProject.board_name
                                :
                                '我参与的项目'
                            }
                            <Icon type="down" style={{ fontSize: '12px' }} />
                        </span>

                    </div>
                </Dropdown>
            </div>
        );
    }
}

export default connect(({ }) => ({}))(DropdownSelect);
