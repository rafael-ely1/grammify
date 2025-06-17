import React, { useState } from 'react'
import { toast } from 'sonner'
import { useAuthStore } from '../stores/auth'

export function Settings() {
  const user = useAuthStore((state) => state.user)
  const [settings, setSettings] = useState({
    checkGrammar: true,
    checkSpelling: true,
    checkStyle: true,
    autoSave: true,
    fontSize: 16,
    theme: 'light',
  })

  const handleSaveSettings = async () => {
    try {
      // In a real app, save to Supabase
      toast.success('Settings saved successfully!')
    } catch (error) {
      toast.error('Failed to save settings')
    }
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">Settings</h1>

      <div className="space-y-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        {/* Writing Settings */}
        <div>
          <h2 className="mb-4 text-lg font-medium text-gray-900">Writing</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-700">Grammar Check</label>
              <input
                type="checkbox"
                checked={settings.checkGrammar}
                onChange={(e) =>
                  setSettings({ ...settings, checkGrammar: e.target.checked })
                }
                className="h-4 w-4 rounded border-gray-300 text-teal-600"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-700">Spelling Check</label>
              <input
                type="checkbox"
                checked={settings.checkSpelling}
                onChange={(e) =>
                  setSettings({ ...settings, checkSpelling: e.target.checked })
                }
                className="h-4 w-4 rounded border-gray-300 text-teal-600"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-700">Style Suggestions</label>
              <input
                type="checkbox"
                checked={settings.checkStyle}
                onChange={(e) =>
                  setSettings({ ...settings, checkStyle: e.target.checked })
                }
                className="h-4 w-4 rounded border-gray-300 text-teal-600"
              />
            </div>
          </div>
        </div>

        {/* Editor Settings */}
        <div>
          <h2 className="mb-4 text-lg font-medium text-gray-900">Editor</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-700">Auto Save</label>
              <input
                type="checkbox"
                checked={settings.autoSave}
                onChange={(e) =>
                  setSettings({ ...settings, autoSave: e.target.checked })
                }
                className="h-4 w-4 rounded border-gray-300 text-teal-600"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-700">
                Font Size
              </label>
              <select
                value={settings.fontSize}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    fontSize: parseInt(e.target.value),
                  })
                }
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
              >
                <option value={12}>Small (12px)</option>
                <option value={16}>Medium (16px)</option>
                <option value={20}>Large (20px)</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm text-gray-700">Theme</label>
              <select
                value={settings.theme}
                onChange={(e) =>
                  setSettings({ ...settings, theme: e.target.value })
                }
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
          </div>
        </div>

        {/* Account Info */}
        <div>
          <h2 className="mb-4 text-lg font-medium text-gray-900">Account</h2>
          <div className="rounded-md bg-gray-50 p-4">
            <p className="text-sm text-gray-600">
              Signed in as: {user?.email}
            </p>
          </div>
        </div>

        <div className="pt-4">
          <button
            onClick={handleSaveSettings}
            className="w-full rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  )
} 