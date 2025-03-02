import React from 'react';
import {
  HomeIcon,
  UsersIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CogIcon,
  NewspaperIcon
} from '@heroicons/react/24/outline';

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, onNavigate }) => {
  const navigation = [
    { name: 'Dashboard', icon: HomeIcon, id: 'dashboard' },
    { name: 'Clients', icon: UsersIcon, id: 'clients' },
    { name: 'Content Manager', icon: DocumentTextIcon, id: 'content' },
    { name: 'Blog Manager', icon: NewspaperIcon, id: 'blog' },
    { name: 'SEO Tools', icon: CogIcon, id: 'seo' },
    { name: 'Analytics', icon: ChartBarIcon, id: 'analytics' },
  ];

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white w-64">
      <div className="p-4 border-b border-gray-800">
        <h1 className="text-xl font-bold">Drastic Digital</h1>
      </div>
      <nav className="flex-1 mt-5 px-2 space-y-1">
        {navigation.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`
              flex items-center px-3 py-2 text-sm font-medium rounded-md w-full
              ${activePage === item.id 
                ? 'bg-gray-800 text-white' 
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'}
            `}
          >
            <item.icon className="mr-3 h-5 w-5" aria-hidden="true" />
            {item.name}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;