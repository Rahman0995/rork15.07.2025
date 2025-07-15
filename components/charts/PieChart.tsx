import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';

interface PieChartData {
  label: string;
  value: number;
  color: string;
}

interface PieChartProps {
  data: PieChartData[];
  size?: number;
  showLegend?: boolean;
}

export const PieChart: React.FC<PieChartProps> = ({ 
  data, 
  size = 120,
  showLegend = true 
}) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  if (total === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Нет данных</Text>
      </View>
    );
  }
  
  let currentAngle = 0;
  const segments = data.map((item) => {
    const percentage = (item.value / total) * 100;
    const angle = (item.value / total) * 360;
    const segment = {
      ...item,
      percentage,
      startAngle: currentAngle,
      endAngle: currentAngle + angle,
    };
    currentAngle += angle;
    return segment;
  });
  
  const radius = size / 2;
  const center = radius;
  
  const createArcPath = (startAngle: number, endAngle: number) => {
    const start = polarToCartesian(center, center, radius - 10, endAngle);
    const end = polarToCartesian(center, center, radius - 10, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    
    return [
      "M", center, center,
      "L", start.x, start.y,
      "A", radius - 10, radius - 10, 0, largeArcFlag, 0, end.x, end.y,
      "Z"
    ].join(" ");
  };
  
  function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.chartContainer}>
        <View 
          style={[
            styles.pieChart,
            { width: size, height: size, borderRadius: size / 2 }
          ]}
        >
          {segments.map((segment, index) => {
            const percentage = (segment.value / total) * 100;
            const rotation = segment.startAngle + (segment.endAngle - segment.startAngle) / 2;
            
            return (
              <View
                key={index}
                style={[
                  styles.segment,
                  {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    backgroundColor: segment.color,
                    transform: [
                      { rotate: `${segment.startAngle}deg` }
                    ],
                  }
                ]}
              >
                <View
                  style={[
                    styles.segmentMask,
                    {
                      width: size,
                      height: size,
                      borderRadius: size / 2,
                      backgroundColor: colors.card,
                      transform: [
                        { rotate: `${segment.endAngle - segment.startAngle}deg` }
                      ],
                    }
                  ]}
                />
              </View>
            );
          })}
          
          {/* Center circle */}
          <View style={[
            styles.centerCircle,
            {
              width: size * 0.6,
              height: size * 0.6,
              borderRadius: (size * 0.6) / 2,
              top: size * 0.2,
              left: size * 0.2,
            }
          ]}>
            <Text style={styles.totalText}>{total}</Text>
            <Text style={styles.totalLabel}>Всего</Text>
          </View>
        </View>
        
        {showLegend && (
          <View style={styles.legend}>
            {segments.map((segment, index) => (
              <View key={index} style={styles.legendItem}>
                <View 
                  style={[
                    styles.legendColor,
                    { backgroundColor: segment.color }
                  ]} 
                />
                <Text style={styles.legendText}>
                  {segment.label} ({segment.percentage.toFixed(1)}%)
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 16,
  },
  chartContainer: {
    alignItems: 'center',
  },
  pieChart: {
    position: 'relative',
    overflow: 'hidden',
  },
  segment: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  segmentMask: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  centerCircle: {
    position: 'absolute',
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  totalLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  legend: {
    marginTop: 16,
    alignItems: 'flex-start',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: colors.text,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 120,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});