const fs = require('fs');
const path = 'src/components/home/vitrin-sekmeleri.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /<span className="text-\[10px\] font-semibold text-\[#12ae8c\]">\s*\{product\.toplamStok\} STOKTA\s*<\/span>/,
  '<span className="text-[11px] font-semibold text-[#12ae8c]">{product.toplamStok.toLocaleString("tr-TR")} STOKTA</span>'
);

content = content.replace(
  /<div className="flex gap-1\.5">\s*<span className="text-\[#1834b8\] bg-\[#1834b8\]\/10 p-1 rounded"><FileText size=\{12\} \/><\/span>\s*<\/div>/,
  '<div className="flex gap-1.5 cursor-pointer text-[#1834b8] hover:text-[#11288f] transition-colors"><FileText size={18} fill="currentColor" /></div>'
);

fs.writeFileSync(path, content, 'utf8');
