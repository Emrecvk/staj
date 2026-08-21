"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const API_URL = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export type ActionResponse = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

export async function login(prevState: ActionResponse, formData: FormData): Promise<ActionResponse> {
  const eposta = formData.get("eposta");
  const sifre = formData.get("sifre");

  try {
    const res = await fetch(`${API_URL}/Kimlik/giris`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eposta, sifre }),
    });

    if (!res.ok) {
      if (res.status === 400) {
        const errorData = await res.json();
        return { success: false, errors: errorData.errors || { general: ["Geçersiz e-posta veya şifre."] } };
      }
      return { success: false, message: "Giriş işlemi sırasında bir hata oluştu." };
    }

    const data = await res.json();
    
    const cookieStore = await cookies();
    cookieStore.set("accessToken", data.accessToken, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 2 // 2 hours
    });
    
    cookieStore.set("refreshToken", data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    cookieStore.set("user", JSON.stringify({ ad: data.kullaniciAdi, firmaMi: data.firmaMi, firmaId: data.firmaId }), { path: "/" });

  } catch {
    return { success: false, message: "Sunucuya bağlanılamadı." };
  }
  
  redirect("/profil");
}

export async function registerUser(prevState: ActionResponse, formData: FormData): Promise<ActionResponse> {
  const data = Object.fromEntries(formData.entries());
  
  try {
    const res = await fetch(`${API_URL}/Kimlik/kayit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      if (res.status === 400) {
        const errorData = await res.json();
        return { success: false, errors: errorData.errors || { general: ["Kayıt işlemi başarısız."] } };
      }
      return { success: false, message: "Kayıt işlemi sırasında bir hata oluştu." };
    }
  } catch {
    return { success: false, message: "Sunucuya bağlanılamadı." };
  }

  // After successful registration, we redirect to login with a success message
  redirect("/giris?kayit=basarili");
}

export async function registerCompany(prevState: ActionResponse, formData: FormData): Promise<ActionResponse> {
  const data = Object.fromEntries(formData.entries());
  
  try {
    // Kurumsal kayıt endpoint'i (önce bireysel kullanıcı kaydı yapılıp sonra firma başvurusu yapılabilir,
    // ya da birleşik bir endpoint olabilir. Biz birleşik olduğunu varsayarak gönderelim).
    const res = await fetch(`${API_URL}/Kimlik/firma-basvurusu`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      if (res.status === 400) {
        const errorData = await res.json();
        return { success: false, errors: errorData.errors || { general: ["Başvuru işlemi başarısız."] } };
      }
      return { success: false, message: "Başvuru işlemi sırasında bir hata oluştu." };
    }
  } catch {
    return { success: false, message: "Sunucuya bağlanılamadı." };
  }

  redirect("/giris?basvuru=basarili");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");
  cookieStore.delete("user");
  redirect("/giris");
}

export async function resetPasswordRequest(prevState: ActionResponse, formData: FormData): Promise<ActionResponse> {

  const eposta = formData.get("eposta");
  
  try {
    const res = await fetch(`${API_URL}/Kimlik/sifre-sifirlama-talebi`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eposta }),
    });

    if (!res.ok) {
      if (res.status === 400) {
        const errorData = await res.json();
        return { success: false, errors: errorData.errors || { general: ["İşlem başarısız."] } };
      }
      return { success: false, message: "Bir hata oluştu." };
    }
    
    return { success: true, message: "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi." };
  } catch {
    return { success: false, message: "Sunucuya bağlanılamadı." };
  }
}
