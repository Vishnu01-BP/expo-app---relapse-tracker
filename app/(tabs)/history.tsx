import { useTheme } from '@/context/ThemeContext';
import { createSupabaseClient } from '@/lib/supabase';
import { useAuth } from '@clerk/clerk-expo';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import { Bot, PieChart as PieIcon, Sparkles, TrendingUp } from 'lucide-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { BarChart, PieChart } from 'react-native-gifted-charts'; // <--- CHART LIBRARY
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface Log {
  id: string;
  created_at: string;
  type: 'urge' | 'relapse';
  mood: string;
  notes: string | null;
  ai_response: string | null;
}

export default function HistoryScreen() {
  const { getToken } = useAuth();
  const { colors } = useTheme();
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLogs = async () => {
    try {
      const token = await getToken({ template: 'supabase' });
      if (!token) return;

      const supabase = createSupabaseClient(token);

      const { data, error } = await supabase
        .from('logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setLogs(data);
      
    } catch (err) {
      console.error('Error fetching logs:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchLogs();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchLogs();
  };

  // --- ANALYTICS LOGIC ---
  const { moodData, weeklyData } = useMemo(() => {
    if (logs.length === 0) return { moodData: [], weeklyData: [] };

    // 1. MOOD BREAKDOWN
    const moodCounts: Record<string, number> = {};
    logs.forEach(l => {
      const m = l.mood || 'Unknown';
      moodCounts[m] = (moodCounts[m] || 0) + 1;
    });

    const pieColors = ['#6366F1', '#EC4899', '#F59E0B', '#10B981', '#3B82F6'];
    const moodData = Object.keys(moodCounts)
      .map((key, index) => ({
        value: moodCounts[key],
        color: pieColors[index % pieColors.length],
        text: `${Math.round((moodCounts[key] / logs.length) * 100)}%`,
        mood: key // Custom prop for legend
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5 only

    // 2. WEEKLY ACTIVITY (Last 7 Days)
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i)); // Go back 6 days, then 5, etc.
      return d.toISOString().split('T')[0];
    });

    const dayCounts: Record<string, number> = {};
    logs.forEach(l => {
      const dateKey = l.created_at.split('T')[0];
      dayCounts[dateKey] = (dayCounts[dateKey] || 0) + 1;
    });

    const weeklyData = last7Days.map(date => {
      const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'narrow' }); // M, T, W...
      return {
        value: dayCounts[date] || 0,
        label: dayName,
        frontColor: '#1F2937', // Dark bars
        gradientColor: '#4B5563',
      };
    });

    return { moodData, weeklyData };
  }, [logs]);

  // --- RENDER HEADER (Charts) ---
  const renderHeader = () => {
    if (logs.length === 0) return null;

    return (
      <View>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Insights</Text>
          <Text style={styles.headerSub}>Understanding your patterns</Text>
        </View>

        {/* CHART 1: MOOD PIE */}
        <View style={[styles.chartCard, { backgroundColor: colors.card }]}>
          <View style={styles.chartTitleRow}>
             <PieIcon size={18} color="#6366F1" />
             <Text style={[styles.chartTitle, { color: colors.text }]}>Trigger Breakdown</Text>
          </View>
          
          <View style={styles.pieContainer}>
            <PieChart
              data={moodData}
              donut
              radius={60}
              innerRadius={40}
              showText
              textColor="#fff"
              textSize={10}
              fontWeight="bold"
            />
            {/* Custom Legend */}
            <View style={styles.legendContainer}>
              {moodData.map((item, index) => (
                <View key={index} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                  <Text style={[styles.legendText, { color: colors.subtext }]}>{item.mood}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* CHART 2: WEEKLY ACTIVITY */}
        <View style={[styles.chartCard, { backgroundColor: colors.card, marginBottom: 30 }]}>
          <View style={styles.chartTitleRow}>
             <TrendingUp size={18} color="#10B981" />
             <Text style={[styles.chartTitle, { color: colors.text }]}>Weekly Activity</Text>
          </View>
          
          <View style={{ alignItems: 'center', marginTop: 10 }}>
            <BarChart
              data={weeklyData}
              barWidth={22}
              noOfSections={3}
              barBorderRadius={4}
              frontColor="#1F2937"
              yAxisThickness={0}
              xAxisThickness={0}
              hideRules
              height={100}
              width={width - 100}
              xAxisLabelTextStyle={{color: colors.subtext, fontSize: 12}}
            />
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Logs</Text>
      </View>
    );
  };

  const renderLogItem = ({ item }: { item: Log }) => {
    const isRelapse = item.type === 'relapse';
    const date = new Date(item.created_at).toLocaleDateString(undefined, {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    return (
      <View style={styles.timelineItem}>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
           <View style={[styles.cardLeft, isRelapse ? styles.indicatorRelapse : styles.indicatorUrge]} />
           
           <View style={styles.cardContent}>
              <View style={styles.headerRow}>
                <Text style={[styles.typeBadge, isRelapse ? styles.textRelapse : styles.textUrge]}>
                  {item.type.toUpperCase()}
                </Text>
                <Text style={styles.dateText}>{date}</Text>
              </View>

              <Text style={[styles.moodText, { color: colors.text }]}>
                Mood: <Text style={{fontWeight: '400'}}>{item.mood}</Text>
              </Text>
              
              {item.notes && <Text style={styles.notesText}>{item.notes}</Text>}
           </View>
        </View>

        {item.ai_response && (
          <View style={styles.aiContainer}>
            <LinearGradient colors={['#EEF2FF', '#E0E7FF']} style={styles.aiCard}>
              <View style={styles.aiHeader}>
                <Bot size={14} color="#6366F1" />
                <Text style={styles.aiLabel}>Coach's Note</Text>
              </View>
              <Text style={styles.aiText}>"{item.ai_response}"</Text>
            </LinearGradient>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {loading ? (
        <ActivityIndicator size="large" color={colors.text} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(item) => item.id}
          renderItem={renderLogItem}
          ListHeaderComponent={renderHeader} // <--- CHARTS LIVE HERE
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.text} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Sparkles size={40} color="#ccc" />
              <Text style={styles.emptyText}>No logs yet. Start your journey!</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  listContent: { paddingBottom: 50 },
  
  // Header
  header: { marginVertical: 20 },
  headerTitle: { fontSize: 32, fontWeight: '800' },
  headerSub: { fontSize: 16, color: '#999', marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },

  // Charts
  chartCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  chartTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 },
  chartTitle: { fontSize: 16, fontWeight: '700' },
  
  pieContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  legendContainer: { gap: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 12, fontWeight: '600' },

  // Logs
  timelineItem: { marginBottom: 20 },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    minHeight: 80,
  },
  cardLeft: { width: 6, height: '100%' },
  indicatorRelapse: { backgroundColor: '#EF4444' },
  indicatorUrge: { backgroundColor: '#3B82F6' },
  
  cardContent: { flex: 1, padding: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  typeBadge: { fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  textRelapse: { color: '#EF4444' },
  textUrge: { color: '#3B82F6' },
  dateText: { color: '#999', fontSize: 12, fontWeight: '600' },
  moodText: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  notesText: { fontSize: 14, color: '#666', marginTop: 6, lineHeight: 20 },

  aiContainer: { marginLeft: 20, marginTop: -10, zIndex: -1 },
  aiCard: {
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    paddingTop: 24,
  },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  aiLabel: { fontSize: 12, fontWeight: '700', color: '#6366F1', textTransform: 'uppercase' },
  aiText: { fontSize: 14, color: '#374151', fontStyle: 'italic', lineHeight: 20 },

  emptyState: { alignItems: 'center', marginTop: 80, gap: 16 },
  emptyText: { color: '#999', fontSize: 16, fontWeight: '500' },
});