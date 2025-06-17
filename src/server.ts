import express, { Request, Response } from 'express'
import cors from 'cors'
import OpenAI from 'openai'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

if (!process.env.VITE_OPENAI_API_KEY) {
  throw new Error('Missing environment variable: VITE_OPENAI_API_KEY')
}

const app = express()
const port = 3001

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY
})

interface AnalyzeTextRequest {
  text: string
}

interface Suggestion {
  type: 'grammar' | 'spelling' | 'style' | 'tone'
  message: string
  replacement: string
  start: number
  end: number
}

interface AnalyzeTextResponse {
  suggestions: Suggestion[]
}

app.use(cors())
app.use(express.json())

app.post('/api/analyze-text', async (req: Request, res: Response) => {
  try {
    const { text } = req.body as AnalyzeTextRequest

    if (!text) {
      res.status(400).json({ error: 'Text is required' })
      return
    }

    console.log('Analyzing text:', text) // Debug log

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a professional writing assistant. Your task is to analyze text for grammar, spelling, style, and tone issues.
          
          For each issue, you must provide:
          1. The type (grammar/spelling/style/tone)
          2. A clear explanation message
          3. The suggested replacement text
          4. The exact start and end character positions of the issue in the original text
          
          Format your response as a JSON object with a 'suggestions' array. Each suggestion must have these exact fields:
          {
            "suggestions": [
              {
                "type": "grammar",
                "message": "Incorrect verb tense",
                "replacement": "went",
                "start": 5,
                "end": 8
              }
            ]
          }
          
          Important:
          - Only respond with valid JSON
          - Include character positions (start/end) for each issue
          - Keep suggestions concise and clear
          - Ensure all fields are present for each suggestion`
        },
        {
          role: "user",
          content: text
        }
      ],
      temperature: 0.3, // Lower temperature for more consistent output
      max_tokens: 1000
    })

    console.log('OpenAI response:', completion.choices[0].message.content) // Debug log

    const response = completion.choices[0].message.content
    if (!response) {
      res.status(500).json({ error: 'No response from OpenAI' })
      return
    }

    // Parse and validate the response
    const parsedResponse = JSON.parse(response) as AnalyzeTextResponse
    if (!Array.isArray(parsedResponse.suggestions)) {
      res.status(500).json({ error: 'Invalid response format from OpenAI' })
      return
    }

    res.json(parsedResponse)
  } catch (error) {
    console.error('Error analyzing text:', error)
    res.status(500).json({ error: 'Failed to analyze text' })
  }
})

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
}) 