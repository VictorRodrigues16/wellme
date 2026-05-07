import { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  SectionList,
  StyleSheet,
  Text,
  View,
  Dimensions,
  Pressable,
} from 'react-native';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGame } from '../../src/context/GameContext';
import { colors, categoryColors } from '../../src/theme/colors';
import { fontFamily } from '../../src/theme/typography';
import { Node3D } from '../../src/components/game/Node3D';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { Button3D } from '../../src/components/ui/Button3D';
import { VitaMascot } from '../../src/components/mascot/VitaMascot';
import { VITA_TIPS } from '../../src/constants/vitaTips';
import type { Mission, MissionStatus } from '../../src/data/types';

type NodeStatus = MissionStatus | 'current';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const STATS_HEIGHT = 90;

const MODULE_ICON_MAP: Record<string, keyof typeof Ionicons.glyphMap> = {
  'Hidratação': 'water', 'Movimento': 'walk', 'Alimentação': 'nutrition',
  'Mente': 'cloudy', 'Sono': 'moon', 'Prevenção': 'shield-checkmark', 'Hábitos': 'swap-horizontal',
};
const MODULE_NUMBERS: Record<string, number> = {
  'Hidratação': 1, 'Movimento': 2, 'Alimentação': 3, 'Mente': 4, 'Sono': 5, 'Prevenção': 6, 'Hábitos': 7,
};

function nodeOffsetX(i: number) {
  return Math.sin(i * 0.9) * (SCREEN_WIDTH * 0.22);
}

