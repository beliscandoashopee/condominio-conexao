import React, { useEffect } from 'react';
import { useCredits } from '@/contexts/credits/CreditsContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function AdminManualCredits() {
  const { manualRequests, fetchManualRequests, approveManualRequest, rejectManualRequest, loading } = useCredits();

  useEffect(() => {
    fetchManualRequests();
  }, [fetchManualRequests]);

  const handleApprove = async (requestId: string) => {
    const success = await approveManualRequest(requestId);
    if (success) {
      toast.success('Solicitação aprovada com sucesso!');
    } else {
      toast.error('Não foi possível aprovar a solicitação');
    }
  };

  const handleReject = async (requestId: string) => {
    const success = await rejectManualRequest(requestId);
    if (success) {
      toast.success('Solicitação rejeitada com sucesso!');
    } else {
      toast.error('Não foi possível rejeitar a solicitação');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-500';
      case 'approved':
        return 'text-green-500';
      case 'rejected':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'approved':
        return 'Aprovado';
      case 'rejected':
        return 'Rejeitado';
      default:
        return status;
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Carregando...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Gerenciar Solicitações de Créditos</h1>

      {manualRequests.length === 0 ? (
        <p className="text-gray-500">Não há solicitações de créditos para gerenciar.</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Método de Pagamento</TableHead>
                <TableHead>Detalhes</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {manualRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    {format(new Date(request.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                  </TableCell>
                  <TableCell>{request.user_id}</TableCell>
                  <TableCell>{request.amount}</TableCell>
                  <TableCell className="capitalize">{request.payment_method}</TableCell>
                  <TableCell className="max-w-xs truncate">{request.payment_details}</TableCell>
                  <TableCell className={getStatusColor(request.status)}>
                    {getStatusText(request.status)}
                  </TableCell>
                  <TableCell>
                    {request.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleApprove(request.id)}
                          className="text-green-600 hover:text-green-700"
                        >
                          Aprovar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReject(request.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Rejeitar
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
