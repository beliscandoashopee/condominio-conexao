
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, CreditCard, Clock, TrendingUp } from 'lucide-react';

interface StatsOverviewProps {
  stats?: {
    totalUsers: number;
    totalCredits: number;
    pendingRequests: number;
    systemUptime: string;
  };
  isLoading: boolean;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ stats, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total de Usuários',
      value: stats?.totalUsers || 0,
      icon: Users,
      description: 'Usuários registrados no sistema',
      color: 'text-blue-600'
    },
    {
      title: 'Créditos Comprados',
      value: stats?.totalCredits || 0,
      icon: CreditCard,
      description: 'Total de créditos adquiridos',
      color: 'text-green-600'
    },
    {
      title: 'Solicitações Pendentes',
      value: stats?.pendingRequests || 0,
      icon: Clock,
      description: 'Créditos manuais pendentes',
      color: 'text-orange-600'
    },
    {
      title: 'Uptime do Sistema',
      value: stats?.systemUptime || '0%',
      icon: TrendingUp,
      description: 'Disponibilidade do sistema',
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Sistema</CardTitle>
          <CardDescription>Status atual e configurações principais</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Status do Sistema</span>
            <Badge variant="default" className="bg-green-100 text-green-800">
              Online
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Versão da API</span>
            <Badge variant="outline">v1.0.0</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Última Atualização</span>
            <span className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString('pt-BR')}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
