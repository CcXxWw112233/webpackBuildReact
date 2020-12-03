# 项目列表接口 boardList

```js
[
  {
    board_id: "1226341577111244800"
    board_name: "产品需求与缺陷汇总"
    org_id: "1216564852450004992"
    apps: [{id: "1021224512160665600", name: "任务", description: "分解任务与管理工作进度", status: "1", unique_key: "3",…},…]
    user_id: "1164009945457364992"
    is_star: "0"
    is_my_private: "0"
  }
]
```


# map接口 mapList

```js
[
  {
    org_id: "1216564852450004992"
    name: "场景测试1.13"
    logo: ""
  }
]

```

# 想要的结构

- 找到对应的组织ID项目后，拼接在一起

```js
[
  id: "1216564852450004992"
  name: "场景测试1.13"
  logo: "",
  board_list: [
   {
      board_id: "1226341577111244800"
      board_name: "产品需求与缺陷汇总"
      org_id: "1216564852450004992"
      apps: [{id: "1021224512160665600", name: "任务", description: "分解任务与管理工作进度", status: "1", unique_key: "3",…},…]
      user_id: "1164009945457364992"
      is_star: "0"
      is_my_private: "0"
   }
  ]
]

```

```js
let s = mapList.reduce((acc,cur) => {
    let obj = {
        ...cur,
        data: []
    }
    boardList.forEach(i => i.id == cur.org_id && obj.data.push(i))
    acc.push(obj)
    return acc
},[])
console.log(s)
