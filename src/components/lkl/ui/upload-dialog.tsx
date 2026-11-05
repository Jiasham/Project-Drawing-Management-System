"use client";
import { useCallback, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { UploadCloud, FileCheck2, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useLkl } from "@/lib/store";
import { t } from "@/lib/i18n";

type Props = {
  open: boolean;
  onClose: () => void;
  onUploaded?: (file: any) => void;
  endpoint: string; // e.g. "/api/drawings/abc/upload"
  extraFields?: Record<string, string>;
};

const ALLOWED = ["dwg", "pdf", "step", "stl", "igs", "jpg", "png", "zip"];
const MAX_MB = 50;

export function UploadDialog({ open, onClose, onUploaded, endpoint, extraFields }: Props) {
  const { lang } = useLkl();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  const reset = () => {
    setFile(null);
    setUploading(false);
    setResult(null);
    setDragOver(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    const f = files[0];
    const ext = (f.name.split(".").pop() || "").toLowerCase();
    if (!ALLOWED.includes(ext)) {
      setResult({ ok: false, message: `File type .${ext} not allowed` });
      return;
    }
    if (f.size > MAX_MB * 1024 * 1024) {
      setResult({ ok: false, message: `File exceeds ${MAX_MB}MB` });
      return;
    }
    setFile(f);
    setResult(null);
  }, []);

  const doUpload = async () => {
    if (!file) return;
    setUploading(true);
    setResult(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      if (extraFields) for (const k in extraFields) fd.append(k, extraFields[k]);
      const res = await fetch(endpoint, { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok || data.error) {
        setResult({ ok: false, message: data.error || `Upload failed (${res.status})` });
      } else {
        setResult({ ok: true, message: t("upload.success", lang) });
        onUploaded?.(data.file ?? data);
        setTimeout(() => {
          reset();
          onClose();
        }, 900);
      }
    } catch (e: any) {
      setResult({ ok: false, message: e?.message || "Network error" });
    } finally {
      setUploading(false);
    }
  };

  const fmtSize = (b: number) => (b < 1024 ? `${b} B` : b < 1024 * 1024 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1024 / 1024).toFixed(2)} MB`);

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          reset();
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-900">
            <UploadCloud className="w-4 h-4 text-blue-700" />
            {t("upload.title", lang)}
          </DialogTitle>
          <DialogDescription className="text-slate-500">{t("upload.subtitle", lang)}</DialogDescription>
        </DialogHeader>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFiles(e.dataTransfer.files);
          }}
          onClick={() => inputRef.current?.click()}
          className={`cursor-pointer border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragOver ? "border-blue-600 bg-blue-50" : "border-slate-300 bg-slate-50 hover:border-blue-500 hover:bg-blue-50/40"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept={ALLOWED.map((e) => `.${e}`).join(",")}
            onChange={(e) => handleFiles(e.target.files)}
          />
          {file ? (
            <div className="flex items-center justify-center gap-3 text-slate-800">
              <FileCheck2 className="w-5 h-5 text-emerald-600" />
              <div className="text-left">
                <div className="text-sm font-semibold truncate max-w-[200px]">{file.name}</div>
                <div className="text-[11px] text-slate-500 lkl-mono">{fmtSize(file.size)}</div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <UploadCloud className="w-7 h-7 text-blue-600" />
              <div className="text-sm text-slate-600">{t("upload.dragDrop", lang)}</div>
              <div className="text-[11px] text-slate-400 lkl-mono uppercase tracking-wider">DWG · PDF · STEP · STL · IGS · JPG · PNG · ZIP</div>
            </div>
          )}
        </div>

        {result && (
          <div
            className={`flex items-center gap-2 rounded-md px-3 py-2 text-xs ${
              result.ok ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {result.ok ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            <span>{result.message}</span>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <button
            className="lkl-btn lkl-btn-ghost"
            onClick={() => {
              reset();
              onClose();
            }}
            disabled={uploading}
          >
            {t("newDrawing.cancel", lang)}
          </button>
          <button
            className="lkl-btn lkl-btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={doUpload}
            disabled={!file || uploading}
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t("upload.uploading", lang)}
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4" />
                {t("upload.title", lang)}
              </>
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
