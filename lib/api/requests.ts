import axios from 'axios'

const client = axios.create()

type ContactRequestPayload = {
  type: 'EXPEDITION' | 'CERTIFICATE' | 'QUESTION' | 'PRIVATE_EVENT'
  name: string
  email: string
  message: string
  _hp?: string
}

export const submitContactRequest = (data: ContactRequestPayload): Promise<{ id: string }> =>
  client.post<{ id: string }>('/api/requests', data).then(r => r.data)
