
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Code, Globe, Database, Shield, Zap } from 'lucide-react';

export const TechStack: React.FC = () => {
  const technologies = [
    {
      category: 'Frontend',
      icon: Globe,
      color: 'text-blue-600',
      techs: [
        { name: 'React', version: '18.3.1', description: 'Biblioteca para interfaces de usuário' },
        { name: 'TypeScript', version: 'Latest', description: 'Superset tipado do JavaScript' },
        { name: 'Vite', version: 'Latest', description: 'Build tool e dev server' },
        { name: 'Tailwind CSS', version: 'Latest', description: 'Framework CSS utilitário' },
        { name: 'Shadcn/UI', version: 'Latest', description: 'Componentes UI reutilizáveis' },
        { name: 'React Router', version: '6.30.0', description: 'Roteamento para React' },
        { name: 'Framer Motion', version: '12.6.2', description: 'Animações e transições' }
      ]
    },
    {
      category: 'Estado e Dados',
      icon: Database,
      color: 'text-green-600',
      techs: [
        { name: 'TanStack Query', version: '5.71.1', description: 'Gerenciamento de estado de servidor' },
        { name: 'React Hook Form', version: '7.53.0', description: 'Formulários performáticos' },
        { name: 'Zod', version: '3.23.8', description: 'Validação de esquemas TypeScript' }
      ]
    },
    {
      category: 'Backend',
      icon: Shield,
      color: 'text-purple-600',
      techs: [
        { name: 'Supabase', version: 'Latest', description: 'Backend como serviço' },
        { name: 'PostgreSQL', version: 'Latest', description: 'Banco de dados relacional' },
        { name: 'Row Level Security', version: 'Native', description: 'Segurança a nível de linha' },
        { name: 'Edge Functions', version: 'Deno', description: 'Funções serverless' }
      ]
    },
    {
      category: 'UI/UX',
      icon: Zap,
      color: 'text-orange-600',
      techs: [
        { name: 'Lucide React', version: '0.462.0', description: 'Ícones SVG' },
        { name: 'Sonner', version: '1.5.0', description: 'Notificações toast' },
        { name: 'Recharts', version: '2.12.7', description: 'Gráficos e visualizações' },
        { name: 'Radix UI', version: 'Latest', description: 'Primitivos UI acessíveis' }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Stack Tecnológico
          </CardTitle>
          <CardDescription>
            Tecnologias e bibliotecas utilizadas no desenvolvimento do sistema
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {technologies.map((category, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <category.icon className={`h-5 w-5 ${category.color}`} />
                {category.category}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {category.techs.map((tech, techIndex) => (
                <div key={techIndex} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{tech.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {tech.version}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{tech.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Arquitetura do Sistema</CardTitle>
          <CardDescription>Visão geral da arquitetura utilizada</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border rounded-lg">
              <Globe className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h3 className="font-medium mb-1">Frontend SPA</h3>
              <p className="text-sm text-muted-foreground">React + TypeScript</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Database className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <h3 className="font-medium mb-1">Backend BaaS</h3>
              <p className="text-sm text-muted-foreground">Supabase + PostgreSQL</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Shield className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <h3 className="font-medium mb-1">Segurança</h3>
              <p className="text-sm text-muted-foreground">RLS + JWT</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
