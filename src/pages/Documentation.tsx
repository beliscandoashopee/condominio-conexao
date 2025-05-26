
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { RefreshCw, Database, Code, Settings, Activity, History } from 'lucide-react';
import { StatsOverview } from '@/components/documentation/StatsOverview';
import { DatabaseSchema } from '@/components/documentation/DatabaseSchema';
import { TechStack } from '@/components/documentation/TechStack';
import { SystemConfig } from '@/components/documentation/SystemConfig';
import { ChangelogSection } from '@/components/documentation/ChangelogSection';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

const Documentation = () => {
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Query para buscar estatísticas em tempo real
  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ['documentation-stats'],
    queryFn: async () => {
      const [usersResult, creditsResult, requestsResult] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('credit_transactions').select('amount').eq('type', 'purchase'),
        supabase.from('manual_credit_requests').select('id', { count: 'exact' })
      ]);

      const totalCredits = creditsResult.data?.reduce((sum, transaction) => sum + transaction.amount, 0) || 0;

      return {
        totalUsers: usersResult.count || 0,
        totalCredits,
        pendingRequests: requestsResult.count || 0,
        systemUptime: '99.9%'
      };
    },
    refetchInterval: 30000 // Atualiza a cada 30 segundos
  });

  const handleRefresh = () => {
    refetch();
    setLastUpdated(new Date());
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Documentação do Sistema</h1>
            <p className="text-muted-foreground">
              Documentação dinâmica e estatísticas em tempo real do ConexãoCondomínio
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              Última atualização: {lastUpdated.toLocaleTimeString()}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="database" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Banco de Dados
            </TabsTrigger>
            <TabsTrigger value="tech" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              Tecnologias
            </TabsTrigger>
            <TabsTrigger value="config" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configurações
            </TabsTrigger>
            <TabsTrigger value="changelog" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Changelog
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <StatsOverview stats={stats} isLoading={isLoading} />
          </TabsContent>

          <TabsContent value="database">
            <DatabaseSchema />
          </TabsContent>

          <TabsContent value="tech">
            <TechStack />
          </TabsContent>

          <TabsContent value="config">
            <SystemConfig />
          </TabsContent>

          <TabsContent value="changelog">
            <ChangelogSection />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Documentation;
