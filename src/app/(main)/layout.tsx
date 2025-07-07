
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  User,
  Lightbulb,
  Github,
  Shield,
  Award,
  Loader2,
  LogOut,
  Terminal,
} from 'lucide-react';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserProvider, useUser } from '@/contexts/user-context';
import { AuthProvider, useAuth } from '@/contexts/auth-context';
import { Skeleton } from '@/components/ui/skeleton';
import { LoginPage } from '@/components/app/login-page';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { isFirebaseConfigured, missingKeys } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const menuItems = [
  { href: '/dashboard', label: 'Activity Dashboard', icon: LayoutDashboard },
  { href: '/proposals', label: 'Proposals', icon: FileText },
  { href: '/profile', label: 'My Profile', icon: User },
  { href: '/optimize', label: 'Proposal Optimizer', icon: Lightbulb },
  { href: '/admin', label: 'Admin', icon: Shield },
];

function AppLogo() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2.5">
      <div className="flex items-center justify-center h-8 w-8 bg-sidebar-accent text-sidebar-accent-foreground rounded-lg flex-shrink-0">
          <Award className="h-5 w-5" />
      </div>
      <h1 className="text-xl font-bold text-sidebar-foreground group-data-[collapsible=icon]:hidden font-headline tracking-tight">Honors App</h1>
    </Link>
  )
}

function TopBar({pageTitle}: {pageTitle: string}) {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-background/80 backdrop-blur-sm sticky top-0 px-4 sm:px-6 z-20">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        <h2 className="text-lg font-headline font-bold">{pageTitle}</h2>
      </div>
      <a href="https://github.com" target="_blank" rel="noopener noreferrer">
        <Button variant="outline" size="sm">
          <Github className="mr-2 h-4 w-4" />
          Star on GitHub
        </Button>
      </a>
    </header>
  )
}

function UserMenu() {
    const { signOut } = useAuth();
    const { profile, isLoading } = useUser();

    if (isLoading) {
        return (
             <div className="flex items-center gap-3">
                <Avatar>
                    <AvatarFallback>CM</AvatarFallback>
                </Avatar>
                <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-3 w-32" />
                </div>
              </div>
        )
    }

    if (!profile) return null;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                 <div className="flex items-center gap-3 cursor-pointer">
                    <Avatar>
                        <AvatarImage src={profile.photoURL || `https://placehold.co/40x40.png`} alt={profile.name} data-ai-hint="person face" />
                        <AvatarFallback>{profile.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                        <span className="text-sm font-semibold text-sidebar-foreground">{profile.name}</span>
                        <span className="text-xs text-sidebar-foreground/70">{profile.email}</span>
                    </div>
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-56">
                <DropdownMenuItem asChild>
                     <Link href="/profile">
                        <User className="mr-2 h-4 w-4" />
                        My Profile
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

function FirebaseNotConfigured() {
    return (
        <div className="flex items-center justify-center h-full bg-muted/40 p-4">
            <Card className="max-w-xl w-full">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Firebase Not Configured</CardTitle>
                    <CardDescription>
                        Your application is missing its Firebase configuration. Please follow the steps below to fix it.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p>To use Firebase services like authentication and database, you need to provide your project's configuration keys in an environment file.</p>
                    <Alert>
                        <Terminal className="h-4 w-4" />
                        <AlertTitle>Action Required</AlertTitle>
                        <AlertDescription>
                            <ol className="list-decimal list-inside space-y-2">
                                <li>Create a file named <code>.env</code> in the root directory of your project (if it doesn&apos;t exist).</li>
                                <li>Open your Firebase project settings and find your web app&apos;s configuration.</li>
                                <li>Copy the configuration keys into the <code>.env</code> file. The keys should be prefixed with <code>NEXT_PUBLIC_</code>.</li>
                            </ol>
                        </AlertDescription>
                    </Alert>
                    <div className="text-sm p-4 bg-secondary rounded-md font-mono text-secondary-foreground overflow-x-auto">
                        <p># .env</p>
                        <p>NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key</p>
                        <p>NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain</p>
                        <p>NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id</p>
                        <p>NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket</p>
                        <p>NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id</p>
                        <p>NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id</p>
                    </div>
                     <p className="text-sm text-muted-foreground">The following keys are currently missing: <strong>{missingKeys.join(', ')}</strong>. After adding them, you may need to restart the development server.</p>
                </CardContent>
            </Card>
        </div>
    );
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const pageTitle = menuItems.find(item => pathname.startsWith(item.href))?.label.replace('My ', '') || 'Honors App';
  
  const { user: authUser, isLoading: isAuthLoading } = useAuth();
  const { profile, isLoading: isProfileLoading } = useUser();

  const renderContent = () => {
    if (!isFirebaseConfigured) {
      return <FirebaseNotConfigured />;
    }

    // Show a spinner if either the initial auth state is loading,
    // or if we have a user but their profile is still loading.
    if (isAuthLoading || (authUser && isProfileLoading)) {
      return (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    // If auth is resolved and there's no user, they need to log in.
    if (!authUser) {
      return <LoginPage />;
    }
    
    // If we have an authUser but no profile (e.g., a creation error),
    // send them back to the login page to try again.
    if (!profile) {
      return <LoginPage />;
    }

    // If we have both the user and their profile, show the app.
    return children;
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <AppLogo />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={pathname.startsWith(item.href)}>
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <UserMenu />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        { authUser && profile && <TopBar pageTitle={pageTitle} /> }
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-background">
          {renderContent()}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
        <UserProvider>
            <LayoutContent>{children}</LayoutContent>
        </UserProvider>
    </AuthProvider>
  );
}
