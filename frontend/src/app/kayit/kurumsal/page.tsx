"use client";

import { useActionState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowRight, Building2, Loader2, UserRound } from "lucide-react";
import { registerCompany, type ActionResponse } from "@/lib/auth";
import { KimlikSayfaKabugu, kimlikGirdiSinifi } from "@/components/auth/kimlik-sayfa-kabugu";

const initialState: ActionResponse = { success: false };

function Alan({ id, etiket, type = "text", autoComplete, inputMode, placeholder, hata, required = true }: { id: string; etiket: string; type?: string; autoComplete?: string; inputMode?: "numeric"; placeholder?: string; hata?: string[]; required?: boolean }) {
  return <div><label htmlFor={id} className="text-sm font-semibold text-metin">{etiket}</label><input id={id} name={id} type={type} autoComplete={autoComplete} inputMode={inputMode} required={required} placeholder={placeholder} aria-invalid={Boolean(hata)} className={`${kimlikGirdiSinifi} ${hata ? "border-hata-500 focus:border-hata-500 focus:ring-hata-50" : ""}`} />{hata && <p className="mt-2 text-sm text-hata-600">{hata[0]}</p>}</div>;
}

export default function CompanyRegisterPage() {
  const [state, formAction, isPending] = useActionState(registerCompany, initialState);

  return (
    <KimlikSayfaKabugu baslik="Firma hesabı başvurusu">
      <div className="mb-7 grid grid-cols-2 rounded-token-girdi bg-yuzey-gomulu p-1" aria-label="Hesap türü seçimi">
        <Link href="/kayit" className="flex min-h-11 items-center justify-center gap-2 rounded-token-girdi px-3 text-sm font-semibold text-metin-ikincil transition-colors hover:bg-yuzey-kart hover:text-metin-marka"><UserRound size={17} /> Bireysel</Link>
        <Link href="/kayit/kurumsal" aria-current="page" className="flex min-h-11 items-center justify-center gap-2 rounded-token-girdi bg-yuzey-kart px-3 text-sm font-bold text-metin-marka shadow-token-hafif"><Building2 size={17} /> Firma hesabı</Link>
      </div>

      {!state.success && state.message && <div role="alert" className="mb-5 flex items-start gap-3 rounded-token-girdi border border-hata-500/30 bg-hata-50 p-4 text-sm text-hata-600"><AlertCircle size={19} className="mt-0.5 shrink-0" /><span>{state.message}</span></div>}

      <form action={formAction} className="space-y-7">
        <fieldset className="space-y-5">
          <legend className="mb-4 w-full border-b border-kenar pb-3 text-sm font-bold uppercase tracking-[0.08em] text-metin-marka">Yetkili kişi</legend>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2"><Alan id="ad" etiket="Ad" autoComplete="given-name" placeholder="Adınız" hata={state.errors?.ad} /><Alan id="soyad" etiket="Soyad" autoComplete="family-name" placeholder="Soyadınız" hata={state.errors?.soyad} /></div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2"><Alan id="eposta" etiket="İş e-posta adresi" type="email" autoComplete="email" placeholder="ad@firma.com" hata={state.errors?.eposta} /><Alan id="telefon" etiket="Telefon numarası" type="tel" autoComplete="tel" placeholder="05xx xxx xx xx" hata={state.errors?.telefon} /></div>
          <Alan id="sifre" etiket="Şifre" type="password" autoComplete="new-password" placeholder="En az 8 karakter" hata={state.errors?.sifre} />
        </fieldset>

        <fieldset className="space-y-5">
          <legend className="mb-4 w-full border-b border-kenar pb-3 text-sm font-bold uppercase tracking-[0.08em] text-metin-marka">Firma bilgileri</legend>
          <Alan id="firmaAdi" etiket="Firma unvanı" autoComplete="organization" placeholder="Firma ticari unvanı" hata={state.errors?.firmaAdi} />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2"><Alan id="vergiDairesi" etiket="Vergi dairesi" hata={state.errors?.vergiDairesi} /><Alan id="vergiNo" etiket="Vergi numarası / TCKN" inputMode="numeric" hata={state.errors?.vergiNo} /></div>
          <Alan id="kepAdresi" etiket="KEP adresi (isteğe bağlı)" type="email" placeholder="firma@hs01.kep.tr" required={false} />
        </fieldset>

        <label className="flex cursor-pointer items-start gap-3 rounded-token-girdi border border-kenar bg-yuzey-kart p-4 text-sm leading-5 text-metin-ikincil"><input id="sozlesme" name="sozlesme" type="checkbox" required className="mt-0.5 h-4 w-4 shrink-0 rounded border-kenar-guclu text-vurgu focus:ring-vurgu" /><span><Link href="/sozlesmeler/cevik-elektronik-kvkk-politikasi" className="font-semibold text-vurgu hover:text-vurgu-guclu">KVKK Aydınlatma Metni</Link>&apos;ni okudum ve başvuru koşullarını kabul ediyorum.</span></label>
        {state.errors?.general && <div role="alert" className="rounded-token-girdi bg-hata-50 p-3 text-sm font-medium text-hata-600">{state.errors.general[0]}</div>}
        <button type="submit" disabled={isPending} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-token-girdi bg-marka px-5 text-sm font-bold text-dolgu-uzeri shadow-token-hafif transition-[background-color,transform] hover:bg-marka-hover active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60">{isPending ? <><Loader2 size={18} className="animate-spin" /> Başvuru gönderiliyor</> : <>Firma Başvurusunu Tamamla <ArrowRight size={18} /></>}</button>
      </form>

      <p className="mt-7 border-t border-kenar pt-6 text-center text-sm text-metin-ikincil">Zaten hesabınız var mı? <Link href="/giris" className="font-bold text-vurgu hover:text-vurgu-guclu">Giriş yapın</Link></p>
    </KimlikSayfaKabugu>
  );
}
