import axios from 'axios'

const client = axios.create()

export const requestLoginCode = (data: { email: string }): Promise<void> =>
  client.post('/api/auth/request-login-code', data).then(() => {})

export const register = (data: { name: string; email: string }): Promise<void> =>
  client.post('/api/auth/register', data).then(() => {})
