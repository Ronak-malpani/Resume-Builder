import React, { useState } from 'react'
import { Plus, Trash2, Sparkles, Loader2 } from 'lucide-react' // Removed LinkIcon
import api from '../configs/api'

const ProjectForm = ({ data, onChange }) => {
  const [loadingIndex, setLoadingIndex] = useState(null)

  const addProject = () => {
    
    const newProject = { name: '', type: '', description: '' } 
    onChange([...data, newProject])
  }

  const removeProject = (index) => {
    const updated = data.filter((_, i) => i !== index)
    onChange(updated)
  }

  const updateProject = (index, field, value) => {
    const updated = [...data]
    updated[index] = { ...updated[index], [field]: value }
    onChange(updated)
  }

  const handleEnhance = async (index, content) => {
    if (!content) return
    try {
      setLoadingIndex(index)
      const token = localStorage.getItem('token')
      const res = await api.post(
        '/api/ai/enhance-project-desc',
        { userContent: content },
        { headers: { Authorization: token } }
      )
      if (res.data?.enhancedContent) {
        updateProject(index, 'description', res.data.enhancedContent)
      }
    } catch (error) {
      console.error('Enhancement failed:', error.response?.data?.message || error.message)
    } finally {
      setLoadingIndex(null)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">Projects</h3>
          <p className="text-sm text-gray-500">Add your Projects</p>
        </div>
        <button
          onClick={addProject}
          className="flex items-center gap-2 px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
        >
          <Plus className="size-4" /> Add Project
        </button>
      </div>

      <div className="space-y-4 mt-6">
        {data.map((project, index) => (
          <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-3 bg-white shadow-sm">
            <div className="flex justify-between items-start">
              <h4 className="font-medium text-gray-900">Project #{index + 1}</h4>
              <button
                onClick={() => removeProject(index)}
                className="text-gray-400 hover:text-red-600 transition-colors"
              >
                <Trash2 className="size-4" />
              </button>
            </div>

            <div className="grid gap-3">
              <div className="grid grid-cols-2 gap-3">
                <input
                  value={project.name || ''}
                  onChange={(e) => updateProject(index, 'name', e.target.value)}
                  type="text"
                  placeholder="Project Name"
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none"
                />
                <input
                  value={project.type || ''}
                  onChange={(e) => updateProject(index, 'type', e.target.value)}
                  type="text"
                  placeholder="Project Type"
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none"
                />
              </div>

              <div className="relative">
                <textarea
                  rows={4}
                  value={project.description || ''}
                  onChange={(e) => updateProject(index, 'description', e.target.value)}
                  placeholder="Describe your project..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none resize-none whitespace-pre-wrap"
                />
                <button
                  type="button"
                  onClick={() => handleEnhance(index, project.description)}
                  disabled={loadingIndex === index || !project.description}
                  className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 text-[10px] bg-purple-100 text-purple-700 rounded hover:bg-purple-200 disabled:opacity-50 transition-colors"
                >
                  {loadingIndex === index ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    <Sparkles className="size-3" />
                  )}
                  AI Enhance
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProjectForm