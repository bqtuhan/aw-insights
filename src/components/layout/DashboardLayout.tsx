import { useAppStore } from '@/store';
import { Sidebar } from './Sidebar';
import { Dropzone } from '@/components/ui/Dropzone';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const status = useAppStore((s) => s.status);

  if (status === 'idle' || status === 'loading' || status === 'error') {
    return (
      <div className="min-h-screen bg-[#080d1a] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-gradient-to-br from-[#080d1a] via-[#0a1025] to-[#0d1530] -z-10" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#1c2d4f]/50 to-transparent" />
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#a78bfa]">
                <span className="text-sm font-bold text-white">AW</span>
              </div>
              <span className="text-xl font-semibold text-[#f0f4ff] tracking-tight">AW Insights</span>
            </div>
            <p className="text-sm text-[#8899bb]">
              Digital Life Intelligence — Privacy-First Analytics
            </p>
          </div>
          <Dropzone />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080d1a] flex flex-col lg:flex-row relative">
      <div className="absolute inset-0 bg-gradient-to-br from-[#080d1a] via-[#0a1025] to-[#0d1530] -z-10 pointer-events-none fixed" />
      
      <Sidebar />
      
      <main className="flex-1 min-h-screen pt-20 lg:pt-0">
        <div className="max-w-7xl mx-auto px-4 py-6 lg:px-8 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
