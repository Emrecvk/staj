"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import type { Category } from "@/lib/api";

type BelgeId = "kvkk" | "uyelik-aydinlatma" | "iletisim-aydinlatma" | "talep-aydinlatma" | "veri-basvuru" | "bilgi-toplumu" | "gizlilik" | "cerez" | "mesafeli-satis" | "uyelik" | "iade" | "bilgi-guvenligi" | "etik" | "entegre";

const kvkkBelgeleri: Array<[BelgeId, string]> = [
  ["kvkk", "Çevik Elektronik KVKK Politikası"],
  ["uyelik-aydinlatma", "Üyelik Formu Aydınlatma Metni"],
  ["iletisim-aydinlatma", "İletişim Formu Aydınlatma Metni"],
  ["talep-aydinlatma", "Talep Formu Aydınlatma Metni"],
  ["veri-basvuru", "Kişisel Veri Başvuru Formu"],
  ["bilgi-toplumu", "Bilgi Toplumu Hizmeti"],
];

const sozlesmeBelgeleri: Array<[BelgeId, string]> = [
  ["gizlilik", "Gizlilik Politikası"],
  ["cerez", "Çerez Politikası"],
  ["mesafeli-satis", "Mesafeli Satış Sözleşmesi"],
  ["uyelik", "Üyelik Sözleşmesi"],
  ["iade", "İade & İptal Sözleşmesi"],
];

const politikaBelgeleri: Array<[BelgeId, string]> = [
  ["bilgi-guvenligi", "Bilgi Güvenliği Politikası"],
  ["etik", "İş Gücü Yönetimi ve Etik Kurallar Politikası"],
  ["entegre", "Entegre Yönetim Sistemleri Politikası"],
];

const belgeBasliklari: Record<BelgeId, string> = {
  kvkk: "Çevik Elektronik KVKK Politikası", "uyelik-aydinlatma": "Üyelik Formu Aydınlatma Metni", "iletisim-aydinlatma": "İletişim Formu Aydınlatma Metni", "talep-aydinlatma": "Talep Formu Aydınlatma Metni", "veri-basvuru": "Kişisel Veri Başvuru Formu", "bilgi-toplumu": "Bilgi Toplumu Hizmeti", gizlilik: "Gizlilik Politikası", cerez: "Çerez Politikası", "mesafeli-satis": "Mesafeli Satış Sözleşmesi", uyelik: "Üyelik Sözleşmesi", iade: "İade ve İptal Sözleşmesi", "bilgi-guvenligi": "Bilgi Güvenliği Politikası", etik: "İş Gücü Yönetimi ve Etik Kurallar Politikası", entegre: "Entegre Yönetim Sistemleri Politikası",
};

