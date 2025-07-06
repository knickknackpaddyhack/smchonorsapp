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
import { Skeleton } from '@/components/ui/skeleton';

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
      <h1 className="text-xl font-bold text-sidebar-foreground group-data-[collapsible=icon]:hidden font-headline tracking-tight">Honors</h1>
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

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const pageTitle = menuItems.find(item => pathname.startsWith(item.href))?.label.replace('My ', '') || 'Honors App';
  const { profile, isLoading } = useUser();

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
          <div className="flex items-center gap-3">
             {isLoading ? (
                <>
                  <Avatar>
                      <AvatarFallback>CM</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                      <Skeleton className="h-4 w-24 mb-1" />
                      <Skeleton className="h-3 w-32" />
                  </div>
                </>
             ) : profile ? (
                <>
                  <Avatar>
                      <AvatarImage src="https://placehold.co/40x40.png" alt={profile.name} data-ai-hint="person face" />
                      <AvatarFallback>{profile.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                      <span className="text-sm font-semibold text-sidebar-foreground">{profile.name}</span>
                      <span className="text-xs text-sidebar-foreground/70">{profile.email}</span>
                  </div>
                </>
             ) : (
                <div className="flex items-center gap-3">
                  <Avatar>
                      <AvatarFallback>??</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                      <span className="text-sm font-semibold text-sidebar-foreground">User not found</span>
                  </div>
                </div>
             )}
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <TopBar pageTitle={pageTitle} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-background">
          {children}
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
    <UserProvider>
      <LayoutContent>{children}</LayoutContent>
    </UserProvider>
  );
}
