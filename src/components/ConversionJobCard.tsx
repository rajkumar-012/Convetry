import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { ConversionJob } from '../types';

interface Props {
  job: ConversionJob;
}

export const ConversionJobCard = memo(({ job }: Props) => {
  const progressWidth = `${Math.max(5, job.progress)}%`;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.labelWrap}>
          <Text style={styles.title} numberOfLines={1}>
            {job.sourceName}
          </Text>
          <Text style={styles.caption}>{job.category.toUpperCase()}</Text>
        </View>
        <View style={[styles.badge, getStateStyle(job.state)]}>
          <Text style={styles.badgeText}>{job.state.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressBar, { width: progressWidth }]} />
      </View>
      <Text style={styles.detail}>Target: {job.targetFormat.toUpperCase()}</Text>
      {job.outputUri ? (
        <Text style={styles.detail} numberOfLines={1}>
          Output: {job.outputUri}
        </Text>
      ) : null}
      {job.error ? (
        <Text style={[styles.detail, styles.error]}>{job.error}</Text>
      ) : null}
    </View>
  );
});

ConversionJobCard.displayName = 'ConversionJobCard';

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  labelWrap: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  caption: {
    marginTop: 4,
    fontSize: 12,
    color: '#64748b',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBar: {
    height: 6,
    borderRadius: 6,
    backgroundColor: '#16a34a',
  },
  detail: {
    fontSize: 13,
    color: '#475569',
  },
  error: {
    color: '#dc2626',
  },
});

function getStateStyle(state: ConversionJob['state']) {
  switch (state) {
    case 'running':
      return { backgroundColor: '#0ea5e9' };
    case 'completed':
      return { backgroundColor: '#16a34a' };
    case 'failed':
      return { backgroundColor: '#dc2626' };
    case 'cancelled':
      return { backgroundColor: '#94a3b8' };
    case 'queued':
    default:
      return { backgroundColor: '#6366f1' };
  }
}

