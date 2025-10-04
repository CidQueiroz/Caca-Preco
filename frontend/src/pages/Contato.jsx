import React from 'react';
import '../styles/Global.css'; // Garante que os estilos globais sejam aplicados

const Contato = () => {
  return (
    <div className="static-page-container contact-page">
      <h1>Conecte-se Comigo</h1>
      <p className="contact-subtitle">Estou sempre aberto a novas oportunidades, colaborações e um bom bate-papo. Me encontre nas redes abaixo!</p>
      
      <div className="social-links-container">
        <a href="https://www.instagram.com/ciddyqueiroz/" target="_blank" rel="noopener noreferrer" className="social-link">
          <img src="/assets/instagram.png" alt="Instagram" />
          <span>Instagram</span>
        </a>
        <a href="https://github.com/CidQueiroz" target="_blank" rel="noopener noreferrer" className="social-link">
          <img src="/assets/github.png" alt="GitHub" />
          <span>GitHub</span>
        </a>
        <a href="https://www.linkedin.com/in/ciddy-queiroz/" target="_blank" rel="noopener noreferrer" className="social-link">
          <img src="/assets/linkedin.png" alt="LinkedIn" />
          <span>LinkedIn</span>
        </a>
        <a href="https://x.com/cyrdQueiroz" target="_blank" rel="noopener noreferrer" className="social-link">
          <img src="/assets/twitter.png" alt="Twitter" />
          <span>Twitter</span>
        </a>
        <a href="https://www.facebook.com/cyrd.queiroz" target="_blank" rel="noopener noreferrer" className="social-link">
          <img src="/assets/facebook1.png" alt="Facebook" />
          <span>Facebook</span>
        </a>
        <a href="mailto:cydy.queiroz@gmail.com" className="social-link">
          <img src="/assets/email.png" alt="Email" />
          <span>Email</span>
        </a>
        <a href="https://wa.me/5521971583118" target="_blank" rel="noopener noreferrer" className="social-link">
          <img src="/assets/whatsapp.png" alt="WhatsApp" />
          <span>WhatsApp</span>
        </a>
      </div>
    </div>
  );
};

export default Contato;
