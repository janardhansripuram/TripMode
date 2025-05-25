import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { PieChart, LineChart } from 'react-native-chart-kit';
import { Calendar, ChevronDown, ChevronUp, TrendingUp, Clock } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { THEME_COLORS } from '@/constants/colors';
import { fetchExpenseStats, fetchTotalSpent } from '@/services/expenseService';
import { formatCurrency } from '@/utils/formatters';
import { StatsByCategory, StatsByMonth } from '@/types';

const screenWidth = Dimensions.get('window').width;

export default function StatisticsScreen() {
  const { theme } = useTheme();
  const colors = THEME_COLORS[theme];
  
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('month'); // 'week', 'month', 'year', 'all'
  const [statsByCategory, setStatsByCategory] = useState<StatsByCategory[]>([]);
  const [statsByMonth, setStatsByMonth] = useState<StatsByMonth[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [timeframeDropdownOpen, setTimeframeDropdownOpen] = useState(false);
  
  useEffect(() => {
    loadStats();
  }, [timeframe]);
  
  const loadStats = async () => {
    setLoading(true);
    try {
      const [categoryStats, monthlyStats, total] = await Promise.all([
        fetchExpenseStats('category', timeframe),
        fetchExpenseStats('month', timeframe),
        fetchTotalSpent(timeframe)
      ]);
      
      setStatsByCategory(categoryStats);
      setStatsByMonth(monthlyStats);
      setTotalSpent(total);
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const chartConfig = {
    backgroundGradientFrom: colors.card,
    backgroundGradientTo: colors.card,
    color: (opacity = 1) => `rgba(42, 157, 143, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
  };
  
  const pieChartData = statsByCategory.map((stat, index) => {
    const categoryColors = [
      '#2A9D8F', // primary
      '#E76F51', // secondary
      '#F4A261', // accent
      '#43AA8B', // success
      '#F9C74F', // warning
      '#E63946', // error
      '#264653', // dark
    ];
    
    return {
      name: stat.category,
      value: stat.amount,
      color: categoryColors[index % categoryColors.length],
      legendFontColor: colors.text,
      legendFontSize: 12,
    };
  });
  
  const lineChartData = {
    labels: statsByMonth.map(stat => stat.month.substring(0, 3)),
    datasets: [
      {
        data: statsByMonth.map(stat => stat.amount),
        color: (opacity = 1) => `rgba(42, 157, 143, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };
  
  const renderTimeframeSelector = () => (
    <View style={styles.timeframeContainer}>
      <TouchableOpacity
        style={[styles.timeframeButton, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => setTimeframeDropdownOpen(!timeframeDropdownOpen)}
      >
        <Calendar size={20} color={colors.primary} />
        <Text style={[styles.timeframeText, { color: colors.text }]}>
          {timeframe === 'week' ? 'This Week' : 
           timeframe === 'month' ? 'This Month' : 
           timeframe === 'year' ? 'This Year' : 'All Time'}
        </Text>
        {timeframeDropdownOpen ? 
          <ChevronUp size={20} color={colors.text} /> : 
          <ChevronDown size={20} color={colors.text} />
        }
      </TouchableOpacity>
      
      {timeframeDropdownOpen && (
        <View style={[styles.timeframeDropdown, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TouchableOpacity 
            style={[
              styles.timeframeOption, 
              timeframe === 'week' && { backgroundColor: colors.primaryLight }
            ]}
            onPress={() => {
              setTimeframe('week');
              setTimeframeDropdownOpen(false);
            }}
          >
            <Text 
              style={[
                styles.timeframeOptionText, 
                { color: timeframe === 'week' ? colors.primary : colors.text }
              ]}
            >
              This Week
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.timeframeOption, 
              timeframe === 'month' && { backgroundColor: colors.primaryLight }
            ]}
            onPress={() => {
              setTimeframe('month');
              setTimeframeDropdownOpen(false);
            }}
          >
            <Text 
              style={[
                styles.timeframeOptionText, 
                { color: timeframe === 'month' ? colors.primary : colors.text }
              ]}
            >
              This Month
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.timeframeOption, 
              timeframe === 'year' && { backgroundColor: colors.primaryLight }
            ]}
            onPress={() => {
              setTimeframe('year');
              setTimeframeDropdownOpen(false);
            }}
          >
            <Text 
              style={[
                styles.timeframeOptionText, 
                { color: timeframe === 'year' ? colors.primary : colors.text }
              ]}
            >
              This Year
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.timeframeOption, 
              timeframe === 'all' && { backgroundColor: colors.primaryLight }
            ]}
            onPress={() => {
              setTimeframe('all');
              setTimeframeDropdownOpen(false);
            }}
          >
            <Text 
              style={[
                styles.timeframeOptionText, 
                { color: timeframe === 'all' ? colors.primary : colors.text }
              ]}
            >
              All Time
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
  
  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Statistics</Text>
        {renderTimeframeSelector()}
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.totalCard, { backgroundColor: colors.card }]}>
          <View style={styles.totalCardHeader}>
            <Text style={[styles.totalCardTitle, { color: colors.textLight }]}>Total Expenses</Text>
            <TrendingUp size={20} color={colors.success} />
          </View>
          <Text style={[styles.totalAmount, { color: colors.text }]}>
            {formatCurrency(totalSpent)}
          </Text>
          <Text style={[styles.totalPeriod, { color: colors.textLight }]}>
            {timeframe === 'week' ? 'This Week' : 
             timeframe === 'month' ? 'This Month' : 
             timeframe === 'year' ? 'This Year' : 'All Time'}
          </Text>
        </View>
        
        {statsByCategory.length > 0 ? (
          <View style={styles.chartSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Expenses by Category</Text>
            <View style={[styles.chartContainer, { backgroundColor: colors.card }]}>
              <PieChart
                data={pieChartData}
                width={screenWidth - 48}
                height={220}
                chartConfig={chartConfig}
                accessor="value"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
              />
            </View>
            
            <View style={styles.categoryListContainer}>
              {statsByCategory.map((stat, index) => (
                <View 
                  key={stat.category} 
                  style={[styles.categoryItem, { backgroundColor: colors.card }]}
                >
                  <View style={styles.categoryInfo}>
                    <View 
                      style={[
                        styles.categoryDot, 
                        { backgroundColor: pieChartData[index]?.color || colors.primary }
                      ]} 
                    />
                    <Text style={[styles.categoryName, { color: colors.text }]}>
                      {stat.category}
                    </Text>
                  </View>
                  <Text style={[styles.categoryAmount, { color: colors.text }]}>
                    {formatCurrency(stat.amount)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View style={[styles.emptyChart, { backgroundColor: colors.card }]}>
            <Text style={[styles.emptyChartText, { color: colors.textLight }]}>
              No expenses recorded for this period
            </Text>
          </View>
        )}
        
        {statsByMonth.length > 0 ? (
          <View style={styles.chartSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Spending Over Time</Text>
            <View style={[styles.chartContainer, { backgroundColor: colors.card }]}>
              <LineChart
                data={lineChartData}
                width={screenWidth - 48}
                height={220}
                chartConfig={{
                  ...chartConfig,
                  backgroundGradientFrom: colors.card,
                  backgroundGradientTo: colors.card,
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(42, 157, 143, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(${theme === 'dark' ? '255, 255, 255' : '0, 0, 0'}, ${opacity})`,
                  style: {
                    borderRadius: 16,
                  },
                  propsForDots: {
                    r: '6',
                    strokeWidth: '2',
                    stroke: '#2A9D8F',
                  },
                }}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 16,
                }}
              />
            </View>
          </View>
        ) : null}
        
        <View style={styles.statsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Insights</Text>
          
          <View style={[styles.insightCard, { backgroundColor: colors.card }]}>
            <Clock size={24} color={colors.primary} />
            <View style={styles.insightContent}>
              <Text style={[styles.insightTitle, { color: colors.text }]}>
                {statsByCategory.length > 0 ? 
                  `Highest spending on ${statsByCategory[0]?.category}` :
                  'No spending data available'
                }
              </Text>
              <Text style={[styles.insightDescription, { color: colors.textLight }]}>
                {statsByCategory.length > 0 ?
                  `You spent ${formatCurrency(statsByCategory[0]?.amount)} on ${statsByCategory[0]?.category}` :
                  'Add expenses to see your spending insights'
                }
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    marginBottom: 16,
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 24,
    marginBottom: 16,
  },
  timeframeContainer: {
    position: 'relative',
  },
  timeframeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  timeframeText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    flex: 1,
    marginLeft: 8,
  },
  timeframeDropdown: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    borderWidth: 1,
    borderRadius: 8,
    zIndex: 10,
  },
  timeframeOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  timeframeOptionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  totalCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  totalCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  totalCardTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
  },
  totalAmount: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 32,
    marginBottom: 4,
  },
  totalPeriod: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  chartSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    marginBottom: 16,
  },
  chartContainer: {
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  categoryListContainer: {
    marginTop: 16,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  categoryName: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  categoryAmount: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
  emptyChart: {
    padding: 40,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyChartText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    textAlign: 'center',
  },
  statsSection: {
    marginBottom: 24,
  },
  insightCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  insightContent: {
    marginLeft: 16,
    flex: 1,
  },
  insightTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    marginBottom: 4,
  },
  insightDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
});