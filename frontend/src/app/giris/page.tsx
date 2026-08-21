"use client";

import { Suspense, useActionState } from "react";
import Link from "next/link";
import { login, type ActionResponse } from "@/lib/auth";
import { AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";

const initialState: ActionResponse = {
  success: false,
};

function LoginContent() {
  const [state, formAction, isPending] = useActionState(login, initialState);
  const searchParams = useSearchParams();
  const registered = searchParams.get("kayit") === "basarili";

  return (
    <div className="min-h-screen bg-yuzey flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex justify-center mb-6">
          <img src="/logo-cevik-yatay.svg" alt="Çevik" className="h-12 w-auto" />
        </Link>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-marka">Hesabınıza Giriş Yapın</h2>
        <p className="mt-2 text-center text-sm text-metin-ikincil">
          Veya <Link href="/kayit" className="font-medium text-vurgu hover:text-marka transition-colors">yeni bir hesap oluşturun</Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-yuzey-kart py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-kenar">
          
          {registered && (
            <div className="mb-4 p-4 rounded-md bg-basari-50 border border-green-200 text-green-700 text-sm">
              Kayıt işleminiz başarıyla tamamlandı. Lütfen giriş yapın.
            </div>
          )}

          {!state.success && state.message && (
            <div className="mb-4 p-4 rounded-md bg-hata-50 border border-hata-500 flex items-start gap-3 text-hata-600 text-sm">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <span>{state.message}</span>
            </div>
          )}

          <form action={formAction} className="space-y-6">
            <div>
              <label htmlFor="eposta" className="block text-sm font-medium text-metin-ikincil">E-posta Adresi</label>
              <div className="mt-1 relative">
                <input
                  id="eposta"
                  name="eposta"
                  type="email"
                  autoComplete="email"
                  required
                  className={`appearance-none block w-full px-3 py-2 border ${state.errors?.eposta ? 'border-hata-500 focus:ring-red-500 focus:border-red-500' : 'border-kenar-guclu focus:ring-vurgu focus:border-vurgu'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm`}
                />
              </div>
              {state.errors?.eposta && <p className="mt-2 text-sm text-hata-600">{state.errors.eposta[0]}</p>}
            </div>

            <div>
              <label htmlFor="sifre" className="block text-sm font-medium text-metin-ikincil">Şifre</label>
              <div className="mt-1 relative">
                <input
                  id="sifre"
                  name="sifre"
                  type="password"
                  autoComplete="current-password"
                  required
                  className={`appearance-none block w-full px-3 py-2 border ${state.errors?.sifre ? 'border-hata-500 focus:ring-red-500 focus:border-red-500' : 'border-kenar-guclu focus:ring-vurgu focus:border-vurgu'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm`}
                />
              </div>
              {state.errors?.sifre && <p className="mt-2 text-sm text-hata-600">{state.errors.sifre[0]}</p>}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-vurgu focus:ring-vurgu border-kenar-guclu rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-metin">Beni hatırla</label>
              </div>

              <div className="text-sm">
                <Link href="/sifre-sifirlama" className="font-medium text-vurgu hover:text-marka">Şifrenizi mi unuttunuz?</Link>
              </div>
            </div>
            
            {state.errors?.general && (
              <div className="text-sm text-hata-600 font-medium text-center">
                {state.errors.general[0]}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isPending}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-marka hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-navy disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isPending ? "Giriş yapılıyor..." : "Giriş Yap"}
              </button>
            </div>
          </form>
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-kenar-guclu" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-yuzey-kart text-metin-ucuncul">Kurumsal Hesabınız Var Mı?</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href="/kayit/kurumsal"
                className="w-full inline-flex justify-center items-center py-2 px-4 border border-vurgu rounded-md shadow-sm bg-yuzey-kart text-sm font-medium text-vurgu hover:bg-vurgu-zemin transition-colors"
              >
                Firma Başvurusu Yapın <ArrowRight size={16} className="ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-yuzey">
        <Loader2 size={48} className="text-vurgu animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
