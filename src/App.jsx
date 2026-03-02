import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import AccountInvestigation from "./pages/AccountInvestigation";
import CyberRiskMonitor from "./pages/CyberRiskMonitor";
import TransactionAnalyzer from "./pages/TransactionAnalyzer";
import AlertsCenter from "./pages/AlertsCenter";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/account" element={<AccountInvestigation />} />
          <Route path="/cyber-risk" element={<CyberRiskMonitor />} />
          <Route path="/transactions" element={<TransactionAnalyzer />} />
          <Route path="/alerts" element={<AlertsCenter />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
