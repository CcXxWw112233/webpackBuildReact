import React from 'react'
import { Switch, Button } from 'antd'
import { changeConfirmLocale } from 'antd/lib/modal/locale'
import { checkPropTypes } from 'prop-types'

const map_name = '投资地图'

export default props => {
  const { title, titleSub, dataSource, change } = props
  const test = id => {
    const onChange = checked => {
      change(id, checked)
    }
    return onChange
  }

  const functionalManagementOfInvestmentMap = () => {
    props.loadFunctionalManagementOfInvestmentMap()
  }

  return (
    <div style={{ marginBottom: '49px' }}>
      <p style={{ color: '#262626', fontSize: '16px', marginBottom: '13px' }}>
        {title}
      </p>
      {titleSub ? (
        <span
          style={{
            width: '532px',
            fontSize: '14px',
            color: '#595959',
            marginBottom: '13px'
          }}
        >
          {titleSub}
        </span>
      ) : null}
      {dataSource.reduce((r, c, i) => {
        return [
          ...r,
          <div
            key={`div${i}`}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              textAlign: 'left',
              borderBottom: '1px solid #CCC'
            }}
          >
            <div style={{ width: '518px', padding: '8px 0' }}>
              <p
                style={{
                  marginBottom: '4px',
                  fontSize: '16px',
                  color: '#595959'
                }}
              >
                {c.name}
              </p>
              <p style={{ fontSize: '12px', color: '#8C8C8C' }}>
                {c.description}
              </p>
            </div>
            <div
              style={{
                width: '94px',
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center'
              }}
            >
              {c.name === map_name ? (
                <Button
                  icon="setting"
                  onClick={functionalManagementOfInvestmentMap}
                />
              ) : (
                <Button icon="setting" hidden />
              )}
              {c.status === '1' ? (
                <Switch defaultChecked onChange={test(c.id)}></Switch>
              ) : (
                <Switch onChange={test(c.id)}></Switch>
              )}
            </div>
          </div>
        ]
      }, [])}
    </div>
  )
}
