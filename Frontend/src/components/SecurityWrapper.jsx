// components/SecurityWrapper.jsx
import { useEffect } from 'react';

export const SecurityWrapper = ({ children }) => {
    useEffect(() => {
        const isProduction = !window.location.hostname.includes('localhost') && 
                           !window.location.hostname.includes('127.0.0.1');
        
        const cspRules = [
            `default-src 'self'`,
            `script-src 'self' 'unsafe-inline' https://js.stripe.com ${isProduction ? '' : "'unsafe-eval'"}`,
            `style-src 'self' 'unsafe-inline'`,
            `img-src 'self' data: blob:`,
            `font-src 'self'`,
            `connect-src 'self' ${window.location.origin}`, 
            `frame-src https://js.stripe.com`,
            `object-src 'none'`,
            `base-uri 'self'`,
            `form-action 'self'`
        ].join('; ');

        const meta = document.createElement('meta');
        meta.httpEquiv = "Content-Security-Policy";
        meta.content = cspRules;
        document.head.appendChild(meta);

        return () => meta.remove();
    }, []);

    return children;
};