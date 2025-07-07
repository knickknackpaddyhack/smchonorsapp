
'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { auth, isFirebaseConfigured } from '@/lib/firebase';

export function AuthDomainWarning() {
    const [isMismatched, setIsMismatched] = useState(false);
    const [configuredDomain, setConfiguredDomain] = useState('');
    const [currentHostname, setCurrentHostname] = useState('');

    useEffect(() => {
        if (typeof window === 'undefined' || !isFirebaseConfigured || !auth?.config?.authDomain) {
            return;
        }

        const configured = auth.config.authDomain;
        const current = window.location.hostname;

        setConfiguredDomain(configured);
        setCurrentHostname(current);

        // localhost is usually authorized by default.
        if (current === 'localhost') {
            setIsMismatched(false);
            return;
        }

        // Firebase authDomain is 'project-id.firebaseapp.com'.
        // If the app is running on a different domain, it needs to be added.
        if (configured !== current) {
             setIsMismatched(true);
        }
    }, []);

    if (!isMismatched) {
        return null;
    }

    return (
        <Alert variant="destructive" className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Potential Configuration Issue</AlertTitle>
            <AlertDescription>
                <p>Your app is running on <strong>{currentHostname}</strong>, but your Firebase authentication is configured for <strong>{configuredDomain}</strong>.</p>
                <p className="mt-2">For Google Sign-In to work, you must add <strong>{currentHostname}</strong> to the list of authorized domains in your Firebase project.</p>
                <p className="mt-2 text-xs">Navigate to: Firebase Console → Authentication → Settings → Authorized domains → Add domain.</p>
            </AlertDescription>
        </Alert>
    );
}
