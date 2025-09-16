import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Circle, Ellipse, G, LinearGradient, Stop, Defs, Filter, feGaussianBlur, feOffset, feComposite, feMerge, feMergeNode } from 'react-native-svg';

const AnimatedRealisticUnicorn = () => {
  // Múltiplas refs para animações complexas
  const floatAnim = useRef(new Animated.Value(0)).current;
  const wingFlapAnim = useRef(new Animated.Value(0)).current;
  const maneFlowAnim = useRef(new Animated.Value(0)).current;
  const tailFlowAnim = useRef(new Animated.Value(0)).current;
  const hornSparkleAnim = useRef(new Animated.Value(0)).current;
  const breathingAnim = useRef(new Animated.Value(0)).current;

  // Interpolações complexas para movimentos mais naturais
  const floatInterpolation = floatAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, -15, 0],
  });

  const wingRotation = wingFlapAnim.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: ['0deg', '-10deg', '-20deg', '-10deg', '0deg'],
  });

  const maneFlow = maneFlowAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['0deg', '3deg', '0deg'],
  });

  const breathingScale = breathingAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.05, 1],
  });

  // Função para animações complexas combinadas
  const startComplexAnimations = () => {
    const floatTiming = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
      ])
    );

    const wingTiming = Animated.loop(
      Animated.sequence([
        Animated.timing(wingFlapAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          useNativeDriver: true,
        }),
        Animated.timing(wingFlapAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          useNativeDriver: true,
        }),
      ])
    );

    const maneTiming = Animated.loop(
      Animated.sequence([
        Animated.timing(maneFlowAnim, {
          toValue: 1,
          duration: 2500,
          easing: Easing.inOut(Easing.sine),
          useNativeDriver: true,
        }),
        Animated.timing(maneFlowAnim, {
          toValue: 0,
          duration: 2500,
          easing: Easing.inOut(Easing.sine),
          useNativeDriver: true,
        }),
      ])
    );

    const breathingTiming = Animated.loop(
      Animated.sequence([
        Animated.timing(breathingAnim, {
          toValue: 1,
          duration: 4000,
          easing: Easing.inOut(Easing.sine),
          useNativeDriver: true,
        }),
        Animated.timing(breathingAnim, {
          toValue: 0,
          duration: 4000,
          easing: Easing.inOut(Easing.sine),
          useNativeDriver: true,
        }),
      ])
    );

    Animated.parallel([
      floatTiming,
      wingTiming,
      maneTiming,
      breathingTiming,
    ]).start();
  };

  useEffect(() => {
    startComplexAnimations();
  }, []);

  const AnimatedG = Animated.createAnimatedComponent(G);
  const AnimatedPath = Animated.createAnimatedComponent(Path);

  return (
    <Animated.View style={[styles.container, {
      transform: [
        { translateY: floatInterpolation },
        { scale: breathingScale }
      ]
    }]}>
      <Svg width="400" height="400" viewBox="0 0 400 400">
        <Defs>
          {/* Gradientes para corpo */}
          <LinearGradient id="bodyGradient" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#fff5f9" />
            <Stop offset="1" stopColor="#ffd6f3" />
          </LinearGradient>
          
          {/* Gradiente para crina */}
          <LinearGradient id="maneGradient" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#ffd6ff" />
            <Stop offset="0.5" stopColor="#ff9eec" />
            <Stop offset="1" stopColor="#ff77e4" />
          </LinearGradient>

          {/* Efeito de brilho */}
          <Filter id="glow" height="300%" width="300%" x="-75%" y="-75%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </Filter>
        </Defs>

        {/* Corpo principal com mais detalhes */}
        <AnimatedG style={{ transform: [{ scale: breathingScale }] }}>
          <Path
            d="M150 200 C100 180 90 220 120 250 C150 280 200 280 250 250 C280 230 280 200 260 180 C240 160 200 170 150 200"
            fill="url(#bodyGradient)"
            stroke="#ffd6f3"
            strokeWidth="2"
          />

          {/* Pernas mais detalhadas com articulações */}
          <Path
            d="M140 250 C138 270 142 290 140 310 C138 320 142 330 150 330"
            stroke="#ffd6f3"
            strokeWidth="8"
            fill="none"
          />
          {/* ... Adicionar mais pernas com paths similares ... */}

          {/* Asas detalhadas e animadas */}
          <AnimatedG
            style={{
              transform: [{ rotate: wingRotation }],
              originX: 200,
              originY: 200
            }}
          >
            <Path
              d="M180 180 C150 150 140 120 160 100 C180 80 200 90 210 110 C220 130 230 150 220 170"
              fill="white"
              stroke="#ffd6f3"
              strokeWidth="2"
              filter="url(#glow)"
            />
            {/* Segunda asa com padrão similar */}
          </AnimatedG>

          {/* Crina fluida e animada */}
          <AnimatedPath
            d="M250 150 C270 140 280 120 270 100 C260 80 240 70 220 80 C200 90 190 110 200 130"
            fill="url(#maneGradient)"
            style={{
              transform: [{ rotate: maneFlow }],
              originX: 235,
              originY: 115
            }}
          />

          {/* Chifre com efeito de brilho */}
          <Path
            d="M280 120 L300 80 L290 70"
            stroke="gold"
            strokeWidth="4"
            filter="url(#glow)"
          />

          {/* Detalhes faciais */}
          <Circle cx="265" cy="130" r="3" fill="#333" /> {/* Olho */}
          <Path
            d="M270 140 C275 142 280 142 285 140"
            stroke="#ffb7e5"
            strokeWidth="2"
            fill="none"
          /> {/* Boca */}
        </AnimatedG>
      </Svg>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 400,
    height: 400,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AnimatedRealisticUnicorn;
