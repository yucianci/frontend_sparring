import { Users, Clock, Plane, Shield } from 'lucide-react';
import { useApp } from '../hooks/useApp';

const OrganizationCards = () => {
  const { selectedOrganization } = useApp();

  if (!selectedOrganization) return null;

  const securityStandards = Object.keys(selectedOrganization.securityObs || {});
  const totalSecurityItems = securityStandards.reduce((count, standard) => {
    const items = selectedOrganization.securityObs[standard] || [];
    return count + items.length;
  }, 0);

  const cards = [
    {
      title: 'Pilotos',
      value: selectedOrganization.pilots.toString(),
      icon: Users,
      color: 'blue',
    },
    {
      title: 'Horas de Voo (Totais)',
      value: `${selectedOrganization.flightHours.toLocaleString()}h`,
      icon: Clock,
      color: 'green',
    },
    {
      title: 'Dirigíveis / Aeronaves',
      value: `${selectedOrganization.airships} unidades`,
      icon: Plane,
      color: 'purple',
    },
    {
      title: 'Padrões de Segurança',
      value: securityStandards.length.toString(),
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
          {securityStandards.length > 0 ? (
            <ul className="space-y-3">
              {securityStandards.map((standard) => {
                const checklistItems = selectedOrganization.securityObs[standard] || [];

                return (
                  <li key={standard} className="text-gray-700 dark:text-gray-300">
                    <div className="flex items-center space-x-2 mb-1">
                      <Shield className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">{standard}</span>
                    </div>
                    {checklistItems.length > 0 && (
                      <ul className="ml-6 list-disc space-y-1 text-sm opacity-90">
                        {checklistItems.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Nenhum padrão de segurança cadastrado.
            </p>
          )}
          {totalSecurityItems > 0 && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
              Total de itens monitorados: {totalSecurityItems}
            </p>
          )}
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
            Observações
          </h3>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {selectedOrganization.generalObs}
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrganizationCards;
