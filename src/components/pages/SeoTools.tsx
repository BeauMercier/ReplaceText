import { useState } from 'react'
import {
  ChartBarIcon,
  DocumentMagnifyingGlassIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline'

interface KeywordData {
  keyword: string
  volume: number
  difficulty: number
  position: number
  change: number
}

const SeoTools = () => {
  const [activeClient] = useState('Acme Plumbing')
  const [keywords] = useState<KeywordData[]>([
    {
      keyword: 'emergency plumber austin',
      volume: 1200,
      difficulty: 45,
      position: 3,
      change: 2,
    },
    {
      keyword: 'plumbing services near me',
      volume: 2500,
      difficulty: 65,
      position: 5,
      change: -1,
    },
    // Add more mock keyword data as needed
  ])

  const tools = [
    {
      name: 'Competitor Analysis',
      description: 'Analyze competitor rankings and content',
      icon: ChartBarIcon,
      action: 'Analyze Competitors',
    },
    {
      name: 'Content Audit',
      description: 'Audit existing content performance',
      icon: DocumentMagnifyingGlassIcon,
      action: 'Start Audit',
    },
    {
      name: 'Site Analysis',
      description: 'Technical SEO and site performance',
      icon: GlobeAltIcon,
      action: 'Analyze Site',
    },
  ]

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">SEO Tools</h1>
          <p className="mt-1 text-sm text-gray-500">
            Currently viewing: {activeClient}
          </p>
        </div>
      </div>

      {/* SEO Tools Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tools.map((tool) => (
          <div
            key={tool.name}
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex-shrink-0">
                <tool.icon className="h-3 w-3 text-indigo-600" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-900">{tool.name}</h3>
              <p className="mt-1 text-xs text-gray-500">{tool.description}</p>
              <button className="mt-3 inline-flex items-center px-3 py-1.5 border border-indigo-600 text-xs font-medium rounded-md text-indigo-600 hover:bg-indigo-50">
                {tool.action}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Keyword Rankings */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Tracked Keywords
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Keyword
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Search Volume
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Difficulty
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Position
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Change
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {keywords.map((keyword) => (
                <tr key={keyword.keyword} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {keyword.keyword}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {keyword.volume.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-indigo-600 h-1.5 rounded-full"
                        style={{ width: `${keyword.difficulty}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 mt-1">
                      {keyword.difficulty}/100
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      #{keyword.position}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center text-sm ${
                      keyword.change > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {keyword.change > 0 ? '+' : ''}{keyword.change}
                    </span>
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

export default SeoTools 