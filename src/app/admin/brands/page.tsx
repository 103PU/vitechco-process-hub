
import { getBrands } from '@/app/actions/admin-taxonomy';
import { BrandClientWrapper } from './client-wrapper';

export default async function BrandsPage() {
    const brands = await getBrands();
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Quản lý Thương Hiệu</h1>
            <BrandClientWrapper initialData={brands} />
        </div>
    );
}
