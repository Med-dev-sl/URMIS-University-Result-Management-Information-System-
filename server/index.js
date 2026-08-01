import { startServer } from './app.js'

const port = Number(process.env.PORT || 5000)

try {
  await startServer({ port, seedData: true })
} catch (error) {
  console.error('Failed to start app:', error)
  process.exit(1)
}
