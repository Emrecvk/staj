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
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <Link href="/" className="flex justify-center mb-6">
          <img src="/logo-cevik-yatay.svg" alt="Çevik" className="h-12 w-auto" />
        </Link>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-brand-navy">Firma Başvurusu</h2>
        <p className="mt-2 text-center text-sm text-gray-600 max-w-xl mx-auto">
          Kurumsal hesabınızla kademeli fiyat avantajlarından yararlanabilir, tekliflerinizi yönetebilir ve özel müşteri temsilcinizle çalışabilirsiniz.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100">
          
          <div className="flex bg-gray-100 p-1 rounded-lg mb-8">
            <Link href="/kayit" className="flex-1 text-center py-2 text-sm font-medium text-gray-500 hover:text-brand-navy flex items-center justify-center gap-2">
              <User size={16} /> Bireysel Kayıt
            </Link>
            <Link href="/kayit/kurumsal" className="flex-1 text-center py-2 text-sm font-bold bg-white rounded-md shadow-sm text-brand-navy flex items-center justify-center gap-2">
              <Building2 size={16} /> Firma Başvurusu
            </Link>
          </div>

          {!state.success && state.message && (
            <div className="mb-4 p-4 rounded-md bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-sm">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <span>{state.message}</span>
            </div>
          )}

          <form action={formAction} className="space-y-6">
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Yetkili Kişi Bilgileri</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="ad" className="block text-sm font-medium text-gray-700">Ad</label>
                  <input id="ad" name="ad" type="text" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-cyan focus:border-brand-cyan sm:text-sm" />
                </div>
                <div>
                  <label htmlFor="soyad" className="block text-sm font-medium text-gray-700">Soyad</label>
                  <input id="soyad" name="soyad" type="text" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-cyan focus:border-brand-cyan sm:text-sm" />
                </div>
                <div>
                  <label htmlFor="eposta" className="block text-sm font-medium text-gray-700">İş E-posta Adresi</label>
                  <input id="eposta" name="eposta" type="email" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-cyan focus:border-brand-cyan sm:text-sm" />
                </div>
                <div>
                  <label htmlFor="telefon" className="block text-sm font-medium text-gray-700">Telefon Numarası</label>
                  <input id="telefon" name="telefon" type="tel" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-cyan focus:border-brand-cyan sm:text-sm" />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="sifre" className="block text-sm font-medium text-gray-700">Şifre</label>
                  <input id="sifre" name="sifre" type="password" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-cyan focus:border-brand-cyan sm:text-sm" />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Firma Bilgileri</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label htmlFor="firmaAdi" className="block text-sm font-medium text-gray-700">Firma Ünvanı</label>
                  <input
                    id="firmaAdi" name="firmaAdi" type="text" required
                    className={`mt-1 block w-full px-3 py-2 border ${state.errors?.firmaAdi ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:ring-brand-cyan focus:border-brand-cyan sm:text-sm`}
                  />
                  {state.errors?.firmaAdi && <p className="mt-1 text-xs text-red-600">{state.errors.firmaAdi[0]}</p>}
                </div>
                
                <div>
                  <label htmlFor="vergiDairesi" className="block text-sm font-medium text-gray-700">Vergi Dairesi</label>
                  <input
                    id="vergiDairesi" name="vergiDairesi" type="text" required
                    className={`mt-1 block w-full px-3 py-2 border ${state.errors?.vergiDairesi ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:ring-brand-cyan focus:border-brand-cyan sm:text-sm`}
                  />
                  {state.errors?.vergiDairesi && <p className="mt-1 text-xs text-red-600">{state.errors.vergiDairesi[0]}</p>}
                </div>
                
                <div>
                  <label htmlFor="vergiNo" className="block text-sm font-medium text-gray-700">Vergi Numarası / TCKN</label>
                  <input
                    id="vergiNo" name="vergiNo" type="text" required
                    className={`mt-1 block w-full px-3 py-2 border ${state.errors?.vergiNo ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:ring-brand-cyan focus:border-brand-cyan sm:text-sm`}
                  />
                  {state.errors?.vergiNo && <p className="mt-1 text-xs text-red-600">{state.errors.vergiNo[0]}</p>}
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="kepAdresi" className="block text-sm font-medium text-gray-700">KEP Adresi (Opsiyonel)</label>
                  <input id="kepAdresi" name="kepAdresi" type="text" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-cyan focus:border-brand-cyan sm:text-sm" />
                </div>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input id="sozlesme" name="sozlesme" type="checkbox" required className="h-4 w-4 text-brand-cyan focus:ring-brand-cyan border-gray-300 rounded" />
              </div>
              <div className="ml-2 text-sm">
                <label htmlFor="sozlesme" className="text-gray-500">
                  <a href="/sozlesmeler/uyelik" className="text-brand-cyan hover:underline">Üyelik Sözleşmesi</a>'ni ve <a href="/sozlesmeler/kvkk" className="text-brand-cyan hover:underline">KVKK Aydınlatma Metni</a>'ni okudum, onaylıyorum.
                </label>
              </div>
            </div>
            
            {state.errors?.general && (
              <div className="text-sm text-red-600 font-medium text-center">
                {state.errors.general[0]}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isPending}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-brand-navy hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-navy disabled:opacity-70 disabled:cursor-not-allowed"
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
