import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { XMLRenderer } from '@laddhaanshul/content-renderer';

const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<bookstore name="Tech Books">
  <book category="programming" lang="en">
    <title>Learning React</title>
    <author>John Doe</author>
    <year>2024</year>
    <price currency="USD">39.99</price>
    <isbn>978-0-123456-78-9</isbn>
    <tags>
      <tag>react</tag>
      <tag>javascript</tag>
      <tag>frontend</tag>
    </tags>
  </book>
  <book category="programming" lang="en">
    <title>Mastering TypeScript</title>
    <author>Jane Smith</author>
    <year>2024</year>
    <price currency="USD">44.99</price>
    <isbn>978-0-987654-32-1</isbn>
    <tags>
      <tag>typescript</tag>
      <tag>javascript</tag>
    </tags>
  </book>
  <book category="design" lang="en">
    <title>UI/UX Design Patterns</title>
    <author>Bob Wilson</author>
    <year>2023</year>
    <price currency="USD">29.99</price>
    <isbn>978-0-555555-55-5</isbn>
  </book>
  <!-- Store info -->
  <store_info>
    <owner>Book Corp</owner>
    <address>123 Main St, Tech City</address>
    <phone>+1-555-0123</phone>
  </store_info>
</bookstore>`;

export default function XMLScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>XML Rendering</Text>
      <XMLRenderer xml={xmlContent} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', padding: 16, color: '#333' },
});
