import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Avatar } from './Avatar';
import { colors } from '@/constants/colors';
import { User } from '@/types';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react-native';

interface UserStats {
  user: User;
  tasksCompleted: number;
  tasksTotal: number;
  reportsSubmitted: number;
  completionRate: number;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
}

interface UserStatsCardProps {
  stats: UserStats;
  onPress?: (user: User) => void;
}

export const UserStatsCard: React.FC<UserStatsCardProps> = ({ stats, onPress }) => {
  const getTrendIcon = () => {
    switch (stats.trend) {
      case 'up':
        return <TrendingUp size={16} color={colors.success} />;
      case 'down':
        return <TrendingDown size={16} color={colors.error} />;
      default:
        return <Minus size={16} color={colors.textSecondary} />;
    }
  };
  
  const getTrendColor = () => {
    switch (stats.trend) {
      case 'up':
        return colors.success;
      case 'down':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };
  
  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={() => onPress?.(stats.user)}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Avatar 
          uri={stats.user.avatar} 
          name={stats.user.name} 
          size={40} 
        />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{stats.user.name}</Text>
          <Text style={styles.userRank}>{stats.user.rank}</Text>
          <Text style={styles.userUnit}>{stats.user.unit}</Text>
        </View>
        <View style={styles.completionRate}>
          <Text style={styles.completionText}>
            {stats.completionRate}%
          </Text>
          <View style={styles.trendContainer}>
            {getTrendIcon()}
            <Text style={[styles.trendText, { color: getTrendColor() }]}>
              {stats.trendValue > 0 ? `+${stats.trendValue}%` : `${stats.trendValue}%`}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill,
              { width: `${stats.completionRate}%` }
            ]} 
          />
        </View>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.tasksCompleted}</Text>
          <Text style={styles.statLabel}>Выполнено</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.tasksTotal}</Text>
          <Text style={styles.statLabel}>Всего задач</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.reportsSubmitted}</Text>
          <Text style={styles.statLabel}>Отчетов</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  userRank: {
    fontSize: 14,
    color: colors.primary,
    marginTop: 2,
  },
  userUnit: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  completionRate: {
    alignItems: 'flex-end',
  },
  completionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 2,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
  },
});