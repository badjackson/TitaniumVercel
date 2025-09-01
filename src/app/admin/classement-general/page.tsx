import dynamic from 'next/dynamic';

const AdminClassementGeneral = dynamic(() => import('@/components/admin/AdminClassementGeneral'), { ssr: false });

export default function AdminClassementGeneralPage() {
  return <AdminClassementGeneral />;
}