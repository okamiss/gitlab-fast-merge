import React, { useEffect, useState } from 'react'
import { Card, Input, Col, Row, Button, Checkbox, Form, Select, message, Space, Radio } from 'antd'
import type { GetProp, RadioChangeEvent } from 'antd'

import { Title, Preview } from './app-style'
import dayjs from 'dayjs'
import copy from 'clipboard-copy'
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

const TimeComponent: React.FC<{ title: string; childStyle: object; sendName?: any }> = ({
  title,
  childStyle,
  sendName
}) => {
  const [messageApi, contextHolder] = message.useMessage()
  const [form] = Form.useForm()
  const [checkedList, setCheckedList] = useState<CheckboxValueType[]>(
    title === 'tag' ? defaultCheckedListTag : defaultCheckedList
  )
  const [preview, setPreview] = useState('')

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
  // const [isinput, setIsinput] = useState(false)
  // const isInputRef = useRef(false)

  // useEffect(() => {
  //   isInputRef.current = isinput
  // }, [isinput])

  const storeList = [
    { value: 'admin-crm', label: 'crm系统' },
    { value: 'admin-scrm', label: 'scrm系统' },
    { value: 'web-wwside', label: '企微侧边栏' }
  ]

  const storeMap = new Map([
    ['admin-crm', 4],
    ['admin-scrm', 10],
    ['web-wwside', 16]
  ])

  const createLink = (b: string, s: string) => {
    if (!s) return

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
    const betaLink = `${frontendUrl}/${s}/-/merge_requests/new?merge_request[source_project_id]=${storeMap.get(
      s
    )}&merge_request[source_branch]=${b}&merge_request[target_project_id]=${storeMap.get(
      s
    )}&merge_request[target_branch]=beta`
    setBetaMerge(betaLink)

    const prodLink = `${frontendUrl}/${s}/-/merge_requests/new?merge_request[source_branch]=${b}`
    setProdMerge(prodLink)
  }

  // 仓库选择
  const storeChange = ({ target: { value } }: RadioChangeEvent) => {
    setSname(value)
    createLink(bname, value)
  }

  const getName = () => {
    // if (isInputRef.current.isinput) return
    // setBname(e)
    // createLink()
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

  return (
    <>
      {contextHolder}
      <Row gutter={16} style={{ padding: '20px' }}>
        <Col className="gutter-row" span={12}>
          <Title>Gitlab快速命名branch/tag</Title>
          <TimeComponent title={'branch'} childStyle={{ margin: '0 auto' }} sendName={getName} />
          <TimeComponent title={'tag'} childStyle={{ margin: '20px auto 0' }} />
        </Col>
        <Col className="gutter-row" span={12}>
          <Title>Gitlab快速合并发布代码</Title>
          <Card bordered={false} style={{ margin: '0 auto' }}>
            <Form name="basic" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} autoComplete="off">
              <Form.Item label="合并分支">
                <Input value={bname} onChange={(e) => bnameChange(e.target.value)} allowClear />
              </Form.Item>
              <Form.Item label="选择仓库系统">
                {/* <Select value={sname} onChange={storeChange} options={storeList} /> */}
                <Radio.Group value={sname} onChange={storeChange} options={storeList} />
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
