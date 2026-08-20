import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";
import type { ProductSummary } from "@/lib/api";

function formatPrice(value: number, currency: string) { return new Intl.NumberFormat("tr-TR", { style: "currency", currency, maximumFractionDigits: 2 }).format(value); }
export function ProductCard({ product }: { product: ProductSummary }) {
  return <article className="product-card"><Link href={`/urunler/${product.id}`} className="product-media">{product.kampanyaliMi && <span className="product-badge">FIRSAT</span>}<button className="favorite-button" aria-label="Favorilere ekle" type="button"><Heart size={16} /></button><div className="component-illustration"><span>{product.ureticiUrunKodu.slice(0, 8)}</span></div></Link><div className="product-info"><span className="product-brand">{product.ureticiAd}</span><Link href={`/urunler/${product.id}`}><h3>{product.ureticiUrunKodu}</h3></Link><p className="product-description">{product.kisaAciklama}</p><span className="stock-status"><i /> Stokta {product.toplamStok.toLocaleString("tr-TR")} adet</span><div className="product-footer"><div className="product-price"><small>Başlangıç fiyatı</small><strong>{formatPrice(product.baslangicFiyati, product.paraBirimi)}</strong></div><button className="add-cart" type="button" aria-label="Sepete ekle"><ShoppingCart size={17} /></button></div></div></article>;
}
