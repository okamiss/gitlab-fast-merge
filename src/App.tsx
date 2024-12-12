import React, { useEffect, useState } from 'react'
import {
  Card,
  Input,
  Col,
  Row,
  Button,
  Checkbox,
  Form,
  Select,
  message,
  Space,
  Radio,
  Table,
  ConfigProvider,
  theme,
  Switch,
  Tag
} from 'antd'
import type { GetProp, TableColumnsType } from 'antd'

import { Title, Preview } from './app-style'
import dayjs from 'dayjs'
import copy from 'clipboard-copy'
import { v4 as uuidv4 } from 'uuid'
import { progressList, storeList } from './common/select'

import Statistics from './components/statistics'

const { TextArea } = Input

type CheckboxValueType = GetProp<typeof Checkbox.Group, 'value'>[number]
const CheckboxGroup = Checkbox.Group

const plainOptions = ['年月日', '时分', '秒']
const defaultCheckedList = ['年月日']
const defaultCheckedListTag = ['年月日', '时分']

const generateTime = (checkedList: any) => {
  let str1 = ''
  let str2 = ''
  let str3 = ''
  if (checkedList.includes('年月日')) {
    str1 = dayjs(new Date()).format('YYYYMMDD')
  }
  if (checkedList.includes('时分')) {
    str2 = dayjs(new Date()).format('HHmm')
  }
  if (checkedList.includes('秒')) {
    str3 = dayjs(new Date()).format('ss')
  }
  return str1 + str2 + str3
}

