
import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { useUser } from "@/contexts/UserContext";
import { useCredits } from "@/contexts/credits";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ArrowUp, ArrowDown, CreditCard, Clock, History } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Define the transaction type
interface CreditTransaction {
  id: string;
  amount: number;
  created_at: string;
  description: string | null;
  type: string;
  package_name?: string;
}

const CreditHistory = () => {
  const { user } = useUser();
  const { credits, isLoading: isLoadingCredits } = useCredits();
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const fetchTransactions = async () => {
      setIsLoading(true);
      try {
        // Fetch credit transactions with package details if available
        const { data, error } = await supabase
          .from("credit_transactions")
          .select(`
            *,
            credit_packages(name)
          `)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        // Transform the data to include package name if available
        const transformedData = data.map((transaction) => ({
          ...transaction,
          package_name: transaction.credit_packages?.name,
        }));

        setTransactions(transformedData);
      } catch (err: any) {
        console.error("Error fetching transactions:", err.message);
        setError("Não foi possível carregar o histórico de transações.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [user, navigate]);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: ptBR });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold">Meus Créditos</h1>
              <p className="text-muted-foreground mt-1">
                Consulte seu saldo e histórico de transações
              </p>
            </div>

            <Button onClick={() => navigate("/purchase-credits")}>
              <CreditCard className="mr-2 h-4 w-4" />
              Comprar créditos
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
            {/* Current balance card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Saldo atual
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingCredits ? (
                  <div className="flex justify-center items-center h-12">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="text-3xl font-bold">
                    {credits?.balance || 0} créditos
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Last purchase card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Última compra
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center items-center h-12">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <div>
                    {transactions.filter(t => t.type === "purchase")[0] ? (
                      <>
                        <div className="text-2xl font-bold">
                          +{transactions.filter(t => t.type === "purchase")[0].amount} créditos
                        </div>
                        <div className="text-sm text-muted-foreground mt-1 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDate(transactions.filter(t => t.type === "purchase")[0].created_at)}
                        </div>
                      </>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        Nenhuma compra realizada
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Last spend card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Último gasto
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center items-center h-12">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <div>
                    {transactions.filter(t => t.type === "spend")[0] ? (
                      <>
                        <div className="text-2xl font-bold text-destructive">
                          {transactions.filter(t => t.type === "spend")[0].amount} créditos
                        </div>
                        <div className="text-sm text-muted-foreground mt-1 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDate(transactions.filter(t => t.type === "spend")[0].created_at)}
                        </div>
                      </>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        Nenhum gasto realizado
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="mt-6">
            <div className="flex items-center gap-2 mb-4">
              <History className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Histórico de transações</h2>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="text-center py-8 text-muted-foreground">
                {error}
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma transação encontrada
              </div>
            ) : (
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium">
                          {format(new Date(transaction.created_at), "dd/MM/yyyy HH:mm")}
                        </TableCell>
                        <TableCell>
                          {transaction.type === "purchase" ? (
                            <div className="flex items-center">
                              <ArrowUp className="h-4 w-4 text-green-500 mr-2" />
                              {transaction.package_name 
                                ? `Compra do pacote ${transaction.package_name}` 
                                : transaction.description || "Compra de créditos"}
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <ArrowDown className="h-4 w-4 text-destructive mr-2" />
                              {transaction.description || "Uso de créditos"}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className={`text-right ${transaction.type === "purchase" ? "text-green-600" : "text-destructive"}`}>
                          {transaction.type === "purchase" ? "+" : ""}{transaction.amount}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreditHistory;
