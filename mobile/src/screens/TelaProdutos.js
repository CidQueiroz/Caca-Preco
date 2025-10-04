import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { globalStyles, cores, fontes } from '../styles/globalStyles';
import Constants from 'expo-constants';
import Notification from '../components/Notification';
import MainLayout from '../components/MainLayout';

const TelaProdutos = ({ navigation }) => {
  const [produtos, setProdutos] = useState([]);
  const [termoBusca, setTermoBusca] = useState('');
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ message: '', type: '' });

  const showNotification = (message, type) => {
    setNotification({ message, type });
  };
  return (
    <MainLayout>
      <View style={globalStyles.container}>
        <Text>Tela de Produtos</Text>
      </View>
    </MainLayout>
  );
}