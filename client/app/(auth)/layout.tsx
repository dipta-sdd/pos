import { ThemeSwitch } from '@/components/theme-switch';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative">
      {children}
      
      {/* Theme Switch - Bottom Right Corner */}
      <div className="fixed bottom-6 right-6 z-50">
        <ThemeSwitch />
      </div>
    </div>
  );
} 