import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';


const MinhasAvaliacoesDetalhe = () => {
    const [avaliacoes, setAvaliacoes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { token } = useContext(AuthContext);

    useEffect(() => {
        const fetchAvaliacoes = async () => {
            try {
                const response = await axios.get('/usuarios/avaliacoes', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setAvaliacoes(response.data);
            } catch (err) {
                setError('Falha ao buscar suas avaliações.');
                console.error(err);
            }
            setLoading(false);
        };

        if (token) {
            fetchAvaliacoes();
        }
    }, [token]);

    if (loading) return <div>Carregando avaliações...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="container">
            <h1>Minhas Avaliações</h1>
            {avaliacoes.length === 0 ? (
                <p>Você ainda não possui avaliações detalhadas.</p>
            ) : (
                <div className="evaluation-list">
                    {avaliacoes.map(avaliacao => (
                        <div key={avaliacao.id_avaliacao} className="evaluation-card">
                            <p><strong>Nota:</strong> {avaliacao.nota}/5</p>
                            <p><strong>Comentário:</strong> {avaliacao.comentario}</p>
                            <p><small>Avaliado em: {new Date(avaliacao.data_avaliacao).toLocaleDateString()}</small></p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MinhasAvaliacoesDetalhe;