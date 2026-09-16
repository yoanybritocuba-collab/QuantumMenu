'use client'

import { useState } from 'react'

export function useTranslation() {
  const [isTranslating, setIsTranslating] = useState(false)
  const [error, setError] = useState('')

  const translate = async (text: string, targetLanguage: string = 'ca'): Promise<string> => {
    if (!text || !text.trim()) return ''

    setIsTranslating(true)
    setError('')

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, targetLanguage }),
      })

      if (!response.ok) throw new Error('Error al traducir')

      const data = await response.json()
      return data.translation || text
    } catch (error) {
      console.error('Error en traducción:', error)
      setError('No se pudo traducir el texto')
      return text
    } finally {
      setIsTranslating(false)
    }
  }

  return { translate, isTranslating, error }
}