function BelgeIcerigi({ belge }: { belge: BelgeId }) {
  if (belge === "kvkk") return <><h2>1. Politika’ya giriş</h2><p>6698 sayılı Kişisel Verilerin Korunması Kanunu ve ilgili mevzuat doğrultusunda, kişisel verilerin hukuka uygun, doğru, belirli ve şeffaf amaçlarla işlenmesi hakkında bilgilendirme amacıyla hazırlanmıştır.</p><p>Çevik Elektronik; müşterilerinin, çalışanlarının, tedarikçilerinin, ziyaretçilerinin ve diğer paydaşlarının kişisel verilerini korumak için gerekli idari ve teknik tedbirleri uygular.</p><p>Bu politika kapsamında kişisel verilerin işlenmesinde aşağıdaki temel ilkeler gözetilir:</p><ul><li>Kişisel verileri hukuka ve dürüstlük kurallarına uygun işleme</li><li>Kişisel verileri doğru ve gerektiğinde güncel tutma</li><li>Kişisel verileri belirli, açık ve meşru amaçlarla işleme</li><li>İşlenen verileri ilgili amaçla bağlantılı, sınırlı ve ölçülü tutma</li></ul><h2>2. Veri güvenliği</h2><p>Kişisel verilerin hukuka aykırı erişimini, kaybını veya kötüye kullanımını önlemek için erişim yetkilendirme, güvenli saklama, yedekleme ve düzenli kontrol süreçleri uygulanır.</p><h2>3. İlgili kişi hakları</h2><p>İlgili kişiler, KVKK’nın 11. maddesi kapsamındaki hakları için yürürlükteki başvuru kanallarını kullanabilir. Başvurular yasal süreler içinde değerlendirilerek yanıtlanır.</p></>;

  const metinler: Record<Exclude<BelgeId, "kvkk">, { giris: string; bolumler: Array<[string, string]> }> = {
    "uyelik-aydinlatma": { giris: "Üyelik başvurusu sırasında paylaşılan kişisel verilerin hangi amaçlarla işlendiğini ve nasıl korunduğunu açıklar.", bolumler: [["İşleme amaçları", "Üyelik hesabının oluşturulması, doğrulanması, müşteri iletişiminin yürütülmesi ve hizmetlerin sunulması."], ["Veri güvenliği", "Üyelik bilgileri yalnızca yetkili süreçlerde kullanılır ve gerekli güvenlik tedbirleriyle saklanır."]] },
    "iletisim-aydinlatma": { giris: "İletişim formu üzerinden iletilen ad, iletişim ve mesaj bilgilerinin işlenmesine ilişkin bilgilendirmedir.", bolumler: [["İletişim süreci", "Sorularınızı yanıtlamak ve talebinizle ilgili geri dönüş yapmak için gerekli bilgiler işlenir."], ["Saklama süresi", "Veriler, iletişim amacının gerektirdiği süre ve yasal yükümlülükler kapsamında saklanır."]] },
    "talep-aydinlatma": { giris: "Teklif ve destek taleplerinizin değerlendirilmesi için alınan bilgilerin kullanım esaslarını açıklar.", bolumler: [["Talebin değerlendirilmesi", "Paylaştığınız bilgiler, ihtiyacınıza uygun ürün ve çözüm önerisi hazırlamak için kullanılır."], ["Yetkili erişim", "Talep bilgilerine yalnızca sürecin yürütülmesi için yetkilendirilmiş ekipler erişebilir."]] },
    "veri-basvuru": { giris: "KVKK kapsamındaki başvuru ve taleplerinizi iletmek için kullanılabilecek başvuru esaslarını içerir.", bolumler: [["Başvuru yöntemi", "Kimlik ve iletişim bilgilerinizi içeren başvurunuzu şirketin güncel iletişim kanalları üzerinden iletebilirsiniz."], ["Başvuruların yanıtlanması", "Başvurular, kimlik doğrulaması yapıldıktan sonra yasal süreler içinde sonuçlandırılır."]] },
    "bilgi-toplumu": { giris: "Çevik Elektronik’in elektronik iletişim ve bilgi toplumu hizmetleri hakkında bilgilendirmedir.", bolumler: [["Hizmet bilgileri", "Elektronik ortamda sunulan hizmetlerin kapsamı, kullanım şartları ve iletişim kanalları bu bölümde açıklanır."], ["Güncel bilgiler", "Hizmet koşullarındaki değişiklikler bu sayfa üzerinden duyurulur."]] },
    gizlilik: { giris: "Çevik Elektronik web sitesi ve dijital hizmetlerini kullanırken kişisel bilgilerinizin nasıl korunduğunu açıklar.", bolumler: [["Toplanan bilgiler", "Hizmet sunumu için gerekli hesap, iletişim ve işlem bilgileri işlenebilir."], ["Paylaşım ve güvenlik", "Veriler, yasal zorunluluklar veya hizmetin sunulması için gerekli durumlar dışında üçüncü kişilerle paylaşılmaz."]] },
    cerez: { giris: "Web sitemizde kullanılan çerezlerin amaçlarını ve tercihlerinizi nasıl yönetebileceğinizi açıklar.", bolumler: [["Çerezlerin amacı", "Oturumun sürdürülmesi, güvenli giriş, site performansının ölçülmesi ve kullanıcı deneyiminin iyileştirilmesi."], ["Tercihlerin yönetimi", "Tarayıcı ayarlarınızdan çerezleri silebilir veya engelleyebilirsiniz. Bu durumda bazı hizmetler sınırlı çalışabilir."]] },
    "mesafeli-satis": { giris: "Elektronik ortamda gerçekleştirilen ürün satışlarında tarafların hak ve yükümlülüklerini belirler.", bolumler: [["Sipariş ve ödeme", "Sipariş özeti, ürün bilgileri, teslimat ve ödeme koşulları onay öncesinde kullanıcıya sunulur."], ["Teslimat ve cayma", "Teslimat, cayma ve iade süreçleri yürürlükteki tüketici mevzuatına uygun olarak yürütülür."]] },
    uyelik: { giris: "Çevik Elektronik platformuna üyelik, hesap kullanımı ve tarafların sorumluluklarına ilişkin koşulları içerir.", bolumler: [["Hesap güvenliği", "Üyelik bilgilerinin gizliliğinden kullanıcı sorumludur. Şüpheli erişimlerde destek kanallarımıza başvurulmalıdır."], ["Hizmet kullanımı", "Platform, yürürlükteki mevzuata ve sözleşme koşullarına uygun şekilde kullanılmalıdır."]] },
    iade: { giris: "Ürün iade, cayma ve sipariş iptali süreçlerinin nasıl yürütüleceğini açıklar.", bolumler: [["İade talebi", "İade talebi, sipariş bilgileri ve gerekçesiyle birlikte destek kanallarımız üzerinden iletilir."], ["İnceleme ve sonuç", "Ürün durumu ve ilgili mevzuat incelenerek iade veya değişim süreci hakkında bilgi verilir."]] },
    "bilgi-guvenligi": { giris: "Bilgi varlıklarının gizliliğini, bütünlüğünü ve erişilebilirliğini korumaya yönelik yaklaşımımızdır.", bolumler: [["Temel yaklaşım", "Bilgi varlıkları risk temelli kontroller, erişim yetkilendirme ve düzenli izleme süreçleriyle korunur."], ["Sürekli iyileştirme", "Güvenlik kontrolleri ve farkındalık çalışmaları düzenli olarak gözden geçirilir."]] },
    etik: { giris: "Çalışanlarımızın, iş ortaklarımızın ve tedarikçilerimizin uyması beklenen etik çalışma ilkelerini açıklar.", bolumler: [["Adil ve saygılı çalışma", "Ayrımcılığa, tacize ve zorlayıcı çalışma koşullarına karşı sıfır tolerans uygulanır."], ["Sorumlu iş ilişkileri", "İş ortaklarıyla ilişkiler dürüstlük, şeffaflık ve yürürlükteki mevzuata uyum ilkeleriyle yürütülür."]] },
    entegre: { giris: "Kalite, çevre, iş sağlığı ve güvenliği süreçlerinin birlikte ve ölçülebilir şekilde yönetilmesine ilişkin yaklaşımımızdır.", bolumler: [["Süreç yönetimi", "Müşteri beklentileri, yasal şartlar ve operasyonel riskler dikkate alınarak süreçler izlenir."], ["Hedefler ve iyileştirme", "Performans göstergeleri düzenli olarak değerlendirilir ve iyileştirme çalışmaları planlanır."]] },
  };
  const secilen = metinler[belge];
  return <><p>{secilen.giris}</p>{secilen.bolumler.map(([baslik, metin]) => <section key={baslik}><h2>{baslik}</h2><p>{metin}</p></section>)}</>;
}

