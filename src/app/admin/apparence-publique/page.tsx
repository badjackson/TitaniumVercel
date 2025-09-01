import dynamic from 'next/dynamic';

const AdminApparencePublique = dynamic(() => import('@/components/admin/AdminApparencePublique'), { ssr: false });

export default function AdminApparencePubliquePage() {
  return <AdminApparencePublique />;
}