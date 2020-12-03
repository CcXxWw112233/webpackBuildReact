import React from 'react'
import dva, { connect } from 'dva/index'
import indexStyles from './index.less'
import globalStyles from '@/globalset/css/globalClassName.less'
import { Icon, message, Tooltip, Button } from 'antd'
import { isColor } from '@/utils/util'
import { changeBoxFeatureName } from '../../../../utils/temporary'
import {
  BOARD_PLANS,
  BOARD_CHAT,
  BOARD_FILES
} from '../../../../globalset/js/constant'
import { currentNounPlanFilterName } from '../../../../utils/businessFunction'

const WorkbenchBoxSelect = props => {
  const { dispatch, workbenchBoxList = [], myWorkbenchBoxList = [] } = props
  const closeBoxManage = () => {
    props.setHomeVisible({
      simpleHeaderVisiable: true,
      myWorkbenchBoxsVisiable: true,
      wallpaperSelectVisiable: true,
      workbenchBoxSelectVisiable: false,
      createProjectVisiable: false
    })
  }
  const selectOrCancelCurrWorkbenchBox = (e, data) => {
    e.stopPropagation()
    // if (data.status == 0 && !data.isSelected) {
    //   message.warn("功能开发中，请耐心等待");
    //   return;
    // }
    const { id } = data
    if (!data.isSelected) {
      dispatch({
        type: 'simplemode/myboxSet',
        payload: { id }
      })
    } else {
      dispatch({
        type: 'simplemode/myboxCancel',
        payload: { id }
      })
    }
  }

  const {
    allWallpaperList = [],
    currentUserWallpaperContent,
    userInfo = {}
  } = props
  const { wallpaper = '' } = userInfo
  const wallpaperContent = currentUserWallpaperContent
    ? currentUserWallpaperContent
    : wallpaper
  let bgStyle = {}
  if (isColor(wallpaperContent)) {
    bgStyle = { backgroundColor: wallpaperContent }
  } else {
    bgStyle = { backgroundImage: `url(${wallpaperContent})` }
  }
  // 渲染svg
  const renderIconSVG = code => {
    let contain = ''
    switch (code) {
      case 'board:plans': //项目计划
        contain = (
          <svg
            t="1584694920941"
            class="icon"
            viewBox="0 0 1024 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            p-id="14704"
            width="72"
            height="76"
          >
            <path
              d="M873.408 182.656h-166.72V119.04a7.936 7.936 0 0 0-7.936-7.936h-55.616a7.936 7.936 0 0 0-7.936 7.936v63.552h-254.08V119.04a7.936 7.936 0 0 0-7.936-7.936h-55.552a7.936 7.936 0 0 0-7.936 7.936v63.552H142.912a31.744 31.744 0 0 0-31.744 31.744v659.008c0 17.6 14.208 31.808 31.744 31.808h730.496a31.744 31.744 0 0 0 31.808-31.808V214.4a31.744 31.744 0 0 0-31.808-31.744z"
              fill="#D8D8D8"
              opacity=".652"
              p-id="14705"
            ></path>
            <path
              d="M308.736 257.28v54.016h69.888V257.28h254.08v54.016h69.888V257.28h117.696c13.824 0 25.088 11.264 25.088 25.152v521.472a25.152 25.152 0 0 1-25.088 25.152H187.072a25.152 25.152 0 0 1-25.088-25.152V282.432c0-13.888 11.2-25.088 25.088-25.088h121.6z m453.824 423.168H352.448a12.8 12.8 0 0 0-12.8 12.8v38.4c0 7.104 5.76 12.8 12.8 12.8h410.112a12.8 12.8 0 0 0 12.8-12.8v-38.4a12.8 12.8 0 0 0-12.8-12.8z m-76.864-160.192H275.584a12.8 12.8 0 0 0-12.8 12.8v38.4c0 7.104 5.696 12.8 12.8 12.8h410.112a12.8 12.8 0 0 0 12.8-12.8v-38.4a12.8 12.8 0 0 0-12.8-12.8z m76.864-147.392H499.84a12.8 12.8 0 0 0-12.8 12.8v38.4c0 7.104 5.76 12.8 12.8 12.8h262.72a12.8 12.8 0 0 0 12.8-12.8v-38.4a12.8 12.8 0 0 0-12.8-12.8z"
              fill="#FFFFFF"
              p-id="14706"
            ></path>
          </svg>
        )
        break
      case 'board:chat': //项目交流
        contain = (
          <svg
            t="1584695335803"
            class="icon"
            viewBox="0 0 1024 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            p-id="14824"
            width="72"
            height="76"
          >
            <path
              d="M325.76 319.424h553.6a62.08 62.08 0 0 1 62.272 61.888v339.52a62.08 62.08 0 0 1-62.272 61.824h-86.528v88.32a20.032 20.032 0 0 1-29.76 15.168l-9.984-5.632-165.952-95.232a20.224 20.224 0 0 0-9.92-2.56h-251.52a62.08 62.08 0 0 1-62.208-61.888V381.312a62.08 62.08 0 0 1 62.208-61.888z"
              fill="#D8D8D8"
              opacity=".65"
              p-id="14825"
            ></path>
            <path
              d="M780.416 186.24c38.912 0 70.464 31.552 70.464 70.464v386.88c0 38.912-31.552 70.464-70.4 70.464h-220.8a22.72 22.72 0 0 0-11.2 3.008l-187.904 108.48-11.328 6.528a22.592 22.592 0 0 1-33.664-17.28v-100.736h-161.92A70.464 70.464 0 0 1 83.2 643.584V256.704c0-38.912 31.552-70.4 70.4-70.4zM495.488 528.448h-215.04a17.152 17.152 0 0 0-17.152 17.152v23.68c0 9.472 7.68 17.152 17.088 17.152h215.04c9.536 0 17.152-7.68 17.152-17.152v-23.68a17.152 17.152 0 0 0-17.088-17.152z m156.544-139.136H280.32a17.152 17.152 0 0 0-17.088 17.152v23.68c0 9.472 7.68 17.152 17.088 17.152h371.648c9.472 0 17.088-7.68 17.088-17.152v-23.68a17.152 17.152 0 0 0-17.088-17.152z"
              fill="#FFFFFF"
              p-id="14826"
            ></path>
          </svg>
        )
        break
      case 'board:files': //项目文档
        contain = (
          <svg
            t="1584695393532"
            class="icon"
            viewBox="0 0 1024 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            p-id="14944"
            width="72"
            height="76"
          >
            <path
              d="M387.84 170.24c62.08 0 112.32 49.6 112.32 110.848l-0.064 49.152h327.04v400h-327.04v49.6a55.808 55.808 0 0 1-56.064 55.424H163.328a55.808 55.808 0 0 1-56.128-55.424V225.664c0-30.592 25.152-55.424 56.128-55.424H387.84z"
              fill="#D8D8D8"
              opacity=".65"
              p-id="14945"
            ></path>
            <path
              d="M842.816 253.12c31.232 0 56.576 24.832 56.576 55.424v471.296a56 56 0 0 1-56.576 55.424H163.776a56 56 0 0 1-56.576-55.424v-526.72h735.616zM268.864 586.432a37.824 37.824 0 1 0 0 75.648 37.824 37.824 0 0 0 0-75.648z m470.656 6.272H382.336a18.88 18.88 0 0 0-18.944 18.88v25.216c0 10.432 8.512 18.88 18.944 18.88h357.12a18.88 18.88 0 0 0 18.944-18.88v-25.216a18.88 18.88 0 0 0-18.88-18.88zM268.8 422.464a37.824 37.824 0 1 0 0 75.648 37.824 37.824 0 0 0 0-75.648z m470.656 6.336H382.336a18.88 18.88 0 0 0-18.944 18.88v25.152c0 10.432 8.512 18.88 18.944 18.88h357.12a18.88 18.88 0 0 0 18.944-18.88v-25.152a18.88 18.88 0 0 0-18.88-18.88z"
              fill="#FFFFFF"
              p-id="14946"
            ></path>
          </svg>
        )
        break
      case 'mine:shows': //我的展示
        contain = (
          <svg
            t="1584753956638"
            class="icon"
            viewBox="0 0 1024 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            p-id="20313"
            width="72"
            height="76"
          >
            <path
              d="M496.96 902.848l-392.32-466.688a23.296 23.296 0 0 1-0.832-28.864l192.32-257.92a23.296 23.296 0 0 1 18.624-9.344H714.688c7.36 0 14.272 3.456 18.688 9.344l192.32 257.92c6.4 8.64 6.08 20.608-0.896 28.864l-392.256 466.688a23.296 23.296 0 0 1-35.584 0z"
              fill="#D8D8D8"
              opacity=".65"
              p-id="20314"
            ></path>
            <path
              d="M319.552 444.16l201.088 353.856 201.152-353.856h108.352l-306.432 374.528-0.64 0.64-0.96 0.64-2.048 0.448a4.736 4.736 0 0 1-3.712-1.728L207.552 444.16h112z m357.952 0l-156.864 273.152-157.44-273.152h314.368z m11.008-246.4l161.792 208h-114.176l-77.44-208h29.824z m-306.56 0L304.64 405.76H192.128l160-208h29.888z m237.312 0l73.92 206.08-172.48-0.512H348.096L421.376 197.76h197.952z"
              fill="#FFFFFF"
              p-id="20315"
            ></path>
          </svg>
        )
        break
      case 'profession:template': //专业模板
        contain = (
          <svg
            t="1584754213649"
            class="icon"
            viewBox="0 0 1024 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            p-id="10364"
            width="72"
            height="76"
          >
            <path
              d="M793.6 140.8c14.08 0 25.6 11.52 25.6 25.6v660.48a25.6 25.6 0 0 1-25.6 25.6H515.584c-93.888 19.2-163.648 4.032-209.28-45.44-45.568-49.536-60.16-126.08-43.648-229.44V166.4c0-14.08 11.456-25.6 25.6-25.6H793.6z"
              fill="#D8D8D8"
              opacity=".65"
              p-id="10365"
            ></path>
            <path
              d="M713.088 208a29.44 29.44 0 0 1 29.888 29.184v641.216a29.44 29.44 0 0 1-29.888 29.12H396.608a30.08 30.08 0 0 1-10.24-1.792h-3.968v-1.792a30.912 30.912 0 0 1-6.912-4.992l-161.92-157.824a28.736 28.736 0 0 1-8.768-20.608V237.184a29.44 29.44 0 0 1 29.888-29.12zM412.16 712.704h-140.16v0.128l139.968 136.448h0.192v-136.576z m115.84-210.304H303.936a16 16 0 0 0-15.936 15.936v6.464c0 8.832 7.168 16 16 16h224a16 16 0 0 0 16-16v-6.464a16 16 0 0 0-16-16z m116.288-89.6H303.936a16 16 0 0 0-15.936 15.936v6.464c0 8.832 7.168 16 16 16h340.352a16 16 0 0 0 15.936-16v-6.464a16 16 0 0 0-16-16z m0-89.6H303.936a16 16 0 0 0-15.936 15.936v6.464c0 8.832 7.168 16 16 16h340.352a16 16 0 0 0 15.936-16v-6.464a16 16 0 0 0-16-16z"
              fill="#FFFFFF"
              p-id="10366"
            ></path>
          </svg>
        )
        break
      case 'cases': //案例
        contain = (
          <svg
            t="1584753730937"
            class="icon"
            viewBox="0 0 1024 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            p-id="20191"
            width="72"
            height="76"
          >
            <path
              d="M319.04 555.712L494.08 702.592l-181.44 216.256L288.64 768.64l-151.04 3.328 181.44-216.256z m376.64 0l181.44 216.256-151.04-3.328-24 150.208-181.44-216.256L695.68 555.712z"
              fill="#D8D8D8"
              opacity=".65"
              p-id="20192"
            ></path>
            <path
              d="M510.72 468.48m-295.68 0a295.68 295.68 0 1 0 591.36 0 295.68 295.68 0 1 0-591.36 0Z"
              fill="#FFFFFF"
              p-id="20193"
            ></path>
            <path
              d="M510.72 213.12a255.36 255.36 0 1 1 0 510.72 255.36 255.36 0 0 1 0-510.72z m0 32a223.36 223.36 0 1 0 0 446.72 223.36 223.36 0 0 0 0-446.72z"
              fill="#D8D8D8"
              p-id="20194"
            ></path>
            <path
              d="M507.392 528.96l-71.104 37.376 13.568-79.168-57.536-56.064 79.488-11.52 35.584-72.064 35.52 72 79.488 11.584-57.536 56.064 13.568 79.168z"
              fill="#D8D8D8"
              p-id="20195"
            ></path>
          </svg>
        )
        break
      case 'regulations': //政策法规
        contain = (
          <svg
            t="1584695449668"
            class="icon"
            viewBox="0 0 1024 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            p-id="15184"
            width="72"
            height="76"
          >
            <path
              d="M271.232 179.2h526.464a40.96 40.96 0 0 1 40.96 40.96v645.12H199.552v-614.4c0-39.616 32.128-71.68 71.68-71.68z"
              fill="#FFFFFF"
              p-id="15185"
            ></path>
            <path
              d="M227.712 691.2a15.36 15.36 0 0 1 15.36 15.36v30.72a15.36 15.36 0 0 1-15.36 15.296h-57.728a15.36 15.36 0 0 1-15.36-15.36v-30.72a15.36 15.36 0 0 1 15.36-15.296h57.728z m422.528-11.712a15.36 15.36 0 0 1 15.36 15.36v30.72a15.36 15.36 0 0 1-15.36 15.296H414.72a15.36 15.36 0 0 1-15.36-15.36v-30.72a15.36 15.36 0 0 1 15.36-15.296h235.52z m48.32-94.656a15.36 15.36 0 0 1 15.36 15.36v30.72a15.36 15.36 0 0 1-15.36 15.296H371.328a15.36 15.36 0 0 1-15.36-15.36v-30.72a15.36 15.36 0 0 1 15.36-15.296h327.232zM532.608 258.304l43.136 86.592 95.616 14.272L602.368 426.88l16 95.36-85.76-44.672-85.76 44.672 16-95.36-69.056-67.84 95.68-14.208 43.136-86.592zM227.712 294.4a15.36 15.36 0 0 1 15.36 15.36v30.72a15.36 15.36 0 0 1-15.36 15.296h-57.728a15.36 15.36 0 0 1-15.36-15.36v-30.72a15.36 15.36 0 0 1 15.36-15.296h57.728zM227.84 833.152h610.816v56.448H227.776a28.16 28.16 0 1 1 0-56.448z"
              fill="#D8D8D8"
              p-id="15186"
            ></path>
          </svg>
        )
        break
      case 'maps': //地图
        contain = (
          <svg
            t="1584695578138"
            class="icon"
            viewBox="0 0 1024 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            p-id="15304"
            width="72"
            height="76"
          >
            <path
              d="M155.904 181.76m93.632 0l529.792 0q93.632 0 93.632 93.632l0 506.56q0 93.632-93.632 93.632l-529.792 0q-93.632 0-93.632-93.632l0-506.56q0-93.632 93.632-93.632Z"
              fill="#FFFFFF"
              p-id="15305"
            ></path>
            <path
              d="M654.08 181.76L376.192 459.712l414.976 415.104c-3.84 0.512-7.808 0.768-11.84 0.768l-86.144-0.064L326.784 509.056 155.904 679.936V581.312L555.392 181.76h98.688z"
              fill="#D8D8D8"
              p-id="15306"
            ></path>
            <path
              d="M786.048 121.6c81.28 0 147.2 66.752 147.2 149.12 0 91.2-88.768 172.928-134.528 216.96a18.24 18.24 0 0 1-25.408 0c-46.848-45.184-134.464-125.44-134.464-216.96 0-82.368 65.92-149.12 147.2-149.12z m0 93.12a55.68 55.68 0 0 0-55.296 55.936 55.68 55.68 0 0 0 55.296 56 55.68 55.68 0 0 0 55.232-56 55.68 55.68 0 0 0-55.232-55.936zM303.04 619.648c48.768 0 88.32 40.064 88.32 89.408 0 54.784-53.312 103.808-80.768 130.24a10.88 10.88 0 0 1-15.168 0c-28.16-27.136-80.704-75.328-80.704-130.24 0-49.344 39.488-89.408 88.32-89.408z m0 55.872a33.344 33.344 0 0 0-33.216 33.536c0 18.56 14.848 33.6 33.216 33.6a33.344 33.344 0 0 0 33.152-33.6 33.344 33.344 0 0 0-33.152-33.536z"
              fill="#D8D8D8"
              p-id="15307"
            ></path>
          </svg>
        )
        break
      case 'mine:flows': //工作流
        contain = (
          <svg
            t="1584754283352"
            class="icon"
            viewBox="0 0 1024 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            p-id="10484"
            width="72"
            height="76"
          >
            <path
              d="M362.24 185.6m76.8 0l455.68 0q76.8 0 76.8 76.8l0 234.112q0 76.8-76.8 76.8l-455.68 0q-76.8 0-76.8-76.8l0-234.112q0-76.8 76.8-76.8Z"
              fill="#D8D8D8"
              opacity=".65"
              p-id="10485"
            ></path>
            <path
              d="M833.024 407.168a20.8 20.8 0 0 1 0 41.536H500.736a20.8 20.8 0 0 1 0-41.6h332.288z m0-96.96a20.8 20.8 0 0 1 0 41.6H500.736a20.8 20.8 0 0 1 0-41.6h332.288z"
              fill="#FFFFFF"
              p-id="10486"
            ></path>
            <path
              d="M57.6 483.328m76.8 0l455.68 0q76.8 0 76.8 76.8l0 234.112q0 76.8-76.8 76.8l-455.68 0q-76.8 0-76.8-76.8l0-234.112q0-76.8 76.8-76.8Z"
              fill="#FFFFFF"
              p-id="10487"
            ></path>
            <path
              d="M528.384 704.896a20.8 20.8 0 0 1 0 41.536H196.096a20.8 20.8 0 0 1 0-41.6h332.288z m0-96.96a20.8 20.8 0 0 1 0 41.6H196.096a20.8 20.8 0 0 1 0-41.6h332.288z"
              fill="#D8D8D8"
              p-id="10488"
            ></path>
            <path
              d="M271.552 254.848l62.272 49.856-62.272 49.856v-24.96H190.464v105.92c-4.224 9.856-12.288 14.784-24.192 14.784s-20.48-4.928-25.6-14.72v-118.4c0-20.224 15.936-36.672 35.904-37.376l94.848-0.064v-24.96z"
              fill="#D8D8D8"
              p-id="10489"
            ></path>
            <path
              d="M271.552 254.848l62.272 49.856-62.272 49.856v-24.96H190.464v0.512l-38.464-39.808a37.248 37.248 0 0 1 24.576-10.496l94.848-0.064v-24.96z"
              fill="#FFFFFF"
              p-id="10490"
            ></path>
            <path
              d="M760 803.84l-62.272-49.856 62.272-49.856 0.064 24.96h80.96V623.104c4.224-9.792 12.352-14.72 24.192-14.72 11.904 0 20.48 4.928 25.664 14.72v118.4c0 20.224-16 36.672-35.968 37.376l-94.848 0.064v24.896z"
              fill="#FFFFFF"
              p-id="10491"
            ></path>
            <path
              d="M877.632 770.048l-40.832-40.96h4.224V623.104c4.224-9.792 12.352-14.72 24.192-14.72 11.904 0 20.48 4.928 25.664 14.72v118.4a37.248 37.248 0 0 1-8.768 24.064l-4.48 4.48z"
              fill="#CACACA"
              opacity=".65"
              p-id="10492"
            ></path>
          </svg>
        )
        break
      case 'report':
        contain = (
          <svg
            t="1595321187623"
            class="icon"
            viewBox="0 0 1024 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            p-id="23036"
            width="72"
            height="76"
          >
            <path
              d="M182.410156 841.589844V116.4921875H116.4921875v791.015625h791.015625v-65.9179685z"
              fill="#FFFFFF"
              p-id="23037"
            ></path>
            <path
              d="M264.80761719 561.43847656h65.91796849v197.75390625h-65.91796849v-197.75390625z m164.79492162-98.87695312h65.91289872v296.63085937h-65.91796926v-296.63085937zM594.39746119 512h65.9179685v247.19238281h-65.9179685V512z m164.79492162-148.31542969h65.9179685v395.5078125h-65.9179685v-395.5078125z m-292.32590901-12.21510661l164.79492162 65.91796849 179.39828748-125.57373047-37.80649061-54.01216908L623.04642417 342.9457636 458.25150254 277.0227238 278.86842667 402.6015248l37.80142007 54.00202801 150.19155652-105.13408911z"
              fill="#FFFFFF"
              p-id="23038"
            ></path>
          </svg>
        )
        break
      case 'whiteboard':
        contain = (
          <svg
            t="1603949719107"
            class="icon"
            viewBox="0 0 1024 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            p-id="11836"
            width="72"
            height="76"
          >
            <path
              d="M801.384727 186.181818H175.127273A70.423273 70.423273 0 0 0 104.727273 256.593455V643.141818a70.423273 70.423273 0 0 0 70.411636 70.4h161.803636v100.608c0.302545 3.072 1.198545 6.225455 2.920728 9.076364a22.574545 22.574545 0 0 0 30.72 8.238545l11.310545-6.516363 187.717818-108.404364c3.444364-1.943273 7.261091-2.990545 11.240728-2.990545h220.532363a70.423273 70.423273 0 0 0 70.4-70.411637V256.581818A70.423273 70.423273 0 0 0 801.396364 186.181818z"
              fill="#FFFFFF"
              p-id="11837"
            ></path>
            <path
              d="M559.767273 540.416l303.825454 303.802182a33.117091 33.117091 0 0 0 46.824728-46.813091L606.603636 493.579636 547.723636 481.559273l12.043637 58.88z"
              fill="#D8D8D8"
              p-id="11838"
            ></path>
            <path
              d="M267.636364 337.454545m19.176727 0l409.099636 0q19.176727 0 19.176728 19.176728l0 19.828363q0 19.176727-19.176728 19.176728l-409.099636 0q-19.176727 0-19.176727-19.176728l0-19.828363q0-19.176727 19.176727-19.176728Z"
              fill="#D8D8D8"
              p-id="11839"
            ></path>
            <path
              d="M267.636364 477.090909m19.176727 0l217.646545 0q19.176727 0 19.176728 19.176727l0 19.828364q0 19.176727-19.176728 19.176727l-217.646545 0q-19.176727 0-19.176727-19.176727l0-19.828364q0-19.176727 19.176727-19.176727Z"
              fill="#D8D8D8"
              p-id="11840"
            ></path>
          </svg>
        )
        break
      default:
        break
    }
    return contain
  }
  const renderNounPlanBox = item => {
    const { code, name } = item
    const { currentNounPlan, simplemodeCurrentProject = {} } = props
    let dec = ''
    switch (code) {
      case 'board:plans':
        dec = currentNounPlanFilterName(BOARD_PLANS, currentNounPlan)
        break
      case 'board:chat':
        dec = currentNounPlanFilterName(BOARD_CHAT, currentNounPlan)
        break
      case 'board:files':
        dec = currentNounPlanFilterName(BOARD_FILES, currentNounPlan)
        break
      default:
        dec = changeBoxFeatureName({
          board_id: simplemodeCurrentProject.board_id,
          noun: name
        })
        break
    }
    return dec
  }
  const renderBoxItem = (boxItem, isSelected) => {
    const { simplemodeCurrentProject = {} } = props
    return (
      <div
        key={boxItem.id}
        className={indexStyles.workbenchBox}
        onClick={e => {
          selectOrCancelCurrWorkbenchBox(e, {
            id: boxItem.id,
            isSelected: isSelected,
            status: boxItem.status
          })
        }}
        disabled={boxItem.status == 0 ? true : false}
      >
        {/* <i dangerouslySetInnerHTML={{ __html: boxItem.icon }} className={`${globalStyles.authTheme} ${indexStyles.workbenchBox_icon}`} ></i><br /> */}
        <div>{renderIconSVG(boxItem.code)}</div>
        <div>
          <span className={indexStyles.workbenchBox_title}>
            {renderNounPlanBox(boxItem)}
          </span>
        </div>
        {isSelected && (
          <span>
            <div className={indexStyles.workbenchBoxSelected}>
              <Icon
                type="check-circle"
                theme="filled"
                style={{ fontSize: '24px' }}
              />
            </div>
            <div className={indexStyles.workbenchBoxSelectedBg}></div>
          </span>
        )}

        {!isSelected && (
          <div className={indexStyles.workbenchBoxSelectHover}></div>
        )}
      </div>
    )
  }
  return (
    <div
      onClick={e => {
        closeBoxManage(e)
      }}
    >
      <div
        className={indexStyles.selectWorkbenchBoxWapperModalBg}
        style={bgStyle}
      ></div>
      <div className={indexStyles.selectWorkbenchBoxWapperModal}>
        <div style={{ paddingLeft: '96px', paddingTop: '44px' }}>
          <div className={indexStyles.backBtn}>
            <Icon type="left" />
            返回
          </div>
        </div>
        <div className={indexStyles.workbenchBoxWapper}>
          {workbenchBoxList.map((boxItem, key) => {
            let isSelected =
              myWorkbenchBoxList.filter(item => item.id == boxItem.id).length >
              0
                ? true
                : false
            //console.log("8888", isSelected);
            return boxItem.status == 0 ? (
              <Tooltip title="功能开发中，请耐心等待">
                {renderBoxItem(boxItem, isSelected)}
              </Tooltip>
            ) : (
              renderBoxItem(boxItem, isSelected)
            )
          })}
        </div>
        <div className={indexStyles.footer}>
          <div className={indexStyles.operationTip}>
            点击空白处或按“ESC“键返回
          </div>
        </div>
      </div>
    </div>
  )
}
export default connect(
  ({
    simplemode: {
      workbenchBoxList,
      myWorkbenchBoxList,
      currentUserWallpaperContent,
      simplemodeCurrentProject
    },
    technological: {
      datas: { userInfo }
    },
    organizationManager: {
      datas: { currentNounPlan }
    }
  }) => ({
    workbenchBoxList,
    myWorkbenchBoxList,
    currentUserWallpaperContent,
    userInfo,
    simplemodeCurrentProject,
    currentNounPlan
  })
)(WorkbenchBoxSelect)
