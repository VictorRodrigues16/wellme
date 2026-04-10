import { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
  Modal,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGame } from '../../src/context/GameContext';
import { colors } from '../../src/theme/colors';
import { fontFamily } from '../../src/theme/typography';
import { StatCard } from '../../src/components/StatCard';
import { ProgressBar } from '../../src/components/ProgressBar';
import { Button3D } from '../../src/components/Button3D';
import { VitaMascot } from '../../src/components/VitaMascot';

export default function PerfilScreen() {
  const insets = useSafeAreaInsets();
  const { state, derived, hydrated, updateName, resetProgress } = useGame();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);

  if (!hydrated || !state || !derived) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  const { user } = state;

  const handleSaveName = () => {
    const trimmed = draft.trim();
    if (trimmed.length > 0) {
      updateName(trimmed);
    }
    setEditing(false);
  };

  const handleReset = () => {
    setShowResetModal(true);
  };

  const confirmReset = () => {
    setShowResetModal(false);
    resetProgress();
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingTop: insets.top }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Card - RPG style */}
        <Animated.View entering={FadeIn.duration(500)}>
          <LinearGradient
            colors={[colors.primary, colors.blue]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerCard}
          >
            {/* Vita mascot as avatar */}
            <View style={styles.avatarContainer}>
              <VitaMascot size={120} expression="happy" animated />
            </View>

            {/* Name */}
            <View style={styles.nameSection}>
              {editing ? (
                <View style={styles.nameEditRow}>
                  <TextInput
                    style={styles.nameInput}
                    value={draft}
                    onChangeText={setDraft}
                    autoFocus
                    maxLength={30}
                    returnKeyType="done"
                    onSubmitEditing={handleSaveName}
                    placeholderTextColor="rgba(255,255,255,0.5)"
                  />
                  <Pressable onPress={handleSaveName} style={styles.saveNameBtn}>
                    <Ionicons name="checkmark" size={24} color={colors.primary} />
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  style={styles.nameRow}
                  onPress={() => {
                    setDraft(user.name);
                    setEditing(true);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <Text style={styles.userName}>{user.name}</Text>
                  <View style={styles.editIcon}>
                    <Ionicons name="pencil" size={14} color="#FFFFFF" />
                  </View>
                </Pressable>
              )}
            </View>

            {/* Level badge */}
            <View style={styles.levelBadge}>
              <Ionicons name="star" size={14} color="#FFFFFF" />
            <Text style={styles.levelText}> NIVEL {user.level}</Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* XP Progress */}
        <Animated.View entering={FadeInDown.delay(150).duration(400)} style={styles.xpSection}>
          <View style={styles.xpHeader}>
            <Text style={styles.xpTitle}>EXPERIENCIA</Text>
            <Text style={styles.xpAmount}>{derived.xpInLevel} / 200 XP</Text>
          </View>
          <ProgressBar
            progress={derived.levelProgress}
            label={`${derived.xpInLevel} / 200 XP`}
            height={24}
            gradientColors={[colors.gold, colors.orange]}
          />
          <Text style={styles.xpSubtext}>
            {200 - derived.xpInLevel} XP para o próximo nível
          </Text>
        </Animated.View>

        {/* Stats Grid */}
        <Animated.View entering={FadeInDown.delay(300).duration(400)}>
          <Text style={styles.sectionTitle}>Estatisticas</Text>
          <View style={styles.statsRow}>
            <StatCard
              iconName="flame"
              value={user.streak}
              label="Ofensiva"
              color={colors.orange}
              shadowColor={colors.orangeDark}
            />
            <StatCard
              iconName="star"
              value={user.xp}
              label="XP Total"
              color={colors.gold}
              shadowColor={colors.goldDark}
            />
            <StatCard
              iconName="checkmark-done"
              value={derived.totalCompleted}
              label="Missoes"
              color={colors.primary}
              shadowColor={colors.primaryDark}
            />
          </View>
        </Animated.View>

        {/* Achievements Summary */}
        <Animated.View entering={FadeInDown.delay(450).duration(400)}>
          <AchievementSummary
            unlocked={derived.unlockedAchievements}
            total={state.achievements.length}
          />
        </Animated.View>

        {/* Reset Button */}
        <Animated.View entering={FadeInDown.delay(600).duration(400)} style={styles.resetSection}>
          <Button3D
            label="RESETAR PROGRESSO"
            onPress={handleReset}
            icon="refresh"
            color={colors.error}
            shadowColor={colors.errorDark}
            size="medium"
          />
          <Text style={styles.versionText}>SaúdeQuest v1.0</Text>
        </Animated.View>

        {/* Footer spacer for tab bar */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Reset confirmation modal */}
      <Modal visible={showResetModal} transparent animationType="fade" onRequestClose={() => setShowResetModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowResetModal(false)}>
          <Animated.View entering={FadeInDown.duration(300)}>
            <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
              <Ionicons name="warning" size={48} color={colors.error} />
              <Text style={styles.modalTitle}>Resetar Progresso?</Text>
              <Text style={styles.modalDesc}>Todo seu progresso, XP, ofensiva e conquistas serão perdidos. Essa ação não pode ser desfeita.</Text>
              <View style={styles.modalButtons}>
                <View style={{ flex: 1 }}>
                  <Button3D label="CANCELAR" onPress={() => setShowResetModal(false)} color={colors.surface} shadowColor={colors.lockedDark} textColor="#FFFFFF" size="medium" fullWidth />
                </View>
                <View style={{ flex: 1 }}>
                  <Button3D label="RESETAR" onPress={confirmReset} color={colors.error} shadowColor={colors.errorDark} icon="trash" size="medium" fullWidth />
                </View>
              </View>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>
    </View>
  );
}

