import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/constants/theme';

interface LineChartData {
  label: string;
  value: number;
}

interface LineChartProps {
  data: LineChartData[];
  color?: string;
  height?: number;
  showDots?: boolean;
}

export const LineChart: React.FC<LineChartProps> = ({ 
  data, 
  color,
  height = 150,
  showDots = true 
}) => {
  const { colors } = useTheme();
  const lineColor = color || colors.primary;
  if (data.length === 0) return null;
  
  const maxValue = Math.max(...data.map(item => item.value));
  const minValue = Math.min(...data.map(item => item.value));
  const range = maxValue - minValue || 1;
  
  const chartWidth = 280;
  const chartHeight = height - 40;
  const stepX = chartWidth / (data.length - 1 || 1);
  
  const getY = (value: number) => {
    return chartHeight - ((value - minValue) / range) * chartHeight;
  };
  
  const pathData = data.map((item, index) => {
    const x = index * stepX;
    const y = getY(item.value);
    return { x, y, value: item.value, label: item.label };
  });
  
  const styles = createStyles(colors);
  
  return (
    <View style={styles.container}>
      <View style={[styles.chartContainer, { width: chartWidth, height }]}>
        <View style={styles.chart}>
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
            <View 
              key={index}
              style={[
                styles.gridLine,
                { top: ratio * chartHeight }
              ]} 
            />
          ))}
          
          {/* Line path */}
          <View style={styles.lineContainer}>
            {pathData.map((point, index) => {
              if (index === 0) return null;
              
              const prevPoint = pathData[index - 1];
              const lineWidth = Math.sqrt(
                Math.pow(point.x - prevPoint.x, 2) + 
                Math.pow(point.y - prevPoint.y, 2)
              );
              const angle = Math.atan2(
                point.y - prevPoint.y, 
                point.x - prevPoint.x
              ) * (180 / Math.PI);
              
              return (
                <View
                  key={index}
                  style={[
                    styles.lineSegment,
                    {
                      left: prevPoint.x,
                      top: prevPoint.y,
                      width: lineWidth,
                      backgroundColor: lineColor,
                      transform: [{ rotate: `${angle}deg` }],
                    }
                  ]}
                />
              );
            })}
          </View>
          
          {/* Data points */}
          {showDots && pathData.map((point, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  left: point.x - 4,
                  top: point.y - 4,
                  backgroundColor: lineColor,
                }
              ]}
            />
          ))}
        </View>
        
        {/* Labels */}
        <View style={styles.labelsContainer}>
          {data.map((item, index) => (
            <Text 
              key={index}
              style={[
                styles.label,
                { left: index * stepX - 20 }
              ]}
            >
              {item.label}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
  },
  chartContainer: {
    position: 'relative',
  },
  chart: {
    position: 'relative',
    backgroundColor: colors.background,
    borderRadius: 8,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colors.border,
    opacity: 0.3,
  },
  lineContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  lineSegment: {
    position: 'absolute',
    height: 2,
    borderRadius: 1,
  },
  dot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.card,
  },
  labelsContainer: {
    position: 'relative',
    height: 20,
    marginTop: 8,
  },
  label: {
    position: 'absolute',
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'center',
    width: 40,
  },
});