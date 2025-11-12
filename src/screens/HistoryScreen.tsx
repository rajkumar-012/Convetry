import React from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { ConversionJobCard } from '../components/ConversionJobCard';
import { useConversionStore } from '../store/useConversionStore';

export function HistoryScreen() {
  const jobs = useConversionStore((state) => state.jobs);
  const completed = jobs.filter((job) => job.state === 'completed' || job.state === 'failed');

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>History</Text>
        <Text style={styles.subtitle}>Completed and failed conversions</Text>
      </View>
      <FlatList
        contentContainerStyle={styles.list}
        data={completed}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ConversionJobCard job={item} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Nothing yet</Text>
            <Text style={styles.emptySubtitle}>Finish a conversion to see it here.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#cbd5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
  },
  subtitle: {
    marginTop: 6,
    color: '#475569',
  },
  list: {
    padding: 20,
    gap: 16,
  },
  empty: {
    marginTop: 120,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
  },
  emptySubtitle: {
    color: '#64748b',
  },
});

