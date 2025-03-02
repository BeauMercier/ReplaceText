import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

interface NavbarProps {
  onMenuClick: () => void
}

const Navbar = ({ onMenuClick }: NavbarProps) => {
  const [notifications] = useState(3) // Example notification count
  const location = useLocation()
  
  // Function to get the current page title based on the path
  const getPageTitle = () => {
    const path = location.pathname
    if (path === '/') return 'Dashboard'
    if (path === '/clients') return 'Clients'
    if (path === '/content') return 'Content Manager'
    if (path === '/seo-tools') return 'SEO Tools'
    if (path === '/analytics') return 'Analytics'
    return 'DrasticDigital'
  }

  // Mock client data - in a real app, this would come from your state or API
  const clients = [
    { id: 1, name: 'Acme Corp' },
    { id: 2, name: 'Globex Industries' },
    { id: 3, name: 'Stark Enterprises' },
    { id: 4, name: 'Wayne Industries' },
  ]

  const navigation = [
    { name: 'Dashboard', href: '/' },
    { name: 'Clients', href: '/clients' },
    { name: 'Content Manager', href: '/content' },
    { name: 'SEO Tools', href: '/seo-tools' },
    { name: 'Analytics', href: '/analytics' },
  ]

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Toggle sidebar"
          >
            Menu
          </button>

          <h1 className="text-xl font-semibold text-gray-800 hidden md:block">
            {getPageTitle()}
          </h1>
        </div>

        <div className="flex-1 max-w-xs mx-4">
          <div className="relative">
            <select 
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
              defaultValue=""
            >
              <option value="" disabled>Select Client</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button 
            className="relative px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={`${notifications} notifications`}
          >
            Notifications
            {notifications > 0 && (
              <span className="ml-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                {notifications}
              </span>
            )}
          </button>

          <div className="flex items-center">
            <button className="flex items-center space-x-2 text-sm text-gray-700 hover:text-blue-600 focus:outline-none">
              <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-medium">
                AD
              </div>
              <span className="font-medium hidden md:block">Admin</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-center space-x-4 mt-3">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`text-sm font-medium ${
                isActive ? 'text-blue-600' : 'text-gray-600 hover:text-blue-500'
              }`}
            >
              {item.name}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default Navbar 