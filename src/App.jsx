import React from 'react'
import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainLayout from './pages/MainLayout'
import CustomerDashboard from './pages/CustomerDashboard'
import Login from './pages/Login'
import Registeration from './pages/Registeration'
import ForgetPassword from './pages/ForgetPassword'
import ForgetUserName from './pages/ForgetUserName'
import Otp from './pages/OtpRequest'
import FundPage from './pages/Fund/FundPage'
import SelfTransferForm from './pages/Fund/SelfTransferForm'
import TransferToSomeOne from './pages/Fund/TransferToSomeOne'
import TransactionsPage from './pages/Transactions/TransactionsPage'
import LoanPage from './pages/Loan/Loan_page'
import LoanApplication from './pages/Loan/LoanApplication'
import AccountsPage from './pages/Accounts/Accounts_page'
import SavingAccount from './pages/Accounts/SavingAccount'

import CurrenrAccount from './pages/Accounts/CurrentAccount'


import AdminDashboard from './pages/Admin/AdminDashboard'
import ProtectedAdminRoute from './pages/Admin/ProtectedAdminRoute'
import AccountControl from './pages/Accounts/AccountControl'
import Profile from './pages/Profile'
function App() {
  return (
    <BrowserRouter>
      <Routes>
  <Route path='/admindashboard' element={<ProtectedAdminRoute><AdminDashboard/></ProtectedAdminRoute>} />
        {/* Entry: Login page as root */}
        <Route path="/" element={<Login />} />
        {/* Public routes reachable from Login */}
        <Route path="/register" element={<Registeration />} />
        <Route path="/forget-password" element={<ForgetPassword />} />
        <Route path="/forget-username" element={<ForgetUserName />} />
        <Route path="/otp" element={<Otp />} />

        {/* Main application routes under /app (protected area) */}
        <Route path="/app" element={<MainLayout />}>
          {/* Dashboard as index (home) => /app */}
          <Route index element={<CustomerDashboard />} />

          {/* KYC route removed as requested */}
          {/* Keep /app/home path to match Header links if used */}
          <Route path="home" element={<CustomerDashboard />} />

          {/* Other top-level pages (only Header + page content) */}
          <Route path="funds" element={<FundPage />} />
          {/* Make transfer a separate top-level route so it does NOT render inside FundPage's Outlet */}
          <Route path="funds/transfer" element={<TransferToSomeOne />} />
          {/* Self transfer is a separate route so it renders fresh below the Header (not nested inside FundPage) */}
          <Route path="funds/self-transfer" element={<SelfTransferForm />} />

          {/* Accounts */}
          <Route path="accounts" element={<AccountsPage />} />
          <Route path="accounts/savings-account" element={<SavingAccount />} />

          <Route path="accounts/current-account" element={<CurrenrAccount />} />

          <Route path="accounts/current-account" element={<SavingAccount />} />
          <Route path="accounts/control" element={<AccountControl />} />


          {/* Transactions */}
          <Route path="transactions" element={<TransactionsPage />} />

          {/* Loans */}
          <Route path="loans" element={<LoanPage />} />
          <Route path="loans/apply" element={<LoanApplication />} />
          <Route path="profile" element={<Profile />} />

          {/* future routes like /accounts, /loans can be added here */}
        </Route>

        {/* Fallback: if no route matches, send to Login */}
        <Route path="*" element={<Login />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
