import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

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
    const { secret } = body

    // SECURITY: Validar secret obrigatoriamente
    if (!secret || typeof secret !== 'string') {
      return NextResponse.json(
        { message: 'Secret is required' },
        { status: 400 }
      )
    }

    // SECURITY: Comparação segura de strings para evitar timing attacks
    if (secret.length !== revalidateSecret.length || secret !== revalidateSecret) {
      return NextResponse.json(
        { message: 'Invalid secret' },
        { status: 401 }
      )
    }

    // Revalidar páginas principais
    revalidatePath('/')
    revalidatePath('/posts')

    return NextResponse.json(
      { revalidated: true, now: Date.now() },
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
