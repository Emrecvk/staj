"use client";

import { Suspense, useActionState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowRight, CheckCircle2, Loader2, LockKeyhole, Mail } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { login, type ActionResponse } from "@/lib/auth";
import { KimlikSayfaKabugu, kimlikGirdiSinifi } from "@/components/auth/kimlik-sayfa-kabugu";

const initialState: ActionResponse = { success: false };

function LoginContent() {
  const [state, formAction, isPending] = useActionState(login, initialState);
  const searchParams = useSearchParams();

  // `proxy.ts`, korumalı bir sayfaya girişsiz gelen kullanıcıyı buraya
  // yollarken geldiği yolu `devam` ile taşır; form bunu geri göndermezse
  // kullanıcı giriş sonrası hedefine değil hep /profil'e düşer.
  const devam = searchParams.get("devam") ?? "";

  const bilgiMesaji =
    searchParams.get("kayit") === "basarili"
      ? "Kayıt işleminiz tamamlandı. Yeni hesabınızla giriş yapabilirsiniz."
      : searchParams.get("basvuru") === "alindi"
        ? "Firma başvurunuz alındı ve onay için sıraya girdi. Hesabınızla şimdiden giriş yapabilirsiniz."
        : null;

  // Oturum tazelenemedi (refresh token süresi doldu ya da iptal edildi).
  // Kullanıcı bunu "sistem beni attı" diye değil, süre dolumu olarak görmeli.
  const oturumDoldu = searchParams.get("oturum") === "doldu";

  return (
    <KimlikSayfaKabugu baslik="Tekrar hoş geldiniz">
      {bilgiMesaji && <div role="status" className="mb-5 flex items-start gap-3 rounded-token-girdi border border-basari-500/30 bg-basari-50 p-4 text-sm text-basari-600"><CheckCircle2 size={19} className="mt-0.5 shrink-0" aria-hidden="true" /><span>{bilgiMesaji}</span></div>}
      {oturumDoldu && <div role="status" className="mb-5 flex items-start gap-3 rounded-token-girdi border border-uyari-500/30 bg-uyari-50 p-4 text-sm text-uyari-600"><AlertCircle size={19} className="mt-0.5 shrink-0" aria-hidden="true" /><span>Oturumunuzun süresi doldu. Kaldığınız yerden devam etmek için lütfen yeniden giriş yapın.</span></div>}
      {!state.success && state.message && <div role="alert" className="mb-5 flex items-start gap-3 rounded-token-girdi border border-hata-500/30 bg-hata-50 p-4 text-sm text-hata-600"><AlertCircle size={19} className="mt-0.5 shrink-0" aria-hidden="true" /><span>{state.message}</span></div>}

      <form action={formAction} className="space-y-5">
        <input type="hidden" name="devam" value={devam} />
        <div>
          <label htmlFor="eposta" className="text-sm font-semibold text-metin">E-posta adresi</label>
          <div className="relative"><Mail size={18} className="pointer-events-none absolute left-3.5 top-1/2 mt-1 -translate-y-1/2 text-metin-ucuncul" aria-hidden="true" /><input id="eposta" name="eposta" type="email" autoComplete="email" required placeholder="ornek@firma.com" aria-invalid={Boolean(state.errors?.eposta)} className={`${kimlikGirdiSinifi} pl-11 ${state.errors?.eposta ? "border-hata-500 focus:border-hata-500 focus:ring-hata-50" : ""}`} /></div>
          {state.errors?.eposta && <p className="mt-2 text-sm text-hata-600">{state.errors.eposta[0]}</p>}
        </div>
        <div>
          <div className="flex items-center justify-between gap-4"><label htmlFor="sifre" className="text-sm font-semibold text-metin">Şifre</label><Link href="/sifre-sifirlama" className="text-sm font-semibold text-vurgu hover:text-vurgu-guclu">Şifremi unuttum</Link></div>
          <div className="relative"><LockKeyhole size={18} className="pointer-events-none absolute left-3.5 top-1/2 mt-1 -translate-y-1/2 text-metin-ucuncul" aria-hidden="true" /><input id="sifre" name="sifre" type="password" autoComplete="current-password" required placeholder="Şifrenizi girin" aria-invalid={Boolean(state.errors?.sifre)} className={`${kimlikGirdiSinifi} pl-11 ${state.errors?.sifre ? "border-hata-500 focus:border-hata-500 focus:ring-hata-50" : ""}`} /></div>
          {state.errors?.sifre && <p className="mt-2 text-sm text-hata-600">{state.errors.sifre[0]}</p>}
        </div>
        <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm text-metin-ikincil"><input name="remember-me" type="checkbox" className="h-4 w-4 rounded border-kenar-guclu text-vurgu focus:ring-vurgu" />Bu cihazda beni hatırla</label>
        {state.errors?.general && <div role="alert" className="rounded-token-girdi bg-hata-50 p-3 text-sm font-medium text-hata-600">{state.errors.general[0]}</div>}
        <button type="submit" disabled={isPending} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-token-girdi bg-marka px-5 text-sm font-bold text-dolgu-uzeri shadow-token-hafif transition-[background-color,transform] hover:bg-marka-hover active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60">{isPending ? <><Loader2 size={18} className="animate-spin" /> Giriş yapılıyor</> : <>Giriş Yap <ArrowRight size={18} /></>}</button>
      </form>

      <div className="mt-7 border-t border-kenar pt-6">
        <p className="text-center text-sm text-metin-ikincil">Henüz hesabınız yok mu? <Link href="/kayit" className="font-bold text-vurgu hover:text-vurgu-guclu">Ücretsiz hesap oluşturun</Link></p>
      </div>
    </KimlikSayfaKabugu>
  );
}

export default function LoginPage() {
  return <Suspense fallback={<div className="flex min-h-[100dvh] items-center justify-center bg-yuzey"><Loader2 size={36} className="animate-spin text-vurgu" /></div>}><LoginContent /></Suspense>;
}
