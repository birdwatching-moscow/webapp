'use server'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/auth/permissions'
import { RequestStatus } from '@/generated/prisma/client'

export async function updateRequestStatus(id: string, status: RequestStatus) {
  const session = await auth()
  if (!session || !isAdmin(session.user.role)) throw new Error('Forbidden')
  await prisma.request.update({ where: { id }, data: { status } })
  revalidatePath('/admin/requests')
}

export async function deleteRequest(id: string) {
  const session = await auth()
  if (!session || !isAdmin(session.user.role)) throw new Error('Forbidden')
  await prisma.request.delete({ where: { id } })
  revalidatePath('/admin/requests')
}
