"use client";

import { useActionState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import { registerUser, type ActionResponse } from "@/lib/auth";
import { KimlikSayfaKabugu, kimlikGirdiSinifi } from "@/components/auth/kimlik-sayfa-kabugu";

const initialState: ActionResponse = { success: false };

function Alan({ id, etiket, type = "text", autoComplete, placeholder, hata }: { id: string; etiket: string; type?: string; autoComplete?: string; placeholder?: string; hata?: string[] }) {
  return <div><label htmlFor={id} className="text-sm font-semibold text-metin">{etiket}</label><input id={id} name={id} type={type} autoComplete={autoComplete} required placeholder={placeholder} aria-invalid={Boolean(hata)} className={`${kimlikGirdiSinifi} ${hata ? "border-hata-500 focus:border-hata-500 focus:ring-hata-50" : ""}`} />{hata && <p className="mt-2 text-sm text-hata-600">{hata[0]}</p>}</div>;
}

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registerUser, initialState);

  return (
    <KimlikSayfaKabugu baslik="Hesabınızı oluşturun">
      {!state.success && state.message && <div role="alert" className="mb-5 flex items-start gap-3 rounded-token-girdi border border-hata-500/30 bg-hata-50 p-4 text-sm text-hata-600"><AlertCircle size={19} className="mt-0.5 shrink-0" /><span>{state.message}</span></div>}

      <form action={formAction} className="space-y-5">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2"><Alan id="ad" etiket="Ad" autoComplete="given-name" placeholder="Adınız" hata={state.errors?.ad} /><Alan id="soyad" etiket="Soyad" autoComplete="family-name" placeholder="Soyadınız" hata={state.errors?.soyad} /></div>
        <Alan id="eposta" etiket="E-posta adresi" type="email" autoComplete="email" placeholder="ornek@firma.com" hata={state.errors?.eposta} />
        <Alan id="telefon" etiket="Telefon numarası" type="tel" autoComplete="tel" placeholder="05xx xxx xx xx" hata={state.errors?.telefon} />
        <Alan id="sifre" etiket="Şifre" type="password" autoComplete="new-password" placeholder="En az 8 karakter" hata={state.errors?.sifre} />

        <label className="flex cursor-pointer items-start gap-3 rounded-token-girdi border border-kenar bg-yuzey-kart p-4 text-sm leading-5 text-metin-ikincil"><input id="sozlesme" name="sozlesme" type="checkbox" required className="mt-0.5 h-4 w-4 shrink-0 rounded border-kenar-guclu text-vurgu focus:ring-vurgu" /><span><Link href="/sozlesmeler/ozdisan-elektronik-kvkk-politikasi" className="font-semibold text-vurgu hover:text-vurgu-guclu">KVKK Aydınlatma Metni</Link>&apos;ni okudum ve üyelik koşullarını kabul ediyorum.</span></label>

        {state.errors?.general && <div role="alert" className="rounded-token-girdi bg-hata-50 p-3 text-sm font-medium text-hata-600">{state.errors.general[0]}</div>}
        <button type="submit" disabled={isPending} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-token-girdi bg-marka px-5 text-sm font-bold text-dolgu-uzeri shadow-token-hafif transition-[background-color,transform] hover:bg-marka-hover active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60">{isPending ? <><Loader2 size={18} className="animate-spin" /> Hesap oluşturuluyor</> : <>Hesap Oluştur <ArrowRight size={18} /></>}</button>
      </form>

      <p className="mt-7 border-t border-kenar pt-6 text-center text-sm text-metin-ikincil">Zaten hesabınız var mı? <Link href="/giris" className="font-bold text-vurgu hover:text-vurgu-guclu">Giriş yapın</Link></p>
    </KimlikSayfaKabugu>
  );
}
