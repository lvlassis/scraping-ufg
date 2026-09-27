import { spawn } from 'child_process'
import type { ApiResponse } from './model/materia'

export function callScraper(cookies: string): Promise<ApiResponse> {
  return new Promise((resolve, reject) => {
    const proc = spawn('sigaa-scraper', ['discente'], { stdio: ['pipe', 'pipe', 'pipe'] })

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
