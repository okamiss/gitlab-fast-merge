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
  Table
} from 'antd'
import type { GetProp, TableColumnsType } from 'antd'

import { Title, Preview, Title2 } from './app-style'
import dayjs from 'dayjs'
import copy from 'clipboard-copy'
import { v4 as uuidv4 } from 'uuid'
import { storeList } from './common/select'

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
}> = ({ title, childStyle, sendName, updateBranch }) => {
  const [messageApi, contextHolder] = message.useMessage()
  const [form] = Form.useForm()
  const [checkedList, setCheckedList] = useState<CheckboxValueType[]>(
    title === 'tag' ? defaultCheckedListTag : defaultCheckedList
  )
  const [preview, setPreview] = useState('')
  const [description, setDescription] = useState('')
  const [sname, setSname] = useState('admin-crm')

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
  const trimFormat = (name: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const trimValue = e.target.value.trim()
    form.setFieldValue(name, trimValue)
  }

  // 复制
  const onFinish = () => {
    copy(preview)
    messageApi.success('复制成功')
  }

  // 暂存分支
  const saveBranch = () => {
    const getSLablename = storeList.find((item) => item.value === sname)?.label

    const params = {
      id: uuidv4(),
      modiy: false,
      branch: preview,
      storeName: sname,
      description
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
      messageApi.success('暂存成功')
    } else {
      updateBranch([params])
      localStorage.setItem('table', JSON.stringify([params]))
      messageApi.success('暂存成功')
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
            preVal: `${title === 'tag' ? 'prod' : 'hyl'}`,
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
                  <Input onChange={(e) => trimFormat('preVal', e)} placeholder="前缀" allowClear />
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
                <Input onChange={(e) => trimFormat('sufVal', e)} placeholder="后缀" allowClear />
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
                onChange={(e) => setDescription(e.target.value)}
                onKeyUp={(e) => e.key === 'Enter' && saveBranch()}
                placeholder="暂存分支描述信息，该分支对应需求说明"
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
                暂存
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
  // const [isinput, setIsinput] = useState(false)
  // const isInputRef = useRef(false)

  // useEffect(() => {
  //   isInputRef.current = isinput
  // }, [isinput])

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

  const copyLink = (e: string) => {
    copy(e)
    messageApi.success('复制成功')
  }

  const openLink = (e: string) => {
    window.open(e)
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
      render: (_: any, record: any, index) =>
        record.modiy ? (
          <Input
            value={record.description}
            onChange={(e) => dirChange(e.target.value, index)}
            onKeyUp={(e) => e.key === 'Enter' && save(record, index)}
          />
        ) : (
          <span>{record.description}</span>
        )
    },
    {
      title: '操作',
      fixed: 'right',
      width: 250,
      render: (_: any, record: any, index: number) => (
        <Space>
          <Button type="link" onClick={() => importBranch(record)}>
            导入分支
          </Button>
          {record.modiy ? (
            <Button type="link" onClick={() => save(record, index)}>
              保存
            </Button>
          ) : (
            <Button type="link" onClick={() => modiy(record, index)}>
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

  const dirChange = (e: string, index: number) => {
    const saveData = JSON.parse(JSON.stringify(dataSource))
    saveData[index].description = e
    setdataSource(saveData)
  }
  // 保存
  const save = (value: branchlist, index: number) => {
    const saveData = JSON.parse(JSON.stringify(dataSource))
    saveData[index].modiy = !value.modiy
    setdataSource(saveData)
    localStorage.setItem('table', JSON.stringify(saveData))
  }

  // 修改
  const modiy = (value: branchlist, index: number) => {
    const modiyData = JSON.parse(JSON.stringify(dataSource))
    modiyData[index].modiy = !value.modiy
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

  return (
    <>
      {contextHolder}
      <Row gutter={16} style={{ padding: '20px' }}>
        <Col className="gutter-row" span={12}>
          <Title>Gitlab快速命名branch/tag</Title>
          <TimeComponent
            title={'branch'}
            childStyle={{ margin: '0 auto' }}
            sendName={getName}
            updateBranch={getUpdate}
          />
          <TimeComponent title={'tag'} childStyle={{ margin: '20px auto 0' }} />
          <Title2>暂存分支列表</Title2>
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
        </Col>
      </Row>
    </>
  )
}

export default App
