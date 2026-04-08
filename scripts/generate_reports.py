import os
from fpdf import FPDF

def create_report(filename, bank_name, title, case_id, threat_name, exposure, prevented, details):
    pdf = FPDF()
    pdf.add_page()
    
    # Header
    pdf.set_font("Helvetica", 'B', 8)
    pdf.set_text_color(150, 0, 0)
    pdf.cell(0, 10, "STRICTLY CONFIDENTIAL - FINANCIAL INTELLIGENCE UNIT ACCESS ONLY", ln=True, align='C')
    
    # Bank Title
    pdf.ln(10)
    pdf.set_font("Helvetica", 'B', 24)
    pdf.set_text_color(0, 0, 0)
    pdf.cell(0, 15, bank_name, ln=True, align='L')
    
    # Subtitle
    pdf.set_font("Helvetica", 'B', 14)
    pdf.set_text_color(50, 50, 50)
    pdf.cell(0, 10, title, ln=True, align='L')
    
    pdf.set_draw_color(0, 255, 65)
    pdf.line(10, 50, 200, 50)
    
    # Metadata
    pdf.ln(10)
    pdf.set_font("Helvetica", '', 10)
    pdf.cell(40, 8, "Case ID:", ln=False)
    pdf.set_font("Helvetica", 'B', 10)
    pdf.cell(0, 8, case_id, ln=True)
    
    pdf.set_font("Helvetica", '', 10)
    pdf.cell(40, 8, "Risk Level:", ln=False)
    pdf.set_font("Helvetica", 'B', 10)
    pdf.set_text_color(255, 0, 0)
    pdf.cell(0, 8, "CRITICAL / IMMEDIATE ACTION", ln=True)
    pdf.set_text_color(0, 0, 0)
    
    pdf.set_font("Helvetica", '', 10)
    pdf.cell(40, 8, "Target Asset:", ln=False)
    pdf.set_font("Helvetica", 'B', 10)
    pdf.cell(0, 8, threat_name, ln=True)

    # Summary
    pdf.ln(10)
    pdf.set_font("Helvetica", 'B', 12)
    pdf.cell(0, 10, "EXECUTIVE SUMMARY", ln=True)
    pdf.set_font("Helvetica", '', 10)
    pdf.multi_cell(0, 7, details)

    # Data Table
    pdf.ln(10)
    pdf.set_fill_color(230, 230, 230)
    pdf.set_font("Helvetica", 'B', 10)
    pdf.cell(90, 10, "Metric", border=1, fill=True)
    pdf.cell(90, 10, "Value / Status", border=1, fill=True, ln=True)
    
    pdf.set_font("Helvetica", '', 10)
    pdf.cell(90, 10, "Exposure Detected", border=1)
    pdf.cell(90, 10, f"INR {exposure}", border=1, ln=True)
    
    pdf.cell(90, 10, "Exposure Prevented (via CyberFusion)", border=1)
    pdf.set_font("Helvetica", 'B', 10)
    pdf.set_text_color(0, 150, 0)
    pdf.cell(90, 10, f"INR {prevented}", border=1, ln=True)
    pdf.set_text_color(0, 0, 0)
    
    pdf.set_font("Helvetica", '', 10)
    pdf.cell(90, 10, "Network Propagation Time", border=1)
    pdf.cell(90, 10, "420ms (Institutional Relay)", border=1, ln=True)

    # Footer
    pdf.ln(20)
    pdf.set_font("Helvetica", 'I', 8)
    pdf.multi_cell(0, 5, "This document was generated automatically by the CyberFusion Intelligence Node. Any unauthorized distribution will lead to immediate revocation of API keys and legal prosecution under the Digital Personal Data Protection Act.")
    
    pdf.ln(10)
    pdf.set_font("Helvetica", 'B', 10)
    pdf.cell(0, 10, f"Digitally Signed by CyberFusion Core-Engine-1", ln=True, align='R')

    # Create directory if not exists
    os.makedirs("public/reports", exist_ok=True)
    pdf.output(f"public/reports/{filename}")
    print(f"Generated: public/reports/{filename}")

# Configuration
reports = [
    {
        "filename": "SBI_Crimson_Advisory.pdf",
        "bank_name": "State Bank of India",
        "title": "Mule Ring Intelligence Report",
        "case_id": "SBI-FIU-2024-08X",
        "threat_name": "OPERATION CRIMSON",
        "exposure": "42,50,000",
        "prevented": "41,00,000",
        "details": "Detection of a coordinated mule account ring operation attempting layered laundering. Signals were identified via transaction velocity anomalies. Immediate freeze of 12 suspect accounts performed. Intelligence relayed to CyberFusion Network for cross-bank immunization."
    },
    {
        "filename": "ICICI_Phishing_Report.pdf",
        "bank_name": "ICICI Bank",
        "title": "Advisory on Phishing Kit v4.2",
        "case_id": "ICICI-SOC-9922",
        "threat_name": "Phishing Kit v4.2",
        "exposure": "18,20,000",
        "prevented": "18,20,000",
        "details": "A new variant of Phishing Kit v4.2 targeting mobile banking users was detected. The kit utilizes sophisticated domain-shadowing techniques. CyberFusion detected the host IP before the first successful compromise at ICICI. Full prevention achieved across the network."
    },
    {
        "filename": "RBI_Compliance_Audit.pdf",
        "bank_name": "Reserve Bank of India",
        "title": "Regulatory Compliance Bulletin",
        "case_id": "RBI-FIU-AUDIT-Q1",
        "threat_name": "Cross-Bank Intelligence Sync",
        "exposure": "N/A - Network Health",
        "prevented": "TOTAL RECOVERY %: 98.4%",
        "details": "Audit of the CyberFusion node shows 100% compliance with local intelligence sharing mandates. The network has successfully prevented 12 independent fraud attempts this quarter by reducing inter-bank latency to sub-second levels."
    }
]

for r in reports:
    create_report(**r)
