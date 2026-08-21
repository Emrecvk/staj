"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, FileText, Loader2 } from "lucide-react";
import { blogYazisiEkle } from "@/lib/admin-api";
import type { AdminBlogYazisi } from "@/lib/admin-tipler";
import { ApiHatasi, BasariBildirimi, BosDurum } from "@/components/admin/durum-bildirimi";

const girdiSinifi =
  "w-full rounded-md border border-kenar-guclu px-3 py-2 text-sm focus:border-vurgu focus:ring-vurgu";

/** Başlıktan URL'e uygun slug türetir; Türkçe karakterleri karşılıklarına çevirir. */
function slugTuret(baslik: string) {
  const harita: Record<string, string> = {
    ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u",
    Ç: "c", Ğ: "g", İ: "i", Ö: "o", Ş: "s", Ü: "u",
  };
  return baslik
    .replace(/[çğıöşüÇĞİÖŞÜ]/g, (h) => harita[h] ?? h)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function IcerikYonetimi({ yazilar }: { yazilar: AdminBlogYazisi[] }) {
  const router = useRouter();
  const [beklemede, basla] = useTransition();
  const [formAcik, setFormAcik] = useState(false);
  const [hata, setHata] = useState<string | null>(null);
  const [basari, setBasari] = useState<string | null>(null);
  const [slug, setSlug] = useState("");

  const gonder = (formData: FormData) => {
    const metin = (ad: string) => String(formData.get(ad) ?? "").trim();

    basla(async () => {
      const sonuc = await blogYazisiEkle({
        baslik: metin("baslik"),
        slug: metin("slug"),
        ozet: metin("ozet"),
        icerikHtml: metin("icerikHtml"),
        kapakGorselUrl: metin("kapakGorselUrl") || undefined,
        kategori: metin("kategori") || undefined,
      });

      if (sonuc.success) {
        setBasari("Blog yazısı yayımlandı.");
        setHata(null);
        setFormAcik(false);
        setSlug("");
        router.refresh();
      } else {
        setHata(sonuc.message);
        setBasari(null);
      }
    });
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-metin">İçerik Yönetimi</h1>
          <p className="mt-1 text-sm text-metin-ucuncul">
            Yayımlanan yazılar herkese açık /blog uçlarından servis edilir.
          </p>
        </div>
        <button
          type="button" onClick={() => setFormAcik(true)}
          className="flex items-center gap-2 rounded-lg bg-marka px-4 py-2 text-sm font-bold text-white hover:bg-opacity-90"
        >
          <Plus size={16} /> Yeni Yazı
        </button>
      </div>

      {hata && <div className="mb-4"><ApiHatasi mesaj={hata} /></div>}
      {basari && <div className="mb-4"><BasariBildirimi mesaj={basari} /></div>}

      <div className="overflow-hidden rounded-xl border border-kenar bg-yuzey-kart shadow-sm">
        {yazilar.length === 0 ? (
          <BosDurum mesaj="Henüz blog yazısı yok." />
        ) : (
          <ul className="divide-y divide-kenar">
            {yazilar.map((y) => (
              <li key={y.id} className="flex items-start gap-4 p-5 hover:bg-yuzey">
                <span className="rounded-lg bg-blue-50 p-2 text-blue-600"><FileText size={18} /></span>
                <div className="min-w-0 flex-grow">
                  <h3 className="font-bold text-metin">{y.baslik}</h3>
                  <p className="mt-0.5 line-clamp-2 text-sm text-metin-ikincil">{y.ozet}</p>
                  <p className="mt-1 font-mono text-xs text-metin-ucuncul">/blog/{y.slug}</p>
                </div>
                <div className="shrink-0 text-right text-xs text-metin-ucuncul">
                  {y.kategori && (
                    <span className="mb-1 block rounded-full bg-yuzey-gomulu px-2 py-0.5 font-medium text-metin-ikincil">
                      {y.kategori}
                    </span>
                  )}
                  {y.yayinTarihi
                    ? new Date(y.yayinTarihi).toLocaleDateString("tr-TR")
                    : "Taslak"}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {formAcik && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4">
          <div className="my-8 w-full max-w-2xl rounded-xl bg-yuzey-kart shadow-xl">
            <div className="flex items-center justify-between border-b border-kenar p-5">
              <h2 className="text-lg font-bold text-metin">Yeni Blog Yazısı</h2>
              <button type="button" onClick={() => setFormAcik(false)}
                className="text-sm text-metin-ucuncul hover:text-metin">Kapat</button>
            </div>

            <form action={gonder} className="space-y-4 p-5">
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-metin-ikincil">Başlık</span>
                <input name="baslik" required className={girdiSinifi}
                  onChange={(e) => setSlug(slugTuret(e.target.value))} />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-metin-ikincil">Slug</span>
                <input name="slug" required value={slug} onChange={(e) => setSlug(e.target.value)}
                  className={`${girdiSinifi} font-mono`} />
                <span className="mt-1 block text-xs text-metin-ucuncul">
                  Başlıktan otomatik türetilir; gerekirse düzenleyin.
                </span>
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-metin-ikincil">Kategori</span>
                  <input name="kategori" className={girdiSinifi} placeholder="örn. Teknik" />
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-metin-ikincil">Kapak Görseli URL</span>
                  <input name="kapakGorselUrl" type="url" className={girdiSinifi} />
                </label>
              </div>

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-metin-ikincil">Özet</span>
                <textarea name="ozet" required rows={2} className={girdiSinifi} />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-metin-ikincil">İçerik (HTML)</span>
                <textarea name="icerikHtml" required rows={8} className={`${girdiSinifi} font-mono`} />
              </label>

              <div className="flex justify-end gap-3 border-t border-kenar pt-4">
                <button type="button" onClick={() => setFormAcik(false)}
                  className="rounded-lg border border-kenar-guclu px-4 py-2 text-sm font-medium text-metin-ikincil hover:bg-yuzey">
                  Vazgeç
                </button>
                <button type="submit" disabled={beklemede}
                  className="flex items-center gap-2 rounded-lg bg-marka px-4 py-2 text-sm font-bold text-white disabled:opacity-50">
                  {beklemede && <Loader2 size={14} className="animate-spin" />}
                  Yayımla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
