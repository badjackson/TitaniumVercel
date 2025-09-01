import dynamic from 'next/dynamic';

const AdminPrises = dynamic(() => import('@/components/admin/AdminPrises'), { ssr: false });

export default function AdminPrisesPage() {
  return <AdminPrises />;
}