export default function TrilhaScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state, derived, hydrated } = useGame();
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);

  if (!hydrated || !state || !derived) {
    return <View style={s.loader}><ActivityIndicator color={colors.primary} size="large" /></View>;
  }

  const { missions } = state;
  const sections: { module: string; category: string; data: Mission[] }[] = [];
  missions.forEach((m) => {
    const last = sections[sections.length - 1];
    if (last && last.module === m.module) last.data.push(m);
    else sections.push({ module: m.module, category: m.category, data: [m] });
  });

  const handleNodePress = (m: Mission) => {
    if (m.status === 'locked') return;
    setSelectedMission(selectedMission?.id === m.id ? null : m);
  };

  const renderSectionHeader = ({ section }: { section: typeof sections[0] }) => {
    const cc = categoryColors[section.category] || categoryColors.hidratacao;
    const num = MODULE_NUMBERS[section.module] || 1;
    const icon = MODULE_ICON_MAP[section.module] || 'help-circle';
    const done = section.data.filter((m) => m.status === 'completed').length;
    return (
      <View style={[s.bannerWrap, { paddingTop: statsH + 8 }]}>
        <LinearGradient colors={[cc.main, cc.dark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.banner}>
          <View style={s.bannerIcon}><Ionicons name={icon} size={18} color="#FFF" /></View>
          <View style={{ flex: 1 }}>
            <Text style={s.bannerLabel}>MÓDULO {num}</Text>
            <Text style={s.bannerTitle}>{section.module}</Text>
          </View>
          <View style={s.bannerProg}><Text style={s.bannerProgTxt}>{done}/{section.data.length}</Text></View>
        </LinearGradient>
      </View>
    );
  };

  const renderItem = ({ item: mission, index, section }: { item: Mission; index: number; section: typeof sections[0] }) => {
    const cc = categoryColors[section.category] || categoryColors.hidratacao;
    const icon = MODULE_ICON_MAP[section.module] || 'help-circle';
    const gi = missions.indexOf(mission);
    const ox = nodeOffsetX(gi);
    const sel = selectedMission?.id === mission.id;

    let ns: NodeStatus = mission.status;
    if (mission.status === 'available' && !missions.some((m) => m.status === 'available' && m.id < mission.id)) ns = 'current';

    const hasNext = index < section.data.length - 1;
    const ngi = hasNext ? missions.indexOf(section.data[index + 1]) : 0;
    const nox = hasNext ? nodeOffsetX(ngi) : 0;
    const nm = hasNext ? section.data[index + 1] : null;
    const pathDone = mission.status === 'completed' && nm?.status !== 'locked';
    const cx = SCREEN_WIDTH / 2;

    // Curve: start at bottom of current node, end at top of next node
    const startX = cx + ox;
    const endX = cx + nox;
    const midX = (startX + endX) / 2;

    return (
      <View style={s.nodeSection}>
        <View style={[s.nodePos, { marginLeft: ox }]}>
          <Node3D
            status={ns}
            iconName={icon}
            color={mission.status === 'completed' ? colors.gold : cc.main}
            darkColor={mission.status === 'completed' ? colors.goldDark : cc.dark}
            title={mission.title}
            onPress={() => handleNodePress(mission)}
            accessibilityLabel={`${mission.title} - ${mission.status}`}
          />
          {mission.status === 'available' && (
            <View style={s.xpBadge}><Text style={s.xpBadgeTxt}>+{mission.xpReward}</Text></View>
          )}
        </View>

        {sel && (
          <Animated.View entering={FadeInDown.duration(200)} style={[s.tooltip, { marginLeft: ox }]}>
            <View style={s.ttArrow} />
            <View style={s.ttBody}>
              <Text style={s.ttDesc} numberOfLines={2}>{mission.description}</Text>
              <View style={s.ttFooter}>
                <View style={s.ttXP}><Ionicons name="star" size={14} color={colors.gold} /><Text style={s.ttXPTxt}> {mission.xpReward} XP</Text></View>
                {mission.status !== 'completed' ? (
                  <Button3D label="COMEÇAR" onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); router.push(`/mission/${mission.id}`); }} color={cc.main} shadowColor={cc.dark} size="small" />
                ) : (
                  <View style={s.doneTag}><Ionicons name="checkmark-circle" size={16} color={colors.primary} /><Text style={s.doneTagTxt}>Concluída</Text></View>
                )}
              </View>
            </View>
          </Animated.View>
        )}

        {hasNext && (
          <View style={s.dotsRow}>
            {[0, 1, 2].map((i) => {
              const t = (i + 1) / 4;
              const dotLeft = ox + (nox - ox) * t;
              return (
                <View
                  key={i}
                  style={[
                    s.dot,
                    { marginLeft: dotLeft, backgroundColor: pathDone ? cc.main : colors.locked },
                  ]}
                />
              );
            })}
          </View>
        )}
      </View>
    );
  };

  const statsH = insets.top + STATS_HEIGHT;

  return (
    <View style={s.container}>
      {/* Fixed stats — always on top */}
      <View style={[s.fixedStats, { paddingTop: insets.top + 6, height: statsH }]}>
        <LinearGradient colors={[colors.primaryDark, colors.primary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.headerGrad}>
          <View style={s.headerStats}>
            <Pill icon="flame" val={String(state.user.streak)} />
            <Pill icon="star" val={`${state.user.xp} XP`} />
            <Pill icon="diamond" val={`Nv ${state.user.level}`} />
          </View>
          <ProgressBar progress={derived.levelProgress} label={`${derived.xpInLevel} / 200 XP`} height={16} gradientColors={[colors.gold, colors.orange]} style={{ marginTop: 6 }} />
        </LinearGradient>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        ListFooterComponent={<View style={{ height: 120 }} />}
        stickySectionHeadersEnabled
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: statsH }}
      />
      <FloatingVita />
    </View>
  );
}

function Pill({ icon, val }: { icon: keyof typeof Ionicons.glyphMap; val: string }) {
  return (
    <View style={s.pill}><Ionicons name={icon} size={14} color="#FFF" /><Text style={s.pillTxt}>{val}</Text></View>
  );
}

