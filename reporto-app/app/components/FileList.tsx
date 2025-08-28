// app/components/FileList.tsx
import { FileText, Trash2 } from "lucide-react";

type FileListProps = {
  files: File[]; // We'll pass an array of File objects
};

export function FileList({ files }: FileListProps) {
  if (files.length === 0) {
    return (
        <div className="text-center text-gray-500 p-4">
            No files uploaded for this analysis yet.
        </div>
    );
  }

  return (
    <div className="p-4 space-y-2">
      <h2 className="text-sm font-semibold text-gray-400 mb-2">Uploaded Files</h2>
      {files.map((file, index) => (
        <div key={index} className="flex items-center justify-between p-2 bg-[#1e1f22] rounded-lg">
          <div className="flex items-center gap-3">
            <FileText size={18} className="text-gray-400 flex-shrink-0" />
            <span className="text-white truncate">{file.name}</span>
          </div>
          {/* In the future, this button could delete the file */}
          <button className="p-1 text-gray-500 hover:text-red-500 transition-colors">
            <Trash2 size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}