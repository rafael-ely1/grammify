import React, { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../stores/auth'
import { useDocumentsStore } from '../stores/documents'
import { TextEditor } from '../components/Editor/TextEditor'

export function Dashboard() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const signOut = useAuthStore((state) => state.signOut)
  const {
    documents,
    currentDocument,
    loading,
    error,
    fetchDocuments,
    createDocument,
    setCurrentDocument,
    deleteDocument,
  } = useDocumentsStore()

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    fetchDocuments()
  }, [user, navigate, fetchDocuments])

  const handleNewDocument = async () => {
    try {
      const doc = await createDocument()
      setCurrentDocument(doc)
    } catch (error) {
      console.error('Error creating document:', error)
    }
  }

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Navigation Header */}
      <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
        <div className="flex items-center gap-8">
          <h1 className="text-xl font-semibold text-teal-600">Grammify</h1>
          <nav className="flex gap-4">
            <Link
              to="/dashboard"
              className="text-sm font-medium text-gray-700 hover:text-teal-600"
            >
              Documents
            </Link>
            <Link
              to="/settings"
              className="text-sm font-medium text-gray-700 hover:text-teal-600"
            >
              Settings
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{user?.email}</span>
          <button
            onClick={() => signOut()}
            className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 border-r border-gray-200 bg-white">
          <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
            <h2 className="text-sm font-medium text-gray-700">My Documents</h2>
            <button
              onClick={handleNewDocument}
              className="rounded-lg bg-teal-600 px-3 py-2 text-sm font-medium text-white hover:bg-teal-700"
            >
              New
            </button>
          </div>
          <div className="p-4">
            {loading ? (
              <div className="text-sm text-gray-500">Loading documents...</div>
            ) : error ? (
              <div className="text-sm text-red-500">{error.message}</div>
            ) : documents.length === 0 ? (
              <div className="text-sm text-gray-500">No documents yet</div>
            ) : (
              <ul className="space-y-2">
                {documents.map((doc) => (
                  <li
                    key={doc.id}
                    className={`cursor-pointer rounded-lg p-2 text-sm ${
                      currentDocument?.id === doc.id
                        ? 'bg-teal-50 text-teal-700'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setCurrentDocument(doc)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate font-medium">
                        {doc.title || 'Untitled'}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteDocument(doc.id)
                        }}
                        className="ml-2 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                      >
                        Delete
                      </button>
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      {new Date(doc.updated_at).toLocaleDateString()}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 overflow-auto p-8">
          {currentDocument ? (
            <TextEditor
              initialContent={currentDocument.content}
              documentId={currentDocument.id}
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <h2 className="mb-2 text-xl font-medium text-gray-700">
                  Welcome to Grammify
                </h2>
                <p className="mb-4 text-gray-500">
                  Create a new document or select one from the sidebar to get started
                </p>
                <button
                  onClick={handleNewDocument}
                  className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
                >
                  Create Document
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 