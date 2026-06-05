import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const source = readFileSync(new URL('../src/components/SettingsPanel.tsx', import.meta.url), 'utf8')

test('settings panel guides new users with examples and a live path preview', () => {
  assert.match(source, /const previewDomain = /)
  assert.match(source, /const previewPath = /)
  assert.match(source, /可以填写你的名字首字母缩写，例如 hyl/)
  assert.match(source, /例如 https:\/\/git\.example\.com/)
  assert.match(source, /例如 frontend/)
  assert.match(source, /路径预览/)
  assert.match(source, /\{previewPath\}/)
})

test('settings panel provides an Ant Design Tour for first-time configuration', () => {
  assert.match(source, /import type \{ TourProps \} from 'antd'/)
  assert.match(source, /Tour/)
  assert.match(source, /填写引导/)
  assert.match(source, /SETTINGS_TOUR_KEY/)
  assert.match(source, /const prefixRef = useRef<HTMLDivElement>\(null\)/)
  assert.match(source, /const domainRef = useRef<HTMLDivElement>\(null\)/)
  assert.match(source, /const groupRef = useRef<HTMLDivElement>\(null\)/)
  assert.match(source, /const previewRef = useRef<HTMLDivElement>\(null\)/)
  assert.match(source, /const shouldOpenGuide = !settings\.defaultPrefix && !settings\.domainUrl && !settings\.groupName/)
  assert.match(source, /target: \(\) => prefixRef\.current/)
  assert.match(source, /target: \(\) => previewRef\.current/)
  assert.match(source, /<Tour open=\{tourOpen\}/)
})
