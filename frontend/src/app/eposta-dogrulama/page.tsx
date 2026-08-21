"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

function EmailVerificationContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const eposta = searchParams.get("eposta");
  
  // Eksik parametre durumu efekt içinde setState ile değil, başlangıç
  // değerinden türetilir; efekt içinde senkron setState basamaklı render
  // tetikler ve React derleyicisi bunu hata olarak işaretler.
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    () => (token && eposta ? "loading" : "error"));

  useEffect(() => {
    if (!token || !eposta) return;

    const verifyEmail = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";
        const res = await fetch(`${API_URL}/Kimlik/eposta-dogrula`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, eposta }),
        });
        
        if (res.ok) {
          setStatus("success");
        } else {
          setStatus("error");
        }
      } catch (e) {
        setStatus("error");
      }
    };

    verifyEmail();
  }, [token, eposta]);

  return (
    <div className="min-h-[70vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-yuzey">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex justify-center mb-6">
          <img src="/logo-cevik-yatay.svg" alt="Çevik" className="h-12 w-auto" />
        </Link>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-marka">
          E-posta Doğrulama
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-yuzey-kart py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-kenar text-center">
          {status === "loading" && (
            <div className="flex flex-col items-center">
              <Loader2 size={48} className="text-vurgu animate-spin mb-4" />
              <p className="text-metin-ikincil">Bilgileriniz doğrulanıyor, lütfen bekleyin...</p>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center">
              <CheckCircle2 size={48} className="text-basari-500 mb-4" />
              <h3 className="text-xl font-bold text-metin mb-2">E-posta Doğrulandı!</h3>
              <p className="text-metin-ikincil mb-6">Hesabınız başarıyla doğrulandı. Artık güvenle alışveriş yapabilirsiniz.</p>
              <Link href="/giris" className="w-full bg-vurgu hover:bg-opacity-90 text-white font-bold py-3 rounded-md transition-colors shadow-sm">
                Giriş Yap
              </Link>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center">
              <XCircle size={48} className="text-hata-500 mb-4" />
              <h3 className="text-xl font-bold text-metin mb-2">Doğrulama Başarısız</h3>
              <p className="text-metin-ikincil mb-6">Bağlantı geçersiz veya süresi dolmuş olabilir. Lütfen tekrar deneyin.</p>
              <Link href="/giris" className="text-vurgu font-medium hover:underline">
                Giriş sayfasına dön
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function EmailVerificationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-yuzey">
        <Loader2 size={48} className="text-vurgu animate-spin" />
      </div>
    }>
      <EmailVerificationContent />
    </Suspense>
  );
}
