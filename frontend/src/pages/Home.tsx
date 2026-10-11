import { useRef, useState, type ChangeEvent } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Camera,
  Check,
  CheckCircle2,
  ChevronRight,
  Clipboard,
  Contrast,
  Crop,
  Download,
  FileText,
  ImagePlus,
  Info,
  Pencil,
  RefreshCw,
  RotateCw,
  ScanLine,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import { toast, Toaster } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const SAMPLE_DOCUMENT =
  "https://customer-assets-0z36b82j.emergentagent.net/job_b0580b7e-fc88-4e47-b2f0-2380faf4d2d1/artifacts/36112bd02817f9f0_WhatsApp%20Image%202026-10-02%20at%2019.03.09%20%281%29.webp";

type Stage = "capture" | "review";
type EditableLineField = "product" | "quantity" | "unit" | "unitPrice" | "total";

interface LineItem {
  id: number;
  product: string;
  quantity: string;
  unit: string;
  unitPrice: string;
  total: string;
  confidence: "high" | "low";
}

const INITIAL_LINE: LineItem = {
  id: 1,
  product: "BAZON",
  quantity: "1",
  unit: "Adet",
  unitPrice: "1050",
  total: "1050",
  confidence: "low",
};

const OCR_TEXT = `SEVK İRSALİYESİ
Sayın: MENZİL
Fiş No: —
Fiili Sevk Tarihi: 02.10.2026

MİKTAR  BİRİM  CİNSİ       FİYATI      TUTARI
1       Adet   BAZON       1050        1050

Not: Emrah Özgen`;

function downloadFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function SectionLabel({ children, testId }: { children: string; testId: string }) {
  return (
    <div data-testid={testId} className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
      {children}
    </div>
  );
}

