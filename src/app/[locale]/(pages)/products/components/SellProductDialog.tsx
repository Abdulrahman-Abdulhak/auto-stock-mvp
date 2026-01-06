"use client";

import { z } from "zod";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shadecn";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Searchbar } from "@components";

import type { ProductRow } from "./types";

type SellProductDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialProduct?: ProductRow | null;
};

type ProductOption = {
  id: number;
  name: string;
  sku: string;
};

type ProductsResponse = {
  data: ProductOption[];
};

type SellResponse = {
  data: {
    allocations: {
      batchId: number;
      expiresAt: string;
      qtyInBase: number;
    }[];
  };
};

function translatedSchema(t: ReturnType<typeof useTranslations>) {
  return z.object({
    productId: z.preprocess((value) => {
      if (value == null || value === "") return -1;
      const num = Number(value);
      return Number.isFinite(num) ? num : -1;
    }, z.number().int().min(1, t("errors.productId.required"))),
    qtyToSell: z.coerce
      .number()
      .int(t("errors.qtyToSell.integer"))
      .min(1, t("errors.qtyToSell.min")),
  });
}

type SellFormInput = z.input<ReturnType<typeof translatedSchema>>;
type SellForm = z.output<ReturnType<typeof translatedSchema>>;

type ApiError = Error & { fields?: Record<string, string> };

async function getProducts(args: {
  q?: string;
  signal?: AbortSignal;
}): Promise<ProductOption[]> {
  const params = new URLSearchParams();
  params.set("page", "1");
  params.set("pageSize", "20");
  if (args.q) params.set("q", args.q);

  const res = await fetch(`/api/products?${params.toString()}`, {
    method: "GET",
    headers: { "content-type": "application/json" },
    cache: "no-store",
    signal: args.signal,
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(`Failed to load products (${res.status}). ${msg}`);
  }

  const data = (await res.json()) as ProductsResponse;
  return data.data ?? [];
}

function SellProductDialog({
  open,
  onOpenChange,
  initialProduct,
}: SellProductDialogProps) {
  const formT = useTranslations("form");
  const commonT = useTranslations("common");
  const queryClient = useQueryClient();

  const [productSearch, setProductSearch] = useState("");
  const [resultOpen, setResultOpen] = useState(false);
  const [resultData, setResultData] = useState<SellResponse | null>(null);

  const form = useForm<SellFormInput, unknown, SellForm>({
    resolver: zodResolver(translatedSchema(formT)),
    defaultValues: {
      productId: "",
      qtyToSell: 1,
    },
  });

  useEffect(() => {
    if (!open) return;
    if (initialProduct?.id) {
      form.setValue("productId", String(initialProduct.id), {
        shouldValidate: true,
      });
    }
  }, [form, initialProduct, open]);

  const productsQuery = useQuery({
    queryKey: ["products", `products-search-${productSearch}`],
    queryFn: ({ signal }) => getProducts({ q: productSearch, signal }),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: 1,
  });

  const productOptions = useMemo(() => {
    const options = productsQuery.data ?? [];
    if (!initialProduct) return options;
    const hasInitial = options.some((p) => p.id === initialProduct.id);
    if (hasInitial) return options;
    return [
      {
        id: initialProduct.id,
        name: initialProduct.name,
        sku: initialProduct.sku,
      },
      ...options,
    ];
  }, [initialProduct, productsQuery.data]);

  const sellMutation = useMutation({
    mutationFn: async (values: SellForm) => {
      const res = await fetch("/api/products/sell", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          productId: values.productId,
          qtyToSell: values.qtyToSell,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const error = new Error(
          data?.error ?? `Failed to sell product (${res.status})`
        ) as ApiError;
        if (data?.fields && typeof data.fields === "object") {
          error.fields = data.fields as Record<string, string>;
        }
        throw error;
      }

      return (await res.json()) as SellResponse;
    },
    onSuccess: async (data) => {
      setResultData(data);
      setResultOpen(true);
      onOpenChange(false);
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      await queryClient.invalidateQueries({ queryKey: ["batches"] });
    },
    onError: (error: ApiError) => {
      if (error?.fields) {
        for (const [field, message] of Object.entries(error.fields)) {
          form.setError(field as keyof SellForm, { message });
        }
      }
    },
  });

  function onSubmit(values: SellForm) {
    sellMutation.mutate(values);
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader title={formT("sell.popups.title")}>
            <DialogTitle>{formT("sell.popups.title")}</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-3"
            >
              <Searchbar
                onDebouncedChange={setProductSearch}
                section="products"
              />
              <FormField
                control={form.control}
                name="productId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="capitalize">
                      {formT("productSelect.labels.sellProduct")}
                    </FormLabel>
                    <FormControl>
                      <Select
                        {...field}
                        value={(field.value as string) ?? ""}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder={formT(
                              "productSelect.placeholders.sellProduct"
                            )}
                          />
                        </SelectTrigger>
                        <SelectContent className="w-full">
                          {productsQuery.isLoading ? (
                            <SelectItem value="loading" disabled>
                              {commonT("state.loading")}
                            </SelectItem>
                          ) : null}
                          {productsQuery.isError ? (
                            <SelectItem value="error" disabled>
                              {commonT("state.failedToLoadProducts")}
                            </SelectItem>
                          ) : null}
                          {productOptions.map((product) => (
                            <SelectItem
                              key={product.id}
                              value={`${product.id}`}
                            >
                              {product.name} ({product.sku})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="qtyToSell"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="capitalize">
                      {formT("qtyToSell.labels.sellProduct")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        inputMode="numeric"
                        value={(field.value as string) ?? ""}
                        onChange={(event) => field.onChange(event.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-between items-center">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => onOpenChange(false)}
                >
                  {commonT("buttons.cancel")}
                </Button>
                <Button
                  type="submit"
                  className="capitalize"
                  disabled={sellMutation.isPending}
                >
                  {formT("sell.buttons.submit")}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={resultOpen} onOpenChange={setResultOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{formT("sell.popups.resultTitle")}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-2 text-sm">
            {resultData?.data.allocations?.length ? (
              resultData.data.allocations.map((allocation) => (
                <div
                  key={allocation.batchId}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="font-mono text-xs">
                    {formT("sell.popups.batchLabel", {
                      id: allocation.batchId,
                    })}
                  </div>
                  <div className="text-muted-foreground">
                    {new Date(allocation.expiresAt).toLocaleDateString()}
                  </div>
                  <div className="font-medium">{allocation.qtyInBase}</div>
                </div>
              ))
            ) : (
              <div>{formT("sell.popups.emptyResult")}</div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default SellProductDialog;
