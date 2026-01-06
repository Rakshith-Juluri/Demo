import React, { useEffect, useState } from 'react';
import TransactionHistory from './TransactionsHistory';

const API = 'http://localhost:4001';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetch(`${API}/transactions`).then(r => r.json());
        // Normalize to ensure `transactionId` exists (TransactionsHistory expects it)
        const normalized = (Array.isArray(data) ? data : []).map(tx => ({
          ...tx,
          transactionId: tx.utr || tx.id || (tx.transactionId || `TX-${tx.id || Math.random().toString(36).slice(2,8)}`),
          senderAccountId: tx.accountId || tx.senderAccountId || '',
          receiverAccountId: tx.beneficiaryId || tx.receiverAccountId || ''
        }));
        setTransactions(normalized);
      } catch (e) {
        console.error('Failed to load transactions', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleViewDetails = (txn) => {
    const details = [
      `Transaction: ${txn.transactionId}`,
      `Status: ${txn.status}`,
      `Amount: ₹${txn.amount}`,
      `From: ${txn.senderAccountId || txn.accountId || '—'}`,
      `To: ${txn.receiverAccountId || txn.beneficiaryId || '—'}`,
      `Method: ${txn.transferType || '—'}`,
      `Reference(UTR): ${txn.utr || '—'}`,
      `Scheduled For: ${txn.scheduledFor || '—'}`,
      `Failure Reason: ${txn.failureReason || '—'}`,
      `Remarks: ${txn.remarks || '—'}`,
    ].join('\n');
    // Simple details view for now
    alert(details);
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="spinner-border text-primary" role="status"></div>
    </div>
  );

  return (
    <TransactionHistory transactions={transactions} onViewDetails={handleViewDetails} />
  );
}
