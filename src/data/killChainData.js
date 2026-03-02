export const KILL_CHAIN_DATA = {
  nodes: [
    { id: "origin", type: "ATTACK_ORIGIN", label: "Dark Web Forum", risk: 100 },
    { id: "phish1", type: "PHISHING", label: "Phishing Kit v4.2", risk: 90 },
    { id: "acc1", type: "COMPROMISED_ACCOUNT", label: "ACC-4821 (James K.)", risk: 95 },
    { id: "acc2", type: "COMPROMISED_ACCOUNT", label: "ACC-7743 (Maria S.)", risk: 88 },
    { id: "mule1", type: "MULE_ACCOUNT", label: "MULE-001", risk: 85 },
    { id: "mule2", type: "MULE_ACCOUNT", label: "MULE-002", risk: 82 },
    { id: "mule3", type: "MULE_ACCOUNT", label: "MULE-003", risk: 79 },
    { id: "txn1", type: "TRANSACTION", label: "$12,400", risk: 75 },
    { id: "txn2", type: "TRANSACTION", label: "$8,900", risk: 70 },
    { id: "txn3", type: "TRANSACTION", label: "$15,200", risk: 72 },
    { id: "exit1", type: "EXIT_POINT", label: "Crypto Exchange A", risk: 95 },
    { id: "exit2", type: "EXIT_POINT", label: "Wire Transfer → HK", risk: 98 }
  ],
  edges: [
    { source: "origin", target: "phish1", type: "DEPLOYS" },
    { source: "phish1", target: "acc1", type: "COMPROMISES" },
    { source: "phish1", target: "acc2", type: "COMPROMISES" },
    { source: "acc1", target: "mule1", type: "RECRUITS" },
    { source: "acc1", target: "mule2", type: "RECRUITS" },
    { source: "acc2", target: "mule3", type: "RECRUITS" },
    { source: "mule1", target: "txn1", type: "TRANSFERS" },
    { source: "mule2", target: "txn2", type: "TRANSFERS" },
    { source: "mule3", target: "txn3", type: "TRANSFERS" },
    { source: "txn1", target: "exit1", type: "LAUNDERS_VIA" },
    { source: "txn2", target: "exit1", type: "LAUNDERS_VIA" },
    { source: "txn3", target: "exit2", type: "LAUNDERS_VIA" }
  ]
};