const TimeComponent: React.FC<{
  title: string
  childStyle: object
  sendName?: any
  updateBranch?: any
  defPre?: string
}> = ({ title, childStyle, sendName, updateBranch, defPre }) => {
  const [messageApi, contextHolder] = message.useMessage()
  const [form] = Form.useForm()
  const [checkedList, setCheckedList] = useState<CheckboxValueType[]>(
    title === 'tag' ? defaultCheckedListTag : defaultCheckedList
  )
  const [preview, setPreview] = useState('')
  const [description, setDescription] = useState('')
  const [sname, setSname] = useState('admin-crm')

  useEffect(() => {
    if (title === 'branch') {
      trimFormat('preVal', defPre || '')
    }
  }, [defPre])

  useEffect(() => {
    const timer = setInterval(() => {
      form.setFieldValue('time', generateTime(checkedList))

      getChange()
    }, 1000)
    return () => clearInterval(timer)
  }, [checkedList])

  const getChange = () => {
    const { preVal, time, sufVal } = form.getFieldsValue()
    const str = `${preVal}${preVal ? '/' : ''}${time}${sufVal ? '_' : ''}${sufVal}`
    setPreview(str)
    if (title === 'branch') {
      sendName(str)
    }
  }

  // 时间change
  const onChange = (list: CheckboxValueType[]) => {
    setCheckedList(list)
    form.setFieldValue('time', generateTime(list))
    getChange()
  }

  // 去除空格
  const trimFormat = (name: string, e: string) => {
    const trimValue = e.trim()
    form.setFieldValue(name, trimValue)
  }

  // 复制
  const onFinish = () => {
    copy(preview)
    messageApi.success('复制成功')
  }

  // 保存分支
  const saveBranch = () => {
    const getSLablename = storeList.find((item) => item.value === sname)?.label

    const params = {
      id: uuidv4(),
      progress: 1,
      modiy: false,
      branch: preview,
      storeName: sname,
      description,
      create_time: Math.floor(Date.now() / 1000)
    }

    const getTable = localStorage.getItem('table')

    if (getTable) {
      const oldTable = JSON.parse(getTable)
      const newTable = [params, ...oldTable]
      const isUse = oldTable.some(
        (item: any) => item.branch === preview && item.storeName === sname
      )

      if (isUse) {
        return messageApi.error(`${getSLablename}仓库已存在(${preview})分支,请尝试编辑修改！`)
      }

      updateBranch(newTable)
      localStorage.setItem('table', JSON.stringify(newTable))
      messageApi.success('保存成功')
      setDescription('')
    } else {
      updateBranch([params])
      localStorage.setItem('table', JSON.stringify([params]))
      messageApi.success('保存成功')
      setDescription('')
    }
  }

  const handleChange = (e: string) => {
    setSname(e)
  }

  return (
    <>
      {contextHolder}
      <Card title={`${title}命名`} bordered={false} style={childStyle}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          onFieldsChange={getChange}
          initialValues={{
            preVal: `${title === 'tag' ? 'prod' : ''}`,
            time: dayjs(new Date()).format('YYYYMMDD'),
            sufVal: ''
          }}
          autoComplete="off"
        >
          <Row gutter={5}>
            <Col span={5}>
              <Form.Item label="前缀" name="preVal">
                {title === 'tag' ? (
                  <Select
                    style={{ width: '100%' }}
                    options={[
                      { value: 'beta', label: 'beta' },
                      { value: 'prod', label: 'prod' }
                    ]}
                  />
                ) : (
                  <Input
                    onChange={(e) => trimFormat('preVal', e.target.value)}
                    placeholder="前缀"
                    allowClear
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={11}>
              <Form.Item
                name="time"
                label={
                  <>
                    时间模式：
                    <CheckboxGroup options={plainOptions} value={checkedList} onChange={onChange} />
                  </>
                }
              >
                <Input readOnly />
              </Form.Item>
            </Col>
            <Col span={5}>
              <Form.Item label="后缀" name="sufVal">
                <Input
                  onChange={(e) => trimFormat('sufVal', e.target.value)}
                  placeholder="后缀"
                  allowClear
                />
              </Form.Item>
            </Col>

            <Col span={3}>
              <Form.Item label="操作">
                <Button type="primary" htmlType="submit">
                  复制
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
        <Preview>预览：{preview}</Preview>
        {title === 'branch' ? (
          <Row gutter={5}>
            <Col span={16}>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onKeyUp={(e) => e.key === 'Enter' && saveBranch()}
                placeholder="分支描述"
                allowClear
              />
            </Col>
            <Col span={5}>
              <Select
                style={{ width: '100%' }}
                value={sname}
                onChange={handleChange}
                options={storeList}
              />
            </Col>
            <Col span={3}>
              <Button type="primary" onClick={saveBranch}>
                保存
              </Button>
            </Col>
          </Row>
        ) : null}
      </Card>
    </>
  )
}

const App: React.FC = () => {
  const [messageApi, contextHolder] = message.useMessage()
  const [betaMerge, setBetaMerge] = useState('')
  const [prodMerge, setProdMerge] = useState('')
  const [bname, setBname] = useState('')
  const [sname, setSname] = useState('')
  const [cbname, setcbname] = useState('')
  const [ctname, setctname] = useState('')
  const [dataSource, setdataSource] = useState<branchlist[]>([])
  const [defaultprefix, setDefaultprefix] = useState(
    localStorage.getItem('defaultprefix') as string
  )
  // const [isinput, setIsinput] = useState(false)
  // const isInputRef = useRef(false)

  // useEffect(() => {
  //   isInputRef.current = isinput
  // }, [isinput])
  const [darkTheme, setDarkTheme] = useState(false)

  useEffect(() => {
    const isDark = localStorage.getItem('theme-dark')
    if (isDark === 'true') {
      switchChange(true)
    }
  })

  useEffect(() => {
    storeChange('admin-crm')
    const getTable = localStorage.getItem('table')
    if (getTable) {
      setdataSource(JSON.parse(getTable))
    }
  }, [])

  // const storeMap = new Map([
  //   ['admin-crm', 4],
  //   ['admin-scrm', 10],
  //   ['web-wwside', 16]
  // ])

  const createLink = (b: string, s: string) => {
    if (!s) return

    const getSid = storeList.find((item) => item.value === s)?.id
    const frontendUrl = 'https://gitlab.techzgzb.cn/frontend'
    const createBranch = `${frontendUrl}/${s}/-/branches/new`
    setcbname(createBranch)
    const createTag = `${frontendUrl}/${s}/-/tags/new`
    setctname(createTag)

    if (!b) {
      setBetaMerge('')
      setProdMerge('')
      return
    }

    const betaLink = `${frontendUrl}/${s}/-/merge_requests/new?merge_request[source_project_id]=${getSid}&merge_request[source_branch]=${b}&merge_request[target_project_id]=${getSid}&merge_request[target_branch]=beta`
    setBetaMerge(betaLink)
    const prodLink = `${frontendUrl}/${s}/-/merge_requests/new?merge_request[source_branch]=${b}`
    setProdMerge(prodLink)
  }

  // 仓库选择
  const storeChange = (value: string) => {
    setSname(value)
    createLink(bname, value)
  }

  const getName = () => {
    // if (isInputRef.current.isinput) return
    // setBname(e)
    // createLink()
  }

  // 导入分支
  const importBranch = (value: branchlist) => {
    const { branch, storeName } = value
    setBname(branch)
    setSname(storeName)
    createLink(branch, storeName)
  }

  // 分支名输入
  const bnameChange = (e: string) => {
    // setIsinput(true)
    setBname(e)
    createLink(e, sname)
  }

  // 复制链接
  const copyLink = (e: string) => {
    copy(e)
    messageApi.success('复制成功')
  }

  // 打开链接
  const openLink = (e: string) => {
    window.open(e)
  }

  // 进度展示组件
  const ProComputed: React.FC<{
    value: number
  }> = ({ value }) => {
    const colorMap: Record<number, string> = {
      1: '#108ee9',
      2: '#8e44ad',
      3: '#27ae60',
      4: '#7f8c8d'
    }
    const color = colorMap[value]
    const progressName = progressList.find((item) => item.value === value)?.label
    return <Tag color={color}>{progressName}</Tag>
  }

  const columns: TableColumnsType<branchlist> = [
    {
      title: '分支名',
      width: 150,
      dataIndex: 'branch'
    },
    {
      title: '代码仓库',
      width: 120,
      // dataIndex: 'storeName'，
      render: (_: any, record: any) => {
        const getSLablename = storeList.find((item) => item.value === record.storeName)?.label
        return <span>{getSLablename}</span>
      }
    },
    {
      title: '描述信息',
      // dataIndex: 'description'
      render: (_: any, record: any) =>
        record.modiy ? (
          <Input
            value={record.description}
            onChange={(e) => dirChange(e.target.value, record.id)}
            onKeyUp={(e) => e.key === 'Enter' && save(record)}
          />
        ) : (
          <span>{record.description}</span>
        )
    },
    {
      title: '进度',
      width: 120,
      render: (_: any, record: any) => {
        return record.modiy ? (
          <Select
            onChange={(e) => proChange(e, record.id)}
            style={{ width: '100%' }}
            value={record.progress}
            options={progressList}
          />
        ) : (
          <ProComputed value={record.progress} />
        )
      }
    },
    {
      title: '操作',
      fixed: 'right',
      width: 250,
      render: (_: any, record: any) => (
        <Space>
          <Button type="link" onClick={() => importBranch(record)}>
            导入分支
          </Button>
          {record.modiy ? (
            <Button type="link" onClick={() => save(record)}>
              保存
            </Button>
          ) : (
            <Button type="link" onClick={() => modiy(record)}>
              修改
            </Button>
          )}

          <Button type="link" danger onClick={() => delBranch(record.id)}>
            删除
          </Button>
        </Space>
      )
    }
  ]

  // 进度修改
  const proChange = (e: number, id: string) => {
    const saveData = JSON.parse(JSON.stringify(dataSource))
    const getId = saveData.findIndex((item: branchlist) => item.id === id)
    saveData[getId].progress = e
    setdataSource(saveData)
  }

  // 描述修改
  const dirChange = (e: string, id: string) => {
    const saveData = JSON.parse(JSON.stringify(dataSource))
    const getId = saveData.findIndex((item: branchlist) => item.id === id)
    saveData[getId].description = e
    setdataSource(saveData)
  }

  // 保存
  const save = (row: branchlist) => {
    const saveData = JSON.parse(JSON.stringify(dataSource))
    const getId = saveData.findIndex((item: branchlist) => item.id === row.id)
    saveData[getId].modiy = !row.modiy
    setdataSource(saveData)
    localStorage.setItem('table', JSON.stringify(saveData))
  }

  // 修改
  const modiy = (row: branchlist) => {
    const modiyData = JSON.parse(JSON.stringify(dataSource))
    const getId = modiyData.findIndex((item: branchlist) => item.id === row.id)

    modiyData[getId].modiy = !row.modiy
    setdataSource(modiyData)
  }

  // 删除分支
  const delBranch = (e: string) => {
    const newTable = dataSource.filter((item) => item.id !== e)
    setdataSource(newTable)
    localStorage.setItem('table', JSON.stringify(newTable))
  }

  // 更新分支
  const getUpdate = (e: branchlist[]) => {
    setdataSource(e)
  }

  // 开启暗黑主题
  const switchChange = (e: boolean) => {
    setDarkTheme(e)
    document.body.classList.toggle('dark', e)
    localStorage.setItem('theme-dark', JSON.stringify(e))
  }

  // 保存默认前缀
  const saveDefaultprefix = (e: string) => {
    setDefaultprefix(e)
    localStorage.setItem('defaultprefix', e)
  }

  return (
    <ConfigProvider
      theme={{
        algorithm: darkTheme ? theme.darkAlgorithm : theme.defaultAlgorithm
      }}
    >
      {contextHolder}
      <Row gutter={16} style={{ padding: '20px', margin: 0 }}>
        <Col className="gutter-row" span={12}>
          <Title>Gitlab快速命名branch/tag</Title>
          <TimeComponent
            title={'branch'}
            childStyle={{ margin: '0 auto' }}
            sendName={getName}
            defPre={defaultprefix}
            updateBranch={getUpdate}
          />
          <TimeComponent title={'tag'} childStyle={{ margin: '20px auto 0' }} />
          <Title>分支列表-导入到右侧合并&发布</Title>
          <Table bordered rowKey="id" dataSource={dataSource} columns={columns} />
        </Col>
        <Col className="gutter-row" span={12}>
          <Title>Gitlab快速合并发布代码</Title>
          <Card bordered={false} style={{ margin: '0 auto' }}>
            <Form name="basic" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} autoComplete="off">
              <Form.Item label="分支名">
                <Input value={bname} onChange={(e) => bnameChange(e.target.value)} allowClear />
              </Form.Item>
              <Form.Item label="代码仓库">
                <Radio.Group
                  value={sname}
                  onChange={(e) => storeChange(e.target.value)}
                  options={storeList}
                />
              </Form.Item>
              <Form.Item label="创建分支">
                <Input value={cbname} />
                <Space>
                  <Button
                    style={{ marginTop: '10px' }}
                    type="primary"
                    onClick={() => copyLink(cbname)}
                  >
                    复制
                  </Button>
                  <Button
                    style={{ marginTop: '10px' }}
                    type="primary"
                    onClick={() => openLink(cbname)}
                  >
                    打开链接
                  </Button>
                </Space>
              </Form.Item>
              <Form.Item label="创建Tag">
                <Input value={ctname} />
                <Space>
                  <Button
                    style={{ marginTop: '10px' }}
                    type="primary"
                    onClick={() => copyLink(ctname)}
                  >
                    复制
                  </Button>
                  <Button
                    style={{ marginTop: '10px' }}
                    type="primary"
                    onClick={() => openLink(ctname)}
                  >
                    打开链接
                  </Button>
                </Space>
              </Form.Item>
              <Form.Item label="合并到测试环境">
                <TextArea value={betaMerge} rows={4} />
                <Space>
                  <Button
                    style={{ marginTop: '10px' }}
                    type="primary"
                    onClick={() => copyLink(betaMerge)}
                  >
                    复制
                  </Button>
                  <Button
                    style={{ marginTop: '10px' }}
                    type="primary"
                    onClick={() => openLink(betaMerge)}
                  >
                    打开链接
                  </Button>
                </Space>
              </Form.Item>
              <Form.Item label="合并到生产环境">
                <TextArea value={prodMerge} rows={4} />
                <Space>
                  <Button
                    style={{ marginTop: '10px' }}
                    type="primary"
                    onClick={() => copyLink(prodMerge)}
                  >
                    复制
                  </Button>
                  <Button
                    style={{ marginTop: '10px' }}
                    type="primary"
                    onClick={() => openLink(prodMerge)}
                  >
                    打开链接
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
          <Title>设置</Title>
          <Card bordered={false} style={{ margin: '0 auto' }}>
            <Form labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} autoComplete="off">
              <Form.Item label="暗黑主题">
                <Switch
                  checkedChildren="开启"
                  unCheckedChildren="关闭"
                  value={darkTheme}
                  onChange={switchChange}
                />
              </Form.Item>
              <Form.Item label="默认分支前缀">
                <Input
                  style={{ width: '250px' }}
                  value={defaultprefix}
                  onChange={(e) => saveDefaultprefix(e.target.value)}
                  allowClear
                  placeholder="用于分支默认前缀"
                />
              </Form.Item>
            </Form>
          </Card>
          <Title>统计</Title>
          <Statistics data={dataSource} />
        </Col>
      </Row>
    </ConfigProvider>
  )
}
export default App
