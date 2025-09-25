import React, { createContext, useState, useContext } from 'react';

export const MonitoringContext = createContext();

export const MonitoringProvider = ({ children }) => {
    const [lastResult, setLastResult] = useState(() => {
        try {
            const item = window.sessionStorage.getItem('lastMonitoringResult');
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error("Error reading from sessionStorage", error);
            return null;
        }
    });

    const updateLastResult = (result) => {
        try {
            if (result) {
                window.sessionStorage.setItem('lastMonitoringResult', JSON.stringify(result));
            } else {
                window.sessionStorage.removeItem('lastMonitoringResult');
            }
            setLastResult(result);
        } catch (error) {
            console.error("Error writing to sessionStorage", error);
        }
    };

    return (
        <MonitoringContext.Provider value={{ lastResult, setLastResult: updateLastResult }}>
            {children}
        </MonitoringContext.Provider>
    );
};

export const useMonitoring = () => {
    return useContext(MonitoringContext);
};
