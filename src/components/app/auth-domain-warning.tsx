
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
        // This logic is flawed for cloud development environments because client-side
        // code cannot access the full list of "Authorized Domains" from Firebase settings.
        // It can only see the default authDomain, which will not match the cloud workstation URL,
        // leading to a false positive warning. The component is disabled by always returning null.
        return;

        /*
        if (typeof window === 'undefined' || !isFirebaseConfigured || !auth?.config?.authDomain) {
            return;
        }

        const configured = auth.config.authDomain;
        const current = window.location.hostname;

        setConfiguredDomain(configured);
        setCurrentHostname(current);

        if (current === 'localhost') {
            setIsMismatched(false);
            return;
        }

        if (configured !== current) {
             setIsMismatched(true);
        }
        */
    }, []);

    // The component is disabled to prevent false positives in this environment.
    return null;

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
