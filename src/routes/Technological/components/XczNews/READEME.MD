- 功能需求分析jkzhsjk

# 头部导航高亮的效果

- 思考：是否要将数据写死，还是做循环遍历的形式？
- 写死：无法获取到当前点击的对象
- 循环：可以判断当前点击的path与location中的pathname是否匹配，匹配了，就给你加上高亮的类

# 获取热点tabs的数据

- 请求url： http://192.168.1.17:8092/hotspot
- 参数：
```js
    "header": [
        "key": "appid",
        "value": "xxx",
        "type": "text"
    ]
```

- 返回结果
```json
{
  "code": "0",
  "message": "success",
  "data": [
    {
      "id": "1126739608453910528",
      "name": "乡村振兴"
    },
    {
      "id": "1126739554435469312",
      "name": "空间规划"
    },
    {
      "id": "1126739484344455168",
      "name": "城市设计"
    },
    {
      "id": "1126754736658321408",
      "name": "区域发展"
    }
  ]
}
```

# 请求的接口如何处理？

- 通过配置 nginx 的跨域请求, 来匹配路径, 具体....

# 如何判断点击热点的Tabs，根据id显示对应点击的内容？
- 还有一个bug, 点击热点tabs时，url地址上显示id，那么就会影响header的高亮效果，如何解决？
    -- 不使用a标签
- 发送请求，传入相应的id，hostpot_id , 默认的页数为 default_page_size为5

- 热点tabs的高亮效果
- 判断当前的下标和循环遍历的index是否相等
- 但是使用 index 的话有bug, 而且如何保存状态,如何解决来回切换页面,tabs高亮的效果以及对应的内容


# 如何处理热点tabs更多的点击？？？
- 怎么把更多塞进去


# 搜索功能

- 顶部搜索功能
1. 可以封装成一个公用的搜索, 根据id，name 关键字来进行搜索
2. 如何延时发布动作, 也就是说当你按下回车或者点击搜索的时候才发送请求, 而不是输入的时候发送
3. 如果 inputVal 为空的时候，就给你返回所有列表
- 地区搜索功能

# 热点文章的接口
- http://192.168.1.17:8092/api/articles/hotspot
```json
{
  "code": "0",
  "message": "success",
  "data": [
    {
      "id": "1030006787337752576",
      "name": "政策",
      "articles": []
    },
    {
      "id": "1033971564770627584",
      "name": "规划",
      "articles": [
        {
          "id": "1132918361626382336",
          "title": "国际城市规划：中国城市未来——智慧城市新机遇，中国智慧城市政策",
          "publish_time": "1558540800",
          "origin_url": "https://mp.weixin.qq.com/s/B1mzsXG5fwnpCEu6jySpEg"
        }
      ]
    },
    {
      "id": "1111622131789205504",
      "name": "资讯",
      "articles": [
        {
          "id": "1132918361626382336",
          "title": "国际城市规划：中国城市未来——智慧城市新机遇，中国智慧城市政策",
          "publish_time": "1558540800",
          "origin_url": "https://mp.weixin.qq.com/s/B1mzsXG5fwnpCEu6jySpEg"
        }
      ]
    }
  ]
}
```

# 高层的接口

- http://192.168.1.17:8092/api/articles/top_leader

```json
{
  "code": "0",
  "message": "success",
  "data": [
    {
      "id": "1111622254892027904",
      "name": "高层指导",
      "articles": [
        {
          "id": "1111622459397902336",
          "title": "韩长赋:“五推进一加强”推动实施乡村振兴战略",
          "origin_name": "无",
          "publish_time": "1523203200",
          "origin_url": "http://www.gov.cn/xinwen/2018-04/09/content_5281020.htm",
          "origin_type": "2"
        }
      ]
    },
    {
      "id": "1111622288362573824",
      "name": "国家会议",
      "articles": [
        {
          "id": "1111622461201453056",
          "title": "交通运输部服务乡村振兴战略推进“四好农村路”建设和脱贫攻坚领导小组召开扩大会议",
          "origin_name": "无",
          "publish_time": "1550937600",
          "origin_url": "http://www.gov.cn/xinwen/2019-02/24/content_5368065.htm",
          "origin_type": "2"
        }
      ]
    }
  ]
}
```

# 权威的接口

- http://192.168.1.17:8092/api/articles/authority

