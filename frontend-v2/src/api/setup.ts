import axios from 'axios'
import type { DatabaseConfig, InstallRequest, InstallResponse, RedisConfig, SetupStatus } from '@/types'

const setupClient = axios.create({
  baseURL: '',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

setupClient.interceptors.response.use((response) => {
  const payload = response.data
  if (payload && typeof payload === 'object' && 'data' in payload) {
    response.data = payload.data
  }
  return response
})

export async function getSetupStatus(): Promise<SetupStatus> {
  const { data } = await setupClient.get<SetupStatus>('/setup/status')
  return data
}

export async function testDatabase(config: DatabaseConfig): Promise<void> {
  await setupClient.post('/setup/test-db', config)
}

export async function testRedis(config: RedisConfig): Promise<void> {
  await setupClient.post('/setup/test-redis', config)
}

export async function install(config: InstallRequest): Promise<InstallResponse> {
  const { data } = await setupClient.post<InstallResponse>('/setup/install', config)
  return data
}
