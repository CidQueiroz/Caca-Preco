import React, { useState, useContext } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, ImageBackground } from 'react-native';
import CustomHeader from './CustomHeader';
import CustomFooter from './CustomFooter';
import { AuthContext } from '../context/AuthContext';

const MainLayout = ({ children }) => {
  const { user } = useContext(AuthContext);

  const backgroundSource = user ? require('../../assets/ia.png') : null;

  // Estados para controlar a visibilidade do cabeçalho e rodapé
  //  const [showHeader, setShowHeader] = useState(true);
  //  const [showFooter, setShowFooter] = useState(true);

  //  const handleScroll = (event) => {
  //    const { y } = event.nativeEvent.contentOffset;
  //    const { height } = event.nativeEvent.layoutMeasurement;
  //    const { contentSize } = event.nativeEvent;

    // Lógica para o Cabeçalho:
    // Exibe o cabeçalho se a posição de rolagem estiver no topo (y <= 20)
  //    if (y <= 20) {
  //      setShowHeader(true);
  //    } else {
  //      setShowHeader(false);
  //  }

    // Lógica para o Rodapé:
    // Exibe o rodapé se a posição de rolagem estiver perto do final.
  //    const isCloseToBottom = y + height >= contentSize.height - 20;
  //    if (isCloseToBottom) {
  //      setShowFooter(true);
  //    } else {
  //      setShowFooter(false);
  //    }
  //  };

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground source={backgroundSource} style={styles.background} imageStyle={{ opacity: 0.1, resizeMode: 'repeat' }}>

        <ScrollView style={styles.ScrollViewContent}>

        <CustomHeader/>

        <View style={styles.childrenContainer}>
          {children}
        </View>

        <CustomFooter />

        </ScrollView>

      </ImageBackground>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdeff2',
  },
  content: {
    flex: 1,
    backgroundColor: 'transparent', // MUITO IMPORTANTE!
  },
  background: {
    flex: 1,
  resizeMode: 'repeat',
  },
  scrollViewContent: {
    flex: 1,
  },
  childrenContainer: {
    flex: 1,
  },
});

export default MainLayout;