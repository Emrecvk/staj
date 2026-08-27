const fs = require('fs');
const path = 'src/components/home/vitrin-sekmeleri.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  '<h3 className="text-sm font-bold text-metin-marka line-clamp-1">',
  '<h3 className="text-base font-bold text-metin-marka line-clamp-1">'
);

content = content.replace(
  '<p className="text-[11px] text-metin-ikincil line-clamp-1 mt-1 uppercase" title={product.kisaAciklama}>',
  '<p className="text-xs text-metin-ikincil line-clamp-1 mt-1 uppercase" title={product.kisaAciklama}>'
);

content = content.replace(
  '<span className="text-[10px] font-semibold text-[#12ae8c]">{product.toplamStok} STOKTA</span>',
  '<span className="text-[11px] font-semibold text-[#12ae8c]">{product.toplamStok.toLocaleString("tr-TR")} STOKTA</span>'
);

content = content.replace(
  '<div className="flex gap-1.5">\n                        <span className="text-[#1834b8] bg-[#1834b8]/10 p-1 rounded"><FileText size={12} /></span>\n                      </div>',
  '<div className="flex gap-1.5 cursor-pointer text-[#1834b8] hover:text-[#11288f] transition-colors"><FileText size={18} fill="currentColor" /></div>'
);

const newQuantity = '<div className="mt-4 mx-2 flex h-[38px] items-center justify-between rounded-full bg-white border border-kenar px-1">\\n                      <button type="button" className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f0f2f5] text-metin hover:bg-[#e2e6eb] transition-colors">-</button>\\n                      <span className="text-sm font-bold text-metin">1</span>\\n                      <button type="button" className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f0f2f5] text-metin hover:bg-[#e2e6eb] transition-colors">+</button>\\n                    </div>';

content = content.replace(
  /<div className="mt-3 mx-2 flex h-9 items-center justify-between rounded-full bg-yuzey-gomulu border border-kenar">[\s\S]*?<\/div>/,
  newQuantity.replace(/\\n/g, '\n')
);

fs.writeFileSync(path, content, 'utf8');