function CaptureStage({
  selectedImage,
  rotation,
  cropMode,
  onCamera,
  onGallery,
  onSample,
  onRotate,
  onCrop,
  onContinue,
}: {
  selectedImage: string;
  rotation: number;
  cropMode: boolean;
  onCamera: () => void;
  onGallery: () => void;
  onSample: () => void;
  onRotate: () => void;
  onCrop: () => void;
  onContinue: () => void;
}) {
  return (
    <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[minmax(0,1.25fr)_360px]">
      <section data-testid="capture-workspace" className="overflow-hidden rounded-[28px] border border-white/10 bg-[#151b22] shadow-2xl shadow-black/20">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-6">
          <div>
            <div data-testid="capture-step-label" className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300">01 / Belgeyi kadrajla</div>
            <h2 data-testid="capture-title" className="font-heading text-lg font-semibold tracking-tight text-white">İrsaliye fotoğrafı</h2>
          </div>
          <Badge data-testid="demo-ocr-badge" className="border-amber-400/25 bg-amber-400/10 text-amber-300">DEMO OCR</Badge>
        </div>

        <div className="relative mx-3 my-3 aspect-[4/5] overflow-hidden rounded-2xl bg-[#090d11] sm:mx-6 sm:my-6 sm:aspect-[16/10]">
          <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.04)_1px,transparent_1px)] [background-size:32px_32px]" />
          <div className="absolute inset-[10%] z-10 rounded-2xl border border-emerald-300/70 shadow-[0_0_0_999px_rgba(4,8,11,.38)]" />
          <div className="absolute left-[10%] right-[10%] top-1/2 z-20 h-px bg-emerald-300/70 shadow-[0_0_16px_rgba(110,231,183,.8)]" />
          <div className="absolute left-1/2 top-3 z-20 -translate-x-1/2 rounded-full border border-white/15 bg-black/45 px-3 py-1 text-[10px] font-medium text-white/80 backdrop-blur">Belgeyi çerçeve içine alın</div>
          <img
            data-testid="document-preview-image"
            src={selectedImage}
            alt="Örnek el yazısı irsaliye önizlemesi"
            className="absolute inset-0 h-full w-full object-cover opacity-90 transition-transform duration-500"
            style={{ transform: `rotate(${rotation}deg) scale(${rotation % 180 === 0 ? 1 : 0.78})` }}
          />
          <div className="absolute bottom-4 left-4 z-30 flex items-center gap-2 rounded-full border border-white/10 bg-black/60 px-3 py-1.5 text-[11px] text-white/75 backdrop-blur">
            <span data-testid="camera-level-indicator" className="flex items-center gap-1.5 text-emerald-300"><span className="size-1.5 rounded-full bg-emerald-300 shadow-[0_0_9px_#6ee7b7]" />Kadraj dengeli</span>
            <span className="text-white/30">•</span>
            <span data-testid="camera-light-indicator">Işık iyi</span>
          </div>
          {cropMode && (
            <div data-testid="crop-mode-overlay" className="absolute inset-[15%] z-40 rounded-lg border-2 border-dashed border-amber-300 bg-amber-300/5">
              <span data-testid="crop-mode-label" className="absolute -top-7 left-0 text-xs font-semibold text-amber-200">Kırpma alanı</span>
              <Button data-testid="crop-apply-button" size="sm" className="absolute bottom-3 right-3 min-h-10 bg-amber-300 text-[#1a160b] hover:bg-amber-200" onClick={onCrop}><Check className="size-4" /> Uygula</Button>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 px-4 pb-4 sm:px-6 sm:pb-6">
          <Button data-testid="rotate-document-button" variant="outline" size="sm" className="min-h-11 border-white/10 bg-white/5 text-white hover:bg-white/10" onClick={onRotate}><RotateCw className="size-4" /> Döndür</Button>
          <Button data-testid="crop-document-button" variant="outline" size="sm" className="min-h-11 border-white/10 bg-white/5 text-white hover:bg-white/10" onClick={onCrop}><Crop className="size-4" /> Kırp</Button>
          <Button data-testid="contrast-toggle-button" variant="outline" size="sm" className="min-h-11 border-white/10 bg-white/5 text-white hover:bg-white/10" onClick={() => toast.info("Yüksek kontrast önizlemesi açıldı") }><Contrast className="size-4" /> Kontrast</Button>
          <Button data-testid="rescan-document-button" variant="ghost" size="sm" className="min-h-11 text-muted-foreground hover:text-white" onClick={() => toast.info("Yeni fotoğraf için kamera veya galeri seçin")}><RefreshCw className="size-4" /> Yeniden çek</Button>
        </div>
      </section>

      <aside data-testid="capture-controls" className="flex flex-col gap-4">
        <Card data-testid="capture-intro-card" className="border-white/10 bg-[#151b22] py-5 shadow-xl shadow-black/10">
          <CardHeader className="px-5">
            <div data-testid="capture-intro-kicker" className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-emerald-300"><ScanLine className="size-4" /> Akıllı tarama</div>
            <CardTitle data-testid="capture-intro-title" className="font-heading text-2xl text-white">Yanlış okunan rakamları yakala.</CardTitle>
            <p data-testid="capture-intro-description" className="mt-2 text-sm leading-6 text-muted-foreground">Belgeyi yükle, 1050 gibi kritik değerleri onaylamadan önce birlikte kontrol edelim.</p>
          </CardHeader>
          <CardContent className="space-y-2 px-5">
            <Button data-testid="camera-scan-button" className="min-h-12 w-full justify-between bg-emerald-400 font-semibold text-[#07120e] hover:bg-emerald-300" onClick={onCamera}><span className="flex items-center gap-2"><Camera className="size-5" /> Kamerayla çek</span><ChevronRight className="size-4" /></Button>
            <Button data-testid="gallery-upload-button" variant="outline" className="min-h-12 w-full justify-between border-white/10 bg-white/5 text-white hover:bg-white/10" onClick={onGallery}><span className="flex items-center gap-2"><ImagePlus className="size-5" /> Galeriden seç</span><ChevronRight className="size-4" /></Button>
            <Button data-testid="sample-document-button" variant="ghost" className="min-h-11 w-full justify-start text-xs text-muted-foreground hover:text-white" onClick={onSample}><Sparkles className="size-4 text-amber-300" /> Örnek belgeyi kullan</Button>
          </CardContent>
        </Card>

        <Card data-testid="capture-tips-card" className="border-white/10 bg-white/[0.03] py-4">
          <CardContent className="px-5">
            <div data-testid="capture-tips-title" className="mb-3 flex items-center gap-2 text-sm font-semibold text-white"><Zap className="size-4 text-amber-300" /> Daha iyi sonuç için</div>
            <ul className="space-y-3 text-xs leading-5 text-muted-foreground">
              <li data-testid="capture-tip-flat" className="flex gap-2"><span className="mt-1 size-1.5 shrink-0 rounded-full bg-emerald-300" /> Kağıdı düz ve gölgesiz tutun.</li>
              <li data-testid="capture-tip-frame" className="flex gap-2"><span className="mt-1 size-1.5 shrink-0 rounded-full bg-emerald-300" /> Dört köşe kadraj çizgisinin içinde olsun.</li>
              <li data-testid="capture-tip-numbers" className="flex gap-2"><span className="mt-1 size-1.5 shrink-0 rounded-full bg-amber-300" /> El yazısı rakamları sonuç ekranında mutlaka doğrulayın.</li>
            </ul>
          </CardContent>
        </Card>

        <Button data-testid="continue-to-review-button" className="min-h-12 w-full bg-white text-[#0c1116] hover:bg-emerald-100" onClick={onContinue}><span>OCR sonucunu gör</span><ChevronRight className="size-4" /></Button>
      </aside>

    </div>
  );
}

