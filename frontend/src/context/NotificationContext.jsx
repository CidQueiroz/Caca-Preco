import React, { createContext, useState, useCallback, useContext } from 'react';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notification, setNotification] = useState(() => {
        try {
            const item = window.sessionStorage.getItem('appNotification');
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error("Error reading notification from sessionStorage", error);
            return null;
        }
    });

    const showNotification = useCallback((message, type = 'sucesso') => {
        const newNotification = { message, type };
        try {
            window.sessionStorage.setItem('appNotification', JSON.stringify(newNotification));
            setNotification(newNotification);
        } catch (error) {
            console.error("Error writing notification to sessionStorage", error);
        }
    }, []);

    const hideNotification = useCallback(() => {
        try {
            window.sessionStorage.removeItem('appNotification');
            setNotification(null);
        } catch (error) {
            console.error("Error removing notification from sessionStorage", error);
        }
    }, []);

    return (
        <NotificationContext.Provider value={{ notification, showNotification, hideNotification }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    return useContext(NotificationContext);
};
