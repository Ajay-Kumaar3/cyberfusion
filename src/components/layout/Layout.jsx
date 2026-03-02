import React from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function Layout({ children }) {
  return (
    <div style={styles.container}>
      <Sidebar />
      <div style={styles.mainWrapper}>
        <Navbar />
        <main style={styles.content}>{children}</main>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    height: "100vh",
    backgroundColor: "#020509",
    color: "#e8edf5",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    overflow: "hidden",
  },
  mainWrapper: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    minWidth: 0,
  },
  content: {
    flex: 1,
    overflowY: "auto",
    background: "radial-gradient(ellipse at 30% 0%, #00d4ff06 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, #a259ff06 0%, transparent 60%), #020509",
  },
};
