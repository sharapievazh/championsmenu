import * as React from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchProductPrices, type StorePrice } from "@/services/priceService";

interface PriceCompareModalProps {
  productName: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PriceCompareModal({ productName, open, onOpenChange }: PriceCompareModalProps) {
  const [prices, setPrices] = React.useState<StorePrice[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!open || !productName) return;
    setLoading(true);
    fetchProductPrices(productName)
      .then((data) => setPrices(data))
      .finally(() => setLoading(false));
  }, [open, productName]);

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="rounded-t-[24px] bg-background">
        <DrawerHeader className="px-5 pt-2 pb-0 text-center">
          <DrawerTitle className="text-xl font-semibold tracking-tight text-foreground">
            {productName ? `Цены на «${productName}»` : "Цены"}
          </DrawerTitle>
        </DrawerHeader>

        <div className="px-5 pb-8 pt-4 space-y-3">
          {loading && (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 rounded-2xl bg-card p-4 shadow-soft"
                >
                  <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <Skeleton className="h-9 w-20 rounded-xl" />
                </div>
              ))}
            </div>
          )}

          {!loading && prices.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              Нет данных о ценах
            </p>
          )}

          {!loading &&
            prices.map((store) => (
              <div
                key={store.store}
                className="flex items-center gap-4 rounded-2xl bg-card p-4 shadow-soft"
              >
                <span className="text-2xl shrink-0">{store.logo}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold text-foreground truncate">
                    {store.store}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span
                      className={`text-lg font-bold ${
                        store.isCheapest ? "text-green-500" : "text-foreground"
                      }`}
                    >
                      {store.price} {store.currency}
                    </span>
                    {store.isCheapest && (
                      <span className="inline-flex items-center rounded-full bg-primary px-2.5 py-0.5 text-xs font-medium text-primary-foreground">
                        Выгодно
                      </span>
                    )}
                  </div>
                </div>
                <a
                  href={store.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors shrink-0"
                >
                  Купить
                </a>
              </div>
            ))}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
