import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn, useSharedValue, useAnimatedStyle, withTiming, withSequence, Easing } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Button3D } from '../Button3D';
import { colors } from '../../theme/colors';
import { fontFamily } from '../../theme/typography';
import type { BreathingContent } from '../../data/types';

interface Props { content: BreathingContent; onComplete: () => void; }

export function BreathingMission({ content, onComplete }: Props) {
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [currentCycle, setCurrentCycle] = useState(0);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const circleScale = useSharedValue(0.6);
  const phase = content.phases[currentPhase];
  const totalPhases = content.phases.length;

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const startBreathing = () => {
    setStarted(true);
    setCurrentCycle(0);
    setCurrentPhase(0);
    setSecondsLeft(content.phases[0].duration);
    animatePhase(0);
    runTimer(0, 0);
  };

  const animatePhase = (phaseIdx: number) => {
    const p = content.phases[phaseIdx];
    if (p.name === 'INSPIRE') {
      circleScale.value = withTiming(1, { duration: p.duration * 1000, easing: Easing.inOut(Easing.ease) });
    } else if (p.name === 'EXPIRE') {
      circleScale.value = withTiming(0.5, { duration: p.duration * 1000, easing: Easing.inOut(Easing.ease) });
    }
    // SEGURE keeps current scale
  };

  const runTimer = (cycle: number, phaseIdx: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    const dur = content.phases[phaseIdx].duration;
    let left = dur;
    setSecondsLeft(left);

    intervalRef.current = setInterval(() => {
      left--;
      setSecondsLeft(left);
      if (left <= 0) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        // Next phase or next cycle
        const nextPhase = phaseIdx + 1;
        if (nextPhase < totalPhases) {
          setCurrentPhase(nextPhase);
          animatePhase(nextPhase);
          runTimer(cycle, nextPhase);
        } else {
          const nextCycle = cycle + 1;
          if (nextCycle < content.cycles) {
            setCurrentCycle(nextCycle);
            setCurrentPhase(0);
            animatePhase(0);
            runTimer(nextCycle, 0);
          } else {
            // All done
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setFinished(true);
          }
        }
      }
    }, 1000);
  };

  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: circleScale.value }],
  }));

  if (finished) {
    return (
      <Animated.View entering={FadeIn.duration(400)} style={s.doneContainer}>
        <Ionicons name="checkmark-done-circle" size={56} color={colors.primary} />
        <Text style={s.doneTitle}>Parabéns!</Text>
        <Text style={s.doneSub}>{content.completion}</Text>
        <Text style={s.doneCycles}>{content.cycles} ciclos completos</Text>
        <Button3D label="COMPLETAR MISSÃO" onPress={onComplete} icon="trophy" color={colors.primary} shadowColor={colors.primaryDark} size="large" fullWidth />
      </Animated.View>
    );
  }

  if (!started) {
    return (
      <View>
        <Text style={s.intro}>{content.intro}</Text>
        <View style={s.phasesPreview}>
          {content.phases.map((p, i) => (
            <View key={i} style={s.phaseRow}>
              <View style={[s.phaseBadge, { backgroundColor: colors.purple }]}>
                <Text style={s.phaseNum}>{p.duration}s</Text>
              </View>
              <View>
                <Text style={s.phaseName}>{p.name}</Text>
                <Text style={s.phaseInst}>{p.instruction}</Text>
              </View>
            </View>
          ))}
        </View>
        <Text style={s.cycleInfo}>{content.cycles} ciclos de respiração</Text>
        <Button3D label="COMEÇAR" onPress={startBreathing} icon="play" color={colors.purple} shadowColor={colors.purpleDark} size="large" fullWidth />
      </View>
    );
  }

  return (
    <View style={s.breathingContainer}>
      <Text style={s.cycleCounter}>Ciclo {currentCycle + 1} de {content.cycles}</Text>

      <View style={s.circleArea}>
        <Animated.View style={[s.outerCircle, circleStyle]}>
          <View style={s.innerCircle}>
            <Text style={s.phaseLabel}>{phase?.name}</Text>
            <Text style={s.phaseTimer}>{secondsLeft}</Text>
            <Text style={s.phaseHint}>{phase?.instruction}</Text>
          </View>
        </Animated.View>
      </View>

    </View>
  );
}

const s = StyleSheet.create({
  intro: { fontFamily: fontFamily.semiBold, fontSize: 15, color: '#FFFFFF', marginBottom: 20, lineHeight: 22 },
  phasesPreview: { gap: 12, marginBottom: 20 },
  phaseRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: 12, padding: 14 },
  phaseBadge: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  phaseNum: { fontFamily: fontFamily.extraBold, fontSize: 14, color: '#FFFFFF' },
  phaseName: { fontFamily: fontFamily.bold, fontSize: 16, color: '#FFFFFF' },
  phaseInst: { fontFamily: fontFamily.regular, fontSize: 13, color: colors.textSecondary },
  cycleInfo: { fontFamily: fontFamily.semiBold, fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginBottom: 20 },
  breathingContainer: { alignItems: 'center', paddingVertical: 20 },
  cycleCounter: { fontFamily: fontFamily.bold, fontSize: 14, color: colors.textSecondary, letterSpacing: 1, marginBottom: 32 },
  circleArea: { alignItems: 'center', justifyContent: 'center', height: 260 },
  outerCircle: { width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(206,130,255,0.2)', borderWidth: 3, borderColor: colors.purple, alignItems: 'center', justifyContent: 'center' },
  innerCircle: { width: 160, height: 160, borderRadius: 80, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  phaseLabel: { fontFamily: fontFamily.extraBold, fontSize: 20, color: colors.purple, letterSpacing: 3 },
  phaseTimer: { fontFamily: fontFamily.extraBold, fontSize: 48, color: '#FFFFFF' },
  phaseHint: { fontFamily: fontFamily.semiBold, fontSize: 12, color: colors.textSecondary, marginTop: 4 },
  doneContainer: { alignItems: 'center', paddingVertical: 24, gap: 8 },
  doneTitle: { fontFamily: fontFamily.extraBold, fontSize: 28, color: '#FFFFFF', marginTop: 8 },
  doneSub: { fontFamily: fontFamily.semiBold, fontSize: 15, color: colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 4 },
  doneCycles: { fontFamily: fontFamily.bold, fontSize: 16, color: colors.gold, marginBottom: 20 },
});
