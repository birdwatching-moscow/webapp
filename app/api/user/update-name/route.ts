import { NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { validateRequest } from '@/lib/api/validate'
import { HTTP_STATUS_UNAUTHORIZED, HTTP_STATUS_INTERNAL_SERVER_ERROR } from '@/lib/constants'

const updateNameSchema = z.object({
  name: z.string().min(1).max(100),
})

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: HTTP_STATUS_UNAUTHORIZED })
  }

  const result = await validateRequest(req, updateNameSchema)
  if (!result.success) return result.response

  const { name } = result.data

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { name },
    })
  } catch (err) {
    console.error('PATCH /api/user/update-name failed', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: HTTP_STATUS_INTERNAL_SERVER_ERROR })
  }

  return NextResponse.json({ ok: true })
}
