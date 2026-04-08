export const BANK_NETWORK = {
  nodes: [
    // CyberFusion hub — center node
    { id: "cf_hub", type: "HUB", label: "CyberFusion\nIntelligence", 
      country: "IN", tier: 1, active: true },
    
    // Tier 1 — Major banks directly integrated
    { id: "sbi", type: "BANK", label: "State Bank\nof India", 
      country: "IN", tier: 2, alerts: 14, status: "ACTIVE" },
    { id: "hdfc", type: "BANK", label: "HDFC Bank", 
      country: "IN", tier: 2, alerts: 8, status: "ACTIVE" },
    { id: "icici", type: "BANK", label: "ICICI Bank", 
      country: "IN", tier: 2, alerts: 11, status: "ACTIVE" },
    { id: "axis", type: "BANK", label: "Axis Bank", 
      country: "IN", tier: 2, alerts: 6, status: "ACTIVE" },
    
    // Tier 2 — International partners
    { id: "hsbc", type: "BANK_INTL", label: "HSBC", 
      country: "GB", tier: 3, alerts: 3, status: "ACTIVE" },
    { id: "dbs", type: "BANK_INTL", label: "DBS Bank", 
      country: "SG", tier: 3, alerts: 5, status: "ACTIVE" },
    { id: "stanchart", type: "BANK_INTL", label: "Standard\nChartered", 
      country: "GB", tier: 3, alerts: 2, status: "ACTIVE" },
    
    // Regulatory nodes
    { id: "rbi_fiu", type: "REGULATOR", label: "RBI FIU-IND", 
      country: "IN", tier: 2, status: "MONITORING" },
    { id: "interpol", type: "REGULATOR", label: "INTERPOL\nCybercrime", 
      country: "INTL", tier: 3, status: "MONITORING" },
    
    // Threat actors (flagged mule accounts floating outside)
    { id: "mule_ring_1", type: "THREAT", label: "Mule Ring\nOPERATION CRIMSON", 
      country: "UNKNOWN", tier: 4, risk: 95 },
    { id: "mule_ring_2", type: "THREAT", label: "Phishing\nKit v4.2", 
      country: "RU", tier: 4, risk: 88 },
    { id: "exit_crypto", type: "EXIT", label: "Crypto\nExchange A", 
      country: "UNKNOWN", tier: 4, risk: 92 },
  ],
  edges: [
    // Hub to banks — intelligence sharing
    { source: "cf_hub", target: "sbi", type: "SHARES_INTEL", bidirectional: true },
    { source: "cf_hub", target: "hdfc", type: "SHARES_INTEL", bidirectional: true },
    { source: "cf_hub", target: "icici", type: "SHARES_INTEL", bidirectional: true },
    { source: "cf_hub", target: "axis", type: "SHARES_INTEL", bidirectional: true },
    { source: "cf_hub", target: "hsbc", type: "SHARES_INTEL", bidirectional: true },
    { source: "cf_hub", target: "dbs", type: "SHARES_INTEL", bidirectional: true },
    { source: "cf_hub", target: "stanchart", type: "SHARES_INTEL", bidirectional: true },
    
    // Hub to regulators
    { source: "cf_hub", target: "rbi_fiu", type: "REPORTS_TO" },
    { source: "cf_hub", target: "interpol", type: "REPORTS_TO" },
    
    // Mule ring attacking multiple banks
    { source: "mule_ring_1", target: "sbi", type: "ATTACKS" },
    { source: "mule_ring_1", target: "hdfc", type: "ATTACKS" },
    { source: "mule_ring_2", target: "icici", type: "ATTACKS" },
    { source: "exit_crypto", target: "mule_ring_1", type: "RECEIVES" },
  ]
};

export const PROPAGATION_EVENTS = [
  { 
    id: 1, trigger_bank: "sbi", propagate_to: ["hdfc", "icici", "axis", "hsbc"],
    threat: "Mule Ring CRIMSON", type: "MULE_FLAGGED", delay_ms: 400, amount: "42.5L"
  },
  { 
    id: 2, trigger_bank: "icici", propagate_to: ["sbi", "hdfc", "dbs"],
    threat: "Phishing Kit v4.2", type: "PHISHING_DETECTED", delay_ms: 600, amount: "18.2L"
  },
  { 
    id: 3, trigger_bank: "hdfc", propagate_to: ["sbi", "axis", "stanchart", "hsbc"],
    threat: "Session Hijack Ring", type: "ACCOUNT_TAKEOVER", delay_ms: 500, amount: "31.0L"
  },
];
