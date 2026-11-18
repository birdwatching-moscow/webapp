import axios from 'axios'
import { API_ROUTES } from '@/utils/routes'

const client = axios.create()

export const requestLoginCode = (data: { email: string }): Promise<void> =>
  client.post(API_ROUTES.auth.requestLoginCode, data).then(() => {})

export const register = (data: { name: string; email: string }): Promise<void> =>
  client.post(API_ROUTES.auth.register, data).then(() => {})
