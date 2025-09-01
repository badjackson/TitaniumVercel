import dynamic from 'next/dynamic';

const AdminCalculsLive = dynamic(() => import('@/components/admin/AdminCalculsLive'), { ssr: false });

export default function AdminCalculsLivePage() {
  return <AdminCalculsLive />;
}