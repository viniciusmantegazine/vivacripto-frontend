import crypto from 'crypto'
import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

// Only slugs matching this shape are safe to feed into revalidatePath.
const POST_PATH_REGEX = /^\/posts\/[a-z0-9-]+$/

/**
 * Constant-time secret comparison. Compares lengths first (an early return on
 * mismatched length does not leak the secret's content), then uses
 * crypto.timingSafeEqual on equal-length buffers.
 */
function isValidSecret(provided: string, expected: string): boolean {
  const providedBuf = Buffer.from(provided)
  const expectedBuf = Buffer.from(expected)
  if (providedBuf.length !== expectedBuf.length) {
    return false
  }
  return crypto.timingSafeEqual(providedBuf, expectedBuf)
}

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Verificar se o secret está configurado
    const revalidateSecret = process.env.REVALIDATE_SECRET
    if (!revalidateSecret) {
      console.error('[REVALIDATE] REVALIDATE_SECRET não configurado')
      return NextResponse.json(
        { message: 'Server configuration error' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { secret, path } = body

    // SECURITY: Validar secret obrigatoriamente
    if (!secret || typeof secret !== 'string') {
      return NextResponse.json(
        { message: 'Secret is required' },
        { status: 400 }
      )
    }

    // SECURITY: Comparação em tempo constante para evitar timing attacks
    if (!isValidSecret(secret, revalidateSecret)) {
      return NextResponse.json(
        { message: 'Invalid secret' },
        { status: 401 }
      )
    }

    // Revalida tudo que depende da lista de posts (mesma tag usada em api.ts)
    revalidateTag('posts')
    // Home sempre revalida
    revalidatePath('/')

    // Se o backend enviou um caminho de post válido, revalida essa página também
    const revalidatedPaths = ['/']
    if (typeof path === 'string' && POST_PATH_REGEX.test(path)) {
      revalidatePath(path)
      revalidatedPaths.push(path)
    }

    return NextResponse.json(
      { revalidated: true, tag: 'posts', paths: revalidatedPaths, now: Date.now() },
      { status: 200 }
    )
  } catch (error) {
    console.error('[REVALIDATE] Error:', error)
    return NextResponse.json(
      { message: 'Error revalidating' },
      { status: 500 }
    )
  }
}
