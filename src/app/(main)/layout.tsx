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

const menuItems = [
  { href: '/dashboard', label: 'Activity Dashboard', icon: LayoutDashboard },
  { href: '/proposals', label: 'Proposals', icon: FileText },
  { href: '/profile', label: 'My Engagement', icon: User },
  { href: '/optimize', label: 'Proposal Optimizer', icon: Lightbulb },
  { href: '/admin', label: 'Admin', icon: Shield },
];

function AppLogo() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2">
      <div className="flex items-center justify-center h-8 w-8 bg-sidebar-foreground text-sidebar-background rounded-lg flex-shrink-0">
          <span className="font-bold text-lg">H</span>
      </div>
      <h1 className="text-xl font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden font-headline">Honors App</h1>
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

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const pageTitle = menuItems.find(item => pathname.startsWith(item.href))?.label.replace('My ', '') || 'Honors App';

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
             <Avatar>
                <AvatarImage src="https://placehold.co/40x40.png" alt="Community Member" data-ai-hint="person face" />
                <AvatarFallback>CM</AvatarFallback>
            </Avatar>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                <span className="text-sm font-semibold text-sidebar-foreground">Community Member</span>
                <span className="text-xs text-sidebar-foreground/70">member@email.com</span>
            </div>
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
  );
}
