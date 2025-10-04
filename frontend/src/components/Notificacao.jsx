import React, { useEffect, useContext } from 'react';
import { NotificationContext } from '../context/NotificationContext';
import '../styles/Global.css';

const Notificacao = () => {
    const { notification, hideNotification } = useContext(NotificationContext);

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => {
                hideNotification();
            }, 5000); // A notificação se esconderá automaticamente após 4 segundos

            return () => clearTimeout(timer);
        }
    }, [notification, hideNotification]);

    if (!notification) {
        return null;
    }

    // A 'key' ajuda o React a reiniciar a animação CSS se uma nova notificação chegar
    return (
        <div key={Date.now()} className={`notification ${notification.type}`}>
            {notification.message}
        </div>
    );
};

export default Notificacao;
