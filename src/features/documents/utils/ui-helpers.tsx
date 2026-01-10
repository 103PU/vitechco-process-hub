import { 
  BookOpen, 
  FileText, 
  Settings, 
  Database, 
  Activity, 
  Shield, 
  Wrench, 
  Code,
  Archive,
  Layers,
  Tag,
  Hash,
  AlertCircle,
  CheckCircle2,
  Cpu as LucideCpu,
  Server,
  Banknote,
  CalendarDays,
  GraduationCap,
  ClipboardList,
  Bookmark,
  Printer,
  ScanLine,
  Wifi,
  FileSpreadsheet,
  Users,
  FileSignature,
  HardDrive,
  Monitor,
  Smartphone,
  AlertTriangle,
  Info,
  HelpCircle,
  Router
} from 'lucide-react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserGear, faHandSparkles, faMicrochip } from '@fortawesome/free-solid-svg-icons';

// --- FONT AWESOME WRAPPER ---
const createFaIcon = (iconDefinition: any) => {
    return function FontAwesomeWrapped({ size = 24, className }: { size?: number; className?: string }) {
        return (
            <div
                style={{ width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                className={className}
            >
                <FontAwesomeIcon
                    icon={iconDefinition}
                    style={{ width: '100%', height: '100%' }}
                />
            </div>
        );
    };
};

// Custom Icons
const TrainingIcon = createFaIcon(faUserGear);
const CleaningIcon = createFaIcon(faHandSparkles);
const ChipIcon = createFaIcon(faMicrochip);


// --- TAG COLORS ---
const TAG_COLORS = [
  { border: 'border-red-500', bg: 'bg-red-500', text: 'text-red-600', lightBg: 'bg-red-50', ring: 'ring-red-500' },
  { border: 'border-orange-500', bg: 'bg-orange-500', text: 'text-orange-600', lightBg: 'bg-orange-50', ring: 'ring-orange-500' },
  { border: 'border-amber-500', bg: 'bg-amber-500', text: 'text-amber-600', lightBg: 'bg-amber-50', ring: 'ring-amber-500' },
  { border: 'border-yellow-500', bg: 'bg-yellow-500', text: 'text-yellow-600', lightBg: 'bg-yellow-50', ring: 'ring-yellow-500' },
  { border: 'border-lime-500', bg: 'bg-lime-500', text: 'text-lime-600', lightBg: 'bg-lime-50', ring: 'ring-lime-500' },
  { border: 'border-green-500', bg: 'bg-green-500', text: 'text-green-600', lightBg: 'bg-green-50', ring: 'ring-green-500' },
  { border: 'border-emerald-500', bg: 'bg-emerald-500', text: 'text-emerald-600', lightBg: 'bg-emerald-50', ring: 'ring-emerald-500' },
  { border: 'border-teal-500', bg: 'bg-teal-500', text: 'text-teal-600', lightBg: 'bg-teal-50', ring: 'ring-teal-500' },
  { border: 'border-cyan-500', bg: 'bg-cyan-500', text: 'text-cyan-600', lightBg: 'bg-cyan-50', ring: 'ring-cyan-500' },
  { border: 'border-sky-500', bg: 'bg-sky-500', text: 'text-sky-600', lightBg: 'bg-sky-50', ring: 'ring-sky-500' },
  { border: 'border-blue-500', bg: 'bg-blue-500', text: 'text-blue-600', lightBg: 'bg-blue-50', ring: 'ring-blue-500' },
  { border: 'border-indigo-500', bg: 'bg-indigo-500', text: 'text-indigo-600', lightBg: 'bg-indigo-50', ring: 'ring-indigo-500' },
  { border: 'border-violet-500', bg: 'bg-violet-500', text: 'text-violet-600', lightBg: 'bg-violet-50', ring: 'ring-violet-500' },
  { border: 'border-purple-500', bg: 'bg-purple-500', text: 'text-purple-600', lightBg: 'bg-purple-50', ring: 'ring-purple-500' },
  { border: 'border-fuchsia-500', bg: 'bg-fuchsia-500', text: 'text-fuchsia-600', lightBg: 'bg-fuchsia-50', ring: 'ring-fuchsia-500' },
  { border: 'border-pink-500', bg: 'bg-pink-500', text: 'text-pink-600', lightBg: 'bg-pink-50', ring: 'ring-pink-500' },
  { border: 'border-rose-500', bg: 'bg-rose-500', text: 'text-rose-600', lightBg: 'bg-rose-50', ring: 'ring-rose-500' },
  { border: 'border-slate-500', bg: 'bg-slate-500', text: 'text-slate-600', lightBg: 'bg-slate-50', ring: 'ring-slate-500' },
  { border: 'border-zinc-500', bg: 'bg-zinc-500', text: 'text-zinc-600', lightBg: 'bg-zinc-50', ring: 'ring-zinc-500' },
  { border: 'border-stone-500', bg: 'bg-stone-500', text: 'text-stone-600', lightBg: 'bg-stone-50', ring: 'ring-stone-500' },
];

export function getTagColorStyles(tagName: string | undefined) {
  if (!tagName) return { border: 'border-gray-300', bg: 'bg-gray-300', text: 'text-gray-600', lightBg: 'bg-gray-50', ring: 'ring-gray-300' };
  
  // Simple hash function to consistently pick a color for a tag name
  let hash = 0;
  for (let i = 0; i < tagName.length; i++) {
    hash = tagName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % TAG_COLORS.length;
  return TAG_COLORS[index];
}

// --- DOCUMENT TYPE ICONS ---
export function getDocumentTypeIcon(typeName: string | undefined) {
  const normalized = typeName?.toLowerCase() || '';

  if (normalized.includes('quy trình')) return BookOpen;
  if (normalized.includes('kỹ thuật')) return Wrench;
  if (normalized.includes('báo cáo')) return Activity;
  if (normalized.includes('bản vẽ')) return Layers;
  if (normalized.includes('mã nguồn') || normalized.includes('code')) return Code;
  if (normalized.includes('cấu hình')) return Settings;
  if (normalized.includes('log')) return FileText;
  if (normalized.includes('dữ liệu')) return Database;
  if (normalized.includes('bảo mật') || normalized.includes('security')) return Shield;
  if (normalized.includes('lỗi') || normalized.includes('error')) return AlertTriangle;
  if (normalized.includes('hướng dẫn') || normalized.includes('help')) return HelpCircle;
  
  return Archive; // Default
}

// --- TAG ICONS ---
export function getTagIcon(tagName: string | undefined) {
  const normalized = tagName?.toLowerCase() || '';
  
  // 1. Hardware & Peripherals
  if (normalized.includes('in') || normalized.includes('printer') || normalized.includes('mực')) return Printer;
  if (normalized.includes('scan')) return ScanLine;
  if (normalized.includes('wifi') || normalized.includes('mạng') || normalized.includes('network') || normalized.includes('internet')) return Wifi;
  if (normalized.includes('router') || normalized.includes('switch') || normalized.includes('modem')) return Router;
  if (normalized.includes('driver') || normalized.includes('hdd') || normalized.includes('ssd') || normalized.includes('disk')) return HardDrive;
  if (normalized.includes('màn hình') || normalized.includes('display') || normalized.includes('monitor')) return Monitor;
  if (normalized.includes('mobile') || normalized.includes('app') || normalized.includes('phone') || normalized.includes('điện thoại')) return Smartphone;
  if (normalized.includes('ricoh') || normalized.includes('toshiba')) return Server;
  if (normalized.includes('main') || normalized.includes('board') || normalized.includes('mạch')) return LucideCpu; // General CPU/Board

  // 2. Documents & Files
  if (normalized.includes('bảng') || normalized.includes('excel') || normalized.includes('sheet') || normalized.includes('csv')) return FileSpreadsheet;
  if (normalized.includes('hợp đồng') || normalized.includes('ký') || normalized.includes('signature')) return FileSignature;
  if (normalized.includes('báo cáo') || normalized.includes('report')) return Activity;

  // 3. Status & Info
  if (normalized.includes('sc') || normalized.includes('error') || normalized.includes('lỗi')) return AlertTriangle;
  if (normalized.includes('ok') || normalized.includes('hoàn thành') || normalized.includes('xong')) return CheckCircle2;
  if (normalized.includes('lưu ý') || normalized.includes('chú ý') || normalized.includes('info')) return Info;

  // 4. People & Organization
  if (normalized.includes('nhân sự') || normalized.includes('tuyển dụng') || normalized.includes('user') || normalized.includes('người')) return Users;
  if (normalized.includes('giá') || normalized.includes('chi phí') || normalized.includes('bill') || normalized.includes('tiền')) return Banknote;
  if (normalized.includes('kế hoạch') || normalized.includes('lịch') || normalized.includes('deadlines')) return CalendarDays;
  if (normalized.includes('training') || normalized.includes('đào tạo') || normalized.includes('hướng dẫn')) return TrainingIcon; // Use FontAwesome
  
  // 5. Specific Technical Tasks
  if (normalized.includes('vệ sinh') || normalized.includes('clean') || normalized.includes('bảo dưỡng')) return CleaningIcon; // Use FontAwesome
  if (normalized.includes('chip') || normalized.includes('reset')) return ChipIcon; // Use FontAwesome

  // 6. Generic Process
  if (normalized.includes('bước') || normalized.includes('quy trình') || normalized.includes('checklist')) return ClipboardList;
  if (normalized.includes('cài đặt') || normalized.includes('setup')) return Settings;
  
  return Tag; // Default generic tag icon
}