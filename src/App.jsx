import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import KillChain from "./pages/KillChain";
import Accounts from "./pages/Accounts";
import Transactions from "./pages/Transactions";
import CyberRisk from "./pages/CyberRisk";
import Reports from "./pages/Reports";
import MetaMaskPanel from "./components/web3/MetaMaskPanel";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/killchain" element={<KillChain />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/cyber-risk" element={<CyberRisk />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </Layout>
      <MetaMaskPanel onFraudAlert={(alert) => console.log("[CyberFusion] Fraud alert:", alert)} />
    </Router>
  );
}

export default App;
