import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Button3D } from '../Button3D';
import { colors } from '../../theme/colors';
import { fontFamily } from '../../theme/typography';
import type { CalculatorContent } from '../../data/types';

interface Props { content: CalculatorContent; onComplete: () => void; }

export function CalculatorMission({ content, onComplete }: Props) {
  const [values, setValues] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    content.inputs.forEach((inp) => {
      if (inp.type === 'slider') init[inp.key] = (inp.default as number) || inp.min || 0;
      else if (inp.type === 'buttonGroup') init[inp.key] = inp.options?.[0]?.value || 0;
    });
    return init;
  });
  const [calculated, setCalculated] = useState(false);
  const [result, setResult] = useState(0);

  const handleCalculate = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    let res = 0;
    if (content.customCalculation === 'sleepCycles') {
      const wake = values.wakeTime || 7;
      res = wake; // Display will show sleep times
    } else if (content.formula) {
      const keys = Object.keys(values);
      res = keys.reduce((acc, key) => acc * (values[key] || 1), 1);
      if (content.formula === 'peso * atividade') {
        res = values.peso * values.atividade;
      }
    }
    setResult(Math.round(res));
    setCalculated(true);
  };

  const updateValue = (key: string, val: number) => {
    setValues((prev) => ({ ...prev, [key]: val }));
    if (calculated) setCalculated(false);
  };

  const isSleepCalc = content.customCalculation === 'sleepCycles';
  const sleepTimes = isSleepCalc ? computeSleepTimes(result) : [];
  const copos = Math.round(result / 250);

  return (
    <View>
      {content.intro && <Text style={s.intro}>{content.intro}</Text>}

      {content.inputs.map((inp) => (
        <View key={inp.key} style={s.inputGroup}>
          <Text style={s.inputLabel}>{inp.label}</Text>
          {inp.type === 'slider' && (
            <View style={s.sliderContainer}>
              <View style={s.sliderRow}>
                <Button3D label="-" onPress={() => updateValue(inp.key, Math.max(inp.min || 0, (values[inp.key] || 0) - (inp.step || 1)))} color={colors.surface} shadowColor={colors.lockedDark} size="small" />
                <Text style={s.sliderValue}>{values[inp.key]} {inp.unit || ''}</Text>
                <Button3D label="+" onPress={() => updateValue(inp.key, Math.min(inp.max || 999, (values[inp.key] || 0) + (inp.step || 1)))} color={colors.surface} shadowColor={colors.lockedDark} size="small" />
              </View>
            </View>
          )}
          {inp.type === 'buttonGroup' && (
            <View style={s.btnGroup}>
              {inp.options?.map((opt) => (
                <Button3D
                  key={opt.value}
                  label={opt.label}
                  onPress={() => updateValue(inp.key, opt.value)}
                  color={values[inp.key] === opt.value ? colors.blue : colors.surface}
                  shadowColor={values[inp.key] === opt.value ? colors.blueDark : colors.lockedDark}
                  size="small"
                />
              ))}
            </View>
          )}
        </View>
      ))}

      {!calculated && (
        <View style={{ marginTop: 20 }}>
          <Button3D label="CALCULAR" onPress={handleCalculate} icon="calculator" color={colors.blue} shadowColor={colors.blueDark} size="large" fullWidth />
        </View>
      )}

      {calculated && (
        <Animated.View entering={FadeIn.duration(400)} style={s.resultSection}>
          <Text style={s.resultLabel}>{content.resultLabel}</Text>
          {isSleepCalc ? (
            <View style={s.sleepTimes}>
              {sleepTimes.map((t, i) => (
                <View key={i} style={[s.sleepChip, i === 1 && s.sleepChipRecommended]}>
                  <Ionicons name="moon" size={16} color="#FFFFFF" />
                  <Text style={s.sleepChipText}>{t.time}</Text>
                  <Text style={s.sleepChipLabel}>{t.label}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={s.resultBig}>
              <Text style={s.resultNumber}>{result}</Text>
              <Text style={s.resultUnit}>{content.resultUnit}</Text>
            </View>
          )}

          {content.extraDisplay && !isSleepCalc && (
            <Text style={s.extra}>{content.extraDisplay.replace('{copos}', String(copos))}</Text>
          )}

          <View style={s.explanationList}>
            {content.explanation.map((exp, i) => (
              <Animated.View key={i} entering={FadeInDown.delay(i * 100).duration(300)} style={s.explanationCard}>
                <Ionicons name="information-circle" size={18} color={colors.blue} />
                <Text style={s.explanationText}>{exp}</Text>
              </Animated.View>
            ))}
          </View>

          <View style={{ marginTop: 20 }}>
            <Button3D label="COMPLETAR MISSÃO" onPress={onComplete} icon="trophy" color={colors.primary} shadowColor={colors.primaryDark} size="large" fullWidth />
          </View>
        </Animated.View>
      )}
    </View>
  );
}

function computeSleepTimes(wakeHour: number) {
  const pad = (n: number) => String(n).padStart(2, '0');
  const results = [];
  const cycles = [6, 5, 4];
  const labels = ['9h - completo', '7h30 - ideal', '6h - minimo'];
  for (let i = 0; i < cycles.length; i++) {
    const totalMin = cycles[i] * 90 + 14; // 14 min to fall asleep
    let sleepHour = wakeHour - Math.floor(totalMin / 60);
    let sleepMin = 60 - (totalMin % 60);
    if (sleepMin >= 60) { sleepMin -= 60; sleepHour += 1; }
    if (sleepHour < 0) sleepHour += 24;
    results.push({ time: `${pad(sleepHour)}:${pad(sleepMin)}`, label: labels[i] });
  }
  return results;
}

const s = StyleSheet.create({
  intro: { fontFamily: fontFamily.semiBold, fontSize: 14, color: colors.textSecondary, marginBottom: 16, lineHeight: 20 },
  inputGroup: { marginBottom: 20 },
  inputLabel: { fontFamily: fontFamily.bold, fontSize: 16, color: '#FFFFFF', marginBottom: 12 },
  sliderContainer: { backgroundColor: colors.surface, borderRadius: 16, padding: 16 },
  sliderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16 },
  sliderValue: { fontFamily: fontFamily.extraBold, fontSize: 28, color: '#FFFFFF', textAlign: 'center', minWidth: 100 },
  btnGroup: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  resultSection: { marginTop: 24 },
  resultLabel: { fontFamily: fontFamily.bold, fontSize: 16, color: colors.textSecondary, textAlign: 'center', marginBottom: 12 },
  resultBig: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center', marginBottom: 8 },
  resultNumber: { fontFamily: fontFamily.extraBold, fontSize: 56, color: colors.gold },
  resultUnit: { fontFamily: fontFamily.bold, fontSize: 20, color: colors.textSecondary, marginLeft: 8 },
  extra: { fontFamily: fontFamily.semiBold, fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginBottom: 16 },
  sleepTimes: { gap: 8, marginBottom: 16 },
  sleepChip: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.surface, borderRadius: 12, padding: 14 },
  sleepChipRecommended: { backgroundColor: 'rgba(94,114,228,0.3)', borderWidth: 1, borderColor: '#5E72E4' },
  sleepChipText: { fontFamily: fontFamily.extraBold, fontSize: 22, color: '#FFFFFF' },
  sleepChipLabel: { fontFamily: fontFamily.semiBold, fontSize: 13, color: colors.textSecondary },
  explanationList: { gap: 8 },
  explanationCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: colors.surface, borderRadius: 12, padding: 14 },
  explanationText: { fontFamily: fontFamily.semiBold, fontSize: 14, color: '#FFFFFF', flex: 1, lineHeight: 20 },
});
