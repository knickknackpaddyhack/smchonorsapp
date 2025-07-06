
'use client';

import { useAuth } from '@/contexts/auth-context';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award } from 'lucide-react';

export function LoginPage() {
  const { signInWithGoogle, isLoading } = useAuth();

  return (
    <div className="flex items-center justify-center h-full bg-muted/40">
      <Card className="max-w-sm w-full">
        <CardHeader className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 bg-primary text-primary-foreground rounded-full mb-4">
              <Award className="h-8 w-8" />
          </div>
          <CardTitle className="font-headline text-3xl">Welcome to your Honors App</CardTitle>
          <CardDescription>
            Sign in to continue to your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={signInWithGoogle} disabled={isLoading} className="w-full">
            Sign in with Google
          </Button>
        </CardContent>
        <CardFooter>
            <p className="text-xs text-muted-foreground text-center w-full">By signing in, you agree to our terms and conditions.</p>
        </CardFooter>
      </Card>
    </div>
  );
}
