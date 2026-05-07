import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Modal,
  Pressable,
  Dimensions,
} from 'react-native';
import type { ListRenderItem } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGame } from '../../src/context/GameContext';
import { colors } from '../../src/theme/colors';
import { fontFamily } from '../../src/theme/typography';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { AchievementBadge3D } from '../../src/components/game/AchievementBadge3D';
import { Button3D } from '../../src/components/ui/Button3D';
import type { Achievement } from '../../src/data/types';

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
const MONTH_NAMES = [
  'janeiro', 'fevereiro', 'marco', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DAY_SIZE = Math.floor((SCREEN_WIDTH - 32 - 64) / 7);

export default function ConquistasScreen() {
  const insets = useSafeAreaInsets();
  const { state, derived, hydrated } = useGame();
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [monthOffset, setMonthOffset] = useState(0);

  if (!hydrated || !state || !derived) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  const { user } = state;
  const completedDates = user.completedDates || [];
  const completedSet = new Set(completedDates);

  // Streak milestone goal
  const streakGoal = getNextMilestone(user.streak);
  const streakProgress = user.streak / streakGoal;

  // Calendar data
  const now = new Date();
  const viewDate = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth();
  const monthLabel = `${MONTH_NAMES[viewMonth]} de ${viewYear}`;

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  const todayISO = now.toISOString().slice(0, 10);
  const isCurrentMonth = monthOffset === 0;

  // Count practiced days this month
  const practicedThisMonth = completedDates.filter((d) => {
    return d.startsWith(`${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`);
  }).length;

  const renderAchievement: ListRenderItem<Achievement> = ({ item, index }) => (
    <Animated.View
      key={item.id}
      entering={FadeInDown.delay(500 + index * 60).duration(300)}
      style={styles.gridItem}
    >
      <AchievementBadge3D
        icon={item.icon}
        title={item.title}
        description={item.description}
        unlocked={item.unlocked}
        onPress={() => {
          setSelectedAchievement(item);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }}
      />
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingTop: insets.top }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section - Streak */}
        <Animated.View entering={FadeIn.duration(500)}>
          <LinearGradient
            colors={['#1CB0F6', '#0E8AC7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.heroCard}
          >
            <View style={styles.heroContent}>
              <View style={styles.heroLeft}>
                {user.streak > 0 && (
                  <View style={styles.heroBadge}>
                    <Text style={styles.heroBadgeText}>OFENSIVA ATIVA</Text>
                  </View>
                )}
                <Text style={styles.heroNumber}>{user.streak}</Text>
                <Text style={styles.heroLabel}>
                  {user.streak === 1 ? 'dia de ofensiva!' : 'dias de ofensiva!'}
                </Text>
              </View>
              <View style={styles.heroRight}>
                {user.streak > 0 ? (
                  <View style={styles.fireContainer}>
                    <Ionicons name="flame" size={90} color="#FF1744" style={styles.fireBack} />
                    <Ionicons name="flame" size={70} color="#FF6D00" style={styles.fireMid} />
                    <Ionicons name="flame" size={48} color="#FFEA00" style={styles.fireFront} />
                  </View>
                ) : (
                  <Ionicons name="flame" size={80} color="rgba(255,255,255,0.15)" />
                )}
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Calendar Section */}
        <Animated.View entering={FadeInDown.delay(150).duration(400)}>
          <View style={styles.calendarSection}>
            {/* Month header */}
            <View style={styles.calendarHeader}>
              <Text style={styles.calendarMonth}>{monthLabel}</Text>
              <View style={styles.calendarNav}>
                <Pressable
                  onPress={() => setMonthOffset((p) => p - 1)}
                  style={styles.navBtn}
                  accessibilityLabel="Mes anterior"
                >
                  <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
                </Pressable>
                <Pressable
                  onPress={() => { if (monthOffset < 0) setMonthOffset((p) => p + 1); }}
                  style={[styles.navBtn, monthOffset >= 0 && styles.navBtnDisabled]}
                  accessibilityLabel="Proximo mes"
                >
                  <Ionicons name="chevron-forward" size={20} color={monthOffset >= 0 ? colors.locked : '#FFFFFF'} />
                </Pressable>
              </View>
            </View>

            {/* Stats row */}
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                <Text style={styles.statNumber}> {practicedThisMonth}</Text>
                <Text style={styles.statLabel}> Dias de prática</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Ionicons name="flame" size={20} color={colors.orange} />
                <Text style={styles.statNumber}> {user.streak}</Text>
                <Text style={styles.statLabel}> Ofensiva atual</Text>
              </View>
            </View>

            {/* Calendar grid */}
            <View style={styles.calendarGrid}>
              {/* Weekday headers */}
              <View style={styles.weekRow}>
                {WEEKDAYS.map((day) => (
                  <View key={day} style={styles.dayCell}>
                    <Text style={styles.weekdayText}>{day}</Text>
                  </View>
                ))}
              </View>

              {/* Day cells */}
              <View style={styles.daysContainer}>
                {/* Empty cells before first day */}
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <View key={`empty-${i}`} style={styles.dayCell} />
                ))}

                {/* Day cells */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dateISO = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const isPracticed = completedSet.has(dateISO);
                  const isToday = dateISO === todayISO;
                  const isFuture = new Date(dateISO) > now;

                  return (
                    <View key={day} style={styles.dayCell}>
                      {isPracticed ? (
                        <View style={styles.dayPracticed}>
                          <View style={styles.dayPracticedCircle}>
                            <Text style={styles.dayTextPracticed}>{day}</Text>
                          </View>
                          <Ionicons name="flame" size={10} color="#FF6D00" style={styles.dayFlame} />
                        </View>
                      ) : isToday ? (
                        <View style={styles.dayToday}>
                          <Text style={styles.dayTextToday}>{day}</Text>
                        </View>
                      ) : (
                        <Text style={[
                          styles.dayText,
                          isFuture && styles.dayTextFuture,
                        ]}>
                          {day}
                        </Text>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Streak Goal */}
        <Animated.View entering={FadeInDown.delay(300).duration(400)}>
          <Text style={styles.sectionTitle}>Meta de ofensiva</Text>
          <View style={styles.goalCard}>
            <View style={styles.goalRow}>
              <View style={styles.goalBadge}>
                <Ionicons name="flame" size={18} color="#FFFFFF" />
                <Text style={styles.goalBadgeText}>{user.streak}</Text>
              </View>
              <View style={styles.goalBarContainer}>
                <ProgressBar
                  progress={streakProgress}
                  height={16}
                  gradientColors={[colors.orange, colors.gold]}
                  showShine
                />
              </View>
              <View style={[styles.goalBadge, styles.goalBadgeTarget]}>
                <Ionicons name="flame" size={18} color="#FFFFFF" />
                <Text style={styles.goalBadgeText}>{streakGoal}</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Achievements Section */}
        <Animated.View entering={FadeInDown.delay(450).duration(400)}>
          <Text style={styles.sectionTitle}>Conquistas</Text>
          <View style={styles.achievementSummary}>
            <Ionicons name="trophy" size={20} color={colors.gold} />
            <Text style={styles.achievementSummaryText}>
              {derived.unlockedAchievements} de {state.achievements.length} desbloqueadas
            </Text>
          </View>
          <FlatList
            data={state.achievements}
            keyExtractor={(item) => item.id}
            numColumns={3}
            scrollEnabled={false}
            columnWrapperStyle={styles.gridRow}
            contentContainerStyle={styles.gridContainer}
            renderItem={renderAchievement}
          />
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Achievement Detail Modal */}
      {selectedAchievement && (
        <Modal
          visible={!!selectedAchievement}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedAchievement(null)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setSelectedAchievement(null)}
          >
            <Animated.View entering={FadeInUp.duration(300)}>
              <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
                <View style={[
                  styles.modalBadge,
                  { backgroundColor: selectedAchievement.unlocked ? colors.gold : colors.locked }
                ]}>
                  <Ionicons
                    name={selectedAchievement.unlocked
                      ? getIconNameForIcon(selectedAchievement.icon)
                      : 'lock-closed'}
                    size={48}
                    color="#FFFFFF"
                  />
                </View>
                <Text style={styles.modalTitle}>{selectedAchievement.title}</Text>
                <Text style={styles.modalDesc}>{selectedAchievement.description}</Text>
                <View style={[
                  styles.modalStatus,
                  { backgroundColor: selectedAchievement.unlocked ? 'rgba(88,204,2,0.15)' : 'rgba(255,75,75,0.15)' }
                ]}>
                  <Ionicons
                    name={selectedAchievement.unlocked ? 'checkmark-circle' : 'lock-closed'}
                    size={18}
                    color={selectedAchievement.unlocked ? colors.primary : colors.error}
                  />
                  <Text style={[
                    styles.modalStatusText,
                    { color: selectedAchievement.unlocked ? colors.primary : colors.error }
                  ]}>
                    {selectedAchievement.unlocked ? ' Desbloqueada!' : ' Bloqueada'}
                  </Text>
                </View>
                <Button3D
                  label="FECHAR"
                  onPress={() => setSelectedAchievement(null)}
                  color={colors.surface}
                  shadowColor={colors.lockedDark}
                  textColor="#FFFFFF"
                  size="small"
                />
              </Pressable>
            </Animated.View>
          </Pressable>
        </Modal>
      )}
    </View>
  );
}

