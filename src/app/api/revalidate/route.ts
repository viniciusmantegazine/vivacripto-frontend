import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { secret } = body

    // Verificar secret (opcional, mas recomendado)
    const revalidateSecret = process.env.REVALIDATE_SECRET
    if (revalidateSecret && secret !== revalidateSecret) {
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
    console.error('Error revalidating:', error)
    return NextResponse.json(
      { message: 'Error revalidating' },
      { status: 500 }
    )
  }
}
