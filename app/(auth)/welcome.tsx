import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ArrowRight, Brain, Heart, Target, TrendingUp, Zap } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// --- 1. DATA & ASSETS ---
const SLIDES = [
  {
    id: '1',
    title: 'You vs. You',
    description: "Honesty is power. If you slip up, log it, learn from it, and restart your streak stronger than before.",
    icon: Target,
    color: '#6366F1', // Indigo
    gradient: ['#6366F1', '#8B5CF6']
  },
  {
    id: '2',
    title: 'Endless Possibilities',
    description: "Explore curated articles, friendly battles, and use the Panic Button when urges strike.",
    icon: Zap,
    color: '#8B5CF6', // Violet
    gradient: ['#8B5CF6', '#EC4899']
  },
  {
    id: '3',
    title: 'Against All Odds',
    description: "Track your progress visually. Make daily commitments and watch your recovery grow.",
    icon: TrendingUp,
    color: '#EC4899', // Pink
    gradient: ['#EC4899', '#F59E0B']
  },
  {
    id: 'welcome', 
    title: "Welcome to MindMend",
    description: "Your journey to clarity and control starts today.",
    icon: Heart,
    color: '#0f172a', // Slate 900
    gradient: ['#0f172a', '#1e293b']
  }
];

// Animated Icon Component
const AnimatedIcon = ({ Icon, color, gradient, size = 120, delay = 0 }: {
  Icon: any;
  color: string;
  gradient: string[];
  size?: number;
  delay?: number;
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entrance animation
    Animated.sequence([
      Animated.delay(delay),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous rotation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      })
    ).start();

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        styles.iconContainer,
        {
          transform: [
            { scale: scaleAnim },
            { scale: pulseAnim },
            { rotate: rotation },
          ],
        },
      ]}
    >
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.iconGradient, { width: size, height: size, borderRadius: size / 2 }]}
      >
        <Icon size={size * 0.4} color="#fff" strokeWidth={2.5} />
      </LinearGradient>
    </Animated.View>
  );
};

export default function WelcomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef<FlatList>(null);

  // Track scroll position
  const viewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems && viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  // --- 2. RENDER ITEM ---
  const renderItem = ({ item }: { item: typeof SLIDES[0] }) => {
    
    // CASE A: FINAL WELCOME SLIDE
    if (item.id === 'welcome') {
      return (
        <View style={[styles.slide, { width }]}>
          <View style={styles.welcomeContainer}>
            {/* Large Hero Icon */}
            <View style={styles.heroIconContainer}>
              <AnimatedIcon 
                Icon={item.icon} 
                color={item.color} 
                gradient={item.gradient}
                size={200}
                delay={200}
              />
            </View>
            
            <Text style={styles.welcomeTitle}>{item.title}</Text>
            <Text style={styles.welcomeDesc}>{item.description}</Text>

            {/* Auth Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.primaryButton}
                activeOpacity={0.8}
                onPress={() => router.push('/(auth)/sign-in')}
              >
                <Text style={styles.primaryButtonText}>Sign In</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.secondaryButton}
                activeOpacity={0.8}
                onPress={() => router.push('/(auth)/sign-up')}
              >
                <Text style={styles.secondaryButtonText}>Create Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    }

    // CASE B: STANDARD ONBOARDING SLIDES
    return (
      <View style={[styles.slide, { width }]}>
        <View style={styles.iconWrapper}>
          <AnimatedIcon 
            Icon={item.icon} 
            color={item.color} 
            gradient={item.gradient}
            size={240}
          />
        </View>
        
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: item.color }]}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      </View>
    );
  };

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      const nextIndex = currentIndex + 1;
      // Use scrollToOffset for more reliable scrolling
      slidesRef.current?.scrollToOffset({
        offset: nextIndex * width,
        animated: true,
      });
      // Also update the index manually to keep state in sync
      setCurrentIndex(nextIndex);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* SLIDER LIST */}
      <View style={{ flex: 3 }}>
        <FlatList
          data={SLIDES}
          renderItem={renderItem}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          bounces={false}
          keyExtractor={(item) => item.id}
          getItemLayout={(_, index) => ({
            length: width,
            offset: width * index,
            index,
          })}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
            useNativeDriver: false,
          })}
          onViewableItemsChanged={viewableItemsChanged}
          viewabilityConfig={viewConfig}
          ref={slidesRef}
          scrollEventThrottle={16}
        />
      </View>

      {/* FOOTER (Dots & Next Button) - Hide on last slide */}
      {currentIndex < SLIDES.length - 1 && (
        <View style={styles.footer}>
          {/* Pagination Dots */}
          <View style={styles.paginator}>
            {SLIDES.map((_, i) => {
              const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
              const dotWidth = scrollX.interpolate({
                inputRange,
                outputRange: [8, 24, 8], // Expands when active
                extrapolate: 'clamp',
              });
              const opacity = scrollX.interpolate({
                inputRange,
                outputRange: [0.3, 1, 0.3],
                extrapolate: 'clamp',
              });

              return (
                <Animated.View
                  key={i.toString()}
                  style={[styles.dot, { width: dotWidth, opacity, backgroundColor: SLIDES[i].color }]}
                />
              );
            })}
          </View>

          {/* Next Arrow */}
          <TouchableOpacity style={styles.nextButton} onPress={handleNext} activeOpacity={0.8}>
             <LinearGradient
               colors={['#0f172a', '#334155']} // Slate Gradient
               style={styles.nextButtonGradient}
             >
               <ArrowRight color="#fff" size={24} />
             </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  slide: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  
  // --- Standard Slide Styles ---
  iconWrapper: {
    width: 320,
    height: 320,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconGradient: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  textContainer: { alignItems: 'center', paddingHorizontal: 10 },
  title: { fontSize: 30, fontWeight: '800', marginBottom: 16, textAlign: 'center' },
  description: { fontSize: 16, color: '#64748b', textAlign: 'center', lineHeight: 24 },

  // --- Welcome Slide Styles ---
  welcomeContainer: { alignItems: 'center', width: '100%' },
  heroIconContainer: { 
    width: 280, 
    height: 280, 
    marginBottom: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeTitle: { fontSize: 32, fontWeight: '800', color: '#0f172a', marginBottom: 12, textAlign: 'center' },
  welcomeDesc: { fontSize: 16, color: '#64748b', textAlign: 'center', marginBottom: 48 },
  
  buttonContainer: { width: '100%', gap: 16 },
  primaryButton: {
    backgroundColor: '#0f172a', // Slate 900
    paddingVertical: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  secondaryButtonText: { color: '#0f172a', fontSize: 18, fontWeight: '600' },

  // --- Footer ---
  footer: { 
    height: 100, 
    justifyContent: 'space-between', 
    paddingHorizontal: 32, 
    flexDirection: 'row', 
    alignItems: 'center',
    paddingBottom: 20
  },
  paginator: { flexDirection: 'row', height: 64, alignItems: 'center' },
  dot: { height: 8, borderRadius: 4, marginHorizontal: 4 },
  
  nextButton: { },
  nextButtonGradient: { 
    width: 64, 
    height: 64, 
    borderRadius: 32, 
    justifyContent: 'center', 
    alignItems: 'center', 
    elevation: 5,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
