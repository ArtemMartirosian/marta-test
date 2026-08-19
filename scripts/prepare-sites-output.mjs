import { copyFile, cp, mkdir, readdir } from 'node:fs/promises'
import { join } from 'node:path'

const DIST_DIRECTORY = 'dist'
const CLIENT_DIRECTORY = join(DIST_DIRECTORY, 'client')
const WORKER_DIRECTORY = join(DIST_DIRECTORY, 'marta_facade_picker')
const SERVER_DIRECTORY = join(DIST_DIRECTORY, 'server')

await mkdir(SERVER_DIRECTORY, { recursive: true })

for (const entry of await readdir(CLIENT_DIRECTORY)) {
  await cp(join(CLIENT_DIRECTORY, entry), join(DIST_DIRECTORY, entry), {
    force: true,
    recursive: true,
  })
}

await copyFile(
  join(WORKER_DIRECTORY, 'index.js'),
  join(SERVER_DIRECTORY, 'index.js'),
)
