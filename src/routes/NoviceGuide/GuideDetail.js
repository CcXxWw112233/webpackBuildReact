import React from 'react'
import { connect } from 'dva'
import indexStyles from './index.less'
import logo from '../../assets/library/lingxi_logo.png'
import { Input, Button, Spin, Select } from 'antd'
import { getSearchOrganizationList } from '../../services/technological/organizationMember'
import { INPUT_CHANGE_SEARCH_TIME } from '../../globalset/js/constant'
import { platformNouns } from '../../globalset/clientCustorm'

const Option = Select.Option

export default class GuideDetail extends React.Component {
  state = {
    name: '', //名称
    stepContinueDisabled: true, //确认按钮
    operateType: '0', //0默认申请加入 ‘1’创建组织
    createButtonVisible: false, //输入框里面的按钮
    seachAreaVisible: false, //查询所得到的结果是否显示
    searchTimer: null,
    searchOrganizationList: [], //搜索列表
    orgProperty: '1', //组织性质
    spinning: false
  }
  nameChange(e) {
    const value = e.target.value
    const that = this
    this.setState({
      name: value
    })
    let flag = true
    if (value) {
      flag = false
    }
    this.setState(
      {
        operateType: '0'
      },
      () => {
        this.setState({
          stepContinueDisabled: this.state.operateType === '1' ? flag : true,
          createButtonVisible: this.state.operateType === '0' ? !flag : false, //如果是申请加入界面，那就根据输入，如果是创建组织，则隐藏
          seachAreaVisible: this.state.operateType === '0' ? !flag : false
        })

        //延时调用查询
        const { searchTimer, operateType } = this.state
        if (operateType === '0') {
          if (searchTimer) {
            clearTimeout(searchTimer)
          }
          this.setState({
            searchTimer: setTimeout(function() {
              //  此处调用请求
              // that.props.getSearchOrganizationList({name: value})
              that.setState({
                spinning: true
              })
              getSearchOrganizationList({ name: value })
                .then(res => {
                  that.setState({
                    searchOrganizationList: res.data,
                    spinning: false
                  })
                })
                .catch(err => {
                  that.setState({
                    spinning: false
                  })
                })
            }, INPUT_CHANGE_SEARCH_TIME)
          })
        }
      }
    )
  }
  nameBlur() {
    const that = this
    setTimeout(function() {
      that.setState({
        seachAreaVisible: false
      })
    }, 500)
  }
  setOperateType(type) {
    this.setState({
      operateType: type,
      seachAreaVisible: type === '1' ? false : true,
      createButtonVisible: false,
      stepContinueDisabled: this.state.name ? false : true
    })
  }

  setOrgProperty(value) {
    this.setState({
      orgProperty: value
    })
  }
  //查询所得到的点击
  searchResultItemClick(data) {
    const { name, id } = data
    this.setState({
      name,
      org_id: id, //请求加入组织id
      seachAreaVisible: false,
      stepContinueDisabled: false
    })
  }
  submitButton() {
    const { operateType, name, org_id, orgProperty } = this.state
    if (operateType === '0') {
      this.props.applyJoinOrganization({ org_id })
    } else if (operateType === '1') {
      this.props.createOrganization({ name, property: orgProperty })
    }
  }

  render() {
    const {
      stepContinueDisabled,
      operateType,
      createButtonVisible,
      name,
      seachAreaVisible,
      spinning,
      searchOrganizationList = [],
      orgProperty
    } = this.state

    return (
      <div className={indexStyles.noviceGuideOut}>
        <div className={indexStyles.contain1}>
          <img src={logo} />
        </div>
        <div className={indexStyles.contain2}>欢迎使用{platformNouns}</div>
        <div className={indexStyles.contain3}>
          查找并加入你的组织，轻松连接工作的伙伴与项目：
        </div>

        <div className={indexStyles.contain4}>
          <div style={{ position: 'relative' }}>
            <Input
              placeholder={'请输入'}
              onBlur={this.nameBlur.bind(this)}
              value={name}
              onChange={this.nameChange.bind(this)}
              maxLength={50}
              style={{ paddingRight: 120, height: 40 }}
            />
            {createButtonVisible ? (
              <Button
                type={'primary'}
                size={'small'}
                style={{ position: 'absolute', right: 10, top: 8 }}
                onClick={this.setOperateType.bind(this, '1')}
              >
                创建组织
              </Button>
            ) : (
              ''
            )}
            {searchOrganizationList.length ? (
              <div
                style={{
                  ...seachAreaStyles,
                  display: !seachAreaVisible ? 'none' : 'block'
                }}
              >
                <Spin spinning={spinning} size={'small'}>
                  {searchOrganizationList.map((value, key) => (
                    <div
                      className={indexStyles.searChItem}
                      key={value.id}
                      onClick={this.searchResultItemClick.bind(this, {
                        name: value.name,
                        id: value.id
                      })}
                    >
                      {value.name}
                    </div>
                  ))}
                </Spin>
              </div>
            ) : (
              <div
                style={{
                  ...seachAreaStyles,
                  display: !seachAreaVisible ? 'none' : 'block'
                }}
              >
                <div>未找到符合搜索条件的组织</div>
              </div>
            )}
          </div>

          {operateType === '0' ? (
            ''
          ) : (
            <div>
              {/*组织性质*/}
              <Select
                style={{ height: 40, width: 350, marginTop: 16 }}
                value={orgProperty}
                size={'large'}
                placeholder={'请选择'}
                onChange={this.setOrgProperty.bind(this)}
              >
                <Option value="1">投资商</Option>
                <Option value="2">设计院</Option>
                <Option value="3">学校</Option>
                <Option value="4">专家</Option>
                <Option value="5">政府</Option>
                <Option value="6">其他</Option>
              </Select>
              {/*人数*/}
            </div>
          )}

          <Button
            type={operateType === '0' ? '' : 'primary'}
            disabled={stepContinueDisabled}
            onClick={this.submitButton.bind(this)}
            style={{ marginTop: 20, width: 208, height: 40 }}
          >
            {operateType === '0' ? '申请加入' : '创建组织'}
          </Button>
        </div>
      </div>
    )
  }
}
const seachAreaStyles = {
  position: 'absolute',
  top: 46,
  width: '100%',
  zIndex: 2,
  height: 'auto',
  padding: '10px',
  borderRadius: 4,
  background: '#FFFFFF',
  border: '1px solid rgba(0,0,0,0.15)',
  boxShadow: `0px 2px 15px 0px rgba(0,0,0,0.08)`,
  overflow: 'hidden'
}
