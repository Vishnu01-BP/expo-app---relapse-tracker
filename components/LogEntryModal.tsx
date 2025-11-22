import { getAIAdvice } from '@/lib/ai'; // <--- IMPORT OUR NEW AI HELPER
import { createSupabaseClient } from '@/lib/supabase';
import { useAuth } from '@clerk/clerk-expo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { AlertCircle, ArrowRight, Bot, CheckCircle2, Heart, Plus, Sparkles, X } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

type LogType = 'urge' | 'relapse';

const DEFAULT_MOODS = [
  'Anxious', 'Stressed', 'Bored', 'Craving', 
  'Hopeful', 'Tired', 'Lonely', 'Angry'
];

const MOOD_STORAGE_KEY = 'user_personalized_moods';

interface LogEntryModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialType?: LogType;
}

export const LogEntryModal = ({ visible, onClose, onSuccess, initialType = 'urge' }: LogEntryModalProps) => {
  const { getToken } = useAuth();
  
  // STATE
  const [loading, setLoading] = useState(false);
  const [loadingState, setLoadingState] = useState(''); // 'Saving...' or 'Consulting AI...'
  const [type, setType] = useState<LogType>(initialType);
  const [mood, setMood] = useState('');
  const [notes, setNotes] = useState('');
  const [currentMoodList, setCurrentMoodList] = useState<string[]>(DEFAULT_MOODS);
  
  // AI RESULT STATE
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);

  // ANIMATIONS
  const slideAnim = useRef(new Animated.Value(600)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const sparkleRotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      resetForm();
      loadMoodList();
      runEntranceAnimation();
    } else {
      resetAnimations();
    }
  }, [visible, initialType]);

  const resetForm = () => {
    setType(initialType);
    setMood('');
    setNotes('');
    setAiAdvice(null); // Reset AI
    setLoading(false);
  };

  const runEntranceAnimation = () => {
    Animated.parallel([
      Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.timing(sparkleRotate, { toValue: 1, duration: 2000, useNativeDriver: true })
    ).start();
  };

  const resetAnimations = () => {
    slideAnim.setValue(600);
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.9);
  };

  const sparkleRotation = sparkleRotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  const loadMoodList = async () => {
    try {
      const stored = await AsyncStorage.getItem(MOOD_STORAGE_KEY);
      if (stored) setCurrentMoodList(JSON.parse(stored));
    } catch (error) {
      console.log('Failed to load moods', error);
    }
  };

  const handleSubmit = async () => {
    if (!mood.trim()) {
      Alert.alert('Required', 'Please select or type how you are feeling.');
      return;
    }

    const standardizedMood = mood.trim();
    setLoading(true);
    setLoadingState('Saving...');

    try {
      // 1. DB SAVE
      const token = await getToken({ template: 'supabase' });
      if (!token) throw new Error('Not authenticated');
      const supabase = createSupabaseClient(token);
      
      const { data: insertedData, error } = await supabase.from('logs').insert({
        type,
        mood: standardizedMood,
        notes,
      }).select().single();

      if (error) throw error;
      if (!insertedData) throw new Error('Failed to create log entry');

      // 2. LOCAL UPDATE
      await updatePersonalMoods(standardizedMood);
      onSuccess(); // Update streak in background

      // 3. AI CALL
      setLoadingState('Consulting Coach...');
      const advice = await getAIAdvice(standardizedMood, notes);
      
      if (advice) {
        // 4. SAVE AI RESPONSE TO DATABASE
        const { error: updateError } = await supabase
          .from('logs')
          .update({ ai_response: advice })
          .eq('id', insertedData.id);
        
        if (updateError) {
          console.error('Failed to save AI response:', updateError);
          // Still show the advice even if save fails
        }
        
        setAiAdvice(advice); // SHOW AI SCREEN
      } else {
        onClose(); // No AI? Just close
      }

    } catch (err: any) {
      Alert.alert('Error', err.message);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const updatePersonalMoods = async (newMood: string) => {
    const exists = currentMoodList.some(m => m.toLowerCase() === newMood.toLowerCase());
    if (!exists) {
      const newList = [newMood, ...currentMoodList].slice(0, 8);
      setCurrentMoodList(newList);
      await AsyncStorage.setItem(MOOD_STORAGE_KEY, JSON.stringify(newList));
    }
  };

  const getMoodEmoji = (moodText: string) => {
    const emojiMap: { [key: string]: string } = {
      'Anxious': '😰', 'Stressed': '😓', 'Bored': '😑', 'Craving': '😣',
      'Hopeful': '🌟', 'Tired': '😴', 'Lonely': '😔', 'Angry': '😠',
    };
    return emojiMap[moodText] || '💭';
  };

  // --- RENDER: AI ADVICE VIEW ---
  if (aiAdvice) {
    return (
      <Modal visible={visible} animationType="none" transparent>
         <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
          <Animated.View style={[styles.modalContainer, styles.aiContainer]}>
            
            <View style={styles.aiIconContainer}>
               <LinearGradient colors={['#6366F1', '#4F46E5']} style={styles.aiIconBg}>
                 <Bot size={40} color="#fff" />
               </LinearGradient>
            </View>

            <Text style={styles.aiTitle}>Coach's Note</Text>
            
            <View style={styles.adviceBox}>
              <Text style={styles.adviceText}>"{aiAdvice}"</Text>
            </View>

            <TouchableOpacity style={styles.aiCloseBtn} onPress={onClose}>
              <Text style={styles.aiCloseText}>Got it, thanks</Text>
              <ArrowRight size={20} color="#fff" />
            </TouchableOpacity>

          </Animated.View>
         </Animated.View>
      </Modal>
    );
  }

  // --- RENDER: FORM VIEW ---
  return (
    <Modal visible={visible} animationType="none" transparent>
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Animated.View 
          style={[
            styles.modalContainer, 
            { transform: [{ translateY: slideAnim }, { scale: scaleAnim }] }
          ]}
        >
          
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <Animated.View style={{ transform: [{ rotate: sparkleRotation }] }}>
                <Sparkles size={24} color="#10B981" />
              </Animated.View>
              <Text style={styles.title}>Log Your Journey</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X color="#6B7280" size={22} />
            </TouchableOpacity>
          </View>

          {/* Form Content */}
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            
            {/* Type Selector */}
            <View style={styles.segmentContainer}>
              <TouchableOpacity 
                style={[styles.segmentBtn, type === 'urge' && styles.activeSegmentUrge]} 
                onPress={() => setType('urge')}
              >
                <View style={styles.segmentContent}>
                  <Heart size={18} color={type === 'urge' ? '#0284C7' : '#9CA3AF'} />
                  <Text style={[styles.segmentText, type === 'urge' && styles.activeTextUrge]}>Check-In</Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.segmentBtn, type === 'relapse' && styles.activeSegmentRelapse]} 
                onPress={() => setType('relapse')}
              >
                <View style={styles.segmentContent}>
                  <AlertCircle size={18} color={type === 'relapse' ? '#DC2626' : '#9CA3AF'} />
                  <Text style={[styles.segmentText, type === 'relapse' && styles.activeTextRelapse]}>Relapse</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Moods */}
            <View style={styles.section}>
              <Text style={styles.label}>How are you feeling?</Text>
              <View style={styles.chipContainer}>
                {currentMoodList.map((m) => (
                  <TouchableOpacity 
                    key={m} 
                    style={[styles.chip, mood === m && (type === 'urge' ? styles.activeChipUrge : styles.activeChipRelapse)]}
                    onPress={() => setMood(m)}
                  >
                    <Text style={styles.chipEmoji}>{getMoodEmoji(m)}</Text>
                    <Text style={[styles.chipText, mood === m && styles.activeChipText]}>{m}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {/* Custom Input */}
              <View style={styles.inputWrapper}>
                <TextInput 
                  style={styles.input} 
                  placeholder="Or type your own feeling..." 
                  placeholderTextColor="#9CA3AF"
                  value={mood}
                  onChangeText={setMood}
                />
                 {mood.length > 0 && !currentMoodList.includes(mood) && (
                  <LinearGradient colors={['#10B981', '#059669']} style={styles.addIndicator}>
                    <Plus size={12} color="#fff" />
                    <Text style={styles.addText}>Add New</Text>
                  </LinearGradient>
                )}
              </View>
            </View>

            {/* Notes */}
            <View style={styles.section}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>What's on your mind?</Text>
                <Text style={styles.optionalText}>Optional</Text>
              </View>
              <TextInput 
                style={[styles.input, styles.textArea]} 
                placeholder="Share what triggered this feeling..." 
                placeholderTextColor="#9CA3AF"
                value={notes}
                onChangeText={setNotes}
                multiline
              />
            </View>

            {/* Submit Button */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.saveBtn, (!mood.trim() || loading) && styles.saveBtnDisabled]} 
                onPress={handleSubmit}
                disabled={!mood.trim() || loading}
              >
                {loading ? (
                  <View style={styles.loadingRow}>
                     <ActivityIndicator color="#fff" size="small"/>
                     <Text style={styles.loadingText}>{loadingState}</Text>
                  </View>
                ) : (
                  <LinearGradient
                    colors={type === 'urge' ? ['#0EA5E9', '#0284C7'] : ['#EF4444', '#DC2626']}
                    style={styles.saveGradient}
                  >
                    <CheckCircle2 size={20} color="#fff" />
                    <Text style={styles.saveText}>Save Entry</Text>
                  </LinearGradient>
                )}
              </TouchableOpacity>
            </View>

          </ScrollView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContainer: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingTop: 28, height: '92%' },
  
  // AI View Styles
  aiContainer: { alignItems: 'center', justifyContent: 'center', height: '50%' },
  aiIconContainer: { marginBottom: 20, shadowColor: '#6366F1', shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  aiIconBg: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  aiTitle: { fontSize: 22, fontWeight: '800', color: '#111', marginBottom: 16 },
  adviceBox: { backgroundColor: '#F3F4F6', padding: 20, borderRadius: 16, marginBottom: 30, width: '100%' },
  adviceText: { fontSize: 16, lineHeight: 24, color: '#374151', textAlign: 'center', fontStyle: 'italic', fontWeight: '500' },
  aiCloseBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#111', paddingVertical: 16, paddingHorizontal: 32, borderRadius: 30 },
  aiCloseText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  // Form Styles
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { fontSize: 24, fontWeight: '800', color: '#111827' },
  closeBtn: { padding: 10, backgroundColor: '#F3F4F6', borderRadius: 24, width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  
  segmentContainer: { flexDirection: 'row', backgroundColor: '#F9FAFB', borderRadius: 20, padding: 6, marginBottom: 28, borderWidth: 1, borderColor: '#E5E7EB' },
  segmentBtn: { flex: 1, paddingVertical: 14, paddingHorizontal: 12, alignItems: 'center', borderRadius: 16 },
  segmentContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  activeSegmentUrge: { backgroundColor: '#DBEAFE' },
  activeSegmentRelapse: { backgroundColor: '#FEE2E2' },
  segmentText: { fontWeight: '700', color: '#6B7280', fontSize: 15 },
  activeTextUrge: { color: '#0284C7' },
  activeTextRelapse: { color: '#DC2626' },
  
  scrollContent: { paddingBottom: 30 },
  section: { marginBottom: 28 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  label: { fontSize: 15, fontWeight: '800', color: '#111827' },
  optionalText: { fontSize: 12, fontWeight: '600', color: '#9CA3AF' },
  
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  chip: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 24, backgroundColor: '#F9FAFB', borderWidth: 2, borderColor: '#E5E7EB', flexDirection: 'row', alignItems: 'center', gap: 6 },
  activeChipUrge: { backgroundColor: '#DBEAFE', borderColor: '#0284C7' },
  activeChipRelapse: { backgroundColor: '#FEE2E2', borderColor: '#DC2626' },
  chipEmoji: { fontSize: 16 },
  chipText: { color: '#374151', fontWeight: '700', fontSize: 14 },
  activeChipText: { color: '#111827' },

  inputWrapper: { position: 'relative' },
  input: { borderWidth: 2, borderColor: '#E5E7EB', borderRadius: 16, padding: 16, fontSize: 15, backgroundColor: '#FAFAFA', color: '#111827', fontWeight: '500' },
  textArea: { height: 120, textAlignVertical: 'top', paddingBottom: 36 },
  
  addIndicator: { position: 'absolute', right: 12, top: 14, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  addText: { fontSize: 12, fontWeight: '700', color: '#fff' },

  buttonContainer: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelBtn: { flex: 1, padding: 18, borderRadius: 16, alignItems: 'center', backgroundColor: '#F3F4F6', borderWidth: 2, borderColor: '#E5E7EB' },
  cancelText: { color: '#6B7280', fontWeight: '700', fontSize: 16 },
  saveBtn: { flex: 2, borderRadius: 16, overflow: 'hidden' },
  saveBtnDisabled: { opacity: 0.5 },
  saveGradient: { padding: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  saveText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center', padding: 18, backgroundColor: '#333' },
  loadingText: { color: '#fff', fontWeight: '600' }
});