import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import KillChain from "./pages/KillChain";
import Accounts from "./pages/Accounts";
import Transactions from "./pages/Transactions";
import CyberRisk from "./pages/CyberRisk";
import Reports from "./pages/Reports";
import MetaMaskPanel from "./components/web3/MetaMaskPanel";

import { BlockchainProvider } from "./context/BlockchainContext";
import { AlertProvider } from "./context/AlertContext";
import BlockchainDemoPage from "./pages/BlockchainDemo";
import SetupPage from "./pages/SetupPage";
import PaymentDemoPage from "./pages/PaymentDemo";

function App() {
  return (
    <BlockchainProvider>
      <AlertProvider>
        <Router>
          <Layout>
            <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/killchain" element={<KillChain />} />
            <Route path="/accounts" element={<Accounts />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/cyber-risk" element={<CyberRisk />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/blockchain" element={<BlockchainDemoPage />} />
            <Route path="/setup" element={<SetupPage />} />
            <Route path="/payments" element={<PaymentDemoPage />} />
          </Routes>
        </Layout>
        <MetaMaskPanel onFraudAlert={(alert) => console.log("[CyberFusion] Fraud alert:", alert)} />
      </Router>
      </AlertProvider>
    </BlockchainProvider>
  );
}

export default App;