function AchievementSummary({ unlocked, total }: { unlocked: number; total: number }) {
  const pressed = useSharedValue(0);

  const bodyStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: pressed.value * 5 }],
  }));

  const shadowStyle = useAnimatedStyle(() => ({
    opacity: 1 - pressed.value,
  }));

  return (
    <Pressable
      onPressIn={() => { pressed.value = withTiming(1, { duration: 80 }); }}
      onPressOut={() => {
        pressed.value = withSpring(0);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }}
    >
      <View style={styles.achievementContainer}>
        <Animated.View style={[styles.achievementShadow, shadowStyle]} />
        <Animated.View style={[styles.achievementBody, bodyStyle]}>
          <View style={styles.achievementIcon}>
            <Ionicons name="trophy" size={32} color={colors.gold} />
          </View>
          <View style={styles.achievementInfo}>
            <Text style={styles.achievementTitle}>Conquistas</Text>
            <Text style={styles.achievementSubtitle}>
              {unlocked} de {total} desbloqueadas
            </Text>
            <ProgressBar
              progress={unlocked / total}
              height={10}
              gradientColors={[colors.gold, colors.orange]}
              showShine={false}
              style={{ marginTop: 8 }}
            />
          </View>
        </Animated.View>
      </View>
    </Pressable>
  );
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

  // Header Card
  headerCard: {
    borderRadius: 24,
    paddingTop: 32,
    paddingBottom: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 12,
  },
  avatarContainer: {
    marginBottom: 16,
  },


  // Name
  nameSection: {
    alignItems: 'center',
    marginBottom: 8,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  userName: {
    fontFamily: fontFamily.extraBold,
    fontSize: 28,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  editIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  nameInput: {
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontFamily: fontFamily.bold,
    fontSize: 20,
    width: 200,
    color: '#FFFFFF',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  saveNameBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 14,
  },
  levelText: {
    fontFamily: fontFamily.bold,
    fontSize: 13,
    color: '#FFFFFF',
    letterSpacing: 1,
  },

  // XP Section
  xpSection: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  xpTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 13,
    color: colors.textSecondary,
    letterSpacing: 1,
  },
  xpAmount: {
    fontFamily: fontFamily.extraBold,
    fontSize: 14,
    color: colors.gold,
  },
  xpSubtext: {
    fontFamily: fontFamily.semiBold,
    marginTop: 10,
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  // Section Title
  sectionTitle: {
    fontFamily: fontFamily.extraBold,
    fontSize: 18,
    color: '#FFFFFF',
    marginTop: 24,
    marginBottom: 14,
    marginLeft: 4,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },

  // Achievement Summary
  achievementContainer: {
    marginTop: 24,
    position: 'relative',
  },
  achievementShadow: {
    position: 'absolute',
    top: 5,
    left: 0,
    right: 0,
    bottom: -5,
    borderRadius: 20,
    backgroundColor: colors.goldDark,
  },
  achievementBody: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: 'rgba(255,200,0,0.3)',
    zIndex: 1,
  },
  achievementIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,200,0,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontFamily: fontFamily.extraBold,
    fontSize: 18,
    color: '#FFFFFF',
  },
  achievementSubtitle: {
    fontFamily: fontFamily.semiBold,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },

  // Reset
  resetSection: {
    marginTop: 32,
    alignItems: 'center',
  },
  versionText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 16,
  },

  // Reset modal
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
    padding: 28,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  modalTitle: {
    fontFamily: fontFamily.extraBold,
    fontSize: 22,
    color: '#FFFFFF',
    marginTop: 12,
    marginBottom: 8,
  },
  modalDesc: {
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
});
