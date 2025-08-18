import React from 'react';
import { useNavigate } from 'react-router-dom';

const AnaliseMercadoSaaS = () => {
  const navigate = useNavigate();

  return (
    <div className="saas-page-container">
      <div className="saas-header">
        <h1>Potencialize Suas Vendas com Análise de Mercado Inteligente</h1>
        <p className="subtitle">Monitore seus concorrentes, otimize seus preços e venda mais. Tudo de forma automática.</p>
      </div>

      <div className="saas-content">
        <h2>O Problema: Adivinhar o Preço Certo é Lento e Custa Caro</h2>
        <p>Pequenos e médios e-commerces, vendedores de marketplace e dropshippers precisam constantemente monitorar os preços e o estoque de seus concorrentes para se manterem competitivos. Fazer isso manualmente é demorado, ineficiente e sujeito a erros.</p>

        <h2>A Solução: Nossa Plataforma de Monitoramento SaaS</h2>
        <p>Nós criamos uma plataforma web onde você se cadastra e deixa a tecnologia trabalhar por você:</p>
        <ul>
          <li><strong>Configure a Automação:</strong> Insira os links dos produtos dos concorrentes que deseja monitorar.</li>
          <li><strong>Coleta de Dados Automática:</strong> Em intervalos definidos, nossa plataforma executa scripts para coletar preços, estoque e avaliações dos sites concorrentes.</li>
          <li><strong>Dashboard Interativo:</strong> Visualize todos os dados em um painel de controle intuitivo, com análises, gráficos e alertas de oportunidade.</li>
        </ul>

        <div className="saas-cta-section">
          <h3>Acesse agora o seu Dashboard de Análise</h3>
          <p>Comece a explorar os dados e insights que preparamos para você.</p>
          <button onClick={() => navigate('/dashboard-analise')} className="btn btn-primary" style={{marginTop: '20px'}}>
            Acessar Análises
          </button>
          <button onClick={() => navigate('/monitorar-concorrencia')} className="btn btn-secondary" style={{marginTop: '10px'}}>
            Monitorar Nova URL
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnaliseMercadoSaaS;