function ReviewStage({
  selectedImage,
  line,
  fullText,
  numericVerified,
  approved,
  onBack,
  onLineChange,
  onTextChange,
  onVerify,
  onApprove,
  onExportJson,
  onExportCsv,
  onCopy,
}: {
  selectedImage: string;
  line: LineItem;
  fullText: string;
  numericVerified: boolean;
  approved: boolean;
  onBack: () => void;
  onLineChange: (field: EditableLineField, value: string) => void;
  onTextChange: (value: string) => void;
  onVerify: () => void;
  onApprove: () => void;
  onExportJson: () => void;
  onExportCsv: () => void;
  onCopy: () => void;
}) {
  const inputClass = "min-h-11 border-white/10 bg-white/[0.04] text-white placeholder:text-muted-foreground";
  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Button data-testid="back-to-capture-button" variant="ghost" className="min-h-11 -ml-2 text-muted-foreground hover:text-white" onClick={onBack}><ArrowLeft className="size-4" /> Belgeye dön</Button>
        <div data-testid="review-status-label" className="flex items-center gap-2 text-xs text-muted-foreground"><span className="size-2 rounded-full bg-amber-300" /> Onay bekliyor</div>
      </div>

      <div className="mb-5 grid gap-4 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)]">
        <Card data-testid="source-document-card" className="border-white/10 bg-[#151b22] py-4">
          <CardHeader className="px-4 pb-3">
            <div className="flex items-center justify-between"><SectionLabel testId="source-document-label">Kaynak belge</SectionLabel><Badge data-testid="source-document-badge" variant="outline" className="border-emerald-400/25 text-emerald-300">Karşılaştır</Badge></div>
          </CardHeader>
          <CardContent className="px-4">
            <div data-testid="source-document-preview" className="relative overflow-hidden rounded-xl border border-white/10 bg-white p-2">
              <img data-testid="review-document-image" src={selectedImage} alt="Taranan irsaliye belgesi" className="max-h-[420px] w-full rounded-lg object-cover" />
              <div data-testid="source-document-focus-note" className="absolute bottom-4 left-4 right-4 flex items-center gap-2 rounded-lg border border-amber-400/30 bg-[#16130c]/90 px-3 py-2 text-xs text-amber-200 backdrop-blur"><AlertTriangle className="size-4 shrink-0" /> 1050 alanı burada kontrol ediliyor</div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card data-testid="ocr-summary-card" className="border-white/10 bg-[#151b22] py-5">
            <CardHeader className="px-5 pb-4">
              <div className="flex items-start justify-between gap-4"><div><SectionLabel testId="ocr-summary-label">OCR özeti</SectionLabel><CardTitle data-testid="ocr-summary-title" className="font-heading text-2xl text-white">Metin hazır, iki alanı kontrol et.</CardTitle></div><div data-testid="ocr-confidence-score" className="text-right"><div className="font-mono text-2xl font-bold text-amber-300">%82</div><div className="text-[10px] uppercase tracking-wider text-muted-foreground">ortalama güven</div></div></div>
            </CardHeader>
            <CardContent className="px-5">
              <div data-testid="ocr-detected-blocks" className="flex flex-wrap gap-2 text-sm">
                <span data-testid="ocr-block-title" className="rounded-md border border-emerald-400/25 bg-emerald-400/10 px-2 py-1 text-emerald-200">SEVK İRSALİYESİ</span>
                <span data-testid="ocr-block-supplier" className="rounded-md border border-emerald-400/25 bg-emerald-400/10 px-2 py-1 text-emerald-200">MENZİL</span>
                <span data-testid="ocr-block-low-confidence" className="rounded-md border border-amber-400/40 bg-amber-400/10 px-2 py-1 font-mono text-amber-200">1050 ?</span>
                <span data-testid="ocr-block-note" className="rounded-md border border-amber-400/30 bg-amber-400/5 px-2 py-1 text-amber-200">Emrah Özgen</span>
              </div>
              <div data-testid="ocr-local-demo-note" className="mt-4 flex gap-2 border-t border-white/10 pt-3 text-xs leading-5 text-muted-foreground"><Info className="mt-0.5 size-4 shrink-0 text-sky-300" />Bu sonuç yerel demo OCR ile oluşturuldu. El yazısı ve sayısal alanları onaydan önce düzenleyebilirsiniz.</div>
            </CardContent>
          </Card>

          <Card data-testid="numeric-validation-card" className={`border py-5 ${numericVerified ? "border-emerald-400/35 bg-emerald-400/[0.06]" : "border-amber-400/40 bg-amber-400/[0.07]"}`}>
            <CardHeader className="px-5 pb-3"><div className="flex items-start gap-3"><div className={`mt-0.5 rounded-lg p-2 ${numericVerified ? "bg-emerald-400/15 text-emerald-300" : "bg-amber-400/15 text-amber-300"}`}>{numericVerified ? <CheckCircle2 className="size-5" /> : <AlertTriangle className="size-5" />}</div><div><SectionLabel testId="numeric-validation-label">1050 sayısal doğrulama</SectionLabel><CardTitle data-testid="numeric-validation-title" className="text-lg text-white">{numericVerified ? "Değer doğrulandı" : "Bu değer eksik veya yanlış okunmuş olabilir"}</CardTitle></div></div></CardHeader>
            <CardContent className="px-5"><p data-testid="numeric-validation-description" className="mb-4 text-sm leading-6 text-muted-foreground">El yazısındaki değer <span data-testid="numeric-suspect-value" className="font-mono font-bold text-amber-300">1050</span> yerine 105 ya da 105O olarak algılanabilir. Tutar hesabını korumak için değeri onaylayın.</p><div className="flex flex-wrap items-center gap-2"><Button data-testid="verify-1050-button" className="min-h-11 bg-amber-300 text-[#1a160b] hover:bg-amber-200" onClick={onVerify}>{numericVerified ? <Check className="size-4" /> : <ShieldCheck className="size-4" />} {numericVerified ? "1050 doğrulandı" : "1050 olarak düzelt"}</Button><span data-testid="numeric-validation-confidence" className="text-xs text-muted-foreground">Alan güveni: <span className="font-mono text-amber-300">%58</span></span></div></CardContent>
          </Card>
        </div>
      </div>

      <Card data-testid="structured-fields-card" className="mb-4 border-white/10 bg-[#151b22] py-5">
        <CardHeader className="px-5 pb-4"><div className="flex items-center justify-between gap-3"><div><SectionLabel testId="structured-fields-label">Yapılandırılmış veri</SectionLabel><CardTitle data-testid="structured-fields-title" className="font-heading text-xl text-white">Satırları düzenle</CardTitle></div><Badge data-testid="editable-fields-badge" variant="outline" className="border-blue-400/25 text-blue-300"><Pencil className="size-3" /> Düzenlenebilir</Badge></div></CardHeader>
        <CardContent className="space-y-5 px-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <label data-testid="field-supplier-label" className="space-y-2 text-xs font-medium text-muted-foreground">Tedarikçi<Input data-testid="field-supplier-input" value="MENZİL" readOnly className={inputClass} /></label>
            <label data-testid="field-document-type-label" className="space-y-2 text-xs font-medium text-muted-foreground">Belge türü<Input data-testid="field-document-type-input" value="Sevk İrsaliyesi" readOnly className={inputClass} /></label>
            <label data-testid="field-date-label" className="space-y-2 text-xs font-medium text-muted-foreground">Fiili sevk tarihi<Input data-testid="field-date-input" value="02.10.2026" readOnly className={inputClass} /></label>
          </div>
          <div data-testid="line-item-editor" className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full min-w-[680px] text-left text-sm"><thead className="bg-white/[0.03] text-[10px] uppercase tracking-[0.15em] text-muted-foreground"><tr><th data-testid="table-header-product" className="px-3 py-3">Mal adı</th><th data-testid="table-header-quantity" className="px-3 py-3">Miktar</th><th data-testid="table-header-unit" className="px-3 py-3">Birim</th><th data-testid="table-header-price" className="px-3 py-3">Birim fiyat</th><th data-testid="table-header-total" className="px-3 py-3">Tutar</th><th data-testid="table-header-confidence" className="px-3 py-3">Durum</th></tr></thead><tbody><tr className="border-t border-white/10 align-top"><td data-testid="line-item-product-cell" className="p-2"><Input data-testid="line-item-product-input" value={line.product} onChange={(event) => onLineChange("product", event.target.value)} className={inputClass} /></td><td data-testid="line-item-quantity-cell" className="p-2"><Input data-testid="line-item-quantity-input" inputMode="decimal" value={line.quantity} onChange={(event) => onLineChange("quantity", event.target.value)} className={inputClass} /></td><td data-testid="line-item-unit-cell" className="p-2"><Input data-testid="line-item-unit-input" value={line.unit} onChange={(event) => onLineChange("unit", event.target.value)} className={inputClass} /></td><td data-testid="line-item-price-cell" className="p-2"><Input data-testid="line-item-price-input" inputMode="decimal" value={line.unitPrice} onChange={(event) => onLineChange("unitPrice", event.target.value)} className={`${inputClass} font-mono ${!numericVerified ? "border-amber-400/50 text-amber-200" : "border-emerald-400/40 text-emerald-200"}`} /></td><td data-testid="line-item-total-cell" className="p-2"><Input data-testid="line-item-total-input" inputMode="decimal" value={line.total} onChange={(event) => onLineChange("total", event.target.value)} className={`${inputClass} font-mono`} /></td><td data-testid="line-item-confidence-cell" className="p-2"><Badge data-testid="line-item-confidence-badge" variant="outline" className={numericVerified ? "mt-1 border-emerald-400/30 text-emerald-300" : "mt-1 border-amber-400/40 text-amber-300"}>{numericVerified ? <CheckCircle2 className="size-3" /> : <AlertTriangle className="size-3" />} {numericVerified ? "Doğrulandı" : "Kontrol et"}</Badge></td></tr></tbody></table>
          </div>
        </CardContent>
      </Card>

      <Card data-testid="full-text-card" className="mb-4 border-white/10 bg-[#151b22] py-5">
        <CardHeader className="px-5 pb-3"><div className="flex items-center justify-between gap-3"><div><SectionLabel testId="full-text-label">Tam metin</SectionLabel><CardTitle data-testid="full-text-title" className="font-heading text-lg text-white">OCR çıktısı</CardTitle></div><FileText className="size-5 text-muted-foreground" /></div></CardHeader>
        <CardContent className="px-5"><Textarea data-testid="full-text-input" value={fullText} onChange={(event) => onTextChange(event.target.value)} className="min-h-44 resize-y border-white/10 bg-white/[0.04] font-mono text-xs leading-6 text-white" /><div data-testid="full-text-edit-note" className="mt-2 flex items-center gap-2 text-xs text-muted-foreground"><Pencil className="size-3" /> Metni dışa aktarmadan önce son kez düzenleyebilirsiniz.</div></CardContent>
      </Card>

      <Card data-testid="approval-export-card" className={`border py-5 ${approved ? "border-emerald-400/30 bg-emerald-400/[0.06]" : "border-white/10 bg-[#151b22]"}`}>
        <CardContent className="flex flex-col gap-4 px-5 sm:flex-row sm:items-center sm:justify-between"><div><div data-testid="approval-title" className="flex items-center gap-2 font-semibold text-white">{approved ? <CheckCircle2 className="size-5 text-emerald-300" /> : <ShieldCheck className="size-5 text-muted-foreground" />}{approved ? "Belge onaylandı" : "Son kontrol ve onay"}</div><p data-testid="approval-description" className="mt-1 text-sm text-muted-foreground">{approved ? "Tam metni ve tablo verisini dışa aktarabilirsiniz." : "Düşük güvenli alanları kontrol etmeden tamamlanmış sayılmaz."}</p></div><div className="flex flex-wrap gap-2"><Button data-testid="approve-document-button" disabled={approved} className="min-h-11 bg-emerald-400 text-[#07120e] hover:bg-emerald-300" onClick={onApprove}>{approved ? <Check className="size-4" /> : <ShieldCheck className="size-4" />} {approved ? "Onaylandı" : "Belgeyi onayla"}</Button><Button data-testid="export-json-button" variant="outline" disabled={!approved} className="min-h-11 border-white/10 bg-white/5 text-white hover:bg-white/10" onClick={onExportJson}><Download className="size-4" /> JSON</Button><Button data-testid="export-csv-button" variant="outline" disabled={!approved} className="min-h-11 border-white/10 bg-white/5 text-white hover:bg-white/10" onClick={onExportCsv}><Download className="size-4" /> CSV</Button><Button data-testid="copy-text-button" variant="ghost" disabled={!approved} className="min-h-11 text-muted-foreground hover:text-white" onClick={onCopy}><Clipboard className="size-4" /> Kopyala</Button></div></CardContent>
      </Card>
    </div>
  );
}

