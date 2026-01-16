import Link from 'next/link';
import { FileText, Cpu } from 'lucide-react';
import { FullDocument } from '../../utils/doc-grouping';
import { cn } from '@/lib/utils';

interface HomeDocumentCardProps {
  doc: FullDocument;
}

export function HomeDocumentCard({ doc }: HomeDocumentCardProps) {
  // Extract unique model names
  const modelNames = Array.from(new Set(doc.machineModels.map((mm: FullDocument['machineModels'][number]) => mm.machineModel.name)));

  return (
    <Link href={`/docs/${doc.id}`} className="block h-full group">
      <div className={cn(
        "bg-white h-full flex flex-col justify-between",
        "rounded-xl border border-gray-200",
        "p-5 shadow-sm transition-all duration-300 ease-out",
        "hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 hover:border-blue-300"
      )}>
        {/* Top: Icon & Title */}
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className={cn(
              "p-2.5 rounded-xl shrink-0 transition-colors duration-300",
              "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white"
            )}>
              <FileText size={22} strokeWidth={2} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 leading-snug line-clamp-2 text-[15px] group-hover:text-blue-700 transition-colors">
                {doc.title}
              </h3>
            </div>
          </div>

          {/* Middle: Type Badge (Optional Context) */}
          <div className="flex flex-wrap gap-2">
            {doc.documentType && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                {doc.documentType.name}
              </span>
            )}
          </div>
        </div>

        {/* Bottom: Machine Models */}
        {modelNames.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
            <Cpu size={14} className="shrink-0 text-gray-400 group-hover:text-blue-500 transition-colors" />
            <span className="truncate">{modelNames.join(', ')}</span>
          </div>
        )}

        {/* Empty state spacer if no models to keep height consistent-ish */}
        {modelNames.length === 0 && <div className="mt-4 pt-3 border-t border-transparent" />}
      </div>
    </Link>
  );
}
