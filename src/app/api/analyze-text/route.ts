import { NextResponse } from 'next/server'
import OpenAI from 'openai'

if (!import.meta.env.VITE_OPENAI_API_KEY) {
  throw new Error('Missing environment variable: VITE_OPENAI_API_KEY')
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY
})

export async function POST(req: Request) {
  try {
    const { text } = await req.json()

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      )
    }

    // Analyze text with OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a professional writing assistant. Analyze the following text for grammar, spelling, style, and tone issues. 
          For each issue found, provide:
          - type: either 'grammar', 'spelling', 'style', or 'tone'
          - message: a clear explanation of the issue
          - replacement: suggested correction
          - start: character index where the issue begins
          - end: character index where the issue ends
          
          Return the response as a JSON object with a 'suggestions' array containing these fields.
          Only return the JSON, no other text.`
        },
        {
          role: "user",
          content: text
        }
      ],
      response_format: { type: "json_object" }
    })

    const response = completion.choices[0].message.content
    if (!response) {
      throw new Error('No response from OpenAI')
    }

    // Parse and validate the response
    const parsedResponse = JSON.parse(response)
    if (!Array.isArray(parsedResponse.suggestions)) {
      throw new Error('Invalid response format from OpenAI')
    }

    return NextResponse.json(parsedResponse)
  } catch (error) {
    console.error('Error analyzing text:', error)
    return NextResponse.json(
      { error: 'Failed to analyze text' },
      { status: 500 }
    )
  }
} 