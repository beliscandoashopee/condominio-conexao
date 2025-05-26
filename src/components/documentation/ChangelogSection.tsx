
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { History, Plus, Settings, Bug, Zap } from 'lucide-react';

export const ChangelogSection: React.FC = () => {
  const changelog = [
    {
      version: '1.2.0',
      date: '2024-12-26',
      type: 'feature',
      changes: [
        {
          type: 'feature',
          icon: Plus,
          title: 'Página de Documentação',
          description: 'Adicionada página de documentação dinâmica com estatísticas em tempo real'
        },
        {
          type: 'feature',
          icon: Plus,
          title: 'Solicitação Manual de Créditos',
          description: 'Implementado sistema de solicitação manual de créditos'
        },
        {
          type: 'improvement',
          icon: Zap,
          title: 'Melhorias na Interface',
          description: 'Aprimoramentos na experiência do usuário e responsividade'
        }
      ]
    },
    {
      version: '1.1.0',
      date: '2024-12-20',
      type: 'feature',
      changes: [
        {
          type: 'feature',
          icon: Plus,
          title: 'Sistema de Créditos',
          description: 'Implementado sistema completo de créditos para publicação de anúncios'
        },
        {
          type: 'feature',
          icon: Plus,
          title: 'Painel Administrativo',
          description: 'Criado painel administrativo para gerenciamento do sistema'
        },
        {
          type: 'feature',
          icon: Settings,
          title: 'Configurações de Checkout',
          description: 'Adicionadas configurações flexíveis para métodos de pagamento'
        }
      ]
    },
    {
      version: '1.0.0',
      date: '2024-12-15',
      type: 'release',
      changes: [
        {
          type: 'feature',
          icon: Plus,
          title: 'Lançamento Inicial',
          description: 'Marketplace funcional com sistema de anúncios'
        },
        {
          type: 'feature',
          icon: Plus,
          title: 'Autenticação',
          description: 'Sistema de autenticação e perfis de usuário'
        },
        {
          type: 'feature',
          icon: Plus,
          title: 'Sistema de Mensagens',
          description: 'Comunicação entre usuários interessados em anúncios'
        }
      ]
    }
  ];

  const getVersionBadgeColor = (type: string) => {
    switch (type) {
      case 'release':
        return 'bg-blue-100 text-blue-800';
      case 'feature':
        return 'bg-green-100 text-green-800';
      case 'fix':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getChangeIcon = (type: string) => {
    switch (type) {
      case 'feature':
        return Plus;
      case 'improvement':
        return Zap;
      case 'fix':
        return Bug;
      default:
        return Settings;
    }
  };

  const getChangeColor = (type: string) => {
    switch (type) {
      case 'feature':
        return 'text-green-600';
      case 'improvement':
        return 'text-blue-600';
      case 'fix':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Histórico de Mudanças
          </CardTitle>
          <CardDescription>
            Registro completo de atualizações, melhorias e correções do sistema
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="space-y-6">
        {changelog.map((release, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <span>Versão {release.version}</span>
                  <Badge className={getVersionBadgeColor(release.type)}>
                    {release.type === 'release' ? 'Release' : 
                     release.type === 'feature' ? 'Funcionalidades' : 'Correções'}
                  </Badge>
                </CardTitle>
                <span className="text-sm text-muted-foreground">
                  {new Date(release.date).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {release.changes.map((change, changeIndex) => {
                  const IconComponent = getChangeIcon(change.type);
                  return (
                    <div key={changeIndex} className="flex items-start gap-3 p-3 border rounded-lg">
                      <IconComponent className={`h-5 w-5 mt-0.5 ${getChangeColor(change.type)}`} />
                      <div className="flex-1">
                        <h4 className="font-medium mb-1">{change.title}</h4>
                        <p className="text-sm text-muted-foreground">{change.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Próximas Atualizações</CardTitle>
          <CardDescription>Funcionalidades planejadas para as próximas versões</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 border rounded-lg border-dashed">
              <Plus className="h-5 w-5 mt-0.5 text-orange-600" />
              <div>
                <h4 className="font-medium">Sistema de Avaliações</h4>
                <p className="text-sm text-muted-foreground">
                  Permitir que usuários avaliem vendedores e produtos
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 border rounded-lg border-dashed">
              <Plus className="h-5 w-5 mt-0.5 text-orange-600" />
              <div>
                <h4 className="font-medium">Chat em Tempo Real</h4>
                <p className="text-sm text-muted-foreground">
                  Implementar sistema de chat instantâneo entre usuários
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 border rounded-lg border-dashed">
              <Plus className="h-5 w-5 mt-0.5 text-orange-600" />
              <div>
                <h4 className="font-medium">Integração com Pagamentos</h4>
                <p className="text-sm text-muted-foreground">
                  Adicionar processamento automático de pagamentos via PIX
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