function FloatingVita() {
  const [ti, setTi] = useState(0);
  const [show, setShow] = useState(false);
  const op = useSharedValue(0);

  useEffect(() => {
    const t = setInterval(() => { setTi((p) => (p + 1) % VITA_TIPS.length); setShow(true); }, 15000);
    const f = setTimeout(() => setShow(true), 5000);
    return () => { clearTimeout(f); clearInterval(t); };
  }, []);

  useEffect(() => {
    if (show) {
      op.value = withTiming(1, { duration: 600 });
      const h = setTimeout(() => { op.value = withTiming(0, { duration: 600 }); setTimeout(() => setShow(false), 650); }, 4000);
      return () => clearTimeout(h);
    }
  }, [show]);

  const bs = useAnimatedStyle(() => ({ opacity: op.value }));

  return (
    <View style={s.vita}>
      {show && (
        <Animated.View style={[s.vitaBubble, bs]}>
          <View style={s.vitaBubbleBody}><Text style={s.vitaBubbleTxt}>{VITA_TIPS[ti]}</Text></View>
          <View style={s.vitaBubbleArr} />
        </Animated.View>
      )}
      <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setTi((p) => (p + 1) % VITA_TIPS.length); op.value = 0; setShow(true); }}>
        <VitaMascot size={80} expression="happy" />
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },

  // Fixed stats
  fixedStats: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    paddingHorizontal: 16,
    paddingBottom: 6,
    backgroundColor: colors.background,
  },
  headerGrad: { borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 },
  headerStats: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  pill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12, gap: 5, backgroundColor: 'rgba(0,0,0,0.2)' },
  pillTxt: { fontFamily: fontFamily.extraBold, fontSize: 13, color: '#FFF' },

  // Section banner
  bannerWrap: { backgroundColor: colors.background, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 6 },
  banner: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, borderRadius: 14, gap: 10 },
  bannerIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(0,0,0,0.15)', alignItems: 'center', justifyContent: 'center' },
  bannerLabel: { fontFamily: fontFamily.bold, fontSize: 9, color: 'rgba(255,255,255,0.7)', letterSpacing: 2 },
  bannerTitle: { fontFamily: fontFamily.extraBold, fontSize: 16, color: '#FFF' },
  bannerProg: { backgroundColor: 'rgba(0,0,0,0.2)', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
  bannerProgTxt: { fontFamily: fontFamily.extraBold, fontSize: 12, color: '#FFF' },

  // Nodes
  nodeSection: { alignItems: 'center', overflow: 'visible' },
  nodePos: { alignItems: 'center', position: 'relative', marginTop: 6, overflow: 'visible' },
  xpBadge: { position: 'absolute', top: 0, right: -16, backgroundColor: colors.gold, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8, borderWidth: 2, borderColor: colors.background },
  xpBadgeTxt: { fontFamily: fontFamily.extraBold, fontSize: 10, color: colors.textDark },
  dotsRow: { alignItems: 'center', gap: 6, paddingVertical: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },

  // Tooltip
  tooltip: { marginTop: 8, alignItems: 'center', width: SCREEN_WIDTH * 0.72 },
  ttArrow: { width: 12, height: 12, backgroundColor: colors.surface, transform: [{ rotate: '45deg' }], marginBottom: -6, zIndex: 0 },
  ttBody: { backgroundColor: colors.surface, borderRadius: 14, padding: 14, width: '100%', zIndex: 1, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  ttDesc: { fontFamily: fontFamily.semiBold, fontSize: 13, color: colors.textSecondary, marginBottom: 10, lineHeight: 19 },
  ttFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  ttXP: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,200,0,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  ttXPTxt: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.gold },
  doneTag: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  doneTagTxt: { fontFamily: fontFamily.bold, fontSize: 13, color: colors.primary },

  // Floating Vita
  vita: { position: 'absolute', bottom: 90, right: 12, alignItems: 'flex-end' },
  vitaBubble: { marginBottom: 6, maxWidth: 190 },
  vitaBubbleBody: { backgroundColor: '#FFF', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8 },
  vitaBubbleTxt: { fontFamily: fontFamily.semiBold, fontSize: 12, color: colors.textDark, lineHeight: 17 },
  vitaBubbleArr: { alignSelf: 'flex-end', marginRight: 18, width: 10, height: 10, backgroundColor: '#FFF', transform: [{ rotate: '45deg' }], marginTop: -5 },
});
