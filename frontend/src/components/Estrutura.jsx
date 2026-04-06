import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Header, Footer, ContactModal, CDKFavicon } from '@cidqueiroz/cdkteck-ui';
import Notificacao from './Notificacao'; // Keep notification component

const Estrutura = ({ children, onThemeToggle }) => {
    const location = useLocation();
    const [isContactModalOpen, setContactModalOpen] = useState(false);

    // Helper component to pass to cdkteck-ui Header/Footer
    const ReactRouterLink = (props) => (
        <Link {...props} />
    );

    return (
        <div className="flex flex-col min-h-screen">
            <CDKFavicon />
            <Header 
                LinkComponent={ReactRouterLink}
                usePathname={() => location.pathname}
                onThemeToggle={onThemeToggle}
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