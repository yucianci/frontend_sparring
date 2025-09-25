import React from 'react';
import { Users, Clock, Plane, Shield } from 'lucide-react';
import { useApp } from '../context/AppContext';

const OrganizationCards: React.FC = () => {
  const { selectedOrganization } = useApp();

  if (!selectedOrganization) return null;

  const cards = [
    {
      title: 'Pilotos',
      value: selectedOrganization.pilots.toString(),
      icon: Users,
      color: 'blue',
    },
    {
      title: 'Horas de Voo (Média)',
      value: `${selectedOrganization.averageFlightHours.toLocaleString()}h`,
      icon: Clock,
      color: 'green',
    },
    {
      title: 'Frota',
      value: `${selectedOrganization.fleet} aeronaves`,
      icon: Plane,
      color: 'purple',
    },
    {
      title: 'Padrões de Segurança',
      value: selectedOrganization.safetyStandards.length.toString(),
      icon: Shield,
      color: 'orange',
    },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
      green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800',
      purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800',
      orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800',
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {selectedOrganization.name}
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className={`p-4 rounded-lg border ${getColorClasses(card.color)}`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                <Icon className="h-8 w-8" />
                <div>
                  <p className="text-sm font-medium opacity-80">{card.title}</p>
                  <p className="text-lg font-bold">{card.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
            Padrões de Segurança
          </h3>
          <ul className="space-y-2">
            {selectedOrganization.safetyStandards.map((standard, index) => (
              <li
                key={index}
                className="flex items-center space-x-2 text-gray-700 dark:text-gray-300"
              >
                <Shield className="h-4 w-4 text-blue-500" />
                <span>{standard}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
            Observações
          </h3>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {selectedOrganization.observations}
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrganizationCards;