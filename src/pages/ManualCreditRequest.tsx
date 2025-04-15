
import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { useCredits } from '@/contexts/credits/CreditsContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function ManualCreditRequest() {
  const { requestManualCredits, loading } = useCredits();
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentDetails, setPaymentDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !paymentMethod || !paymentDetails) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    const amountNumber = parseInt(amount);
    if (isNaN(amountNumber) || amountNumber <= 0) {
      toast.error('Por favor, insira uma quantidade válida de créditos');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const success = await requestManualCredits(amountNumber, paymentMethod, paymentDetails);
      
      if (success) {
        toast.success('Solicitação de créditos enviada com sucesso!');
        setAmount('');
        setPaymentMethod('');
        setPaymentDetails('');
      } else {
        toast.error('Não foi possível enviar a solicitação de créditos');
      }
    } catch (error) {
      toast.error('Erro ao processar sua solicitação');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 pt-24 pb-8">
        <h1 className="text-2xl font-bold mb-6">Solicitar Créditos Manualmente</h1>
        
        <form onSubmit={handleSubmit} className="max-w-md space-y-6">
          <div className="space-y-2">
            <Label htmlFor="amount">Quantidade de Créditos</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Digite a quantidade de créditos"
              min="1"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Método de Pagamento</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o método de pagamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pix">PIX</SelectItem>
                <SelectItem value="transfer">Transferência Bancária</SelectItem>
                <SelectItem value="cash">Dinheiro</SelectItem>
                <SelectItem value="other">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentDetails">Detalhes do Pagamento</Label>
            <Textarea
              id="paymentDetails"
              value={paymentDetails}
              onChange={(e) => setPaymentDetails(e.target.value)}
              placeholder="Descreva os detalhes do pagamento (ex: chave PIX, dados bancários, etc)"
              required
            />
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Enviando...' : 'Enviar Solicitação'}
          </Button>
        </form>

        <div className="mt-8 text-sm text-gray-600">
          <p>Após enviar a solicitação:</p>
          <ol className="list-decimal list-inside mt-2 space-y-1">
            <li>Realize o pagamento conforme os detalhes fornecidos</li>
            <li>Um administrador irá verificar e aprovar sua solicitação</li>
            <li>Os créditos serão adicionados à sua conta após a aprovação</li>
          </ol>
        </div>
      </div>
    </Layout>
  );
}
