import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Header, Footer, ContactModal } from '@cidqueiroz/cdkteck-ui';
import Notificacao from './Notificacao'; // Keep notification component

const Estrutura = ({ children }) => {
    const location = useLocation();
    const [isContactModalOpen, setContactModalOpen] = useState(false);

    // Helper component to pass to cdkteck-ui Header/Footer
    const ReactRouterLink = (props) => (
        <Link {...props} />
    );

    return (
        <div className="flex flex-col min-h-screen">
            <Header 
                LinkComponent={ReactRouterLink}
                usePathname={() => location.pathname}
            />
            <main className="flex-grow">
                {children}
            </main>
            <Footer 
                openContactModal={() => setContactModalOpen(true)}
                LinkComponent={ReactRouterLink}
            />
            <ContactModal isOpen={isContactModalOpen} onClose={() => setContactModalOpen(false)} />
            <Notificacao />
        </div>
    );
};

export default Estrutura;