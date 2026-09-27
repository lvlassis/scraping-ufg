import { spawn } from 'child_process'
import { app } from 'electron'
import { join } from 'path'
import type { ApiResponse } from './model/materia'

function getScraperBin(): string {
  if (process.env.SIGAA_SCRAPER_PATH) return process.env.SIGAA_SCRAPER_PATH
  if (app.isPackaged)
    return join(
      process.resourcesPath,
      process.platform === 'win32' ? 'sigaa-scraper.exe' : 'sigaa-scraper'
    )
  return 'sigaa-scraper'
}

export function callScraper(cookies: string): Promise<ApiResponse> {
  return new Promise((resolve, reject) => {
    const proc = spawn(getScraperBin(), ['discente'], { stdio: ['pipe', 'pipe', 'pipe'] })

    let stdout = ''
    let stderr = ''

    proc.stdout.on('data', (d: Buffer) => (stdout += d))
    proc.stderr.on('data', (d: Buffer) => (stderr += d))

    proc.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(stderr.trim() || `sigaa-scraper exited with code ${code}`))
        return
      }
      try {
        resolve(JSON.parse(stdout) as ApiResponse)
      } catch {
        reject(new Error('sigaa-scraper returned invalid JSON'))
      }
    })

    proc.on('error', reject)
    proc.stdin.write(cookies)
    proc.stdin.end()
  })
}
