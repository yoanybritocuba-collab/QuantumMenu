import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { text, targetLanguage } = await request.json()

    if (!text || !targetLanguage) {
      return NextResponse.json(
        { error: 'Texto e idioma objetivo son requeridos' },
        { status: 400 }
      )
    }

    const sourceLang = 'es'
    const targetLang = targetLanguage === 'ca' ? 'ca' : 'en'

    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; QuantumMenuBot/1.0)'
      }
    })

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`)
    }

    const data = await response.json()
    const translation = data?.responseData?.translatedText || text

    return NextResponse.json({ translation })
  } catch (error) {
    console.error('Error en API de traducción:', error)
    return NextResponse.json(
      { error: 'Error al traducir', details: (error as Error).message },
      { status: 500 }
    )
  }
}