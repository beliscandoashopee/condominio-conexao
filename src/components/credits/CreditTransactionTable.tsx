
import React from "react";
import { History, ArrowUp, ArrowDown } from "lucide-react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreditTransactionTableSkeleton } from "./CreditTransactionSkeleton";

type Transaction = {
  id: string;
  amount: number;
  created_at: string;
  description: string | null;
  type: string;
  package_name?: string;
};

type CreditTransactionTableProps = {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
};

const CreditTransactionTable = ({
  transactions,
  isLoading,
  error
}: CreditTransactionTableProps) => {
  return (
    <div className="mt-6">
      <div className="flex items-center gap-2 mb-4">
        <History className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Histórico de transações</h2>
      </div>

      {isLoading ? (
        <CreditTransactionTableSkeleton />
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
  );
};

export default CreditTransactionTable;
