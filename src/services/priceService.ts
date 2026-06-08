// Мок-сервис сравнения цен. Чтобы перейти на реальный бэкенд — перепиши только
// тело fetchProductPrices, сохранив сигнатуру и тип StorePrice.

export interface StorePrice {
  store: string;       // название магазина
  logo: string;        // эмодзи как запасной вариант логотипа
  price: number;       // цена в тенге
  currency: string;    // "₸"
  url: string;         // диплинк на поиск товара в магазине
  isCheapest: boolean; // самое выгодное предложение
}

interface StoreConfig {
  name: string;
  logo: string;
  factor: number;                 // относительный уровень цен магазина
  buildUrl: (q: string) => string;
}

const STORES: StoreConfig[] = [
  { name: "Magnum",  logo: "🟡", factor: 1.0,  buildUrl: (q) => `https://magnum.kz/search?q=${encodeURIComponent(q)}` },
  { name: "Arbuz",   logo: "🍉", factor: 1.08, buildUrl: (q) => `https://arbuz.kz/ru/almaty/catalog/search?query=${encodeURIComponent(q)}` },
  // URL поиска Galmart и Small предположительные — проверь и при необходимости поправь:
  { name: "Galmart", logo: "🟢", factor: 1.12, buildUrl: (q) => `https://galmart.kz/search?text=${encodeURIComponent(q)}` },
  { name: "Small",   logo: "🔵", factor: 0.95, buildUrl: (q) => `https://small.kz/search?q=${encodeURIComponent(q)}` },
];

// Стабильный псевдо-хеш: цена одного товара не «прыгает» между открытиями окна.
function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) { h = (h << 5) - h + str.charCodeAt(i); h |= 0; }
  return Math.abs(h);
}

export async function fetchProductPrices(productName: string): Promise<StorePrice[]> {
  // Имитация парсинга цен в реальном времени.
  await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 500));

  const base = 200 + (hash(productName) % 600); // базовая цена 200–800 ₸
  const prices: StorePrice[] = STORES.map((s) => {
    const jitter = ((hash(productName + s.name) % 21) - 10) / 100; // ±10%
    const price = Math.max(50, Math.round((base * s.factor * (1 + jitter)) / 5) * 5);
    return { store: s.name, logo: s.logo, price, currency: "₸", url: s.buildUrl(productName), isCheapest: false };
  });

  prices.sort((a, b) => a.price - b.price); // дешёвые сверху
  if (prices.length > 0) prices[0].isCheapest = true;
  return prices;
}
