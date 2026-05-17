import { useAppStore } from '@/store';
import type { SectionId } from '@/store/types';
import { cn } from '@/lib/utils';
import { usePreferences } from '@/hooks/usePrefences';
import { useTranslation } from 'react-i18next';

const navItems: { id: SectionId; labelKey: string; icon: string }[] = [
  { id: 'overview', labelKey: 'nav.overview', icon: 'layout-dashboard' },
  { id: 'focus', labelKey: 'nav.focus', icon: 'target' },
  { id: 'flow', labelKey: 'nav.flow', icon: 'zap' },
  { id: 'burnout', labelKey: 'nav.burnout', icon: 'flame' },
  { id: 'apps', labelKey: 'nav.apps', icon: 'bar-chart-3' },
  { id: 'timeline', labelKey: 'nav.timeline', icon: 'calendar' },
];

const iconMap: Record<string, React.ReactNode> = {
  'layout-dashboard': (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
  ),
  'target': (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
  ),
  'zap': (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
  ),
  'flame': (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
  ),
  'bar-chart-3': (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
  ),
  'calendar': (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg>
  ),
};

export function Sidebar() {
  const { t } = useTranslation();
  const currentSection = useAppStore((s) => s.currentSection);
  const setSection = useAppStore((s) => s.setSection);
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const { language, updateLanguage } = usePreferences();

  const handleNavClick = (section: SectionId) => {
    setSection(section);
  };

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 z-40 h-full w-64 flex flex-col transition-transform duration-300 ease-in-out',
          'bg-[#0a0f1e] border-r border-[#1c2d4f]',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0 lg:static lg:z-auto',
        )}
      >
        <div className="flex items-center gap-3 px-5 py-5 border-b border-[#1c2d4f]">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#00d4ff] to-[#a78bfa]">
            <span className="text-sm font-bold text-white">AW</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-[#f0f4ff] tracking-wide">{t('common.brand')}</span>
            <span className="text-[10px] text-[#4a5a7a]">{t('common.tagline')}</span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = currentSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={cn(
                  'group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-[#172035] text-[#00d4ff] shadow-[0_0_12px_rgba(0,212,255,0.15)]'
                    : 'text-[#8899bb] hover:bg-[#0f1629] hover:text-[#f0f4ff]',
                )}
              >
                <span
                  className={cn(
                    'flex-shrink-0 transition-colors duration-200',
                    isActive ? 'text-[#00d4ff]' : 'text-[#4a5a7a] group-hover:text-[#8899bb]',
                  )}
                >
                  {iconMap[item.icon]}
                </span>
                <span>{t(item.labelKey)}</span>
                {isActive && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#00d4ff] shadow-[0_0_6px_rgba(0,212,255,0.6)]" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-[#1c2d4f] px-5 py-3 space-y-3">
          <div>
            <label className="text-[10px] text-[#4a5a7a] uppercase tracking-widest block mb-2">
              {t('common.language')}
            </label>
            <select
              value={language}
              onChange={(e) => updateLanguage(e.target.value)}
              className="w-full px-2 py-1.5 text-xs bg-[#0f1629] border border-[#1c2d4f] rounded text-[#f0f4ff] hover:border-[#00d4ff] transition-colors cursor-pointer"
            >
              <option value="en">English</option>
              <option value="tr">Türkçe</option>
              <option value="de">Deutsch</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="ja">日本語</option>
              <option value="zh">中文</option>
              <option value="pt">Português</option>
            </select>
          </div>
          <span className="text-[10px] text-[#4a5a7a] uppercase tracking-widest block">
            {t('common.privacyNote')}
          </span>
        </div>
      </aside>

      <button
        onClick={toggleSidebar}
        className={cn(
          'fixed top-4 left-4 z-50 rounded-lg border border-[#1c2d4f] bg-[#0f1629] p-2 text-[#8899bb] hover:text-[#f0f4ff] transition-colors',
          'lg:hidden',
          sidebarOpen && 'hidden',
        )}
        aria-label={t('common.accessibility.openSidebar')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/></svg>
      </button>
    </>
  );
}
