import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, {
  Path,
  Circle,
  Ellipse,
  G,
} from 'react-native-svg';

export type VitaExpression = 'happy' | 'excited' | 'sleepy' | 'celebrate';

interface VitaMascotProps {
  size?: number;
  expression?: VitaExpression;
  animated?: boolean;
}

export function VitaMascot({
  size = 200,
  expression = 'happy',
  animated = false,
}: VitaMascotProps) {
  const translateY = useSharedValue(0);

  useEffect(() => {
    if (animated) {
      translateY.value = withRepeat(
        withSequence(
          withTiming(-8, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    }
  }, [animated]);

  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const isCelebrate = expression === 'celebrate';

  const content = (
    <Svg width={size} height={size * (580 / 680)} viewBox="0 0 680 580">
      {/* Ground shadow */}
      <Ellipse cx={340} cy={560} rx={155} ry={18} fill="#000000" opacity={0.15} />

      {/* Stem */}
      <Path d="M 332 240 Q 328 185 336 135 L 344 135 Q 352 185 348 240 Z" fill="#5A8A2A" />
      <Path d="M 336 230 Q 334 180 340 135" stroke="#7BAF3E" strokeWidth={2} fill="none" strokeLinecap="round" />

      {/* Left leaf */}
      <G transform="rotate(-38 308 118)">
        <Ellipse cx={308} cy={118} rx={36} ry={17} fill="#58CC02" />
        <Ellipse cx={308} cy={118} rx={36} ry={17} fill="none" stroke="#46A302" strokeWidth={4} />
        <Path d="M 276 118 Q 308 114 340 118" stroke="#46A302" strokeWidth={2.5} fill="none" strokeLinecap="round" />
        <Ellipse cx={298} cy={112} rx={10} ry={4} fill="#7BE03A" opacity={0.7} />
      </G>

      {/* Right leaf */}
      <G transform="rotate(38 372 118)">
        <Ellipse cx={372} cy={118} rx={36} ry={17} fill="#58CC02" />
        <Ellipse cx={372} cy={118} rx={36} ry={17} fill="none" stroke="#46A302" strokeWidth={4} />
        <Path d="M 340 118 Q 372 122 404 118" stroke="#46A302" strokeWidth={2.5} fill="none" strokeLinecap="round" />
        <Ellipse cx={382} cy={112} rx={10} ry={4} fill="#7BE03A" opacity={0.7} />
      </G>

      {/* Left arm */}
      <Ellipse
        cx={isCelebrate ? 175 : 170}
        cy={isCelebrate ? 260 : 385}
        rx={30}
        ry={22}
        fill="#FF5757"
        transform={isCelebrate ? 'rotate(-45 175 260)' : undefined}
      />
      <Ellipse
        cx={isCelebrate ? 175 : 170}
        cy={isCelebrate ? 260 : 385}
        rx={30}
        ry={22}
        fill="none"
        stroke="#B82E2E"
        strokeWidth={5}
        transform={isCelebrate ? 'rotate(-45 175 260)' : undefined}
      />

      {/* Right arm */}
      <Ellipse
        cx={isCelebrate ? 505 : 510}
        cy={isCelebrate ? 260 : 385}
        rx={30}
        ry={22}
        fill="#FF5757"
        transform={isCelebrate ? 'rotate(45 505 260)' : undefined}
      />
      <Ellipse
        cx={isCelebrate ? 505 : 510}
        cy={isCelebrate ? 260 : 385}
        rx={30}
        ry={22}
        fill="none"
        stroke="#B82E2E"
        strokeWidth={5}
        transform={isCelebrate ? 'rotate(45 505 260)' : undefined}
      />

      {/* Heart body */}
      <Path
        d="M340 525 C 175 425, 135 280, 215 200 C 275 138, 340 178, 340 240 C 340 178, 405 138, 465 200 C 545 280, 505 425, 340 525 Z"
        fill="#FF5757"
      />

      {/* Bottom shadow */}
      <Path d="M340 525 C 285 495, 215 445, 180 380 C 200 460, 275 510, 340 525 Z" fill="#C73E3E" opacity={0.55} />
      <Path d="M340 525 C 395 495, 465 445, 500 380 C 480 460, 405 510, 340 525 Z" fill="#C73E3E" opacity={0.35} />

      {/* Heart outline */}
      <Path
        d="M340 525 C 175 425, 135 280, 215 200 C 275 138, 340 178, 340 240 C 340 178, 405 138, 465 200 C 545 280, 505 425, 340 525 Z"
        fill="none"
        stroke="#B82E2E"
        strokeWidth={7}
        strokeLinejoin="round"
      />

      {/* Highlight */}
      <Ellipse cx={245} cy={265} rx={48} ry={24} fill="#FFFFFF" opacity={0.32} transform="rotate(-32 245 265)" />
      <Ellipse cx={285} cy={225} rx={16} ry={9} fill="#FFFFFF" opacity={0.55} transform="rotate(-32 285 225)" />

      {/* Cheeks */}
      <Ellipse cx={218} cy={380} rx={26} ry={13} fill="#FFB3B3" opacity={0.85} />
      <Ellipse cx={462} cy={380} rx={26} ry={13} fill="#FFB3B3" opacity={0.85} />

      {/* Eyes - vary by expression */}
      {expression === 'sleepy' ? (
        <>
          {/* Sleepy eyes - closed arcs */}
          <Path d="M 255 310 Q 282 290 310 310" stroke="#1A1A1A" strokeWidth={6} fill="none" strokeLinecap="round" />
          <Path d="M 370 310 Q 398 290 425 310" stroke="#1A1A1A" strokeWidth={6} fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          {/* Left eye */}
          <Circle cx={282} cy={305} r={expression === 'excited' ? 46 : 42} fill="#FFFFFF" />
          <Circle cx={282} cy={305} r={expression === 'excited' ? 46 : 42} fill="none" stroke="#1A1A1A" strokeWidth={5} />
          <Circle cx={290} cy={316} r={expression === 'excited' ? 24 : 22} fill="#1A1A1A" />
          <Circle cx={298} cy={308} r={expression === 'excited' ? 9 : 8} fill="#FFFFFF" />
          <Circle cx={284} cy={324} r={3.5} fill="#FFFFFF" />

          {/* Right eye */}
          <Circle cx={398} cy={305} r={expression === 'excited' ? 46 : 42} fill="#FFFFFF" />
          <Circle cx={398} cy={305} r={expression === 'excited' ? 46 : 42} fill="none" stroke="#1A1A1A" strokeWidth={5} />
          <Circle cx={406} cy={316} r={expression === 'excited' ? 24 : 22} fill="#1A1A1A" />
          <Circle cx={414} cy={308} r={expression === 'excited' ? 9 : 8} fill="#FFFFFF" />
          <Circle cx={400} cy={324} r={3.5} fill="#FFFFFF" />
        </>
      )}

      {/* Mouth - vary by expression */}
      {expression === 'excited' ? (
        <>
          {/* Open mouth */}
          <Ellipse cx={340} cy={400} rx={30} ry={22} fill="#1A1A1A" />
          <Path d="M 320 400 Q 340 418 360 400 Q 355 414 340 414 Q 325 414 320 400 Z" fill="#FF8FA3" />
        </>
      ) : expression === 'sleepy' ? (
        <>
          {/* Sleepy small mouth */}
          <Path d="M 325 390 Q 340 400 355 390" stroke="#1A1A1A" strokeWidth={5} fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          {/* Happy smile */}
          <Path d="M 300 380 Q 340 425 380 380" stroke="#1A1A1A" strokeWidth={7} fill="none" strokeLinecap="round" />
          <Path d="M 322 400 Q 340 418 358 400 Q 352 412 340 412 Q 328 412 322 400 Z" fill="#FF8FA3" />
        </>
      )}

      {/* Celebrate stars */}
      {isCelebrate && (
        <>
          <Path d="M 140 200 l 6 -14 6 14 14 -6 -14 6 -6 14 -6 -14 -14 6 Z" fill="#FFC800" />
          <Path d="M 520 180 l 5 -12 5 12 12 -5 -12 5 -5 12 -5 -12 -12 5 Z" fill="#FFC800" />
          <Path d="M 560 320 l 4 -10 4 10 10 -4 -10 4 -4 10 -4 -10 -10 4 Z" fill="#FFC800" />
        </>
      )}
    </Svg>
  );

  if (animated) {
    return <Animated.View style={floatStyle}>{content}</Animated.View>;
  }

  return <View>{content}</View>;
}
