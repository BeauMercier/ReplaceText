import { Link, useLocation } from 'react-router-dom'

interface SidebarProps {
  isOpen: boolean
}

const Sidebar = ({ isOpen }: SidebarProps) => {
  const location = useLocation()
  
  const navigation = [
    { name: 'Dashboard', href: '/' },
    { name: 'Clients', href: '/clients' },
    { name: 'Content Manager', href: '/content' },
    { name: 'SEO Tools', href: '/seo-tools' },
    { name: 'Analytics', href: '/analytics' },
  ]

  return (
    <div className={`${isOpen ? 'w-64' : 'w-20'} transition-all duration-300 bg-blue-800 text-white flex flex-col h-full`}>
      <div className="flex items-center justify-center py-6 border-b border-blue-700">
        {isOpen ? (
          <h1 className="text-xl font-bold">DrasticDigital</h1>
        ) : (
          <span className="text-xl font-bold">DD</span>
        )}
      </div>

      <nav className="flex-1 py-4 px-3">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={`flex items-center justify-${isOpen ? 'start' : 'center'} py-3 px-4 rounded-md transition-colors ${
                    isActive
                      ? 'bg-blue-700 text-white font-medium'
                      : 'text-blue-200 hover:bg-blue-700 hover:text-white'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {isOpen ? (
                    <span className="text-sm">{item.name}</span>
                  ) : (
                    <span className="text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full bg-blue-700">
                      {item.name.charAt(0)}
                    </span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="mt-auto border-t border-blue-700 py-4 px-3">
        {isOpen ? (
          <p className="text-xs text-blue-300 text-center">
            © 2024 DrasticDigital
          </p>
        ) : (
          <p className="text-xs text-blue-300 text-center">©</p>
        )}
      </div>
    </div>
  )
}

export default Sidebar 