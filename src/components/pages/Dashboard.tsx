import { useState } from 'react'
import { Link } from 'react-router-dom'

const Dashboard = () => {
  const [activeClient, setActiveClient] = useState('All Clients')
  
  const stats = [
    {
      name: 'Active Clients',
      value: '12',
      change: '+2',
      changeType: 'increase',
    },
    {
      name: 'Content Pieces',
      value: '89',
      change: '+12',
      changeType: 'increase',
    },
    {
      name: 'SEO Rankings',
      value: '67%',
      change: '+5%',
      changeType: 'increase',
    },
    {
      name: 'Keywords Tracked',
      value: '1,234',
      change: '+123',
      changeType: 'increase',
    },
  ]

  const recentActivity = [
    {
      id: 1,
      client: 'Acme Corp',
      action: 'City page created',
      date: '2 hours ago',
    },
    {
      id: 2,
      client: 'TechStart Inc',
      action: 'Blog post optimized',
      date: '4 hours ago',
    },
    {
      id: 3,
      client: 'Global Services',
      action: 'SEO audit completed',
      date: '1 day ago',
    },
    {
      id: 4,
      client: 'Acme Corp',
      action: 'Keyword research updated',
      date: '1 day ago',
    },
    {
      id: 5,
      client: 'Local Plumbers',
      action: 'New client added',
      date: '2 days ago',
    },
  ]

  const quickActions = [
    {
      name: 'Create Content',
      description: 'Generate city pages or blog posts',
      path: '/content',
    },
    {
      name: 'SEO Analysis',
      description: 'Check rankings and performance',
      path: '/seo-tools',
    },
    {
      name: 'Add Client',
      description: 'Create a new client profile',
      path: '/clients',
    },
    {
      name: 'View Analytics',
      description: 'See performance metrics',
      path: '/analytics',
    },
  ]

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Welcome Section */}
      <section className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome to your Dashboard</h1>
            <p className="mt-1 text-gray-600">
              Overview of your digital marketing performance
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <select 
              value={activeClient}
              onChange={(e) => setActiveClient(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-700 text-sm"
            >
              <option value="All Clients">All Clients</option>
              <option value="Acme Corp">Acme Corp</option>
              <option value="TechStart Inc">TechStart Inc</option>
              <option value="Global Services">Global Services</option>
            </select>
            
            <Link 
              to="/clients" 
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              Add New Client
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white p-6 rounded-lg shadow-md border border-gray-200"
          >
            <h3 className="text-sm font-medium text-gray-500">{stat.name}</h3>
            <div className="mt-2 flex items-baseline">
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <span className={`ml-2 text-sm font-medium ${
                stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </section>

      {/* Quick Actions */}
      <section className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action) => (
            <Link 
              key={action.name}
              to={action.path}
              className="block p-4 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
            >
              <h3 className="font-medium text-gray-900">{action.name}</h3>
              <p className="mt-1 text-sm text-gray-600">{action.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Activity */}
      <section className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
          <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            View All
          </button>
        </div>
        
        <div className="divide-y divide-gray-200">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="py-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-900">{activity.client}</span>
                <span className="text-xs text-gray-500">{activity.date}</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{activity.action}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Content Performance */}
      <section className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Content Performance</h2>
            <p className="text-sm text-gray-600">Track how your content is performing</p>
          </div>
          
          <select className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-700 text-sm">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
          </select>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Top Performing</h3>
                <p className="text-xl font-bold mt-1">Home Services</p>
              </div>
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">+24%</span>
            </div>
            <div className="mt-2 text-xs text-gray-600">
              <p>12,345 impressions</p>
              <p className="mt-1">4.8% conversion rate</p>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Most Improved</h3>
                <p className="text-xl font-bold mt-1">Plumbing Services</p>
              </div>
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">+45%</span>
            </div>
            <div className="mt-2 text-xs text-gray-600">
              <p>8,765 impressions</p>
              <p className="mt-1">3.2% conversion rate</p>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Needs Attention</h3>
                <p className="text-xl font-bold mt-1">About Us</p>
              </div>
              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">-12%</span>
            </div>
            <div className="mt-2 text-xs text-gray-600">
              <p>3,421 impressions</p>
              <p className="mt-1">High bounce rate (78%)</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Dashboard 