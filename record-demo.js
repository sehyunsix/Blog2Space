import { chromium } from '@playwright/test'
import { mkdirSync } from 'fs'
import { dirname } from 'path'

async function recordDemo() {
  // 영상 저장 디렉토리 생성
  mkdirSync('public/videos', { recursive: true })

  const browser = await chromium.launch({ headless: false })

  try {
    console.log('🎬 Demo 영상 녹화 시작...')

    // 로컬 개발 서버에서 녹화 (더 안정적)
    const context = await browser.newContext({
      recordVideo: { dir: 'public/videos', size: { width: 1280, height: 720 } },
      viewport: { width: 1280, height: 720 },
    })

    const page = await context.newPage()

    // 로컬호스트에서 테스트 (또는 www.sobut.shop 사용 가능)
    const url = 'http://localhost:5173'
    console.log(`📱 ${url}에 접속 중...`)

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 })
    await page.waitForTimeout(3000)

    // 1. 텍스트 입력 화면 표시
    console.log('📝 텍스트 입력 화면 표시 중...')
    await page.waitForTimeout(2000)

    // 2. GO TO SPACE 버튼 클릭
    console.log('🚀 GO TO SPACE 버튼 클릭...')
    try {
      const buttons = await page.locator('button').all()
      let found = false
      for (const button of buttons) {
        const text = await button.textContent()
        if (text && text.includes('GO TO SPACE')) {
          await button.click()
          found = true
          break
        }
      }
      if (!found) {
        console.log('⚠️ GO TO SPACE 버튼을 찾을 수 없음')
      }
    } catch (e) {
      console.log('⚠️ 버튼 클릭 오류:', e.message)
    }

    // 3. 로딩 화면 표시
    console.log('⏳ 로딩 중...')
    await page.waitForTimeout(5000)

    // 4. Canvas 로드 대기
    console.log('🎯 3D 공간 표시 대기 중...')
    try {
      await page.waitForSelector('canvas', { timeout: 30000 })
      console.log('✅ Canvas 로드됨')
    } catch (e) {
      console.log('⚠️ Canvas 로드 타임아웃 (계속 진행)')
    }
    await page.waitForTimeout(3000)

    // 5. 3D 공간 인터랙션
    console.log('🌐 3D 공간 인터랙션 중...')
    const canvas = await page.$('canvas')
    if (canvas) {
      // 마우스 드래그
      await page.mouse.move(640, 400)
      await page.mouse.down()
      await page.mouse.move(750, 350)
      await page.mouse.up()
      await page.waitForTimeout(1500)

      // 줌인
      await page.mouse.wheel(0, -100)
      await page.waitForTimeout(1000)
    }

    // 6. 검색 입력
    console.log('🔍 검색 기능 시연 중...')
    try {
      const inputs = await page.locator('input').all()
      let found = false
      for (const input of inputs) {
        const placeholder = await input.getAttribute('placeholder')
        if (placeholder && placeholder.includes('검색')) {
          await input.click()
          await input.type('텍스트', { delay: 100 })
          await page.waitForTimeout(1500)

          // 검색 버튼 클릭
          const buttons = await page.locator('button').all()
          for (const button of buttons) {
            const text = await button.textContent()
            if (text && text.includes('검색')) {
              await button.click()
              found = true
              break
            }
          }
          break
        }
      }
      if (!found) {
        console.log('⚠️ 검색 기능을 찾을 수 없음')
      }
    } catch (e) {
      console.log('⚠️ 검색 오류:', e.message)
    }

    await page.waitForTimeout(3000)

    // 영상 저장
    const video = await page.video()
    if (video) {
      const path = await video.path()
      console.log(`📹 영상 저장됨: ${path}`)
    }

    await context.close()
    console.log('✅ 영상 녹화 완료')
  } catch (error) {
    console.error('❌ 오류 발생:', error.message)
  } finally {
    await browser.close()
    console.log('🎬 브라우저 종료')
  }
}

recordDemo().catch(console.error)