```json
{
  "code": "0",
  "message": "success",
  "data": [
    {
      "id": "1111622387620777984",
      "name": "机构报告",
      "articles": [
        {
          "id": "1111622462522658816",
          "title": "世联视角：2018年地产行业年报摘选（2）——全国商品房库存点评",
          "origin_name": "无",
          "publish_time": "1552665600",
          "origin_url": "https://mp.weixin.qq.com/s/yg_380wRYaeTwl0y3vuH3g",
          "origin_type": "2"
        }
      ]
    },
    {
      "id": "1111622317152276480",
      "name": "政策解读",
      "articles": [
        {
          "id": "1111622460530364416",
          "title": "部长解读：2019年中央一号文件",
          "origin_name": "无",
          "publish_time": "1550678400",
          "origin_url": "http://www.cacp.org.cn/hyzs/7533.jhtml",
          "origin_type": "2"
        }
      ]
    },
    {
      "id": "1111622420202131456",
      "name": "媒体热议",
      "articles": [
        {
          "id": "1111622463147610112",
          "title": "央广网：【奋进新时代】美丽中国",
          "origin_name": "无",
          "publish_time": "1551801600",
          "origin_url": "http://china.cnr.cn/news/20190306/t20190306_524531696.shtml",
          "origin_type": "2"
        },
      ]
    },

  ]
}
```

# 地区的接口

- http://192.168.1.17:8092/api/common/areas

- 请求头
`appid: 123`

```json
{
  "code": "0",
  "message": "success",
  "data": [
    {
      "id": "0",
      "name": "国家",
      "child": [
        {
          "id": "110000",
          "name": "北京市",
          "deep": "1",
          "parent_id": "0",
          "child": [
            {
              "id": "110100",
              "name": "市辖区",
              "deep": "2",
              "parent_id": "110000",
              "child": []
            },
            {
              "id": "110200",
              "name": "县",
              "deep": "2",
              "parent_id": "110000",
              "child": []
            }
          ]
        },
        {
          "id": "320000",
          "name": "江苏省",
          "deep": "1",
          "parent_id": "0",
          "child": []
        },
        {
          "id": "430000",
          "name": "湖南省",
          "deep": "1",
          "parent_id": "0",
          "child": [
            {
              "id": "430100",
              "name": "长沙市",
              "deep": "2",
              "parent_id": "430000",
              "child": []
            },
          ]
        },
        {
          "id": "610000",
          "name": "陕西省",
          "deep": "1",
          "parent_id": "0",
          "child": [
            {
              "id": "610100",
              "name": "西安市",
              "deep": "2",
              "parent_id": "610000",
              "child": []
            },  
          ]
        }
      ]
    }
  ]
}
```


# 资讯库的接口

- http://192.168.1.17:8092/api/articles/store

```json
{
  "code": "0",
  "message": "success",
  "data": [
    {
      "id": "1033972517250928640",
      "name": "文件库",
      "articles": []
    },
    {
      "id": "1033972571198066688",
      "name": "标准库",
      "articles": []
    },
    {
      "id": "1033972476700397568",
      "name": "法规库",
      "articles": []
    }
  ]
}
```

#  文章详情的接口

- http://192.168.1.17:8092/api/articles/more

- 参数
`page_no : 1`
`page_size: 10`

- 请求头
`appid: 123`

```json
{
  "code": "0",
  "message": "success",
  "data": {
    "total": "365",
    "size": "10",
    "pages": "37",
    "current": "1",
    "offset": "0",
    "limit": "10",
    "records": [
      {
        "id": "1132918363438321664",
        "file_no": "暂无",
        "title": "2019年改造建筑大奖，最终决选名单公布！",
        "area_id": "0",
        "thumbnail_type": "0",
        "view_count": "0",
        "create_time": "1558943761",
        "update_time": "1558943761",
        "origin_type": "2",
        "origin_url": "https://mp.weixin.qq.com/s/cDxvgnIJ0TQKiYpLGiUKtQ",
        "keyword": "建筑奖",
        "keyword2": "建筑改造",
        "status": "1",
        "publish_time": "1558540800"
      },
      {
        "id": "1132918361626382336",
        "file_no": "暂无",
        "title": "国际城市规划：中国城市未来——智慧城市新机遇，中国智慧城市政策",
        "summary": "",
        "area_id": "0",
        "thumbnail_type": "0",
        "view_count": "0",
        "create_time": "1558943761",
        "update_time": "1560491678",
        "origin_type": "2",
        "origin_url": "https://mp.weixin.qq.com/s/B1mzsXG5fwnpCEu6jySpEg",
        "keyword": "智慧城市",
        "keyword2": "城市未来,城市群",
        "status": "1",
        "appendicular_address": "",
        "publish_time": "1558540800"
      },
      {
        "id": "1132918358233190400",
        "file_no": "暂无",
        "title": "重庆市中心城区生活中心的识别与评估",
        "area_id": "500000",
        "thumbnail_type": "0",
        "view_count": "0",
        "create_time": "1558943760",
        "update_time": "1558943760",
        "origin_type": "2",
        "origin_url": "https://mp.weixin.qq.com/s/P53ZoxBQTf5wECwaYr93Mw",
        "keyword": "大数据",
        "keyword2": "手机信令数据,识别与评估",
        "keyword3": "生活中心",
        "status": "1",
        "publish_time": "1558540800"
      }
    ],
    "condition": {}
  }
}
```

# 公用的文章列表组件

- 当路径为 `/technological/xczNews` 时, 默认显示所有的文章列表
- 做一个公用的文章列表组件, 处理样式问题


