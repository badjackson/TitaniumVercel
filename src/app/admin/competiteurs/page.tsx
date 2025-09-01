import dynamic from 'next/dynamic';

const AdminCompetiteurs = dynamic(() => import('@/components/admin/AdminCompetiteurs'), { ssr: false });

export default function AdminCompetiteursPage() {
  return <AdminCompetiteurs />;
}