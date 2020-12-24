export default {
  name: 'Enfo',
  uri: 'http://www.enfo.com.cn/efboc/index.html',
  prefix: 'enfo',
  xml: {
    tagAlias: 'lowerCase'
  },
  types: [
    {
      name: 'InstanceBtnList',
      superClass: [
        'Element'
      ],
      properties: [
        {
          name: 'buttons',
          isMany: true,
          type: 'Button'
        }
      ]
    },
    { // 流程按钮设置
      name: 'FlowInstanceBtnList',
      superClass: ['InstanceBtnList'],
      extends: ['bpmn:Process']
    },
    { // 节点按钮设置
      name: 'NodeInstanceBtnList',
      superClass: ['InstanceBtnList'],
      extends: ['bpmn:FlowNode']
    },
    {
      // 用户节点 前置脚本/后置脚本
      name: 'UserScript',
      extends: ['bpmn:UserTask'],
      superClass: ['Element'],
      properties: [
        {
          name: 'EnterScript',
          isMany: true,
          type: 'PythonScript'
        },
        {
          name: 'ExitScript',
          isMany: true,
          type: 'PythonScript'
        }
      ]
    },
    {
      name: 'Button',
      properties: [
        {
          name: 'name',
          isAttr: true,
          type: 'String'
        },
        {
          name: 'action',
          isAttr: true,
          type: 'String'
        },
        {
          name: 'allow_script',
          isMany: true,
          type: 'AllowScript'
        },
        {
          name: 'prep_script',
          isMany: true,
          type: 'JavaScript'
        },
        {
          name: 'submit_script',
          isMany: true,
          type: 'SubmitScript'
        },
        {
          name: 'object',
          isMany: true,
          type: 'Object'
        },
        {
          name: 'url_form',
          isMany: true,
          type: 'UrlForm'
        },
        {
          name: 'module_form',
          isMany: true,
          type: 'ModuleForm'
        }
      ]
    },
    {
      name: 'Script',
      superClass: [
        'Element'
      ],
      properties: [
        {
          name: 'text',
          isBody: true,
          type: 'String'
        }
      ]
    },
    {
      name: 'PythonApi',
      superClass: [
        'Element'
      ],
      properties: [
        {
          name: 'cls',
          isAttr: true,
          type: 'String'
        },
        {
          name: 'fun',
          isAttr: true,
          type: 'String'
        }
      ]
    },
    {
      name: 'JavaScript',
      superClass: [
        'Script'
      ]
    },
    {
      name: 'AllowScript',
      superClass: [
        'PythonApi'
      ]
    },
    {
      name: 'SubmitScript',
      superClass: [
        'PythonApi'
      ]
    },
    {
      name: 'PythonScript',
      superClass: [
        'Script'
      ]
    },
    {
      name: 'Description',
      properties: [
        {
          name: 'text',
          isMany: true,
          type: 'String'
        }
      ]
    },
    {
      name: 'NodeDescription',
      superClass: ['Description'],
      extends: [
        'bpmn:FlowNode'
      ]
    },
    {
      name: 'NoneEventDefinition',
      superClass: ['Element'],
      extends: ['bpmn:StartEvent'],
      properties: [
        {
          name: 'assigns',
          isMany: true,
          type: 'Assigns'
        },
        {
          name: 'object',
          isMany: true,
          type: 'Object'
        },
        {
          name: 'url_form',
          isMany: true,
          type: 'UrlForm'
        },
        {
          name: 'module_form',
          isMany: true,
          type: 'ModuleForm'
        },
        {
          name: 'variable',
          isMany: true,
          type: 'Variable'
        }
      ]
    },
    { // 节点人员设置
      name: 'Assigns',
      superClass: ['Element'],
      extends: ['bpmn:UserTask'],
      properties: [
        {
          name: 'assign',
          isMany: true,
          type: 'Assign'
        }
      ]
    },
    { // 人员 可以设置为 solo@start_user@
      //              multi@group@[group_id]
      //              multi@roule@[role_id]
      name: 'Assign',
      properties: [
        {
          name: 'text',
          isBody: true,
          type: 'String'
        }
      ]
    },
    { // 流程表单
      name: 'Object',
      superClass: ['Element'],
      extends: [
        'bpmn:Process',
        'bpmn:UserTask',
        'bpmn:StartEvent'
      ],
      properties: [
        { // 引用对象 list
          name: 'quote_objects',
          isMany: true,
          type: 'QuoteObject'
        },
        { // 展示表单 list
          name: 'display_forms',
          isMany: true,
          type: 'DisplayForm'
        },
        { // 编辑表单 list
          name: 'edit_forms',
          isMany: true,
          type: 'EditForm'
        }
      ]
    },

    { // 引用对象
      name: 'QuoteObject',
      properties: [
        {
          name: 'text',
          isBody: true,
          type: 'string'
        }
      ]
    },
    { // 展示表单
      name: 'DisplayForm',
      properties: [
        {
          name: 'text',
          isBody: true,
          type: 'string'
        }
      ]
    },
    { // 编辑表单
      name: 'EditForm',
      properties: [
        {
          name: 'text',
          isBody: true,
          type: 'string'
        }
      ]
    },
    {
      name: 'UrlForm',
      extends: [
        'bpmn:Process',
        'bpmn:Task',
        'bpmn:StartEvent'
      ],
      superClass: ['Element'],
      properties: [
        {
          name: 'url',
          isAttr: true,
          type: 'String'
        }
      ]
    },
    {
      name: 'ModuleForm',
      extends: [
        'bpmn:Process',
        'bpmn:Task',
        'bpmn:StartEvent'
      ],
      superClass: ['Element'],
      properties: [
        {
          name: 'module_name',
          isAttr: true,
          type: 'String'
        }
      ]
    },

    { // 多实例设置
      name: 'MultiInstance',
      extends: [
        'bpmn:Task',
        'bpmn:SubProcess'
      ],
      superClass: ['Element'],
      properties: [
        { // 实例数量 支持通过表单某个值来获取/根据任务候选人进行生成
          name: 'number',
          isAttr: true,
          type: 'String'
        },
        {
          name: 'end_condition',
          isMany: true,
          type: 'EndCondition'
        },
        {
          name: 'result_reduction',
          isMany: true,
          type: 'ResultReduction'
        }
      ]
    },
    { // 结束条件，通过写脚本实现
      name: 'EndCondition',
      superClass: ['PythonApi']
    },
    {
      // 多实例结束，结果处理,通过写脚本来提交最后的结果
      name: 'ResultReduction',
      superClass: ['PythonApi']
    },

    {
      // 标题规则
      name: 'FlowTitleRule',
      extends: ['bpmn:Process'],
      superClass: ['PythonApi']
    },

    {
      // 多实例会签
      name: 'Countersign',
      extends: [
        'bpmn:Task',
        'bpmn:SubProcess'
      ],
      superClass: ['Element'],
      properties: [
        {
          name: 'strategy',
          isAttr: true,
          type: 'String'
        },
        {
          name: 'all_user',
          isAttr: true,
          type: 'String'
        },
        {
          name: 'win_out',
          isAttr: true,
          type: 'String'
        },
        {
          name: 'extract',
          isAttr: true,
          type: 'String'
        },
        {
          name: 'weight_mode',
          isAttr: true,
          type: 'String'
        },
        {
          name: 'weight',
          isMany: true,
          type: 'Weight'
        },
        {
          name: 'backToBack',
          isMany: true,
          type: 'BackToBack'
        },
        {
          name: 'courseResultSess',
          isMany: true,
          type: 'CourseResultSess'
        },
        {
          name: 'voteResultForm',
          isMany: true,
          type: 'VoteResultForm'
        },
        {
          name: 'voteForm',
          isMany: true,
          type: 'VoteForm'
        }
      ]
    },
    {
      name: 'Weight',
      properties: [
        {
          name: 'weight',
          isAttr: true,
          type: 'string'
        },
        {
          name: 'text',
          isBody: true,
          type: 'string'
        }
      ]
    },
    {
      name: 'BackToBack',
      properties: [
        {
          name: 'text',
          isBody: true,
          type: 'string'
        }
      ]
    },
    {
      name: 'CourseResultSess',
      properties: [
        {
          name: 'text',
          isBody: true,
          type: 'string'
        }
      ]
    },
    {
      name: 'VoteResultForm',
      properties: [
        {
          name: 'edit_forms',
          isMany: true,
          type: 'EditForm'
        },
        {
          name: 'moduleForm',
          isMany: true,
          type: 'ModuleForm'
        }
      ]
    },
    {
      name: 'VoteForm',
      properties: [
        {
          name: 'edit_forms',
          isMany: true,
          type: 'EditForm'
        },
        {
          name: 'moduleForm',
          isMany: true,
          type: 'ModuleForm'
        }
      ]
    },
    { // 变量设置
      name: 'Variable',
      superClass: ['Element'],
      extends: [
        'bpmn:Process',
        'bpmn:FlowNode'
      ],
      properties: [
        {
          name: 'jsonVar',
          isBody: true,
          type: 'String'
        }
      ]
    },
    { //观察者
      name: 'Observer',
      superClass: ['Element'],
      extends: ['bpmn:Process'],
      properties: [
        {
          name: 'observer',
          isAttr: true,
          type: 'String'
        },
        {
          name: 'the_observer',
          isAttr: true,
          type: 'String'
        }
      ]
    }
  ]
}
