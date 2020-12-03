# processInfo 实例详情
```json
{
    "code":"0",
    "message":"success",
    "data":{
        "id":"1235125396043862016",
        "name":"歌词册",
        "description":"<p></p>",
        "status":"1",
        "create_user_id":"1135840292222668800",
        "create_user_name":"",
        "create_user_avatar":"",
        "create_time":"1583311817",
        "content_link":"1235125396056444928",
        "curr_node_id":"1235125396056444928",
        "nodes":[
            {
                "id":"1235125396056444928",
                "name":"LAST DANCE",
                "description":"",
                "node_type":"1",
                "deadlined_timeout":"0",
                "assignee_type":"1",
                "assignees":[

                ],
                "transfer_mode":"2",
                "enable_revocation":"1",
                "enable_opinion":"1",
                "sort":"1",
                "content_link":[

                ]
            }
        ],
        "completed_amount":"0",
        "node_amount":"1",
        "is_privilege":"0",
        "privileges":[

        ],
        "privileges_extend":[

        ],
        "is_shared":"0"
    }
}
```

# processTemplateList 模板列表
```json
{
    "code":"0",
    "message":"success",
    "data":[
        {
            "id":"1235125380650766336",
            "name":"歌词册",
            "versions":"1",
            "template_no":"1235125380650766337",
            "board_id":"1235125250149191680",
            "user_id":"1135840292222668800",
            "is_retain":"1",
            "is_new_version":"1",
            "create_time":"1583311813",
            "update_time":"1583311813",
            "flow_template_node_list":[
                {
                    "id":"1235125380671737856",
                    "template_id":"1235125380650766336",
                    "flow_node_type":"1",
                    "name":"LAST DANCE",
                    "description":"",
                    "assignee_type":"1",
                    "assignees":"",
                    "cc_type":"1",
                    "transfer_mode":"2",
                    "enable_revocation":"1",
                    "enable_opinion":"1",
                    "create_time":"1583311813",
                    "update_time":"1583311813",
                    "sort":"1"
                }
            ]
        }
    ]
}
```

# processDoingList | processStopedList | processComepletedList | processNotBeginningList
```json
{
    "code":"0",
    "message":"success",
    "data":[
        {
            "is_privilege":"0",
            "privileges":[

            ],
            "id":"1235125396043862016",
            "flow_template_id":"1235125380650766336",
            "board_id":"1235125250149191680",
            "name":"歌词册",
            "description":"<p></p>",
            "status":"1",
            "proc_ins_id":"610075",
            "proc_def_id":"process1235125380650766336:1:610074",
            "create_by":"1135840292222668800",
            "curr_node_id":"1235125396056444928",
            "create_time":"1583311817",
            "update_time":"1583311817",
            "total_node_num":"0",
            "completed_node_num":"0"
        }
    ]
}
```

# approvePersonnelSuggestion
```json
[
    {
        "type": "1",
        "user_id": "1195311878813913088",
        "name": "一只加菲吖",
        "avatar": "https://newdi-test-public.oss-cn-beijing.aliyuncs.com/2019-11-22/293c32e5af584288a238cc58d1c6a66f.jpg",
        "suggestion": "符合报销流程",
        "create_time": "1584582196000",
    },
    {
        "type": "2",
        "user_id": "1207501040593801216",
        "name": "rabbitQi",
        "avatar": "https://newdi-test-public.oss-cn-beijing.aliyuncs.com/2020-01-09/43f14b585cff4de2ae18d23555e72192.jpeg",
        "suggestion": "资料不完整",
        "create_time": "1584582196000",
    },
    {   
        "type": "1",
        "user_id": "1184398454126940160",
        "name": "13388889999",
        "avatar": "",
        "suggestion": "",
        "create_time": "1584582196000",
    }
]
```

```js
{
    "board_id": '1240485128740933632',
    "org_id":  '1192754064144863232',
    "": "1235378754189135872"
}

```

# processInfo 实例详情

- 第一层的status: 流程实例状态 3=结束(完成) 2=中止 1=运行中 0=未开始
- 然后每个节点的 status: 0:未开始  1:进行中 2:完成
- processed 审批人状态 2=完成 1=进行中 0=未开始

