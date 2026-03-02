import React from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function Layout({ children }) {
  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      backgroundColor: '#000000',
      color: '#ffffff',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Floating Wobbly Background Blobs */}
      <div className="blob-bg blob-1"></div>
      <div className="blob-bg blob-2"></div>
      <div className="blob-bg blob-3"></div>

      <div style={{ zIndex: 10, display: 'flex', height: '100vh', width: '100%' }}>
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
          <div className="scanline"></div>
          <Navbar />
          <main style={{ flex: 1, overflowY: 'auto' }}>
            <div style={{ maxWidth: 1400, margin: '0 auto', padding: '24px' }}>
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
