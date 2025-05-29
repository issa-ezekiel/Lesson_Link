import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import type { User } from '@shared/schema';
import { 
  ChartPie, 
  BookOpen, 
  ListChecks, 
  TrendingUp, 
  BarChart3, 
  Users, 
  User as UserIcon 
} from 'lucide-react';

interface SidebarProps {
  user: Omit<User, 'password'>;
}

export function Sidebar({ user }: SidebarProps) {
  const [location] = useLocation();

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: ChartPie,
      roles: ['teacher', 'administrator']
    },
    {
      name: 'My Lessons',
      href: '/lessons',
      icon: BookOpen,
      roles: ['teacher']
    },
    {
      name: 'AERRO Standards',
      href: '/standards',
      icon: ListChecks,
      roles: ['teacher', 'administrator']
    },
    {
      name: 'My Progress',
      href: '/progress',
      icon: TrendingUp,
      roles: ['teacher']
    },
    {
      name: 'Reports',
      href: '/reports',
      icon: BarChart3,
      roles: ['administrator']
    },
    {
      name: 'Teachers',
      href: '/teachers',
      icon: Users,
      roles: ['administrator']
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: UserIcon,
      roles: ['teacher', 'administrator']
    },
  ];

  const filteredNavItems = navigationItems.filter(item => 
    item.roles.includes(user.role)
  );

  return (
    <div className="w-64 bg-white shadow-lg flex-shrink-0">
      <div className="p-6 border-b border-border">
        <h1 className="text-xl font-bold text-primary">EduTrack</h1>
        <p className="text-sm text-muted-foreground mt-1">Standards Management</p>
      </div>
      
      <div className="p-4 border-b border-border bg-muted/50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">
            <span>{user.firstName.charAt(0)}{user.lastName.charAt(0)}</span>
          </div>
          <div>
            <p className="font-medium text-sm">{user.firstName} {user.lastName}</p>
            <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
          </div>
        </div>
      </div>

      <nav className="p-4">
        <ul className="space-y-2">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href || location.startsWith(item.href + '/');
            
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-3 p-3 rounded-lg transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
