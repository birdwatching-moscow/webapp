/**
 * Lightweight enum constants for use in client components.
 * Mirror Prisma-generated enums without importing the Prisma client.
 */

export const EventStatus = {
  DRAFT:     'DRAFT',
  ACTIVE:    'ACTIVE',
  CANCELLED: 'CANCELLED',
  PAST:      'PAST',
  DELETED:   'DELETED',
} as const
export type EventStatus = typeof EventStatus[keyof typeof EventStatus]

export const RequestStatus = {
  NEW:         'NEW',
  WAITLIST:    'WAITLIST',
  OPEN:        'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  CLOSED:      'CLOSED',
} as const
export type RequestStatus = typeof RequestStatus[keyof typeof RequestStatus]

export const RequestType = {
  EXPEDITION:    'EXPEDITION',
  CERTIFICATE:   'CERTIFICATE',
  QUESTION:      'QUESTION',
  PRIVATE_EVENT: 'PRIVATE_EVENT',
} as const
export type RequestType = typeof RequestType[keyof typeof RequestType]
