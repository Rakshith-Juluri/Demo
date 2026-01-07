import React, { useEffect, useState } from 'react';
import TransactionHistory from './TransactionsHistory';
// --- Added Imports ---
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const API = 'http://localhost:4001';

export default function TransactionsPage() {
  const currentUserId = "89e1"; 
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTx, setSelectedTx] = useState(null);

  const theme = {
    darkBlue: "#0C4A6E",
    primary: "#0284C7",
    warning: "#F59E0B",
    bgGradient: "linear-gradient(180deg, #E0F2FE 0%, #F8FAFC 600px)",
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [accRes, txRes, benRes] = await Promise.all([
          fetch(`${API}/accounts`),
          fetch(`${API}/transactions`),
          fetch(`${API}/beneficiaries`)
        ]);

        const allAccounts = await accRes.json();
        const rawTransactions = await txRes.json();
        const allBeneficiaries = await benRes.json();

        const normalizedTx = (Array.isArray(rawTransactions) ? rawTransactions : []).map(tx => ({
          ...tx,
          transactionId: tx.utr || tx.id || (tx.transactionId || `TX-${tx.id || Math.random().toString(36).slice(2,8)}`),
          senderAccountId: tx.accountId || tx.senderAccountId || '',
          receiverAccountId: tx.beneficiaryId || tx.receiverAccountId || ''
        }));

        const userAccounts = allAccounts.filter(acc => acc.customerId === currentUserId);
        setAccounts(userAccounts);
        setBeneficiaries(allBeneficiaries);
        setTransactions(normalizedTx);

        if (userAccounts.length > 0) {
          setSelectedAccountId(userAccounts[0].id);
        }
      } catch (err) {
        console.error("Data fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentUserId]);

  const filteredTransactions = transactions.filter(tx => 
    String(tx.senderAccountId) === String(selectedAccountId) || 
    String(tx.accountId) === String(selectedAccountId)
  );

  // --- DOWNLOAD STATEMENT LOGIC ---
  const handleDownloadStatement = () => {
    const doc = new jsPDF();
    const selectedAcc = accounts.find(acc => acc.id === selectedAccountId);

    // 1. Header & Branding
    doc.setFontSize(22);
    doc.setTextColor(12, 74, 110); // Sky Bank Dark Blue
    doc.text("SKY BANK", 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("ACCOUNT STATEMENT", 14, 28);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 33);

    // 2. Account Details Section
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 38, 196, 38);
    
    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.text(`Account Number: ${selectedAcc?.accNo || selectedAccountId}`, 14, 48);
    doc.text(`Account Type: ${selectedAcc?.type || 'Standard'}`, 14, 54);
    doc.text(`Current Balance: INR ${selectedAcc?.balance?.toLocaleString()}`, 14, 60);

    // 3. Transactions Table
    const tableColumn = ["Date", "Description", "Ref ID", "Status", "Amount"];
    const tableRows = filteredTransactions.map(tx => [
      new Date(tx.timestamp).toLocaleDateString(),
      tx.remarks || tx.transferType || 'Transaction',
      tx.transactionId,
      tx.status,
      `INR ${tx.amount.toLocaleString()}`
    ]);

    doc.autoTable({
      startY: 70,
      head: [tableColumn],
      body: tableRows,
      headStyles: { fillColor: [12, 74, 110], fontSize: 10 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { top: 70 },
    });

    // 4. Save the PDF
    doc.save(`SkyBank_Statement_${selectedAcc?.accNo || 'Account'}.pdf`);
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center vh-100" style={{ background: theme.bgGradient }}>
      <div className="spinner-border text-primary" role="status"></div>
    </div>
  );

  return (
    <div style={{ background: theme.bgGradient, minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <div className="container py-5">
        
        {/* Header Section */}
        <div className="d-flex justify-content-between align-items-start mb-5">
          <div>
            <h1 className="fw-black display-6 mb-0" style={{ color: theme.darkBlue, fontWeight: 900 }}>Transactions</h1>
            <p className="fs-5 text-secondary fw-medium">Monitor your account activity and history.</p>
          </div>
          {/* TOP RIGHT DOWNLOAD BUTTON */}
          <button 
            onClick={handleDownloadStatement}
            className="btn btn-primary rounded-pill px-4 py-3 fw-bold shadow-sm d-flex align-items-center gap-2"
            style={{ backgroundColor: theme.primary, border: 'none' }}
          >
            <i className="bi bi-cloud-arrow-down-fill fs-5"></i>
            Download Statement
          </button>
        </div>

        {/* 1. ACCOUNT CARDS */}
        <div className="mb-5">
          <h6 className="text-uppercase fw-bold text-muted small mb-3" style={{ letterSpacing: '1px' }}>
            <i className="bi bi-wallet2 me-2 text-primary"></i>Select Account
          </h6>
          <div className="d-flex gap-3 overflow-auto pb-3" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {accounts.map((acc) => (
              <div 
                key={acc.id}
                onClick={() => setSelectedAccountId(acc.id)}
                className={`card border-0 rounded-5 p-4 shadow-sm transition-all ${selectedAccountId === acc.id ? 'bg-dark text-white' : 'bg-white text-dark'}`}
                style={{ 
                  minWidth: '280px', 
                  cursor: 'pointer',
                  transform: selectedAccountId === acc.id ? 'scale(1.02)' : 'scale(1)',
                  transition: '0.3s'
                }}
              >
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className={`badge rounded-pill px-3 py-2 ${selectedAccountId === acc.id ? 'bg-primary' : 'bg-primary bg-opacity-10 text-primary'}`}>
                    {acc.type || acc.displayName}
                  </span>
                  <i className={`bi bi-check-circle-fill ${selectedAccountId === acc.id ? 'text-info' : 'opacity-25 text-secondary'}`}></i>
                </div>
                <h3 className="fw-black mb-1">₹{acc.balance.toLocaleString()}</h3>
                <p className={`fw-medium mb-0 small ${selectedAccountId === acc.id ? 'text-light opacity-50' : 'text-muted'}`}>
                  {acc.accNo || acc.id}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 2. TRANSACTION HISTORY CONTAINER */}
        <div className="card border-0 shadow-sm rounded-5 overflow-hidden bg-white">
          <div className="p-4 border-bottom d-flex justify-content-between align-items-center bg-white">
            <h5 className="fw-bold mb-0" style={{ color: theme.darkBlue }}>Activity History</h5>
          </div>
          
          <div className="p-2">
            <TransactionHistory 
              transactions={filteredTransactions} 
              onViewDetails={(tx) => setSelectedTx(tx)} 
            />
          </div>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-5">
              <i className="bi bi-inbox text-muted display-1 opacity-25"></i>
              <p className="text-muted mt-3 fw-medium">No transactions found for this account.</p>
            </div>
          )}
        </div>

        {/* 3. MODAL (NO CHANGES MADE TO MODAL LOGIC) */}
        {selectedTx && (
          <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(12, 74, 110, 0.4)', backdropFilter: 'blur(8px)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg rounded-5 overflow-hidden">
                <div className="p-4 text-white d-flex justify-content-between align-items-center" style={{ backgroundColor: theme.darkBlue }}>
                  <h5 className="modal-title fw-black mb-0">Transaction Receipt</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedTx(null)}></button>
                </div>
                
                <div className="modal-body p-4">
                  <div className="text-center mb-5">
                    <div className={`display-4 fw-black mb-2 ${selectedTx.status === 'SUCCESS' ? 'text-dark' : 'text-warning'}`}>
                      ₹{selectedTx.amount.toLocaleString()}
                    </div>
                    <span className={`badge rounded-pill px-4 py-2 fw-bold ${selectedTx.status === 'SUCCESS' ? 'bg-success text-white' : 'bg-warning text-dark'}`}>
                      {selectedTx.status}
                    </span>
                  </div>
                  
                  <div className="bg-light rounded-4 p-4">
                    <ul className="list-group list-group-flush bg-transparent">
                      <li className="list-group-item bg-transparent d-flex justify-content-between px-0 border-light">
                        <span className="text-muted small fw-bold text-uppercase">Reference ID</span>
                        <span className="fw-bold text-dark">{selectedTx.transactionId}</span>
                      </li>
                      <li className="list-group-item bg-transparent d-flex justify-content-between px-0 border-light">
                        <span className="text-muted small fw-bold text-uppercase">Method</span>
                        <span className="fw-bold text-dark">{selectedTx.transferType || 'Digital Transfer'}</span>
                      </li>
                      <li className="list-group-item bg-transparent d-flex justify-content-between px-0 border-light">
                        <span className="text-muted small fw-bold text-uppercase">From Account</span>
                        <span className="fw-bold text-dark">{selectedTx.senderAccountId || '—'}</span>
                      </li>
                      <li className="list-group-item bg-transparent d-flex justify-content-between px-0 border-light">
                        <span className="text-muted small fw-bold text-uppercase">To Account</span>
                        <span className="fw-bold text-dark">{selectedTx.receiverAccountId || '—'}</span>
                      </li>
                      <li className="list-group-item bg-transparent d-flex justify-content-between px-0 border-light">
                        <span className="text-muted small fw-bold text-uppercase">Date & Time</span>
                        <span className="fw-bold text-dark">{new Date(selectedTx.timestamp).toLocaleString()}</span>
                      </li>
                    </ul>
                  </div>

                  <div className="mt-4 p-3 border border-dashed rounded-4">
                    <small className="text-muted d-block fw-bold text-uppercase mb-1" style={{fontSize: '10px'}}>Remarks</small>
                    <p className="mb-0 fw-medium">{selectedTx.remarks || 'No remarks provided.'}</p>
                  </div>
                </div>

                <div className="modal-footer border-0 p-4 pt-0">
                  <button type="button" className="btn btn-dark w-100 py-3 rounded-pill fw-black" onClick={() => setSelectedTx(null)}>DONE</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .fw-black { font-weight: 900 !important; }
        .rounded-5 { border-radius: 2rem !important; }
        .transition-all:hover { transform: translateY(-5px) scale(1.02); box-shadow: 0 1rem 3rem rgba(0,0,0,.1) !important; }
        .border-dashed { border: 2px dashed #e2e8f0; }
      `}</style>
    </div>
  );
}