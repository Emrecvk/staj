"use client";

import { Toaster as SonnerToaster, toast } from "sonner";

/* ---------------------------------------------------------------------------
   Bildirimler

   Neden toast: "sepete eklendi", "teklif gönderildi" gibi geçici geri
   bildirimler sayfanın içine gömüldüğünde ya kullanıcının baktığı yerden
   uzakta kalıyor ya da yerleşimi kaydırıyor. Toast ikisini de yapmıyor.

   KURAL: toast yalnızca GEÇİCİ bildirim içindir. Form doğrulama hatası
   toast'a gitmez, ilgili alanın altında satır içinde kalır; kullanıcı hangi
   alanın yanlış olduğunu görmeli.

   Konum: mobilde üst, masaüstünde sağ alt. Mobilde alt kenar başparmağın ve
   sistem gezinme çubuğunun bölgesi.
   --------------------------------------------------------------------------- */

export function Bildirimler() {
  return (
    <SonnerToaster
      position="bottom-right"
      mobileOffset={{ top: 16 }}
      expand={false}
      // Sonner varsayılan koyu/açık temayı kendi seçer; biz sistem tercihine
      // bırakıyoruz ki sayfanın geri kalanıyla aynı kalsın.
      theme="system"
      toastOptions={{
        classNames: {
          toast:
            "!rounded-token-kart !border-kenar !bg-yuzey-kart !text-metin !shadow-token-katman",
          description: "!text-metin-ikincil",
          actionButton: "!bg-marka !text-dolgu-uzeri",
          cancelButton: "!bg-yuzey-gomulu !text-metin-ikincil",
        },
      }}
    />
  );
}

/* Uygulama genelinde tek giriş noktası. Doğrudan sonner'ı import etmek yerine
   buradan geçiliyor ki ileride sağlayıcı değişirse tek dosya güncellensin. */
export const bildir = {
  basarili: (mesaj: string, aciklama?: string) => toast.success(mesaj, { description: aciklama }),
  hata: (mesaj: string, aciklama?: string) => toast.error(mesaj, { description: aciklama }),
  bilgi: (mesaj: string, aciklama?: string) => toast(mesaj, { description: aciklama }),

  /** Eylem butonlu bildirim: "Sepete eklendi · Sepete git" gibi. */
  eylemli: (mesaj: string, eylemMetni: string, onEylem: () => void, aciklama?: string) =>
    toast.success(mesaj, {
      description: aciklama,
      action: { label: eylemMetni, onClick: onEylem },
    }),

  /** Söz tabanlı: bekleme, başarı ve hata durumlarını tek çağrıda yönetir. */
  sure: <T,>(
    soz: Promise<T>,
    mesajlar: { bekliyor: string; basarili: string; hata: string },
  ) =>
    toast.promise(soz, {
      loading: mesajlar.bekliyor,
      success: mesajlar.basarili,
      error: mesajlar.hata,
    }),
};
