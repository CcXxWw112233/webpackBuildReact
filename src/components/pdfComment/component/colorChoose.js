import React, { useState, useMemo } from 'react'
import styles from './index.less'
// 将hex颜色转成rgb
function hexToRgba(hex, opacity) {
  var RGBA =
    'rgba(' +
    parseInt('0x' + hex.slice(1, 3)) +
    ',' +
    parseInt('0x' + hex.slice(3, 5)) +
    ',' +
    parseInt('0x' + hex.slice(5, 7)) +
    ',' +
    opacity +
    ')'
  return {
    red: parseInt('0x' + hex.slice(1, 3)),
    green: parseInt('0x' + hex.slice(3, 5)),
    blue: parseInt('0x' + hex.slice(5, 7)),
    rgba: RGBA
  }
}
// 将rgb颜色转成hex
function colorRGB2Hex(color) {
  var rgb = color.split(',')
  var r = parseInt(rgb[0].split('(')[1])
  var g = parseInt(rgb[1])
  var b = parseInt(rgb[2].split(')')[0])

  var hex = '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
  return hex
}
export default function ChooseColor(props) {
  const [activeColor, setColor] = useState(props.color)
  let colors = [
    '#E2E5EC',
    '#FFE948',
    '#FFC120',
    '#FF873B',
    '#9EA6C2',
    '#AFFF88',
    '#50A427',
    '#FF4E3B',
    '#474A5B',
    '#6A9AFF',
    '#337015',
    '#9013FE',
    '#000000',
    '#4170E8'
  ]
  useMemo(() => {
    // if (
    //   !props.needHex &&
    //   props.color &&
    //   props.color.indexOf('#') !== -1 &&
    //   props.color.length === 7
    // ) {
    //   setColor(hexToRgba(props.color, 1).rgba)
    // } else if (props.color) {
    //   setColor(props.color)
    // }
    setColor(props.color)
  }, [props.color])
  const setActiveColor = val => {
    // setColor(val)
    // console.log(props)
    // if (props.needHex) {
    props.onChange && props.onChange(val, val)
    // } else props.onChange && props.onChange(val, colorRGB2Hex(val))
  }
  const defaultColor = props.colors || colors
  return (
    <div className={styles.ChooseColor}>
      {defaultColor.map((item, index) => {
        return (
          <div className={styles.color_flexBox} key={index}>
            <span
              className={`${styles.color_item} ${
                activeColor === item ? styles.activeColor : ''
              }`}
              onClick={setActiveColor.bind(this, item)}
              key={index}
              style={{ background: item }}
            />
          </div>
        )
      })}
    </div>
  )
}
