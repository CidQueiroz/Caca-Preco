import React, { useState, useEffect, useRef, useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { Video } from 'expo-av';
import { AuthContext } from '../../src/context/AuthContext';

const TelaSplash = () => {
    const { terminarSplash } = useContext(AuthContext);
    const [isLoaded, setIsLoaded] = useState(false);
    const [playCount, setPlayCount] = useState(0);
    const videoRef = useRef(null);

    useEffect(() => {
        // Este efeito lida com a navegação após a conclusão da reprodução do vídeo.
        if (playCount >= 2) {
            terminarSplash();
        }
    }, [playCount, terminarSplash]);

    const handleVideoLoad = () => {
        setIsLoaded(true);
    };

    const handlePlaybackStatusUpdate = (playbackStatus) => {
        if (playbackStatus.didJustFinish) {
            setPlayCount(prevCount => {
                const newCount = prevCount + 1;
                if (newCount === 1) {
                    // Se terminou a primeira reprodução, reinicia o vídeo
                    videoRef.current.replayAsync();
                }
                return newCount;
            });
        }
    };

    return (
        <View style={styles.container}>
            {/* Renderize o vídeo apenas quando ele estiver pronto */}
            {isLoaded && (
                <Video
                    ref={videoRef}
                    source={require('../../assets/video_logo1.mp4')}
                    style={styles.backgroundVideo}
                    isMuted={true}
                    shouldPlay={true}
                    isLooping={false}
                    resizeMode="contain"
                    onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
                />
            )}
            
            {/* Este vídeo é invisível, serve apenas para carregar o arquivo e disparar o evento */}
            <Video
                source={require('../../assets/video_logo1.mp4')}
                onLoad={handleVideoLoad}
                style={{ display: 'none' }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    backgroundVideo: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
    },
});

export default TelaSplash;