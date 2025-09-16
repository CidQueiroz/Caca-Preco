import React, { useEffect, useContext, useRef } from 'react';
import { StyleSheet, Dimensions, Image } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay, Easing, interpolateColor } from 'react-native-reanimated';
import { useNavigation, StackActions } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';

const AnimatedImage = Animated.createAnimatedComponent(Image);
const { height } = Dimensions.get('window');

const TelaSplash = () => {
    const { usuario, token } = useContext(AuthContext);
    const navigation = useNavigation();
    const videoRef = useRef(null);

    const cdkTranslateY = useSharedValue(-height / 2);
    const teckTranslateY = useSharedValue(height / 2);
    const logoOpacity = useSharedValue(0);
    const animation = useSharedValue(0);

    const navigateToNextScreen = (videoDuration) => {
        animation.value = withTiming(1, { duration: videoDuration, easing: Easing.linear });

        const timer = setTimeout(() => {
            if (token && usuario) {
                if (!usuario.email_verificado) {
                    navigation.dispatch(StackActions.replace('TelaVerificarEmail'));
                } else if (!usuario.perfil_completo) {
                    navigation.dispatch(StackActions.replace('TelaCompletarPerfil'));
                } else {
                    const dashboard = usuario.tipoUsuario === 'Vendedor' 
                        ? 'TelaDashboardVendedor' 
                        : 'TelaDashboardCliente';
                    navigation.dispatch(StackActions.replace(dashboard));
                }
            } else {
                navigation.dispatch(StackActions.replace('TelaInicial'));
            }
        }, videoDuration);

        return () => clearTimeout(timer);
    };

    useEffect(() => {
        cdkTranslateY.value = withTiming(0, { duration: 1500, easing: Easing.out(Easing.cubic) });
        teckTranslateY.value = withTiming(0, { duration: 1500, easing: Easing.out(Easing.cubic) });
        logoOpacity.value = withDelay(500, withTiming(1, { duration: 1000 }));
    }, []);

    const onVideoLoad = (status) => {
        if (status.isLoaded) {
            navigateToNextScreen(status.durationMillis);
        }
    };

    const animatedContainerStyle = useAnimatedStyle(() => {
        const backgroundColor = interpolateColor(
            animation.value,
            [0, 1],
            ['#D9DBE0', '#FCFCFB']
        );
        return {
            backgroundColor,
        };
    });

    const cdkImageStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: cdkTranslateY.value }],
        opacity: logoOpacity.value,
    }));
    
    const teckImageStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: teckTranslateY.value }],
        opacity: logoOpacity.value,
    }));
    
    const centralElementStyle = useAnimatedStyle(() => ({
        opacity: logoOpacity.value,
    }));

    return (
        <Animated.View style={[styles.container, animatedContainerStyle]}>
            <AnimatedImage
                source={require('../../assets/CDK.png')}
                style={[styles.sideImage, styles.cdkImage, cdkImageStyle]}
                resizeMode="contain"
            />
            <Animated.View style={[styles.centralElement, centralElementStyle]}>
                <Video
                    ref={videoRef}
                    source={require('../../assets/video.mp4')}
                    style={styles.video}
                    resizeMode={ResizeMode.CONTAIN}
                    shouldPlay={true}
                    isLooping={false}
                    isMuted={false}
                    onLoad={onVideoLoad}
                />
            </Animated.View>
            <AnimatedImage
                source={require('../../assets/TECK.png')}
                style={[styles.sideImage, styles.teckImage, teckImageStyle]}
                resizeMode="contain"
            />
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    centralElement: {
        width: 375,
        height: 375,
    },
    video: {
        width: '100%',
        height: '100%',
    },
    sideImage: {
        position: 'absolute',
        width: '50%',
        height: 100,
    },
    cdkImage: {
        top: '15%',
    },
    teckImage: {
        bottom: '15%',
    },
});

export default TelaSplash;
