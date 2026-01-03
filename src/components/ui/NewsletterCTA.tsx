'use client'

import { useState } from 'react'
import { Mail } from 'lucide-react'

export default function NewsletterCTA() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/newsletter/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        setStatus('success')
        setMessage('Inscrição realizada com sucesso! Verifique seu email.')
        setEmail('')
      } else {
        setStatus('error')
        setMessage('Erro ao inscrever. Tente novamente.')
      }
    } catch (error) {
      setStatus('error')
      setMessage('Erro ao inscrever. Tente novamente.')
    }

    setTimeout(() => {
      setStatus('idle')
      setMessage('')
    }, 5000)
  }

  return (
    <div className="bg-gradient-to-r from-orange-500 to-yellow-500 rounded-2xl p-8 md:p-12 text-white">
      <div className="max-w-3xl mx-auto text-center">
        <Mail className="w-12 h-12 mx-auto mb-4" />
        <h2 className="text-3xl font-bold mb-4">
          Receba as principais notícias cripto no seu email
        </h2>
        <p className="text-lg mb-6 text-white/90">
          Assine nossa newsletter e fique por dentro das últimas novidades do mercado de criptomoedas.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            placeholder="Seu melhor email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={status === 'loading'}
            className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            {status === 'loading' ? 'Enviando...' : 'Assinar'}
          </button>
        </form>

        {message && (
          <p className={`mt-4 text-sm ${status === 'success' ? 'text-white' : 'text-red-100'}`}>
            {message}
          </p>
        )}

        <p className="text-sm text-white/80 mt-4">
          Sem spam. Cancele a qualquer momento.
        </p>
      </div>
    </div>
  )
}
