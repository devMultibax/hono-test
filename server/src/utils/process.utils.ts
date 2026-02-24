import { spawn } from 'child_process'

export function spawnCommand(
  command: string,
  args: string[],
  env: NodeJS.ProcessEnv
): Promise<{ code: number; stderr: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { env })
    let stderr = ''
    child.stderr.on('data', (data) => { stderr += data.toString() })
    child.on('close', (code) => resolve({ code: code ?? 1, stderr }))
    child.on('error', (err) => reject(err))
  })
}
