import React, { useEffect, useState } from 'react'
import { Card, Input, Col, Row, Button, Checkbox, Form, Select, message } from 'antd'
import type { GetProp } from 'antd'

import { Title, Preview } from './app-style'
import dayjs from 'dayjs'
import copy from 'clipboard-copy'

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

const TimeComponent: React.FC<{ title: string; childStyle: object }> = ({ title, childStyle }) => {
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
    setPreview(`${preVal}${preVal ? '/' : ''}${time}${sufVal ? '_' : ''}${sufVal}`)
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
            preVal: `${title === 'tag' ? 'beta' : ''}`,
            time: dayjs(new Date()).format('YYYYMMDD'),
            sufVal: ''
          }}
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
                  <Input onChange={(e) => trimFormat('preVal', e)} placeholder="前缀" />
                )}
              </Form.Item>
            </Col>
            <Col span={10}>
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
                <Input onChange={(e) => trimFormat('sufVal', e)} placeholder="后缀" />
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
  return (
    <>
      <Title>gitlab一键命名branch/tag</Title>
      <TimeComponent title={'branch'} childStyle={{ width: 800, margin: '0 auto' }} />
      <TimeComponent title={'tag'} childStyle={{ width: 800, margin: '20px auto 0' }} />
    </>
  )
}

export default App