```json
{
    "id": "1240120246988312576",
    "name": "标准流程启动（2）",
    "description": "这是第二个流程启动",
    "status": "1",
    "nodes": [
      {
        "id": "1240120247009284096",
        "assignees": [
          {
            "id": "1110064610620346368",
            "name": "钟先生",
            "avatar": "https://newdi-test-public.oss-cn-beijing.aliyuncs.com/2019-06-19/cecc1c8a2dcf4a3590da3ce2b889f828.jpg",
            "processed": "2",
            "time": "1584521312",
            "comment": "wo tong yi l"
          }
        ],
        "recipients": [
          {
            "id": "1110064610620346368",
            "name": "钟先生",
            "avatar": "https://newdi-test-public.oss-cn-beijing.aliyuncs.com/2019-06-19/cecc1c8a2dcf4a3590da3ce2b889f828.jpg"
          }
        ],
        "status": "2",
        "forms": [
          {
            "id": "1240115038702931968",
            "title": "文本标题",
            "sort": "1",
            "value": "我是文本标题哈我是文本标题哈",
            "form_id": "1240115038329638912",
            "field_type": "1",
            "prompt_content": "请填写",
            "is_required": "0",
            "is_multiple_choice": "0",
            "val_min_length": "10",
            "val_max_length": "20",
            "date_range": "1",
            "date_precision": "1",
            "verification_rule": "number"
          },
          {
            "id": "1240115039084613632",
            "title": "性别",
            "sort": "2",
            "options": [
              {
                "id": "1240115039088807936",
                "label_name": "男",
                "label_value": "男"
              },
              {
                "id": "1240115039088807937",
                "label_name": "女",
                "label_value": "女"
              }
            ],
            "value": "男",
            "form_id": "1240115038329638912",
            "field_type": "2",
            "prompt_content": "请选择",
            "is_required": "1",
            "is_multiple_choice": "0",
            "date_range": "1",
            "date_precision": "1"
          },
          {
            "id": "1240115039860559872",
            "title": "生日",
            "sort": "3",
            "value": "1584519956",
            "form_id": "1240115038329638912",
            "field_type": "3",
            "prompt_content": "您的出生日期",
            "is_required": "1",
            "is_multiple_choice": "0",
            "date_range": "1",
            "date_precision": "1"
          },
          {
            "id": "1240115040238047232",
            "title": "简历",
            "sort": "4",
            "form_id": "1240115038329638912",
            "field_type": "5",
            "prompt_content": "请上传简历",
            "is_required": "1",
            "is_multiple_choice": "0",
            "date_range": "1",
            "date_precision": "1",
            "limit_file_num": "1",
            "limit_file_type": [
              "document",
              "image",
              "audio",
              "video"
            ],
            "limit_file_size": "10"
          }
        ],
        "node_type": "1",
        "assignee_type": "2",
        "deadline_type": "2",
        "deadline_time_type": "day",
        "deadline_value": "1",
        "cc_type": "1"
      },
      {
        "id": "1240120247390965760",
        "assignees": [
          {
            "id": "1110064610620346368",
            "name": "钟先生",
            "avatar": "https://newdi-test-public.oss-cn-beijing.aliyuncs.com/2019-06-19/cecc1c8a2dcf4a3590da3ce2b889f828.jpg",
            "processed": "2"
          },
          {
            "id": "1110381102486392832",
            "name": "fengabner聯通號",
            "avatar": "",
            "processed": "1"
          }
        ],
        "recipients": [
          {
            "id": "1110064610620346368",
            "name": "钟先生",
            "avatar": "https://newdi-test-public.oss-cn-beijing.aliyuncs.com/2019-06-19/cecc1c8a2dcf4a3590da3ce2b889f828.jpg"
          }
        ],
        "status": "1",
        "node_type": "2",
        "deadline_type": "2",
        "deadline_time_type": "hour",
        "deadline_value": "10",
        "cc_type": "1"
      }
    ],
    "flow_template_id": "1240115038321250304",
    "board_id": "1173834815573725184",
    "create_by": "1110064610620346368",
    "curr_node_id": "1240120247390965760",
    "create_time": "1584502682",
    "is_privilege": "0",
    "privileges": [],
    "privileges_extend": [],
    "is_shared": "0"
  }
  ```

# 上传文件内容
返回的数据结构
```js
flow_file_id: "1244573880069263360"
file_id: "1244573879729524736"
file_resource_id: "1199652429776424960"
file_name: "1.jpg"

```
# 评分人列表

```json
[
  {
    "passed": "2",
    "user_id": "1195311878813913088",
    "name": "一只加菲吖",
    "avatar": "https://newdi-test-public.oss-cn-beijing.aliyuncs.com/2019-11-22/293c32e5af584288a238cc58d1c6a66f.jpg",
    "suggestion": "符合报销流程",
    "create_time": "1584582196000",
    "ratingDetail": [
      {
        "key": "0",
        "title": "评分项",
        "weight_ratio": '100',
        "max_score": '100',
        "description": '楼下老爷爷',
      }
    ]
  },
]


