import { areaJson, AdministrativeDivisionDatas } from './areaJson'

// 当数据源是AdministrativeDivisionDatas
// let provinceDatas = []
// let cityDatas = {}
// let areaDatas = {}
// for(let i = 0; i < AdministrativeDivisionDatas.length; i++ ) {
//   provinceDatas.push(AdministrativeDivisionDatas[i]['name'])
//   cityDatas[AdministrativeDivisionDatas[i]['name']] = []
//   areaDatas[AdministrativeDivisionDatas[i]['name']] = {}
//   for(let j = 0; j < AdministrativeDivisionDatas[i]['city'].length; j ++ ){
//     cityDatas[AdministrativeDivisionDatas[i]['name']].push(AdministrativeDivisionDatas[i]['city'][j]['name'])
//     areaDatas[AdministrativeDivisionDatas[i]['name']][AdministrativeDivisionDatas[i]['city'][j]['name']] =  AdministrativeDivisionDatas[i]['city'][j]['area']
//   }
// }
// export const provinceData = provinceDatas
// export const cityData = cityDatas
// export const areaData = areaDatas
// let provinceDatas = []
// let cityDatas = []
// let areaDatas = []
//

let areaDatas = []
let typeArray1 = []
let typeArray2 = []
let typeArray3 = []

for (let i = 0; i < areaJson.length; i++ ) {
  if(areaJson[i].type === 1) {
    areaDatas.push({...areaJson[i], children: [], label: areaJson[i].name, value: areaJson[i].code})
    typeArray1.push(areaJson[i])
  }else if(areaJson[i].type === 2) {
    typeArray2.push(areaJson[i])
  }else if(areaJson[i].type === 3) {
    typeArray3.push(areaJson[i])
  }
}
for (let i = 0; i < areaDatas.length; i++ ) {
  for (let j = 0; j < typeArray2.length; j++) {
    if(typeArray2[j].parentCode === areaDatas[i].code) {
      areaDatas[i]['children'].push({...typeArray2[j], children: [], label: typeArray2[j].name, value: typeArray2[j].code})
    }
  }
}
for (let i = 0; i < areaDatas.length; i++ ) {
  for (let j = 0; j < typeArray3.length; j++) {
    for(let k =0 ; k < areaDatas[i]['children'].length; k++ ) {
      if(typeArray3[j].parentCode === areaDatas[i]['children'][k].code) {
        areaDatas[i]['children'][k]['children'].push({...typeArray3[j], label: typeArray3[j].name, value: typeArray3[j].code})
      }
    }
  }
}
export const areaData = areaDatas



