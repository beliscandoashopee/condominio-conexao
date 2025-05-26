
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Database, Key, Link } from 'lucide-react';

export const DatabaseSchema: React.FC = () => {
  const tables = [
    {
      name: 'profiles',
      description: 'Perfis dos usuários do sistema',
      columns: [
        { name: 'id', type: 'string', primary: true, description: 'ID único do usuário' },
        { name: 'name', type: 'string', description: 'Nome do usuário' },
        { name: 'email', type: 'string', description: 'Email do usuário' },
        { name: 'apartment', type: 'string', description: 'Número do apartamento' },
        { name: 'block', type: 'string', description: 'Bloco do apartamento' },
        { name: 'role', type: 'enum', description: 'Papel do usuário (user/admin)' },
        { name: 'avatar', type: 'string', description: 'URL do avatar' }
      ]
    },
    {
      name: 'user_credits',
      description: 'Saldo de créditos dos usuários',
      columns: [
        { name: 'id', type: 'string', primary: true, description: 'ID único' },
        { name: 'user_id', type: 'string', foreign: true, description: 'ID do usuário' },
        { name: 'balance', type: 'number', description: 'Saldo atual de créditos' }
      ]
    },
    {
      name: 'credit_transactions',
      description: 'Histórico de transações de créditos',
      columns: [
        { name: 'id', type: 'string', primary: true, description: 'ID único' },
        { name: 'user_id', type: 'string', foreign: true, description: 'ID do usuário' },
        { name: 'amount', type: 'number', description: 'Quantidade de créditos' },
        { name: 'type', type: 'string', description: 'Tipo da transação' },
        { name: 'description', type: 'string', description: 'Descrição da transação' }
      ]
    },
    {
      name: 'manual_credit_requests',
      description: 'Solicitações manuais de créditos',
      columns: [
        { name: 'id', type: 'string', primary: true, description: 'ID único' },
        { name: 'user_id', type: 'string', foreign: true, description: 'ID do usuário' },
        { name: 'amount', type: 'number', description: 'Quantidade solicitada' },
        { name: 'payment_method', type: 'string', description: 'Método de pagamento' },
        { name: 'payment_details', type: 'string', description: 'Detalhes do pagamento' },
        { name: 'status', type: 'string', description: 'Status da solicitação' }
      ]
    },
    {
      name: 'checkout_settings',
      description: 'Configurações de checkout do sistema',
      columns: [
        { name: 'id', type: 'string', primary: true, description: 'ID único' },
        { name: 'type', type: 'enum', description: 'Tipo de checkout' },
        { name: 'enabled', type: 'boolean', description: 'Se está habilitado' }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Estrutura do Banco de Dados
          </CardTitle>
          <CardDescription>
            Esquema completo das tabelas e relacionamentos do sistema
          </CardDescription>
        </CardHeader>
      </Card>

      {tables.map((table, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle className="text-lg">{table.name}</CardTitle>
            <CardDescription>{table.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Coluna</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Chaves</TableHead>
                  <TableHead>Descrição</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {table.columns.map((column, colIndex) => (
                  <TableRow key={colIndex}>
                    <TableCell className="font-medium">{column.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{column.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {column.primary && (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            <Key className="h-3 w-3 mr-1" />
                            PK
                          </Badge>
                        )}
                        {column.foreign && (
                          <Badge className="bg-blue-100 text-blue-800">
                            <Link className="h-3 w-3 mr-1" />
                            FK
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {column.description}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
