import React, { useRef, useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '../../stores/auth'
import { supabase } from '../../lib/supabase'
import { toast } from 'sonner'
import { debounce } from 'lodash'

interface TextEditorProps {
  initialContent?: string
  documentId: string
}

interface Suggestion {
  id: string
  type: 'grammar' | 'style' | 'spelling' | 'tone' | 'other'
  message: string
  replacement: string
  start: number
  end: number
}

interface OpenAIResponse {
  suggestions: {
    type: 'grammar' | 'spelling' | 'style' | 'tone'
    message: string
    replacement: string
    start: number
    end: number
  }[]
}

export const TextEditor: React.FC<TextEditorProps> = ({ initialContent = '', documentId }) => {
  const editorRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const [content, setContent] = useState(initialContent)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [hoveredSuggestion, setHoveredSuggestion] = useState<Suggestion | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [wordCount, setWordCount] = useState(0)
  const [charCount, setCharCount] = useState(0)
  const [readingTime, setReadingTime] = useState(0)
  const processingTimeoutRef = useRef<NodeJS.Timeout>()
  const user = useAuthStore((state) => state.user)

  // Create a stable reference to the analyze function
  const analyzeTextRef = useRef(async (text: string) => {
    if (!text.trim()) {
      setSuggestions([])
      return
    }

    setIsProcessing(true)
    try {
      const response = await fetch('http://localhost:3001/api/analyze-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      })

      if (!response.ok) {
        throw new Error('Failed to analyze text')
      }

      const data = await response.json()
      console.log('API response:', data)
      setSuggestions(data.suggestions)
    } catch (error) {
      console.error('Error analyzing text:', error)
      toast.error('Failed to analyze text')
    } finally {
      setIsProcessing(false)
    }
  })

  // Create a stable reference to the debounced function
  const debouncedAnalyzeTextRef = useRef(
    debounce((text: string) => analyzeTextRef.current(text), 500)
  )

  // Save cursor position before rendering
  const saveCursorPosition = useCallback(() => {
    if (!editorRef.current) return null
    const selection = window.getSelection()
    if (!selection || !selection.rangeCount) return null
    return selection.getRangeAt(0).cloneRange()
  }, [])

  // Restore cursor position after rendering
  const restoreCursorPosition = useCallback((range: Range | null) => {
    if (!range) return
    const selection = window.getSelection()
    if (!selection) return
    selection.removeAllRanges()
    selection.addRange(range)
  }, [])

  // Update document stats
  useEffect(() => {
    const words = content.trim().split(/\s+/).filter(Boolean).length
    const chars = content.length
    const time = Math.ceil(words / 200) // Average reading speed of 200 words per minute

    setWordCount(words)
    setCharCount(chars)
    setReadingTime(time)
  }, [content])

  // Process text with OpenAI
  const processText = useCallback(async (text: string) => {
    if (!text.trim()) {
      setSuggestions([])
      return
    }

    // Clear any existing processing timeout
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current)
    }

    // Set processing state after a delay to prevent flickering
    processingTimeoutRef.current = setTimeout(() => {
      setIsProcessing(true)
    }, 500)

    try {
      console.log('Sending text for analysis:', text) // Debug log
      const response = await fetch('http://localhost:3001/api/analyze-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('API error:', errorData) // Debug log
        throw new Error(errorData.error || 'Failed to analyze text')
      }

      const data: OpenAIResponse = await response.json()
      console.log('API response:', data) // Debug log
      
      // Convert OpenAI suggestions to our format
      const newSuggestions = data.suggestions.map(suggestion => ({
        id: Math.random().toString(36).substr(2, 9),
        ...suggestion,
        context: text.slice(
          Math.max(0, suggestion.start - 20),
          Math.min(text.length, suggestion.end + 20)
        ),
      }))

      setSuggestions(newSuggestions)

      // Save to Supabase if we have a document ID
      if (documentId && user) {
        await supabase
          .from('documents')
          .upsert({
            id: documentId,
            content: text,
            user_id: user.id,
            updated_at: new Date().toISOString()
          })
        console.log('Document saved successfully')
      }
    } catch (error) {
      console.error('Error processing text:', error)
      toast.error('Failed to process text')
    } finally {
      // Clear the processing timeout
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current)
      }
      setIsProcessing(false)
    }
  }, [documentId, user])

  // Handle content changes without moving cursor
  const handleContentChange = useCallback((e: React.FormEvent<HTMLDivElement>) => {
    const editor = editorRef.current
    if (!editor) return

    // Get the raw text content
    const newContent = e.currentTarget.textContent || ''
    
    // Only update if content actually changed
    if (newContent !== content) {
      // Get current selection before any updates
      const selection = window.getSelection()
      let cursorOffset = 0

      try {
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0)
          cursorOffset = range.startOffset || 0
        }
      } catch (error) {
        console.error('Error getting selection:', error)
      }

      // Update content state
      setContent(newContent)

      // Update stats
      const words = newContent.trim().split(/\s+/).filter(Boolean).length
      const chars = newContent.length
      setWordCount(words)
      setCharCount(chars)
      setReadingTime(Math.ceil(words / 200))

      // Trigger analysis
      debouncedAnalyzeTextRef.current(newContent)

      // Restore cursor position
      if (selection) {
        requestAnimationFrame(() => {
          try {
            // Get the text node, create one if it doesn't exist
            let textNode = editor.firstChild as Text
            if (!textNode) {
              textNode = document.createTextNode(newContent)
              editor.appendChild(textNode)
            } else if (!(textNode instanceof Text)) {
              // If first child is not a text node, create one
              textNode = document.createTextNode(newContent)
              editor.innerHTML = ''
              editor.appendChild(textNode)
            }

            // Ensure we don't exceed the text length
            const maxOffset = Math.min(cursorOffset, textNode.length)
            
            // Create and set the new range
            const newRange = document.createRange()
            newRange.setStart(textNode, maxOffset)
            newRange.collapse(true)
            selection.removeAllRanges()
            selection.addRange(newRange)
          } catch (error) {
            console.error('Error restoring cursor:', error)
          }
        })
      }
    }
  }, [content])

  // Initialize editor content
  useEffect(() => {
    const editor = editorRef.current
    if (!editor) return

    // Initialize with content if editor is empty or has different content
    if (!editor.textContent || editor.textContent !== initialContent) {
      try {
        // Create a text node with initial content or empty string
        const textNode = document.createTextNode(initialContent || '')
        
        // Clear existing content
        editor.innerHTML = ''
        
        // Add the new text node
        editor.appendChild(textNode)
        
        // Set content state
        setContent(initialContent || '')

        // Set initial cursor position at the end
        const selection = window.getSelection()
        if (selection) {
          const range = document.createRange()
          range.setStart(textNode, textNode.length)
          range.collapse(true)
          selection.removeAllRanges()
          selection.addRange(range)
        }
      } catch (error) {
        console.error('Error initializing editor:', error)
      }
    }
  }, [initialContent])

  // Apply suggestion with precise cursor management
  const applySuggestion = useCallback((suggestion: Suggestion) => {
    const editor = editorRef.current
    if (!editor) return

    // Store current selection state
    const selection = window.getSelection()
    if (!selection) return

    // Get current cursor position
    const currentRange = selection.getRangeAt(0).cloneRange()
    const wasCollapsed = selection.isCollapsed
    const cursorOffset = currentRange.startOffset

    // Get current content and calculate new content
    const currentContent = editor.textContent || ''
    const newContent = 
      currentContent.slice(0, suggestion.start) +
      suggestion.replacement +
      currentContent.slice(suggestion.end)

    // Calculate length difference for cursor adjustment
    const lengthDiff = suggestion.replacement.length - (suggestion.end - suggestion.start)

    // Update content
    const textNode = document.createTextNode(newContent)
    while (editor.firstChild) {
      editor.removeChild(editor.firstChild)
    }
    editor.appendChild(textNode)
    setContent(newContent)

    // Remove suggestion and hover state
    setSuggestions(prev => prev.filter(s => s.id !== suggestion.id))
    setHoveredSuggestion(null)

    // Restore cursor position
    requestAnimationFrame(() => {
      try {
        let newOffset = cursorOffset
        
        // Adjust cursor position based on where it was relative to the suggestion
        if (cursorOffset > suggestion.end) {
          // If cursor was after the suggestion, adjust by the length difference
          newOffset = cursorOffset + lengthDiff
        } else if (cursorOffset > suggestion.start) {
          // If cursor was inside the suggestion, place it at the end of the replacement
          newOffset = suggestion.start + suggestion.replacement.length
        }
        // If cursor was before the suggestion, keep the same position

        // Ensure we don't exceed the text length
        newOffset = Math.min(newOffset, newContent.length)

        // Apply the new cursor position
        const newRange = document.createRange()
        newRange.setStart(textNode, newOffset)
        if (!wasCollapsed) {
          // If there was a selection, maintain it
          const endOffset = Math.min(currentRange.endOffset + lengthDiff, newContent.length)
          newRange.setEnd(textNode, endOffset)
        } else {
          newRange.collapse(true)
        }
        selection.removeAllRanges()
        selection.addRange(newRange)

        // Trigger content change to update analysis
        debouncedAnalyzeTextRef.current(newContent)
      } catch (error) {
        console.error('Error restoring cursor after suggestion:', error)
      }
    })
  }, [])

  // Handle hover state for suggestions in the text
  const handleSuggestionHover = useCallback((suggestion: Suggestion | null) => {
    setHoveredSuggestion(suggestion)
  }, [])

  // Position tooltip near the hovered text
  const positionTooltip = useCallback((event: MouseEvent) => {
    if (!tooltipRef.current) return
    
    const rect = (event.target as HTMLElement).getBoundingClientRect()
    tooltipRef.current.style.top = `${rect.bottom + window.scrollY + 5}px`
    tooltipRef.current.style.left = `${rect.left + window.scrollX}px`
  }, [])

  // Function to highlight text with suggestions
  const highlightText = useCallback(() => {
    const editor = editorRef.current
    if (!editor) return

    // Remove existing highlights
    const existingHighlights = editor.querySelectorAll('.suggestion-highlight')
    existingHighlights.forEach(highlight => {
      const text = highlight.textContent || ''
      highlight.replaceWith(text)
    })

    // Store current selection
    const selection = window.getSelection()
    const range = selection?.getRangeAt(0)
    const cursorOffset = range?.startOffset || 0

    let html = editor.innerHTML
    const offsets: number[] = []

    // Sort suggestions by start position in descending order
    const sortedSuggestions = [...suggestions].sort((a, b) => b.start - a.start)

    sortedSuggestions.forEach(suggestion => {
      const start = suggestion.start
      const end = suggestion.end
      const text = content.slice(start, end)

      // Calculate real positions accounting for HTML tags
      const realStart = calculateRealPosition(html, start, offsets)
      const realEnd = calculateRealPosition(html, end, offsets)

      const highlightClass = `suggestion-highlight suggestion-${suggestion.type}`
      const highlightedText = `<span class="${highlightClass}" data-suggestion-id="${suggestion.id}">${text}</span>`

      html = html.slice(0, realStart) + highlightedText + html.slice(realEnd)
      offsets.push(highlightedText.length - (end - start))
    })

    editor.innerHTML = html

    // Restore cursor position
    if (selection && range) {
      requestAnimationFrame(() => {
        try {
          const textNode = editor.firstChild || editor
          const newRange = document.createRange()
          const maxOffset = Math.min(cursorOffset, (textNode.textContent || '').length)
          newRange.setStart(textNode, maxOffset)
          newRange.collapse(true)
          selection.removeAllRanges()
          selection.addRange(newRange)
        } catch (error) {
          console.error('Error restoring cursor after highlighting:', error)
        }
      })
    }

    // Add event listeners to highlighted spans
    const highlights = editor.querySelectorAll('.suggestion-highlight')
    highlights.forEach(highlight => {
      highlight.addEventListener('mouseenter', (e) => {
        const suggestionId = (e.target as HTMLElement).getAttribute('data-suggestion-id')
        const suggestion = suggestions.find(s => s.id === suggestionId)
        if (suggestion) {
          handleSuggestionHover(suggestion)
          positionTooltip(e as MouseEvent)
        }
      })
      highlight.addEventListener('mouseleave', () => {
        handleSuggestionHover(null)
      })
      highlight.addEventListener('click', (e) => {
        const suggestionId = (e.target as HTMLElement).getAttribute('data-suggestion-id')
        const suggestion = suggestions.find(s => s.id === suggestionId)
        if (suggestion) {
          applySuggestion(suggestion)
        }
      })
    })
  }, [suggestions, content, handleSuggestionHover, positionTooltip, applySuggestion])

  // Helper function to calculate real position in HTML accounting for tags
  const calculateRealPosition = (html: string, position: number, offsets: number[]): number => {
    let realPos = position
    offsets.forEach(offset => {
      if (position > offset) realPos += offset
    })
    return realPos
  }

  // Apply styles for different suggestion types
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      .suggestion-highlight {
        cursor: pointer;
        border-bottom: 2px solid;
      }
      .suggestion-grammar {
        background-color: rgba(239, 68, 68, 0.1);
        border-bottom-color: rgb(239, 68, 68);
      }
      .suggestion-style {
        background-color: rgba(59, 130, 246, 0.1);
        border-bottom-color: rgb(59, 130, 246);
      }
      .suggestion-spelling {
        background-color: rgba(147, 51, 234, 0.1);
        border-bottom-color: rgb(147, 51, 234);
      }
      .suggestion-other {
        background-color: rgba(245, 158, 11, 0.1);
        border-bottom-color: rgb(245, 158, 11);
      }
    `
    document.head.appendChild(style)
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  // Update highlights when suggestions change
  useEffect(() => {
    highlightText()
  }, [suggestions, highlightText])

  // Debounced text processing
  useEffect(() => {
    if (content) {
      const timeoutId = setTimeout(() => {
        processText(content)
      }, 500)
      return () => clearTimeout(timeoutId)
    }
  }, [content, processText])

  return (
    <div className="relative min-h-[500px] w-full rounded-lg border border-gray-200 bg-white shadow-sm">
      {/* Editor Toolbar */}
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">
            {isProcessing ? 'Processing...' : 'Ready'}
          </span>
          <div className="h-4 w-px bg-gray-300" />
          <span className="text-sm text-gray-500">
            {wordCount} words
          </span>
          <span className="text-sm text-gray-500">
            {charCount} characters
          </span>
          <span className="text-sm text-gray-500">
            ~{readingTime} min read
          </span>
        </div>
      </div>

      {/* Editor Content */}
      <div className="relative flex">
        <div
          ref={editorRef}
          className="min-h-[400px] w-full resize-none p-4 text-base focus:outline-none"
          contentEditable
          suppressContentEditableWarning
          onInput={handleContentChange}
          onFocus={(e) => {
            if (e.currentTarget.textContent === 'Start writing...') {
              e.currentTarget.textContent = ''
            }
          }}
          onBlur={(e) => {
            if (!e.currentTarget.textContent?.trim()) {
              e.currentTarget.textContent = 'Start writing...'
            }
          }}
        >
          {initialContent || 'Start writing...'}
        </div>

        {/* Suggestions Panel */}
        <div className="w-64 border-l border-gray-200 p-4">
          <h3 className="mb-4 text-sm font-medium text-gray-700">
            Suggestions ({suggestions.length})
          </h3>
          <div className="space-y-4">
            {suggestions.map((suggestion, index) => {
              const key = `suggestion-${suggestion.id}-${index}-${suggestion.start}-${suggestion.end}`
              return (
                <div
                  key={key}
                  className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                    hoveredSuggestion?.id === suggestion.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-500'
                  }`}
                  onMouseEnter={() => setHoveredSuggestion(suggestion)}
                  onMouseLeave={() => setHoveredSuggestion(null)}
                >
                  <span className={`mb-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                    suggestion.type === 'grammar'
                      ? 'bg-red-100 text-red-800'
                      : suggestion.type === 'style'
                      ? 'bg-blue-100 text-blue-800'
                      : suggestion.type === 'spelling'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {suggestion.type}
                  </span>
                  <p className="mb-2 text-sm text-gray-600">{suggestion.message}</p>
                  <div className="text-xs">
                    <span className="text-gray-500">Original: </span>
                    <span className="font-medium">{content.slice(suggestion.start, suggestion.end)}</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-gray-500">Suggestion: </span>
                    <span className="font-medium text-green-600">{suggestion.replacement}</span>
                  </div>
                  <button
                    onClick={() => applySuggestion(suggestion)}
                    className="mt-2 w-full rounded bg-blue-600 px-2 py-1 text-xs font-medium text-white hover:bg-blue-700"
                  >
                    Apply Suggestion
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* Hover Tooltip */}
        {hoveredSuggestion && (
          <div
            ref={tooltipRef}
            className="absolute z-50 w-64 rounded-lg border border-gray-200 bg-white p-3 shadow-lg"
            style={{ position: 'fixed' }}
          >
            <span className={`mb-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
              hoveredSuggestion.type === 'grammar'
                ? 'bg-red-100 text-red-800'
                : hoveredSuggestion.type === 'style'
                ? 'bg-blue-100 text-blue-800'
                : hoveredSuggestion.type === 'spelling'
                ? 'bg-purple-100 text-purple-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {hoveredSuggestion.type}
            </span>
            <p className="mb-2 text-sm text-gray-600">{hoveredSuggestion.message}</p>
            <div className="text-xs">
              <span className="text-gray-500">Suggestion: </span>
              <span className="font-medium text-green-600">{hoveredSuggestion.replacement}</span>
            </div>
            <button
              onClick={() => applySuggestion(hoveredSuggestion)}
              className="mt-2 w-full rounded bg-blue-600 px-2 py-1 text-xs font-medium text-white hover:bg-blue-700"
            >
              Apply Suggestion
            </button>
          </div>
        )}
      </div>
    </div>
  )
} 