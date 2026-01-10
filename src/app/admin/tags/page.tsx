
import { getTags } from '@/app/actions/admin-taxonomy';
import { TagClientWrapper } from './client-wrapper';

export default async function TagsPage() {
    const tags = await getTags();
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Quản lý Thẻ (Tags)</h1>
            <TagClientWrapper initialData={tags} />
        </div>
    );
}


