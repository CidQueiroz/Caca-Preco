import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement, // Adicionado para gráficos de pizza
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2'; // Adicionado Pie
import Botao from '../components/Botao';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement, // Adicionado para gráficos de pizza
  Title,
  Tooltip,
  Legend
);

// --- DADOS E CONFIGURAÇÕES DOS GRÁFICOS ---

const lineChartData = {
  labels: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'],
  datasets: [
    {
      label: 'Seu Preço Médio',
      data: [25.50, 25.60, 25.45, 25.80, 25.65, 26.00, 25.90],
      borderColor: '#FF8383',
      backgroundColor: 'rgba(255, 131, 131, 0.5)',
      tension: 0.3,
    },
    
    {
      label: 'Média da Concorrência',
      data: [24.80, 24.90, 25.00, 24.90, 24.95, 25.10, 25.05],
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
        '#FFC107',
        'rgba(255, 99, 132, 0.6)',
      ],
      borderColor: [
        'rgba(75, 192, 192, 1)',
        '#FFC107',
        'rgba(255, 99, 132, 1)',
      ],
      borderWidth: 1,
    },
  ],
};

const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      font: {
        size: 16,
      }
    },
  },
};


const DashboardAnalise = () => {
  return (
    <div className="analytics-dashboard">
      <h1 className="dashboard-title">Dashboard de Análise de Mercado</h1>
      
      <div className="card-grid">
        
        <div className="kpi-card">
          <h4>Seu Preço Médio</h4>
          <p>R$ 25,90</p>
          <span className="kpi-trend up">+1.5%</span>
        </div>
        
        <div className="kpi-card">
          <h4>Média da Concorrência</h4>
          <p>R$ 25,05</p>
          <span className="kpi-trend up">+1.0%</span>
        </div>
        
        <div className="kpi-card">
          <h4>Oportunidades</h4>
          <p>5 Produtos</p>
          <span className="kpi-description">Onde seu preço é competitivo</span>
        </div>
        
        <div className="kpi-card">
          <h4>Produtos Monitorados</h4>
          <p>120</p>
          <span className="kpi-description">Total de itens em monitoramento</span>
        </div>
      
      </div>
      
      <div className="analytics-dashboard"> 
        <div className="charts-grid">
          
          <div className="chart-card">
            <h4 className="chart-title-header">Seu Preço vs. Concorrência (Últimos 7 dias)</h4>
            <Line options={{...chartOptions, plugins: {...chartOptions.plugins, title: { ...chartOptions.plugins.title, text: 'Evolução dos Preços'}}}} data={lineChartData} />
          </div>
          
          <div className="chart-card">
            <h4 className="chart-title-header">Comparativo de Estoque</h4>
            <Bar options={{...chartOptions, plugins: {...chartOptions.plugins, title: { ...chartOptions.plugins.title, text: 'Níveis de Estoque Atuais'}}}} data={barChartData} />
          </div>

          <div className="chart-card">
            <h4 className="chart-title-header">Distribuição de Preços no Mercado</h4>
            <Pie options={{...chartOptions, plugins: {...chartOptions.plugins, title: { ...chartOptions.plugins.title, text: 'Posicionamento de Preço'}}}} data={pieChartData} />
          </div>
          
          {/* Adicionamos a classe 'ai-card' para um estilo mais específico */}
          <div className="chart-card ai-card">
              <h3 className="chart-title-header">Análise com IA Generativa ✨</h3>
              
              <div className="ai-analysis-content">
                  {/* Adicionamos um div para agrupar o texto */}
                  <div>
                      <p>
                          Analisando as tendências de preço e estoque, identifiquei uma <strong>oportunidade de aumento de margem</strong> no 'Produto C'.
                      </p>
                      <p>
                          <strong>Sugestão:</strong> Considere um leve aumento de preço neste item durante o fim de semana, pois a demanda concorrente está diminuindo enquanto a sua permanece estável.
                      </p>
                  </div>
                  
                  <div className="ai-button">
                      <Botao variante="primario">
                          Ver análise completa
                      </Botao>
                  </div>
              </div>
          </div>
          
        </div>
      
      </div>
    
    </div>
  );
};

export default DashboardAnalise;