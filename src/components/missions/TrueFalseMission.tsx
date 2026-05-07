import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Button3D } from '../ui/Button3D';
import { ProgressBar } from '../ui/ProgressBar';
import { colors } from '../../theme/colors';
import { fontFamily } from '../../theme/typography';
import type { TrueFalseContent } from '../../data/types';

interface Props { content: TrueFalseContent; onComplete: () => void; }

export function TrueFalseMission({ content, onComplete }: Props) {
  const [current, setCurrent] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);

  const stmt = content.statements[current];
  const progress = (current + (answered ? 1 : 0)) / content.statements.length;

  const handleAnswer = (userSaysTrue: boolean) => {
    const isCorrect = userSaysTrue === stmt.isTrue;
    setCorrect(isCorrect);
    setAnswered(true);
    if (isCorrect) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setCorrectCount((c) => c + 1);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleNext = () => {
    if (current + 1 < content.statements.length) {
      setCurrent((c) => c + 1);
      setAnswered(false);
    } else {
      setFinished(true);
    }
  };

  if (finished) {
    return (
      <Animated.View entering={FadeIn.duration(400)}>
        <View style={s.resultContainer}>
          <Ionicons name="ribbon" size={48} color={colors.gold} />
          <Text style={s.resultTitle}>{correctCount} de {content.statements.length}</Text>
          <Text style={s.resultSub}>respostas corretas</Text>
        </View>
        <Button3D label="COMPLETAR MISSÃO" onPress={onComplete} icon="trophy" color={colors.primary} shadowColor={colors.primaryDark} size="large" fullWidth />
      </Animated.View>
    );
  }

  return (
    <View>
      <ProgressBar progress={progress} label={`${current + 1}/${content.statements.length}`} />
      {current === 0 && !answered && <Text style={s.intro}>{content.intro}</Text>}

      <Animated.View entering={FadeIn.duration(300)} key={current}>
        <Text style={s.counter}>AFIRMACAO {current + 1} DE {content.statements.length}</Text>
        <View style={s.statementCard}>
          <Ionicons name="chatbox-ellipses" size={24} color={colors.textSecondary} />
          <Text style={s.statementText}>{stmt.text}</Text>
        </View>

        {!answered && (
          <View style={s.buttonsRow}>
            <View style={{ flex: 1 }}>
              <Button3D label="VERDADE" onPress={() => handleAnswer(true)} color={colors.primary} shadowColor={colors.primaryDark} icon="checkmark" size="medium" fullWidth />
            </View>
            <View style={{ flex: 1 }}>
              <Button3D label="MARKETING" onPress={() => handleAnswer(false)} color={colors.error} shadowColor={colors.errorDark} icon="close" size="medium" fullWidth />
            </View>
          </View>
        )}
      </Animated.View>

      {answered && (
        <Animated.View entering={FadeInDown.duration(300)} style={[s.feedback, { backgroundColor: correct ? 'rgba(88,204,2,0.15)' : 'rgba(255,75,75,0.15)' }]}>
          <Ionicons name={correct ? 'checkmark-circle' : 'close-circle'} size={28} color={correct ? colors.primary : colors.error} />
          <Text style={[s.feedbackTitle, { color: correct ? colors.primary : colors.error }]}>{correct ? 'Correto!' : 'Errado!'}</Text>
          <Text style={s.feedbackExpl}>{stmt.explanation}</Text>
          <Button3D label={current + 1 < content.statements.length ? 'PRÓXIMA' : 'VER RESULTADO'} onPress={handleNext} icon="arrow-forward" color={colors.blue} shadowColor={colors.blueDark} size="small" />
        </Animated.View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  intro: { fontFamily: fontFamily.semiBold, fontSize: 14, color: colors.textSecondary, marginBottom: 16, lineHeight: 20 },
  counter: { fontFamily: fontFamily.bold, fontSize: 12, color: colors.textSecondary, letterSpacing: 2, marginTop: 12, marginBottom: 8 },
  statementCard: { backgroundColor: colors.surface, borderRadius: 14, padding: 16, gap: 8, marginBottom: 16 },
  statementText: { fontFamily: fontFamily.bold, fontSize: 15, color: '#FFFFFF', lineHeight: 22 },
  buttonsRow: { flexDirection: 'row', gap: 10 },
  feedback: { borderRadius: 14, padding: 16, marginTop: 10, alignItems: 'center', gap: 6 },
  feedbackTitle: { fontFamily: fontFamily.extraBold, fontSize: 18 },
  feedbackExpl: { fontFamily: fontFamily.semiBold, fontSize: 13, color: colors.textSecondary, textAlign: 'center', lineHeight: 18, marginBottom: 6 },
  resultContainer: { alignItems: 'center', paddingVertical: 24 },
  resultTitle: { fontFamily: fontFamily.extraBold, fontSize: 36, color: '#FFFFFF', marginTop: 12 },
  resultSub: { fontFamily: fontFamily.semiBold, fontSize: 16, color: colors.textSecondary, marginTop: 4, marginBottom: 24 },
});
