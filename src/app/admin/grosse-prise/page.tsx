import dynamic from 'next/dynamic';

const AdminGrossePrise = dynamic(() => import('@/components/admin/AdminGrossePrise'), { ssr: false });

export default function AdminGrossePrisePage() {
  return <AdminGrossePrise />;
}