export default function Home() {
  const [stage, setStage] = useState<Stage>("capture");
  const [selectedImage, setSelectedImage] = useState(SAMPLE_DOCUMENT);
  const [rotation, setRotation] = useState(0);
  const [cropMode, setCropMode] = useState(false);
  const [line, setLine] = useState<LineItem>(INITIAL_LINE);
  const [fullText, setFullText] = useState(OCR_TEXT);
  const [numericVerified, setNumericVerified] = useState(false);
  const [approved, setApproved] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setSelectedImage(reader.result);
        setStage("capture");
        toast.success("Belge yüklendi", { description: "Kadrajı kontrol edip OCR sonucuna geçebilirsiniz." });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLineChange = (field: EditableLineField, value: string) => {
    setLine((current) => ({ ...current, [field]: value }));
    if (field === "unitPrice" || field === "total") setNumericVerified(value === "1050");
    setApproved(false);
  };

  const continueToReview = () => {
    setStage("review");
    toast.success("OCR tamamlandı", { description: "Düşük güvenli alanları kontrol etmeniz gerekiyor." });
  };

  const verify1050 = () => {
    setLine((current) => ({ ...current, unitPrice: "1050", total: "1050" }));
    setNumericVerified(true);
    toast.success("1050 doğrulandı", { description: "Birim fiyat ve tutar 1050 olarak korundu." });
  };

  const approveDocument = () => {
    if (!numericVerified || line.unitPrice !== "1050" || line.total !== "1050") {
      toast.error("Önce 1050 alanını doğrulayın", { description: "Birim fiyat ve tutar 1050 olmalı." });
      return;
    }
    setApproved(true);
    toast.success("Belge onaylandı", { description: "Artık tam metin ve tablo verisini dışa aktarabilirsiniz." });
  };

  const exportJson = () => {
    downloadFile("fisokut-belge.json", JSON.stringify({ supplier: "MENZİL", date: "02.10.2026", lineItems: [line], fullText }, null, 2), "application/json");
    toast.success("JSON indirildi");
  };

  const exportCsv = () => {
    downloadFile("fisokut-satirlar.csv", `Mal adı,Miktar,Birim,Birim fiyat,Tutar\n${line.product},${line.quantity},${line.unit},${line.unitPrice},${line.total}\n`, "text/csv;charset=utf-8");
    toast.success("CSV indirildi");
  };

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(fullText);
      toast.success("Tam metin panoya kopyalandı");
    } catch {
      toast.error("Kopyalama başarısız", { description: "Metni seçip manuel olarak kopyalayabilirsiniz." });
    }
  };

  return (
    <div data-testid="scanner-page" className="min-h-svh bg-[#0c1116] text-foreground">
      <Toaster richColors />
      <header data-testid="app-header" className="sticky top-0 z-50 border-b border-white/10 bg-[#0c1116]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div data-testid="brand-lockup" className="flex items-center gap-3"><div data-testid="brand-icon" className="grid size-9 place-items-center rounded-xl bg-emerald-400 text-[#07120e] shadow-[0_0_24px_rgba(52,211,153,.2)]"><ScanLine className="size-5" /></div><div><div data-testid="brand-name" className="font-heading text-base font-bold tracking-tight text-white">FişOkut</div><div data-testid="brand-subtitle" className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Belge tarayıcı</div></div></div>
          <div data-testid="header-security-note" className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex"><ShieldCheck className="size-4 text-emerald-300" /> Yerel demo • Verileriniz cihazınızda</div>
          {stage === "review" && <Button data-testid="header-reset-button" variant="ghost" size="icon" className="min-h-11 min-w-11 text-muted-foreground hover:text-white" onClick={() => { setStage("capture"); setApproved(false); }} aria-label="Yeni tarama"><X className="size-5" /></Button>}
        </div>
      </header>

      <main className="px-4 pb-24 pt-6 sm:px-6 sm:pt-10">
        <div className="mx-auto mb-7 max-w-6xl"><div data-testid="page-kicker" className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300"><SlidersHorizontal className="size-4" /> {stage === "capture" ? "İrsaliye taraması" : "Sonuç inceleme"}</div><h1 data-testid="page-title" className="font-heading max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">{stage === "capture" ? "Fişi okut, kritik rakamları gözden kaçırma." : "Sonucu düzenle ve güvenle onayla."}</h1><p data-testid="page-description" className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">{stage === "capture" ? "Kamera veya galeriden bir belge seçin. Özellikle el yazısı 1050 gibi alanları onaylamadan önce birlikte doğrulayalım." : "OCR metnini belgeyle karşılaştırın, düşük güvenli alanları düzeltin ve sonrasında istediğiniz formatta dışa aktarın."}</p></div>
        {stage === "capture" ? <CaptureStage selectedImage={selectedImage} rotation={rotation} cropMode={cropMode} onCamera={() => cameraInputRef.current?.click()} onGallery={() => galleryInputRef.current?.click()} onSample={() => { setSelectedImage(SAMPLE_DOCUMENT); toast.success("Örnek irsaliye hazır"); }} onRotate={() => setRotation((current) => (current + 90) % 360)} onCrop={() => setCropMode((current) => !current)} onContinue={continueToReview} /> : <ReviewStage selectedImage={selectedImage} line={line} fullText={fullText} numericVerified={numericVerified} approved={approved} onBack={() => setStage("capture")} onLineChange={handleLineChange} onTextChange={(value) => { setFullText(value); setApproved(false); }} onVerify={verify1050} onApprove={approveDocument} onExportJson={exportJson} onExportCsv={exportCsv} onCopy={copyText} />}
        <input data-testid="camera-file-input" ref={cameraInputRef} className="hidden" type="file" accept="image/*" capture="environment" onChange={handleFile} />
        <input data-testid="gallery-file-input" ref={galleryInputRef} className="hidden" type="file" accept="image/*" onChange={handleFile} />
      </main>

      <nav data-testid="bottom-navigation" className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-[#0c1116]/95 px-4 py-2 backdrop-blur-xl sm:hidden"><div className="mx-auto flex max-w-md items-center justify-around"><button data-testid="bottom-nav-scan-button" type="button" className={`flex min-h-12 flex-col items-center justify-center gap-1 px-5 text-[10px] font-medium ${stage === "capture" ? "text-emerald-300" : "text-muted-foreground"}`} onClick={() => setStage("capture")}><Camera className="size-5" />Tarama</button><button data-testid="bottom-nav-review-button" type="button" className={`flex min-h-12 flex-col items-center justify-center gap-1 px-5 text-[10px] font-medium ${stage === "review" ? "text-emerald-300" : "text-muted-foreground"}`} onClick={() => setStage("review")}><FileText className="size-5" />Sonuç</button></div></nav>
    </div>
  );
}