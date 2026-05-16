import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { CSSRenderer } from '@content-renderer/react-and-native';

const cssContent = `/* Main Styles */
:root {
  --primary-color: #6c63ff;
  --secondary-color: #00d4ff;
  --text-color: #333;
  --bg-color: #ffffff;
  --border-radius: 8px;
  --shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  color: var(--text-color);
  background-color: var(--bg-color);
  line-height: 1.6;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.header {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  padding: 2rem;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  text-align: center;
}

.btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(108, 99, 255, 0.4);
}

@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }
  
  .header {
    padding: 1rem;
  }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.card {
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  padding: 1.5rem;
  animation: fadeIn 0.5s ease;
}`;

export default function CSSScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>CSS Rendering</Text>
      <CSSRenderer css={cssContent} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', padding: 16, color: '#333' },
});
