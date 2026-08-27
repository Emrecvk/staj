import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Şifre Sıfırlama",
  description: "Çevik Elektronik hesabınız için şifre sıfırlama bağlantısı isteyin.",
};

export default function SifreSifirlamaLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
