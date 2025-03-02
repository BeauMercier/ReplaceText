import { useState } from 'react'
import {
  DocumentTextIcon,
  BuildingOfficeIcon,
  PlusIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'

interface ContentItem {
  id: string
  title: string
  type: 'city-page' | 'blog-post'
  status: 'draft' | 'published' | 'in-review'
  client: string
  lastModified: string
}

const ContentManager = () => {
  const [activeTab, setActiveTab] = useState<'city-pages' | 'blog-posts'>('city-pages')
  const [contentItems] = useState<ContentItem[]>([
    {
      id: '1',
      title: 'Plumbing Services in Austin',
      type: 'city-page',
      status: 'published',
      client: 'Acme Plumbing',
      lastModified: '2024-03-01',
    },
    {
      id: '2',
      title: '10 Essential Plumbing Maintenance Tips',
      type: 'blog-post',
      status: 'draft',
      client: 'Acme Plumbing',
      lastModified: '2024-02-28',
    },
    // Add more mock content items as needed
  ])

  const filteredContent = contentItems.filter(
    (item) => item.type === (activeTab === 'city-pages' ? 'city-page' : 'blog-post')
  )

  const getStatusColor = (status: ContentItem['status']) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800'
      case 'draft':
        return 'bg-yellow-100 text-yellow-800'
      case 'in-review':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Content Manager</h1>
        <button className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
          <PlusIcon className="h-3 w-3 mr-2" />
          Create New Content
        </button>
      </div>

      {/* Content Type Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('city-pages')}
            className={`${
              activeTab === 'city-pages'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            <BuildingOfficeIcon className="h-3 w-3 mr-2" />
            City Pages
          </button>
          <button
            onClick={() => setActiveTab('blog-posts')}
            className={`${
              activeTab === 'blog-posts'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            <DocumentTextIcon className="h-3 w-3 mr-2" />
            Blog Posts
          </button>
        </nav>
      </div>

      {/* Content List */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Modified
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredContent.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {item.title}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{item.client}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.lastModified}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-indigo-600 hover:text-indigo-900 mr-4">
                      Edit
                    </button>
                    <button className="text-gray-600 hover:text-gray-900">
                      <ArrowPathIcon className="h-3 w-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default ContentManager 