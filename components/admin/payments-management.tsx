'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Payment {
  id: string;
  amount: number;
  payment_type: string;
  status: string;
  created_at: string;
}

export function PaymentsManagement() {
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await fetch('/api/admin/payments');
      const data = await response.json();
      setPayments(data.payments || []);
    } catch (error) {
      toast.error('Ödemeler yüklenemedi');
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Ödemeler</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tutar</TableHead>
            <TableHead>Tip</TableHead>
            <TableHead>Durum</TableHead>
            <TableHead>Tarih</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell>{payment.amount} TL</TableCell>
              <TableCell>
                <Badge variant="outline">{payment.payment_type}</Badge>
              </TableCell>
              <TableCell>
                <Badge>{payment.status}</Badge>
              </TableCell>
              <TableCell>
                {new Date(payment.created_at).toLocaleDateString('tr-TR')}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
