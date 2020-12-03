import React from 'react'
import { Input, Select, Cascader } from 'antd'
import indexStyles from './index.less'
import { areaData } from '../../../../../../utils/areaData'

const Option = Select.Option

export default class ConfirmInfoThreeOne extends React.Component {
  areaChange = value => {
    // console.log(value)
  }

  render() {
    const multipleSelectChildren = []
    for (let i = 10; i < 36; i++) {
      multipleSelectChildren.push(
        <Option key={i.toString(36) + i}>{i.toString(36) + i}</Option>
      )
    }
    const fiterSelect = value => {
      let container = ''
      switch (value) {
        case 'redio':
          container = (
            <div
              className={indexStyles.EditFormThreeOneOutItem}
              style={{ width: '100%' }}
            >
              <Select
                defaultValue="lucy"
                style={{ width: '100%' }}
                size={'small'}
              >
                <Option value="jack">Jack</Option>
                <Option value="lucy">Lucy</Option>
                <Option value="disabled">Disabled</Option>
                <Option value="Yiminghe">yiminghe</Option>
              </Select>
            </div>
          )
          break
        case 'multiple':
          container = (
            <div
              className={indexStyles.EditFormThreeOneOutItem}
              style={{ width: '100%' }}
            >
              <Select
                mode="multiple"
                size={'small'}
                style={{ width: '100%' }}
                placeholder="Please select"
                defaultValue={['a10', 'c12']}
              >
                {multipleSelectChildren}
              </Select>
            </div>
          )
          break
        case 'province':
          container = (
            <div
              className={indexStyles.EditFormThreeOneOutItem}
              style={{ width: '100%' }}
            >
              <p>所在归属地 (必填)</p>
              <div>
                <Cascader
                  options={areaData}
                  onChange={this.areaChange.bind(this)}
                  placeholder="请选择省市区"
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          )
          break
        default:
          container = ''
      }
      return container
    }

    return (
      <div className={indexStyles.EditFormThreeOneOut}>
        <div className={indexStyles.EditFormThreeOneOut_form}>
          <div className={indexStyles.EditFormThreeOneOut_form_left}></div>
          <div className={indexStyles.EditFormThreeOneOut_form_right}>
            {fiterSelect('province')}
          </div>
        </div>
      </div>
    )
  }
}

// state = {
//   provincies: provinceData,
//   secondProvice: provinceData[0],
//   cities: cityData[provinceData[0]],
//   secondCity: cityData[provinceData[0]][0],
//   areas: areaData[provinceData[0]][cityData[provinceData[0]][0]], //areaData[provinceData[0]][0][cityData[provinceData[0]][0]]
//   secondArea:areaData[provinceData[0]][cityData[provinceData[0]][0]][0],
// }
//
// handleProvinceChange = (value) => {
//   this.setState({
//     secondProvice: value,
//     cities: cityData[value],
//     secondCity: cityData[value][0],
//     areas:  areaData[value][cityData[value][0]],
//     secondArea:areaData[value][cityData[value][0]][0]
//   });
// }
//
// onSecondCityChange = (value) => {
//   const { secondProvice } = this.state
//   this.setState({
//     secondCity: value,
//     areas: areaData[secondProvice][value],
//     secondArea: areaData[secondProvice][value][0] || ''
//   });
// }
// onSecondAreaChange = (value) => {
//   this.setState({
//     secondArea: value,
//   });
// }

// const { cities, secondCity, areas, secondArea} = this.state
//
// const provinceOptions = provinceData.map(province => <Option key={province}>{province}</Option>);
// const cityOptions = cities.map(city => <Option key={city}>{city}</Option>);
// const areaOptions = areas.map(area => <Option key={area}>{area}</Option>);
//
// const multipleSelectChildren = [];
// for (let i = 10; i < 36; i++) {
//   multipleSelectChildren.push(<Option key={i.toString(36) + i}>{i.toString(36) + i}</Option>);
// }
//
// const fiterSelect = (value) => {
//   let container = ''
//   switch (value) {
//     case 'redio':
//       container = (
//         <div  className={indexStyles.EditFormThreeOneOutItem} style={{ width: '100%'}}>
//           <Select defaultValue="lucy" style={{ width: '100%' }}  size={'small'}>
//             <Option value="jack">Jack</Option>
//             <Option value="lucy">Lucy</Option>
//             <Option value="disabled" >Disabled</Option>
//             <Option value="Yiminghe">yiminghe</Option>
//           </Select>
//         </div>
//       )
//       break
//     case 'multiple':
//       container = (
//         <div  className={indexStyles.EditFormThreeOneOutItem} style={{ width: '100%'}}>
//           <Select
//             mode="multiple"
//             size={'small'}
//             style={{ width: '100%' }}
//             placeholder="Please select"
//             defaultValue={['a10', 'c12']}
//           >
//             {multipleSelectChildren}
//           </Select>
//         </div>
//       )
//       break
//     case 'province':
//       container = (
//         <div  className={indexStyles.EditFormThreeOneOutItem} style={{ width: '100%'}}>
//           <p>所在归属地 (必填)</p>
//           <div>
//             <Select defaultValue={provinceData[0]} style={{ width: 215 }} onChange={this.handleProvinceChange} size={'small'}>
//               {provinceOptions}
//             </Select>
//             <Select value={secondCity} style={{ width: 215, marginLeft: 14 }} onChange={this.onSecondCityChange} size={'small'}>
//               {cityOptions}
//             </Select>
//             <Select value={secondArea} style={{ width: 215, marginLeft: 14 }} onChange={this.onSecondAreaChange} size={'small'}>
//               {areaOptions}
//             </Select>
//           </div>
//         </div>
//       )
//       break
//     default:
//       container = ''
//   }
//   return container
// }
