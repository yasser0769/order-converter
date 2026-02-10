import { downloadCSV } from '../utils/csvExporter';

export default function ExportButton({ rows }) {
  if (!rows || rows.length === 0) return null;

  return (
    <button
      onClick={() => downloadCSV(rows)}
      className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium px-5 py-2.5 rounded-lg transition-colors cursor-pointer"
    >
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
        />
      </svg>
      Download CSV
    </button>
  );
}
