import dynamic from 'next/dynamic';

const AdminJuges = dynamic(() => import('@/components/admin/AdminJuges'), { ssr: false });

export default function AdminJugesPage() {
  return <AdminJuges />;
}