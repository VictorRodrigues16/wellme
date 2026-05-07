import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGame } from '../../src/context/GameContext';
import { colors, categoryColors } from '../../src/theme/colors';
import { fontFamily } from '../../src/theme/typography';
import { Button3D } from '../../src/components/ui/Button3D';
import { CelebrationOverlay } from '../../src/components/overlays/CelebrationOverlay';
import { LevelUpOverlay } from '../../src/components/overlays/LevelUpOverlay';
import { XP_PER_LEVEL } from '../../src/data/initialData';
import { QuizMission } from '../../src/components/missions/QuizMission';
import { CalculatorMission } from '../../src/components/missions/CalculatorMission';
import { MultiSelectMission } from '../../src/components/missions/MultiSelectMission';
import { TrueFalseMission } from '../../src/components/missions/TrueFalseMission';
import { TimerSequenceMission } from '../../src/components/missions/TimerSequenceMission';
import { BreathingMission } from '../../src/components/missions/BreathingMission';
import { DragDropPlateMission } from '../../src/components/missions/DragDropPlateMission';
import type {
  QuizContent,
  CalculatorContent,
  MultiSelectContent,
  TrueFalseContent,
  TimerSequenceContent,
  BreathingContent,
  DragDropPlateContent,
} from '../../src/data/types';

const CATEGORY_ICON_MAP: Record<string, keyof typeof Ionicons.glyphMap> = {
  hidratacao: 'water',
  movimento: 'walk',
  alimentacao: 'nutrition',
  mente: 'cloudy',
  sono: 'moon',
  prevencao: 'shield-checkmark',
  habitos: 'swap-horizontal',
};

export default function MissionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state, completeMission } = useGame();

  const mission = state?.missions.find((m) => m.id === Number(id));

  const [showCelebration, setShowCelebration] = useState(false);
  const [levelUpInfo, setLevelUpInfo] = useState<{ type: 'level-up' | 'module-complete'; level?: number; moduleName?: string } | null>(null);
  const [missionCompleted, setMissionCompleted] = useState(false);

  if (!mission || (!missionCompleted && mission.status !== 'available')) {
    return (
      <View style={styles.center}>
        <View style={styles.errorCard}>
          <Ionicons name="alert-circle" size={48} color={colors.error} />
          <Text style={styles.errorText}>Missão não encontrada ou indisponível.</Text>
          <Button3D label="VOLTAR" onPress={() => router.back()} icon="arrow-back" color={colors.primary} shadowColor={colors.primaryDark} />
        </View>
      </View>
    );
  }

  const handleComplete = () => {
    setShowCelebration(true);
  };

  const confirmComplete = () => {
    const oldLevel = state!.user.level;
    const newXp = state!.user.xp + mission.xpReward;
    const newLevel = Math.floor(newXp / XP_PER_LEVEL) + 1;

    const moduleMissions = state!.missions.filter((m) => m.module === mission.module);
    const completedInModule = moduleMissions.filter((m) => m.status === 'completed').length;
    const willCompleteModule = completedInModule === moduleMissions.length - 1;

    setMissionCompleted(true);
    completeMission(mission.id);

    if (newLevel > oldLevel) {
      setLevelUpInfo({ type: 'level-up', level: newLevel });
    } else if (willCompleteModule) {
      setLevelUpInfo({ type: 'module-complete', moduleName: mission.module });
    } else {
      router.back();
    }
  };

  const catColors = categoryColors[mission.category] || categoryColors.hidratacao;

  if (levelUpInfo) {
    return (
      <LevelUpOverlay type={levelUpInfo.type} level={levelUpInfo.level} moduleName={levelUpInfo.moduleName} onDismiss={() => router.back()} />
    );
  }

  if (showCelebration) {
    return (
      <CelebrationOverlay title={mission.title} xpEarned={mission.xpReward} onContinue={confirmComplete} />
    );
  }

  const renderMission = () => {
    switch (mission.type) {
      case 'quiz':
        return <QuizMission content={mission.content as QuizContent} onComplete={handleComplete} catColor={catColors.main} catDark={catColors.dark} />;
      case 'calculator':
        return <CalculatorMission content={mission.content as CalculatorContent} onComplete={handleComplete} />;
      case 'multi_select':
        return <MultiSelectMission content={mission.content as MultiSelectContent} onComplete={handleComplete} />;
      case 'true_false':
        return <TrueFalseMission content={mission.content as TrueFalseContent} onComplete={handleComplete} />;
      case 'timer_sequence':
        return <TimerSequenceMission content={mission.content as TimerSequenceContent} onComplete={handleComplete} catColor={catColors.main} catDark={catColors.dark} />;
      case 'breathing':
        return <BreathingMission content={mission.content as BreathingContent} onComplete={handleComplete} />;
      case 'drag_drop_plate':
        return <DragDropPlateMission content={mission.content as DragDropPlateContent} onComplete={handleComplete} />;
      default:
        return <Text style={{ color: '#FFFFFF' }}>Tipo de missão não suportado</Text>;
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[catColors.main, catColors.dark]}
        style={[styles.headerGradient, { paddingTop: insets.top }]}
      >
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.closeBtn} accessibilityLabel="Fechar">
            <Ionicons name="close" size={28} color="#FFFFFF" />
          </Pressable>
          <View style={styles.xpPill}>
            <Ionicons name="star" size={14} color={colors.textDark} />
            <Text style={styles.xpPillText}> +{mission.xpReward} XP</Text>
          </View>
        </View>
        <View style={styles.headerInfo}>
          <Ionicons name={CATEGORY_ICON_MAP[mission.category] || 'help-circle'} size={48} color="#FFFFFF" style={styles.headerIcon} />
          <Text style={styles.headerTitle}>{mission.title}</Text>
          <Text style={styles.headerDesc}>{mission.description}</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.missionContent}>
          {renderMission()}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerGradient: { paddingHorizontal: 20, paddingBottom: 24 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, marginTop: 8 },
  closeBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.2)', alignItems: 'center', justifyContent: 'center' },
  xpPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.gold, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 14 },
  xpPillText: { fontFamily: fontFamily.extraBold, fontSize: 14, color: colors.textDark },
  headerInfo: { alignItems: 'center' },
  headerIcon: { marginBottom: 8 },
  headerTitle: { fontFamily: fontFamily.extraBold, fontSize: 24, color: '#FFFFFF', textAlign: 'center', marginBottom: 4 },
  headerDesc: { fontFamily: fontFamily.semiBold, fontSize: 15, color: 'rgba(255,255,255,0.8)', textAlign: 'center', lineHeight: 22 },
  scrollView: { flex: 1 },
  content: { padding: 20, paddingBottom: 60 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, backgroundColor: colors.background },
  errorCard: { backgroundColor: colors.surface, borderRadius: 24, padding: 32, alignItems: 'center' },
  errorText: { fontFamily: fontFamily.semiBold, fontSize: 16, color: colors.textSecondary, textAlign: 'center', marginVertical: 16 },
  missionContent: {},
});
