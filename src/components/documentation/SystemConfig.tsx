
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings, CreditCard, Shield, Globe } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export const SystemConfig: React.FC = () => {
  const { data: checkoutSettings, isLoading } = useQuery({
    queryKey: ['checkout-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('checkout_settings')
        .select('*')
        .order('type');
      
      if (error) {
        console.error('Error fetching checkout settings:', error);
        return [];
      }
      return data || [];
    }
  });

  const categories = [
    'Instrumentos Musicais',
    'Eletrônicos',
    'Vestuário',
    'Casa e Decoração',
    'Livros',
    'Esportes',
    'Outros'
  ];

  const systemConfigs = [
    {
      category: 'Marketplace',
      icon: Globe,
      settings: [
        { name: 'Categorias Ativas', value: categories.length, type: 'number' },
        { name: 'Moderação Automática', value: 'Ativada', type: 'status' },
        { name: 'Upload de Imagens', value: 'Permitido', type: 'status' },
        { name: 'Limite por Anúncio', value: '5 imagens', type: 'text' }
      ]
    },
    {
      category: 'Segurança',
      icon: Shield,
      settings: [
        { name: 'Autenticação', value: 'JWT + RLS', type: 'text' },
        { name: 'Timeout da Sessão', value: '24 horas', type: 'text' },
        { name: 'Rate Limiting', value: 'Ativo', type: 'status' },
        { name: 'HTTPS', value: 'Obrigatório', type: 'status' }
      ]
    },
    {
      category: 'Créditos',
      icon: CreditCard,
      settings: [
        { name: 'Custo por Anúncio', value: '1 crédito', type: 'text' },
        { name: 'Créditos Manuais', value: 'Habilitado', type: 'status' },
        { name: 'Limite Mínimo', value: '10 créditos', type: 'text' },
        { name: 'Validade', value: 'Sem limite', type: 'text' }
      ]
    }
  ];

  const getPaymentMethodName = (type: string) => {
    switch (type) {
      case 'credit_card':
        return 'Cartão de Crédito';
      case 'pix':
        return 'PIX';
      case 'manual':
        return 'Pagamento Manual';
      default:
        return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações do Sistema
          </CardTitle>
          <CardDescription>
            Configurações atuais e parâmetros do sistema
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {systemConfigs.map((config, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <config.icon className="h-5 w-5" />
                {config.category}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {config.settings.map((setting, settingIndex) => (
                <div key={settingIndex} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{setting.name}</span>
                  {setting.type === 'status' ? (
                    <Badge 
                      variant="default" 
                      className={
                        String(setting.value).includes('Ativ') || String(setting.value).includes('Permit') || String(setting.value).includes('Obrig')
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }
                    >
                      {setting.value}
                    </Badge>
                  ) : setting.type === 'number' ? (
                    <Badge variant="outline">{setting.value}</Badge>
                  ) : (
                    <span className="text-sm text-muted-foreground">{setting.value}</span>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Métodos de Checkout</CardTitle>
          <CardDescription>Configurações dos métodos de pagamento disponíveis</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          ) : checkoutSettings && checkoutSettings.length > 0 ? (
            <div className="space-y-3">
              {checkoutSettings.map((setting) => (
                <div key={setting.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    <span className="font-medium">
                      {getPaymentMethodName(setting.type)}
                    </span>
                  </div>
                  <Badge 
                    variant={setting.enabled ? 'default' : 'secondary'}
                    className={setting.enabled ? 'bg-green-100 text-green-800' : ''}
                  >
                    {setting.enabled ? 'Habilitado' : 'Desabilitado'}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              Nenhuma configuração de checkout encontrada
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Categorias do Marketplace</CardTitle>
          <CardDescription>Categorias disponíveis para classificação de anúncios</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {categories.map((category, index) => (
              <Badge key={index} variant="outline" className="px-3 py-1">
                {category}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
