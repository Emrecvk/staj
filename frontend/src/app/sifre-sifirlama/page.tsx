"use client";

import { useActionState } from "react";
import Link from "next/link";
import Image from "next/image";
import { resetPasswordRequest, type ActionResponse } from "@/lib/auth";
import { AlertCircle, CheckCircle2 } from "lucide-react";

const initialState: ActionResponse = {
  success: false,
};

export default function PasswordResetPage() {
  const [state, formAction, isPending] = useActionState(resetPasswordRequest, initialState);

  return (
    <main id="icerik" className="min-h-screen bg-yuzey flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex justify-center mb-6">
          <Image src="/logo-cevik-yatay.svg" alt="Çevik Elektronik" width={180} height={48} priority className="h-12 w-auto" />
        </Link>
        <h1 className="mt-6 text-center text-3xl font-extrabold text-metin-marka">Şifrenizi mi unuttunuz?</h1>
        <p className="mt-2 text-center text-sm text-metin-ikincil">
          E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-yuzey-kart py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-kenar">
          
          {state.success ? (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <CheckCircle2 className="h-6 w-6 text-basari-600" />
              </div>
              <h3 className="text-lg font-medium text-metin mb-2">E-posta Gönderildi</h3>
              <p className="text-sm text-metin-ucuncul mb-6">{state.message}</p>
              <Link href="/giris" className="text-vurgu hover:text-metin-marka font-medium text-sm">
                Giriş sayfasına dön
              </Link>
            </div>
          ) : (
            <>
              {!state.success && state.message && (
                <div className="mb-4 p-4 rounded-md bg-hata-50 border border-hata-500 flex items-start gap-3 text-hata-600 text-sm">
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  <span>{state.message}</span>
                </div>
              )}

              <form action={formAction} className="space-y-6">
                <div>
                  <label htmlFor="eposta" className="block text-sm font-medium text-metin-ikincil">Kayıtlı E-posta Adresiniz</label>
                  <div className="mt-1 relative">
                    <input
                      id="eposta" name="eposta" type="email" autoComplete="email" required
                      className={`appearance-none block w-full px-3 py-2 border ${state.errors?.eposta ? 'border-hata-500' : 'border-kenar-guclu'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-vurgu focus:border-vurgu sm:text-sm`}
                    />
                  </div>
                  {state.errors?.eposta && <p className="mt-2 text-sm text-hata-600">{state.errors.eposta[0]}</p>}
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
                    {isPending ? "Gönderiliyor..." : "Bağlantı Gönder"}
                  </button>
                </div>
              </form>
              
              <div className="mt-6 text-center">
                <Link href="/giris" className="text-sm font-medium text-metin-ikincil hover:text-metin-marka">
                  Vazgeç ve giriş sayfasına dön
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
