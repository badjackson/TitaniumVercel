import dynamic from 'next/dynamic';

const JudgeDashboard = dynamic(() => import('@/components/judge/JudgeDashboard'), { ssr: false });

export default function JudgePage() {
  return (
    <JudgeDashboard />
  );
}