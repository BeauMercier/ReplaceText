import { useState } from 'react'
import {
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  UserIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline'

interface AnalyticMetric {
  name: string
  value: string
  change: string
  changeType: 'increase' | 'decrease'
  icon: any
}

interface PageAnalytics {
  page: string
  views: number
  uniqueVisitors: number
  avgTimeOnPage: string
  bounceRate: string
}

const Analytics = () => {
  const [timeframe, setTimeframe] = useState('7d')
  
  const metrics: AnalyticMetric[] = [
    {
      name: 'Total Page Views',
      value: '45,232',
      change: '+12.3%',
      changeType: 'increase',
      icon: EyeIcon,
    },
    {
      name: 'Unique Visitors',
      value: '21,091',
      change: '+8.1%',
      changeType: 'increase',
      icon: UserIcon,
    },
    {
      name: 'Avg. Time on Site',
      value: '2m 45s',
      change: '-5.2%',
      changeType: 'decrease',
      icon: ClockIcon,
    },
    {
      name: 'Conversion Rate',
      value: '3.2%',
      change: '+0.8%',
      changeType: 'increase',
      icon: ArrowTrendingUpIcon,
    },
  ]

  const pageAnalytics: PageAnalytics[] = [
    {
      page: '/plumbing-services-austin',
      views: 12500,
      uniqueVisitors: 8900,
      avgTimeOnPage: '2:15',
      bounceRate: '35%',
    },
    {
      page: '/emergency-plumber',
      views: 8300,
      uniqueVisitors: 6200,
      avgTimeOnPage: '1:45',
      bounceRate: '42%',
    },
    {
      page: '/blog/plumbing-tips',
      views: 5600,
      uniqueVisitors: 4100,
      avgTimeOnPage: '3:20',
      bounceRate: '28%',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Analytics</h1>
          <p className="mt-1 text-sm text-gray-500">
            Performance metrics and insights
          </p>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex space-x-2">
          {['24h', '7d', '30d', '90d'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeframe(range)}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                timeframe === range
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <div
            key={metric.name}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex-shrink-0">
                <metric.icon className="h-3 w-3 text-gray-400" />
              </div>
              <div className={`ml-2 text-sm font-medium ${
                metric.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
              }`}>
                {metric.change}
                {metric.changeType === 'increase' ? (
                  <ArrowUpIcon className="inline h-4 w-4 ml-1" />
                ) : (
                  <ArrowDownIcon className="inline h-4 w-4 ml-1" />
                )}
              </div>
            </div>
            <div className="mt-2">
              <h3 className="text-sm font-medium text-gray-500">{metric.name}</h3>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {metric.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Page Analytics Table */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Top Performing Pages
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Page
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Views
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unique Visitors
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg. Time on Page
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bounce Rate
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pageAnalytics.map((page) => (
                <tr key={page.page} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-indigo-600">
                      {page.page}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {page.views.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {page.uniqueVisitors.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {page.avgTimeOnPage}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {page.bounceRate}
                    </div>
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

export default Analytics 