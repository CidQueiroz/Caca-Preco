import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { globalStyles, cores, fontes } from '../styles/globalStyles';
import Constants from 'expo-constants';
import MainLayout from '../components/MainLayout';

const TelaMinhasAvaliacoesDetalhe = ({ navigation }) => {
    const [avaliacoes, setAvaliacoes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { token } = useContext(AuthContext);

    useEffect(() => {
        const fetchAvaliacoes = async () => {
            try {
                const apiUrl = Constants.expoConfig.extra.apiUrl;
                const response = await axios.get(`${apiUrl}/api/avaliacoes/`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setAvaliacoes(response.data);
            } catch (err) {
                setError('Falha ao buscar suas avaliações.');
                console.error(err);
                Alert.alert('Erro', 'Falha ao buscar suas avaliações.');
            }
            setLoading(false);
        };

        if (token) {
            fetchAvaliacoes();
        }
    }, [token]);

    if (loading) {
        return (
            <View style={globalStyles.container}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text style={globalStyles.text}>Carregando avaliações...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={globalStyles.container}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    return (
        <MainLayout>
            <ScrollView style={globalStyles.container}>
                <Text style={globalStyles.title}>Minhas Avaliações</Text>
                {avaliacoes.length === 0 ? (
                    <Text style={styles.noEvaluationsText}>Você ainda não possui avaliações detalhadas.</Text>
                ) : (
                    <View style={styles.evaluationList}>
                        {avaliacoes.map(avaliacao => (
                            <View key={avaliacao.id} style={styles.evaluationCard}>
                                <Text style={styles.evaluationText}><Text style={{ fontWeight: 'bold' }}>Nota:</Text> {avaliacao.nota}/5</Text>
                                <Text style={styles.evaluationText}><Text style={{ fontWeight: 'bold' }}>Comentário:</Text> {avaliacao.comentario}</Text>
                                <Text style={styles.evaluationDate}><Text style={{ fontWeight: 'bold' }}>Avaliado em:</Text> {new Date(avaliacao.data_avaliacao).toLocaleDateString()}</Text>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>
        </MainLayout>
    );
};

const styles = StyleSheet.create({
    noEvaluationsText: {
        textAlign: 'center',
        fontSize: 16,
        color: cores.texto,
        marginTop: 20,
    },
    evaluationList: {
        marginTop: 20,
    },
    evaluationCard: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    evaluationText: {
        fontSize: 16,
        color: cores.texto,
        marginBottom: 5,
    },
    evaluationDate: {
        fontSize: 12,
        color: cores.cinza,
        marginTop: 10,
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
        fontSize: 16,
        marginTop: 20,
    },
});

export default TelaMinhasAvaliacoesDetalhe;