function getNextMilestone(streak: number): number {
  const milestones = [7, 14, 30, 50, 100, 150, 200, 365, 500, 1000];
  for (const m of milestones) {
    if (streak < m) return m;
  }
  return Math.ceil((streak + 50) / 50) * 50;
}

const ACHIEVEMENT_ICON_MAP: Record<string, keyof typeof Ionicons.glyphMap> = {
  star: 'star',
  water: 'water',
  walk: 'walk',
  nutrition: 'nutrition',
  leaf: 'leaf',
  flame: 'flame',
  trophy: 'trophy',
  medal: 'medal',
};

function getIconNameForIcon(icon: string): keyof typeof Ionicons.glyphMap {
  return ACHIEVEMENT_ICON_MAP[icon] || 'medal';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },

  // Hero
  heroCard: {
    borderRadius: 24,
    padding: 24,
    marginTop: 12,
    overflow: 'hidden',
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroLeft: {
    flex: 1,
  },
  heroRight: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fireContainer: {
    width: 90,
    height: 100,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  fireBack: {
    position: 'absolute',
    bottom: 0,
  },
  fireMid: {
    position: 'absolute',
    bottom: 6,
  },
  fireFront: {
    position: 'absolute',
    bottom: 10,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  heroBadgeText: {
    fontFamily: fontFamily.extraBold,
    fontSize: 11,
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },
  heroNumber: {
    fontFamily: fontFamily.extraBold,
    fontSize: 72,
    color: '#FFFFFF',
    lineHeight: 80,
  },
  heroLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 20,
    color: '#FFFFFF',
    marginTop: -4,
  },

  // Calendar
  calendarSection: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 14,
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  calendarMonth: {
    fontFamily: fontFamily.extraBold,
    fontSize: 18,
    color: '#FFFFFF',
  },
  calendarNav: {
    flexDirection: 'row',
    gap: 8,
  },
  navBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnDisabled: {
    opacity: 0.3,
  },

  // Stats row
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statNumber: {
    fontFamily: fontFamily.extraBold,
    fontSize: 16,
    color: '#FFFFFF',
  },
  statLabel: {
    fontFamily: fontFamily.semiBold,
    fontSize: 12,
    color: colors.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 8,
  },

  // Calendar grid
  calendarGrid: {},
  weekRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: DAY_SIZE,
    height: DAY_SIZE * 0.72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekdayText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 11,
    color: colors.textSecondary,
  },
  dayText: {
    fontFamily: fontFamily.bold,
    fontSize: 13,
    color: colors.textSecondary,
  },
  dayTextFuture: {
    color: colors.locked,
  },
  dayPracticed: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayPracticedCircle: {
    width: DAY_SIZE * 0.6,
    height: DAY_SIZE * 0.6,
    borderRadius: DAY_SIZE * 0.3,
    backgroundColor: '#1CB0F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayTextPracticed: {
    fontFamily: fontFamily.extraBold,
    fontSize: 12,
    color: '#FFFFFF',
  },
  dayFlame: {
    marginTop: 1,
  },
  dayToday: {
    width: DAY_SIZE * 0.65,
    height: DAY_SIZE * 0.65,
    borderRadius: DAY_SIZE * 0.33,
    borderWidth: 2,
    borderColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayTextToday: {
    fontFamily: fontFamily.extraBold,
    fontSize: 13,
    color: colors.blue,
  },

  // Section title
  sectionTitle: {
    fontFamily: fontFamily.extraBold,
    fontSize: 20,
    color: '#FFFFFF',
    marginTop: 24,
    marginBottom: 12,
    marginLeft: 4,
  },

  // Streak goal
  goalCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  goalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.orange,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  goalBadgeTarget: {
    backgroundColor: colors.gold,
  },
  goalBadgeText: {
    fontFamily: fontFamily.extraBold,
    fontSize: 14,
    color: '#FFFFFF',
  },
  goalBarContainer: {
    flex: 1,
  },

  // Achievements
  achievementSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    marginLeft: 4,
  },
  achievementSummaryText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    color: colors.textSecondary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  gridContainer: {
    paddingBottom: 8,
  },
  gridRow: {
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  gridItem: {
    flex: 1 / 3,
    alignItems: 'center',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,27,45,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  modalBadge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontFamily: fontFamily.extraBold,
    fontSize: 22,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalDesc: {
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  modalStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 14,
    marginBottom: 20,
  },
  modalStatusText: {
    fontFamily: fontFamily.bold,
    fontSize: 15,
  },
});
