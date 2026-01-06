import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "./Header"; // Adjust the path based on your folder structure

export default function CustomerDashboard() {
  const [userData, setUserData] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const theme = {
    primary: "#0284C7",
    darkBlue: "#0C4A6E",
    bgGradient: "linear-gradient(180deg, #E0F2FE 0%, #F8FAFC 600px)",
  };

  useEffect(() => {
    // Load Bootstrap Icons if not already in index.html
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css";
    document.head.appendChild(link);

    const fetchAllData = async () => {
      try {
        const [userRes, accountsRes, transRes] = await Promise.all([
          fetch("http://localhost:4001/users/90f2"),
          fetch("http://localhost:4001/accounts?userId=89e1"),
          fetch("http://localhost:4001/transactions?userId=89e1&_limit=5")
        ]);

        setUserData(await userRes.json());
        setAccounts(await accountsRes.json());
        setTransactions(await transRes.json());
      } catch (e) {
        console.error("Data Load Error:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  if (loading) return (
    <div className="vh-100 d-flex justify-content-center align-items-center" style={{ background: theme.bgGradient }}>
      <div className="spinner-grow text-primary" role="status"></div>
    </div>
  );

  return (
    <div style={{ background: theme.bgGradient, minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      
      {/* Integrated Header Section */}
    

      {/* --- MAIN DASHBOARD CONTENT --- */}
      <main className="container py-5">
        <div className="row g-4">
          
          {/* Welcome Message */}
          <div className="col-12 mb-2">
            <h1 className="fw-black display-6" style={{ color: theme.darkBlue, fontWeight: 900 }}>
              Hello, {userData?.name || "User"}
            </h1>
            <p className="text-secondary fs-5 fw-medium">Welcome back to our Bank.</p>
          </div>

          {/* Summary Cards */}
          <div className="col-md-4">
            <div className="card border-0 p-4 h-100 shadow-sm rounded-4 bg-white">
              <span className="text-muted small fw-bold mb-2 d-block">TOTAL AVAILABLE BALANCE</span>
              <h2 className="fw-black mb-4" style={{ color: theme.darkBlue }}>₹{userData?.balance?.toLocaleString() || "0"}</h2>
              <Link to="/funds" className="btn btn-primary rounded-pill fw-bold py-2 w-100">Send Money</Link>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card border-0 p-4 h-100 shadow-sm rounded-4 bg-dark text-white">
              <div className="d-flex justify-content-between mb-3">
                <span className="small fw-bold opacity-75 text-uppercase">Loan Due</span>
                <i className="bi bi-calendar-check text-warning"></i>
              </div>
              <h3 className="fw-bold">₹12,400</h3>
              <p className="small opacity-50 mb-4">Upcoming: 12 Jan 2026</p>
              <button className="btn btn-outline-light rounded-pill fw-bold btn-sm">Pay Now</button>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card border-0 p-4 h-100 shadow-sm rounded-4 bg-white">
              <span className="text-muted small fw-bold mb-2 d-block">CREDIT SCORE</span>
              <div className="d-flex align-items-center gap-3">
                <h2 className="fw-black text-success mb-0">782</h2>
                <div className="bg-success text-white px-2 py-1 rounded-pill" style={{fontSize: '10px', fontWeight: 'bold'}}>EXCELLENT</div>
              </div>
              <hr className="opacity-5" />
              <Link to="/loans" className="text-decoration-none small fw-bold text-primary">apply for new loans →</Link>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm rounded-4 bg-white p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold mb-0">Recent Activity</h5>
                <button className="btn btn-light btn-sm rounded-pill px-3 fw-bold text-primary small">View Statement</button>
              </div>
              <div className="table-responsive">
                <table className="table table-borderless align-middle">
                  <thead className="table-light">
                    <tr style={{fontSize: '11px'}}>
                      <th className="text-muted px-3">TRANSACTION</th>
                      <th className="text-muted text-center">DATE</th>
                      <th className="text-muted text-end px-3">AMOUNT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map(t => (
                      <tr key={t.id} className="border-bottom-subtle">
                        <td className="fw-semibold py-3 px-3">{t.description}</td>
                        <td className="text-center text-secondary small">{t.date}</td>
                        <td className={`text-end px-3 fw-bold ${t.type === 'debit' ? 'text-danger' : 'text-success'}`}>
                          {t.type === 'debit' ? '-' : '+'}₹{t.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* My Accounts Sidebar */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 bg-white p-4">
              <h6 className="fw-bold text-muted mb-4 text-uppercase small" style={{letterSpacing: '1px'}}>My Accounts</h6>
              {accounts.map(acc => (
                <div key={acc.id} className="d-flex align-items-center justify-content-between mb-3 p-3 bg-light rounded-4">
                   <div className="d-flex align-items-center gap-2">
                      <div className="bg-white p-2 rounded-circle shadow-sm"><i className="bi bi-wallet2 text-primary"></i></div>
                      <div>
                        <div className="fw-bold small">{acc.type}</div>
                        <div className="text-muted" style={{fontSize: '10px'}}>..{acc.accountNumber?.slice(-4)}</div>
                      </div>
                   </div>
                   <div className="fw-bold">₹{acc.balance?.toLocaleString()}</div>
                </div>
              ))}
              <button className="btn btn-outline-primary w-100 rounded-pill fw-bold mt-2 py-2 small">Manage Account</button>
            </div>
          </div>
        </div>
      </main>
      {/* dashboard is the index page; do not render nested route Outlet here so other pages don't show dashboard content */}
    </div>
  );
}