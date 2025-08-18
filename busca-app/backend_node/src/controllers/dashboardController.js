const db = require('../config/db');

exports.getAnalysisData = async (req, res) => {
    if (req.user.tipo.toLowerCase() !== 'vendedor') {
        return res.status(403).json({ message: 'Acesso negado. Apenas vendedores podem acessar a análise de dashboard.' });
    }

    try {
        // Dados fictícios para os gráficos
        const lineChartData = {
            labels: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'],
            datasets: [
                {
                    label: 'Seu Preço Médio',
                    data: [25.50, 25.60, 25.45, 25.70, 25.65, 26.00, 25.90],
                    borderColor: '#FF8383',
                    backgroundColor: 'rgba(255, 131, 131, 0.5)',
                    tension: 0.3,
                },
                {
                    label: 'Média da Concorrência',
                    data: [24.80, 24.90, 25.00, 24.85, 24.95, 25.10, 25.05],
                    borderColor: '#A19AD3',
                    backgroundColor: 'rgba(161, 154, 211, 0.5)',
                    tension: 0.3,
                },
            ],
        };

        const barChartData = {
            labels: ['Produto A', 'Produto B', 'Produto C', 'Produto D', 'Produto E'],
            datasets: [
                {
                    label: 'Seu Estoque',
                    data: [50, 60, 70, 45, 80],
                    backgroundColor: '#A1D6CB',
                },
                {
                    label: 'Estoque Médio da Concorrência',
                    data: [45, 65, 68, 50, 75],
                    backgroundColor: '#FFC107',
                },
            ],
        };

        const pieChartData = {
            labels: ['Abaixo do Mercado', 'No Mercado', 'Acima do Mercado'],
            datasets: [
                {
                    data: [30, 50, 20],
                    backgroundColor: [
                        'rgba(75, 192, 192, 0.6)',
                        'rgba(255, 206, 86, 0.6)',
                        'rgba(255, 99, 132, 0.6)',
                    ],
                    borderColor: [
                        'rgba(75, 192, 192, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(255, 99, 132, 1)',
                    ],
                    borderWidth: 1,
                },
            ],
        };

        res.status(200).json({ 
            lineChartData,
            barChartData,
            pieChartData
        });

    } catch (error) {
        console.error('Erro ao buscar dados para o dashboard:', error);
        res.status(500).json({ error: 'Falha ao buscar dados para o dashboard.' });
    }
};