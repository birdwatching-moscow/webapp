import axios from 'axios'
import { API_ROUTES } from '@/utils/routes'

const client = axios.create()

type ContactRequestPayload = {
  type: 'EXPEDITION' | 'CERTIFICATE' | 'QUESTION' | 'PRIVATE_EVENT'
  expeditionId?: string
  name: string
  email: string
  message: string
  _hp?: string
}

export const submitContactRequest = (data: ContactRequestPayload): Promise<{ id: string }> =>
  client.post<{ id: string }>(API_ROUTES.requests, data).then(r => r.data)
