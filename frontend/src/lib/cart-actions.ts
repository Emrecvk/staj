"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

async function getAuthHeaders() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;
  // Also pass guest cart id if no token?
  const guestCartId = cookieStore.get("guestCartId")?.value;
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  } else if (guestCartId) {
    headers["X-Guest-Cart-Id"] = guestCartId;
  }
  
  return headers;
}

export async function addToCart(ambalajId: number, miktar: number) {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/Sepet/ekle`, {
      method: "POST",
      headers,
      body: JSON.stringify({ urunAmbalajId: ambalajId, miktar }),
    });

    if (!res.ok) {
      if (res.status === 409) {
        return { success: false, message: "Stok veya sistem çakışması (concurrency) hatası. Lütfen sayfayı yenileyip tekrar deneyin." };
      }
      return { success: false, message: "Sepete eklenemedi." };
    }
    
    // Set guest cart cookie if provided in response headers or body
    const data = await res.json();
    if (data.oturumAnahtari && !headers["Authorization"]) {
       const cookieStore = await cookies();
       cookieStore.set("guestCartId", data.oturumAnahtari, { maxAge: 60 * 60 * 24 * 7, path: "/" });
    }

    revalidatePath("/sepet");
    return { success: true };
  } catch (err) {
    return { success: false, message: "Sunucu bağlantı hatası." };
  }
}

export async function updateCartItem(kalemId: number, yeniMiktar: number) {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/Sepet/guncelle`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ kalemId, yeniMiktar }),
    });
    
    if (!res.ok) {
      return { success: false, message: "Miktar güncellenemedi." };
    }
    
    revalidatePath("/sepet");
    return { success: true };
  } catch (err) {
    return { success: false, message: "Sunucu bağlantı hatası." };
  }
}

export async function removeCartItem(kalemId: number) {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/Sepet/kalem/${kalemId}`, {
      method: "DELETE",
      headers,
    });
    
    if (!res.ok) return { success: false };
    
    revalidatePath("/sepet");
    return { success: true };
  } catch (err) {
    return { success: false };
  }
}

export async function clearCart() {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/Sepet`, {
      method: "DELETE",
      headers,
    });
    
    if (!res.ok) return { success: false };
    
    revalidatePath("/sepet");
    return { success: true };
  } catch (err) {
    return { success: false };
  }
}

export async function getCart() {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/Sepet`, {
      headers,
      cache: "no-store",
    });
    
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function createOrder(data: any) {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/Siparisler`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });
    
    if (!res.ok) {
       return { success: false, message: "Sipariş oluşturulamadı." };
    }
    
    const siparis = await res.json();
    return { success: true, siparisNo: siparis.siparisNo };
  } catch (err) {
    return { success: false, message: "Sunucu bağlantı hatası." };
  }
}

export async function createQuote(data: any) {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/Teklifler`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });
    
    if (!res.ok) {
       return { success: false, message: "Teklif talebi oluşturulamadı." };
    }
    
    const teklif = await res.json();
    return { success: true, talepNo: teklif.talepNo };
  } catch (err) {
    return { success: false, message: "Sunucu bağlantı hatası." };
  }
}
