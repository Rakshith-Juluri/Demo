import React, { useState, useEffect } from "react";

const EMICalculator = () => {
  // Constants synced with LoanApplication.jsx
  const rules = {
    home: { rate: 8.5, minT: 60, maxT: 360, label: "5-30 Years" },
    personal: { rate: 11.5, minT: 12, maxT: 60, label: "1-5 Years" }
  };

  const [loanType, setLoanType] = useState("home"); // 'home' or 'personal'
  const [amount, setAmount] = useState(1000000);
  const [tenure, setTenure] = useState(rules.home.minT);
  const [emi, setEmi] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);

  // Update tenure if it falls out of bounds when switching loan types
  useEffect(() => {
    const bounds = rules[loanType];
    if (tenure < bounds.minT) setTenure(bounds.minT);
    if (tenure > bounds.maxT) setTenure(bounds.maxT);
  }, [loanType]);

  useEffect(() => {
    const P = amount;
    const r = rules[loanType].rate / 12 / 100;
    const n = tenure;
    
    const emiCalc = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    
    if (isFinite(emiCalc)) {
      setEmi(Math.round(emiCalc));
      setTotalInterest(Math.round(emiCalc * n - P));
    }
  }, [amount, tenure, loanType]);

  return (
    <div className="card border-0 shadow-lg p-4 p-md-5 rounded-5 bg-white mb-5">
      <div className="row align-items-center">
        <div className="col-lg-7 pe-lg-5">
          <div className="d-flex align-items-center gap-3 mb-4">
             <h4 className="fw-black mb-0" style={{ color: "#0C4A6E", fontWeight: 900 }}>Loan Planner</h4>
             <div className="bg-light p-1 rounded-pill d-flex shadow-sm">
                <button 
                  onClick={() => setLoanType("home")}
                  className={`btn btn-sm rounded-pill px-3 fw-bold transition-all ${loanType === 'home' ? 'btn-primary shadow' : 'btn-light text-muted'}`}
                >Home</button>
                <button 
                  onClick={() => setLoanType("personal")}
                  className={`btn btn-sm rounded-pill px-3 fw-bold transition-all ${loanType === 'personal' ? 'btn-primary shadow' : 'btn-light text-muted'}`}
                >Personal</button>
             </div>
          </div>

          {/* Amount Slider */}
          <div className="mb-4">
            <div className="d-flex justify-content-between mb-2">
              <label className="fw-bold text-secondary small">AMOUNT</label>
              <span className="fw-black text-primary">₹{amount.toLocaleString()}</span>
            </div>
            <input type="range" className="form-range" min="50000" max="10000000" step="50000" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
          </div>

          {/* Tenure Slider - Dynamic Bounds */}
          <div className="mb-4">
            <div className="d-flex justify-content-between mb-2">
              <label className="fw-bold text-secondary small">TENURE ({rules[loanType].label})</label>
              <span className="fw-black text-primary">{tenure} Months</span>
            </div>
            <input 
              type="range" 
              className="form-range" 
              min={rules[loanType].minT} 
              max={rules[loanType].maxT} 
              step="1" 
              value={tenure} 
              onChange={(e) => setTenure(Number(e.target.value))} 
            />
          </div>

          <div className="p-3 bg-light rounded-4 d-flex justify-content-between align-items-center">
             <span className="small fw-bold text-muted uppercase">Fixed Interest Rate</span>
             <span className="badge bg-white text-primary border shadow-sm fs-6 px-3">{rules[loanType].rate}% p.a.</span>
          </div>
        </div>

        <div className="col-lg-5 text-center border-start mt-4 mt-lg-0">
          <div className="p-4 bg-primary bg-opacity-10 rounded-5">
            <h6 className="text-primary fw-bold small mb-2 text-uppercase">Monthly Installment</h6>
            <h1 className="fw-black text-dark mb-4" style={{ fontSize: "2.8rem", fontWeight: 900 }}>₹{emi.toLocaleString()}</h1>
            
            <div className="row g-2">
               <div className="col-6">
                  <div className="bg-white p-2 rounded-4 shadow-sm text-center">
                    <small className="d-block text-muted fw-bold" style={{ fontSize: '9px' }}>TOTAL INTEREST</small>
                    <span className="fw-bold text-danger">₹{totalInterest.toLocaleString()}</span>
                  </div>
               </div>
               <div className="col-6">
                  <div className="bg-white p-2 rounded-4 shadow-sm text-center">
                    <small className="d-block text-muted fw-bold" style={{ fontSize: '9px' }}>TOTAL PAYABLE</small>
                    <span className="fw-bold text-dark">₹{(amount + totalInterest).toLocaleString()}</span>
                  </div>
               </div>
            </div>

            <div className="mt-4 pt-2 border-top">
                <small className="text-muted d-block mb-3">Estimated for {loanType} loan</small>
                <div className="mx-auto" style={{
                  width: "100px", height: "10px", borderRadius: "10px", background: "#E2E8F0", overflow: "hidden"
                }}>
                   <div style={{ width: `${(totalInterest/(amount+totalInterest))*100}%`, height: '100%', background: '#EF4444' }}></div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EMICalculator;