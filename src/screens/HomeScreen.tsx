import { StatusBar } from 'expo-status-bar';
import * as DocumentPicker from 'expo-document-picker';
import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { v4 as uuid } from 'uuid';

import { ConversionJobCard } from '../components/ConversionJobCard';
import { inferDescriptor } from '../constants/conversions';
import { useConversionQueue } from '../hooks/useConversionQueue';
import { useConversionStore } from '../store/useConversionStore';
import type { ConversionDescriptor } from '../types';

interface PendingFile {
  name: string;
  uri: string;
  mimeType?: string | null;
}

export function HomeScreen({ navigation }: { navigation: any }) {
  const jobs = useConversionStore((state) => state.jobs);
  const enqueue = useConversionStore((state) => state.enqueue);
  const [pendingFile, setPendingFile] = useState<PendingFile | null>(null);
  const [descriptor, setDescriptor] = useState<ConversionDescriptor | null>(null);
  const [targetFormat, setTargetFormat] = useState<string>('');
  const [quality, setQuality] = useState('85');

  useConversionQueue();

  const runningCount = useMemo(
    () => jobs.filter((job) => job.state === 'running').length,
    [jobs],
  );

  const completedCount = useMemo(
    () => jobs.filter((job) => job.state === 'completed').length,
    [jobs],
  );

  const handlePickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      multiple: false,
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets?.length) {
      return;
    }

    const asset = result.assets[0];
    const extension = asset.name.split('.').pop() ?? 'txt';
    const inferred = inferDescriptor(extension);
    setPendingFile({ name: asset.name, uri: asset.uri, mimeType: asset.mimeType });
    setDescriptor(inferred);
    setTargetFormat(inferred.defaultTarget);
    setQuality('85');
  };

  const handleConfirm = () => {
    if (!pendingFile || !descriptor || !targetFormat) {
      return;
    }

    const qualityValue = Number.isNaN(Number.parseInt(quality, 10))
      ? 85
      : Math.min(100, Math.max(1, Number.parseInt(quality, 10)));

    enqueue({
      id: uuid(),
      sourceUri: pendingFile.uri,
      sourceName: pendingFile.name,
      category: descriptor.category,
      targetFormat,
      parameters:
        descriptor.category === 'image'
          ? { quality: qualityValue }
          : undefined,
    });

    setPendingFile(null);
    setDescriptor(null);
    setTargetFormat('');
  };

  const handleCancel = () => {
    setPendingFile(null);
    setDescriptor(null);
    setTargetFormat('');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Converty</Text>
          <Text style={styles.subtitle}>Offline file conversion hub</Text>
        </View>
        <Pressable style={styles.historyButton} onPress={() => navigation.navigate('History')}>
          <Text style={styles.historyText}>History ({completedCount})</Text>
        </Pressable>
      </View>

      <View style={styles.metrics}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Running</Text>
          <Text style={styles.metricValue}>{runningCount}</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Queued</Text>
          <Text style={styles.metricValue}>{jobs.filter((j) => j.state === 'queued').length}</Text>
        </View>
      </View>

      <Pressable style={styles.primaryButton} onPress={handlePickFile}>
        <Text style={styles.primaryButtonText}>New Conversion</Text>
      </Pressable>

      <FlatList
        contentContainerStyle={styles.list}
        data={jobs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ConversionJobCard job={item} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No conversions yet</Text>
            <Text style={styles.emptySubtitle}>Tap “New Conversion” to get started.</Text>
          </View>
        }
      />

      <Modal transparent visible={Boolean(pendingFile)} animationType="slide" onRequestClose={handleCancel}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Select target format</Text>
            <Text style={styles.modalSubtitle}>{pendingFile?.name}</Text>

            <View style={styles.targetList}>
              {descriptor?.supportedTargets.map((format) => (
                <Pressable
                  key={format}
                  style={[styles.targetOption, targetFormat === format && styles.targetOptionActive]}
                  onPress={() => setTargetFormat(format)}
                >
                  <Text
                    style={[styles.targetOptionText, targetFormat === format && styles.targetOptionTextActive]}
                  >
                    {format.toUpperCase()}
                  </Text>
                </Pressable>
              ))}
            </View>

            {descriptor?.category === 'image' ? (
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Quality (1-100)</Text>
                <TextInput
                  keyboardType="numeric"
                  value={quality}
                  onChangeText={setQuality}
                  style={styles.fieldInput}
                />
              </View>
            ) : null}

            <View style={styles.modalActions}>
              <Pressable style={styles.secondaryButton} onPress={handleCancel}>
                <Text style={styles.secondaryText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.confirmButton} onPress={handleConfirm}>
                <Text style={styles.confirmText}>Add to queue</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingTop: 12,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f172a',
  },
  subtitle: {
    marginTop: 4,
    color: '#475569',
  },
  historyButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#0ea5e9',
  },
  historyText: {
    color: '#0ea5e9',
    fontWeight: '600',
  },
  metrics: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 1,
  },
  metricLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  metricValue: {
    marginTop: 6,
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  primaryButton: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: '#16a34a',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  list: {
    padding: 20,
    gap: 16,
  },
  emptyState: {
    marginTop: 100,
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    gap: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  modalSubtitle: {
    color: '#475569',
  },
  targetList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  targetOption: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#e2e8f0',
  },
  targetOptionActive: {
    backgroundColor: '#16a34a',
  },
  targetOptionText: {
    fontWeight: '600',
    color: '#0f172a',
  },
  targetOptionTextActive: {
    color: '#fff',
  },
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    fontWeight: '600',
    color: '#0f172a',
  },
  fieldInput: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cbd5f5',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#0f172a',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cbd5f5',
    alignItems: 'center',
  },
  secondaryText: {
    color: '#475569',
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#16a34a',
    alignItems: 'center',
  },
  confirmText: {
    color: '#fff',
    fontWeight: '600',
  },
});

