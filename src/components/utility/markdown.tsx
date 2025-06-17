"use client"

import { type ReactNode } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import type { Components } from "react-markdown"
import { cn } from "@/lib/utils"

interface MarkdownProps {
  children: string
}

interface ComponentProps {
  children: ReactNode
  href?: string
  src?: string
  alt?: string
  className?: string
}

export function Markdown({ children }: MarkdownProps) {
  const components: Components = {
    h1: ({ children }) => (
      <h1 className="mb-4 text-2xl font-bold">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="mb-3 text-xl font-bold">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="mb-2 text-lg font-bold">{children}</h3>
    ),
    p: ({ children }) => (
      <p className="mb-4 leading-relaxed">{children}</p>
    ),
    ul: ({ children }) => (
      <ul className="mb-4 list-disc pl-5">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="mb-4 list-decimal pl-5">{children}</ol>
    ),
    li: ({ children }) => <li className="mb-1">{children}</li>,
    code: ({ className, children }) => {
      const match = /language-(\w+)/.exec(className || "")
      return match ? (
        <pre className={`mb-4 overflow-auto rounded bg-gray-100 p-4 ${className}`}>
          <code className={className}>{children}</code>
        </pre>
      ) : (
        <code className="rounded bg-gray-100 px-1 py-0.5">{children}</code>
      )
    },
    blockquote: ({ children }) => (
      <blockquote className="mb-4 border-l-4 border-gray-200 pl-4 italic">
        {children}
      </blockquote>
    ),
    a: ({ href, children }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline"
      >
        {children}
      </a>
    ),
    img: ({ src, alt }) => (
      <img
        src={src}
        alt={alt}
        className="mb-4 max-h-96 w-auto rounded-lg object-cover"
      />
    ),
    table: ({ children }) => (
      <div className="mb-4 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          {children}
        </table>
      </div>
    ),
    th: ({ children }) => (
      <th className="bg-gray-50 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
        {children}
      </td>
    ),
  }

  return (
    <div
      className={cn("prose prose-gray dark:prose-invert max-w-none")}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  )
}
