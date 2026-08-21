"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerCompany, type ActionResponse } from "@/lib/auth";
import { AlertCircle, Building2, User } from "lucide-react";

const initialState: ActionResponse = {
  success: false,
};

export default function CompanyRegisterPage() {
  const [state, formAction, isPending] = useActionState(registerCompany, initialState);

  return (
    <div className="min-h-screen bg-yuzey flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <Link href="/" className="flex justify-center mb-6">
          <img src="/logo-cevik-yatay.svg" alt="Çevik" className="h-12 w-auto" />
        </Link>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-marka">Firma Başvurusu</h2>
        <p className="mt-2 text-center text-sm text-metin-ikincil max-w-xl mx-auto">
          Kurumsal hesabınızla kademeli fiyat avantajlarından yararlanabilir, tekliflerinizi yönetebilir ve özel müşteri temsilcinizle çalışabilirsiniz.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-yuzey-kart py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-kenar">
          
          <div className="flex bg-yuzey-gomulu p-1 rounded-lg mb-8">
            <Link href="/kayit" className="flex-1 text-center py-2 text-sm font-medium text-metin-ucuncul hover:text-marka flex items-center justify-center gap-2">
              <User size={16} /> Bireysel Kayıt
            </Link>
            <Link href="/kayit/kurumsal" className="flex-1 text-center py-2 text-sm font-bold bg-yuzey-kart rounded-md shadow-sm text-marka flex items-center justify-center gap-2">
              <Building2 size={16} /> Firma Başvurusu
            </Link>
          </div>

          {!state.success && state.message && (
            <div className="mb-4 p-4 rounded-md bg-hata-50 border border-hata-500 flex items-start gap-3 text-hata-600 text-sm">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <span>{state.message}</span>
            </div>
          )}

          <form action={formAction} className="space-y-6">
            <div className="border-b border-kenar pb-6">
              <h3 className="text-lg font-medium text-metin mb-4">Yetkili Kişi Bilgileri</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="ad" className="block text-sm font-medium text-metin-ikincil">Ad</label>
                  <input id="ad" name="ad" type="text" required className="mt-1 block w-full px-3 py-2 border border-kenar-guclu rounded-md shadow-sm focus:ring-vurgu focus:border-vurgu sm:text-sm" />
                </div>
                <div>
                  <label htmlFor="soyad" className="block text-sm font-medium text-metin-ikincil">Soyad</label>
                  <input id="soyad" name="soyad" type="text" required className="mt-1 block w-full px-3 py-2 border border-kenar-guclu rounded-md shadow-sm focus:ring-vurgu focus:border-vurgu sm:text-sm" />
                </div>
                <div>
                  <label htmlFor="eposta" className="block text-sm font-medium text-metin-ikincil">İş E-posta Adresi</label>
                  <input id="eposta" name="eposta" type="email" required className="mt-1 block w-full px-3 py-2 border border-kenar-guclu rounded-md shadow-sm focus:ring-vurgu focus:border-vurgu sm:text-sm" />
                </div>
                <div>
                  <label htmlFor="telefon" className="block text-sm font-medium text-metin-ikincil">Telefon Numarası</label>
                  <input id="telefon" name="telefon" type="tel" required className="mt-1 block w-full px-3 py-2 border border-kenar-guclu rounded-md shadow-sm focus:ring-vurgu focus:border-vurgu sm:text-sm" />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="sifre" className="block text-sm font-medium text-metin-ikincil">Şifre</label>
                  <input id="sifre" name="sifre" type="password" required className="mt-1 block w-full px-3 py-2 border border-kenar-guclu rounded-md shadow-sm focus:ring-vurgu focus:border-vurgu sm:text-sm" />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <h3 className="text-lg font-medium text-metin mb-4">Firma Bilgileri</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label htmlFor="firmaAdi" className="block text-sm font-medium text-metin-ikincil">Firma Ünvanı</label>
                  <input
                    id="firmaAdi" name="firmaAdi" type="text" required
                    className={`mt-1 block w-full px-3 py-2 border ${state.errors?.firmaAdi ? 'border-hata-500' : 'border-kenar-guclu'} rounded-md shadow-sm focus:ring-vurgu focus:border-vurgu sm:text-sm`}
                  />
                  {state.errors?.firmaAdi && <p className="mt-1 text-xs text-hata-600">{state.errors.firmaAdi[0]}</p>}
                </div>
                
                <div>
                  <label htmlFor="vergiDairesi" className="block text-sm font-medium text-metin-ikincil">Vergi Dairesi</label>
                  <input
                    id="vergiDairesi" name="vergiDairesi" type="text" required
                    className={`mt-1 block w-full px-3 py-2 border ${state.errors?.vergiDairesi ? 'border-hata-500' : 'border-kenar-guclu'} rounded-md shadow-sm focus:ring-vurgu focus:border-vurgu sm:text-sm`}
                  />
                  {state.errors?.vergiDairesi && <p className="mt-1 text-xs text-hata-600">{state.errors.vergiDairesi[0]}</p>}
                </div>
                
                <div>
                  <label htmlFor="vergiNo" className="block text-sm font-medium text-metin-ikincil">Vergi Numarası / TCKN</label>
                  <input
                    id="vergiNo" name="vergiNo" type="text" required
                    className={`mt-1 block w-full px-3 py-2 border ${state.errors?.vergiNo ? 'border-hata-500' : 'border-kenar-guclu'} rounded-md shadow-sm focus:ring-vurgu focus:border-vurgu sm:text-sm`}
                  />
                  {state.errors?.vergiNo && <p className="mt-1 text-xs text-hata-600">{state.errors.vergiNo[0]}</p>}
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="kepAdresi" className="block text-sm font-medium text-metin-ikincil">KEP Adresi (Opsiyonel)</label>
                  <input id="kepAdresi" name="kepAdresi" type="text" className="mt-1 block w-full px-3 py-2 border border-kenar-guclu rounded-md shadow-sm focus:ring-vurgu focus:border-vurgu sm:text-sm" />
                </div>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input id="sozlesme" name="sozlesme" type="checkbox" required className="h-4 w-4 text-vurgu focus:ring-vurgu border-kenar-guclu rounded" />
              </div>
              <div className="ml-2 text-sm">
                <label htmlFor="sozlesme" className="text-metin-ucuncul">
                  <a href="/sozlesmeler/uyelik" className="text-vurgu hover:underline">Üyelik Sözleşmesi</a>&apos;ni ve <a href="/sozlesmeler/kvkk" className="text-vurgu hover:underline">KVKK Aydınlatma Metni</a>&apos;ni okudum, onaylıyorum.
                </label>
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
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-marka hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-navy disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isPending ? "Başvuru Gönderiliyor..." : "Firma Başvurusunu Tamamla"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
