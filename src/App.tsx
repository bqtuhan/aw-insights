import { useAppStore } from '@/store';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { OverviewSection } from '@/components/dashboard/OverviewSection';
import { FocusSection } from '@/components/dashboard/FocusSection';
import { FlowSection } from '@/components/dashboard/FlowSection';
import { BurnoutSection } from '@/components/dashboard/BurnoutSection';
import { AppsSection } from '@/components/dashboard/AppsSection';
import { TimelineSection } from '@/components/dashboard/TimelineSection';

export default function App() {
  const currentSection = useAppStore((s) => s.currentSection);

  return (
    <DashboardLayout>
      {currentSection === 'overview' && <OverviewSection />}
      {currentSection === 'focus' && <FocusSection />}
      {currentSection === 'flow' && <FlowSection />}
      {currentSection === 'burnout' && <BurnoutSection />}
      {currentSection === 'apps' && <AppsSection />}
      {currentSection === 'timeline' && <TimelineSection />}
    </DashboardLayout>
  );
}
