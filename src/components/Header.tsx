import { Plane, Moon, Sun, Building2 } from 'lucide-react';
import { useApp } from '../hooks/useApp';
import { organizations } from '../data/organizations';

const Header = () => {
  const { selectedOrganization, setSelectedOrganization, isDarkMode, toggleDarkMode } = useApp();

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 sm:h-16 gap-4 sm:gap-0">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Plane className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Aviation AI
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Safety Analysis Platform
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-6 w-full sm:w-auto">
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <div className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Building2 className="h-4 w-4" />
                <label htmlFor="organization-select">Organização:</label>
              </div>
              <select
                id="organization-select"
                value={selectedOrganization?.id || ''}
                onChange={(e) => {
                  const org = organizations.find(o => o.id === e.target.value);
                  if (org) setSelectedOrganization(org);
                }}
                className="block w-full sm:w-56 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm transition-all duration-200 hover:border-blue-400 dark:hover:border-blue-500"
              >
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={toggleDarkMode}
              className="self-end sm:self-auto p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105"
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5 text-yellow-500" />
              ) : (
                <Moon className="h-5 w-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
