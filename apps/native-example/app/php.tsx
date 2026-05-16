import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { CodeRenderer } from '@content-renderer/react-and-native';

const phpCode = `<?php

namespace App\\Services;

class UserService
{
    private array $users = [];

    public function __construct(private Database $db) {}

    public function getUser(int $id): ?User
    {
        $query = "SELECT * FROM users WHERE id = :id";
        $stmt = $this->db->prepare($query);
        $stmt->execute([':id' => $id]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($data === false) {
            return null;
        }

        return new User(
            id: $data['id'],
            name: $data['name'],
            email: $data['email']
        );
    }

    public function getAllUsers(): array
    {
        $query = "SELECT * FROM users ORDER BY name ASC";
        $stmt = $this->db->query($query);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Create a new user in the database
     */
    public function createUser(string $name, string $email): User
    {
        $query = "INSERT INTO users (name, email) VALUES (:name, :email)";
        $stmt = $this->db->prepare($query);
        $stmt->execute([':name' => $name, ':email' => $email]);

        return new User(
            id: (int) $this->db->lastInsertId(),
            name: $name,
            email: $email
        );
    }
}
`;

export default function PHPScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>PHP Code Rendering</Text>
      <CodeRenderer code={phpCode} language="php" showLineNumbers={true} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', padding: 16, color: '#333' },
});