function BelgeGrubu({ baslik, belgeler, acik = false, secili, onSec }: { baslik: string; belgeler: Array<[BelgeId, string]>; acik?: boolean; secili: BelgeId; onSec: (id: BelgeId) => void }) {
  return <details open={acik} className="group"><summary className="flex cursor-pointer list-none items-center justify-between text-base font-medium text-metin-marka [&::-webkit-details-marker]:hidden">{baslik}<span className="text-lg leading-none text-metin-ikincil group-open:hidden">+</span><span className="hidden text-lg leading-none text-metin-ikincil group-open:inline">−</span></summary><div className="mt-5 space-y-4 border-l border-kenar pl-4 text-sm text-metin-ikincil">{belgeler.map(([id, ad]) => <button type="button" key={id} onClick={() => onSec(id)} className={`block w-full text-left transition-colors hover:text-vurgu ${secili === id ? "font-semibold text-vurgu" : ""}`}>{secili === id && <span className="mr-2 inline-block h-2 w-2 rounded-sm bg-vurgu" />}{ad}</button>)}</div></details>;
}

export function KvkkClient({ kategoriler }: { kategoriler: Category[] }) {
  const [secili, setSecili] = useState<BelgeId>("kvkk");
  return <div className="flex min-h-screen flex-col bg-yuzey"><SiteHeader categories={kategoriler} /><main id="icerik" className="mx-auto grid w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 md:grid-cols-[280px_minmax(0,1fr)] md:px-0 md:py-14"><aside className="h-fit border-b border-kenar pb-5 md:sticky md:top-24 md:border-b-0 md:border-r md:pb-0 md:pr-8"><nav className="space-y-6" aria-label="Yasal belgeler"><BelgeGrubu baslik="KVKK Aydınlatma Metinleri" belgeler={kvkkBelgeleri} acik secili={secili} onSec={setSecili} /><BelgeGrubu baslik="Gizlilik Politikası ve Sözleşmeler" belgeler={sozlesmeBelgeleri} secili={secili} onSec={setSecili} /><BelgeGrubu baslik="Politikalar" belgeler={politikaBelgeleri} secili={secili} onSec={setSecili} /></nav></aside><article className="min-w-0 px-0 pt-8 md:px-14 md:pt-0"><div className="max-w-3xl"><div className="flex items-center gap-2 text-sm font-bold text-vurgu"><ShieldCheck size={19} /> Yasal Bilgilendirme</div><h1 className="mt-4 text-3xl font-extrabold tracking-tight text-metin-marka md:text-5xl">{belgeBasliklari[secili]}</h1><p className="mt-4 text-sm text-metin-ucuncul">Son güncelleme: 02.02.2026</p></div><div className="prose prose-slate mt-10 max-w-3xl text-metin-ikincil prose-headings:text-metin-marka prose-headings:font-bold prose-a:text-vurgu"><BelgeIcerigi belge={secili} /></div></article></main><SiteFooter /></div>;
}
