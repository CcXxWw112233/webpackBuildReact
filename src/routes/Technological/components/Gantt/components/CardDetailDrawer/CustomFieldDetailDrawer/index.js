import React, { Component } from 'react'
import { Drawer } from 'antd'
import { connect } from 'dva'
import styles from './index.less'
import CustomFields from '../.././../../../../../components/CustomFields'
import { isApiResponseOk } from '../../../../../../../utils/handleResponseData'

@connect(mapStateToProps)
export default class index extends Component {
  onClose = () => {
    this.props.dispatch({
      type: 'publicTaskDetailModal/updateDatas',
      payload: {
        selected_more_field_visible: false
      }
    })
  }

  handleAddCustomField = (checkedKeys = [], calback) => {
    const {
      drawContent: { board_id, card_id }
    } = this.props
    this.props
      .dispatch({
        type: 'organizationManager/createRelationCustomField',
        payload: {
          fields: checkedKeys,
          relation_id: card_id,
          source_type: '2'
        }
      })
      .then(res => {
        if (isApiResponseOk(res)) {
          this.props.dispatch({
            type: 'publicTaskDetailModal/getCardWithAttributesDetail',
            payload: {
              id: card_id
            }
          })
          if (calback && typeof calback == 'function') calback()
          this.onClose()
        } else {
          if (calback && typeof calback == 'function') calback()
        }
      })
  }

  render() {
    const { drawContent = {}, selected_more_field_visible } = this.props
    const { org_id, fields = [] } = drawContent
    // console.log(selected_more_field_visible);
    return (
      <div
        className={`${
          styles.draw_field_detail
        } ${!selected_more_field_visible && styles.hide_over}`}
      >
        <Drawer
          placement="right"
          title={'添加字段'}
          onClose={this.onClose}
          mask={true}
          destroyOnClose
          visible={selected_more_field_visible}
          getContainer={false}
          style={{ position: 'absolute' }}
          width={280}
          closable={true}
          className={styles.draw_field_detail}
        >
          {selected_more_field_visible && (
            <CustomFields
              onlyShowPopoverContent={true}
              relations_fields={fields}
              org_id={org_id}
              handleAddCustomField={this.handleAddCustomField}
            />
          )}
        </Drawer>
      </div>
    )
  }
}

function mapStateToProps({
  publicTaskDetailModal: { drawContent = {}, selected_more_field_visible }
}) {
  return {
    drawContent,
    selected_more_field_visible
  }
}
