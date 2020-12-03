# 通知提醒的页面思考

1. 默认的时候
需要判断是否有历史记录提醒, 1) 需要默认就遍历一遍历史记录, 以及会出现一个小删除按钮
                        , 2) 默认显示添加提醒的样式

2. 点击添加提醒之后
会出现确定按钮
- 根据不同的选项, 对应不同的内容显示: 
- 注意 xxx时, 以及自定义的时候的情况
- 需要在原来的基础上添加一条信息

3. 通知提醒默认失效的状态

4. 通知提醒默认已经实现提醒的状态

# 获取事件列表

- url: "http://localhost/api/projects/remind/trigger/list/${id}", // 1,2,3

- 返回的数据

```json
"data": [
    {
      "id": "1",
      "type_code": "task:start:before",
      "type_name": "任务开始前",
      "remind_item": "1",
      "remind_edit_type": "1",
      "create_time": "1560331140"
    },
]
```
- 根据 remind_edit_type 来判断是否显示后两项的选项内容

# 选择框的数据思考

`remind_time_type`: m/h/d 分钟/小时/天

# 设置提醒的接口

url: "http://192.168.1.68:8234/api/projects/remind"

参数 remindParam
{
  rela_id: 类型id 任务 日程 节点 文件
  rela_type: 类型 1: 任务 2: 日程 3: 节点 4: 文件
  remind_time_type: 提醒的时间类型 m h d datetime 自定义时间
  remind_time_value: 提醒时间值, 如果是自定义时间传时间戳
  remind_trigger 提醒的触发器类型 type_code: "task:start:before"
  users: [待提醒的用户]
}