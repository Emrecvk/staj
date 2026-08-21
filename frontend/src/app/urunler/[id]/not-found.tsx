export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-20 text-center px-4">
      <div className="text-8xl font-black text-gray-200 mb-4">404</div>
      <h1 className="text-2xl md:text-3xl font-bold text-brand-navy mb-4">Ürün Bulunamadı</h1>
      <p className="text-gray-500 max-w-md mx-auto mb-8">
        Aradığınız ürün yayından kaldırılmış veya URL hatalı olabilir. Lütfen arama özelliğini kullanarak diğer ürünleri keşfedin.
      </p>
      <a href="/urunler" className="bg-brand-cyan text-white px-8 py-3 rounded-lg font-bold hover:bg-opacity-90 transition-colors">
        Kataloğa Geri Dön
      </a>
    </div>
  );
}
