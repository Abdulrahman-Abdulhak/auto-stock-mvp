"use client";

import { z } from "zod";

import { useState } from "react";
import { PlusIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from "@shadecn";
import { useForm } from "react-hook-form";

const emptyToUndefined = (value: unknown) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
};

type ProductOption = {
  id: number;
  name: string;
  sku: string;
};

type ProductsResponse = {
  data: ProductOption[];
};

function translatedSchema(t: ReturnType<typeof useTranslations>) {
  return z.object({
    productId: z.preprocess((value) => {
      if (value == null || value === "") return undefined;
      const num = Number(value);
      return Number.isFinite(num) ? num : value;
    }, z.number().int().min(1, "Product is required.")),
    qtyReceived: z.coerce
      .number()
      .int(t("errors.currentStock.integer"))
      .min(0, t("errors.currentStock.notNegative"))
      .default(0),
    expiresAt: z.preprocess(
      emptyToUndefined,
      z.string().min(1, "Expiration date is required.")
    ),
  });
}

export type CreateBatchInput = z.input<ReturnType<typeof translatedSchema>>;
export type CreateBatch = z.output<ReturnType<typeof translatedSchema>>;

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

function AddBatch() {
  const batchesT = useTranslations("batches");
  const formT = useTranslations("form");
  const commonT = useTranslations("common");

  const [open, setOpen] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const queryClient = useQueryClient();

  const form = useForm<CreateBatchInput, unknown, CreateBatch>({
    resolver: zodResolver(translatedSchema(formT)),
    defaultValues: {
      productId: "",
      qtyReceived: 0,
      expiresAt: "",
    },
  });

  const productsQuery = useQuery({
    queryKey: ["products", `products-search-${productSearch}`],
    queryFn: ({ signal }) => getProducts({ q: productSearch, signal }),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: 1,
  });

  const createBatch = useMutation({
    mutationFn: async (values: CreateBatch) => {
      const res = await fetch("/api/batches", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          productId: values.productId,
          qtyReceived: values.qtyReceived,
          expiresAt: values.expiresAt,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const error = new Error(
          data?.error ?? `Failed to create batch (${res.status})`
        ) as ApiError;
        if (data?.fields && typeof data.fields === "object") {
          error.fields = data.fields as Record<string, string>;
        }
        throw error;
      }

      return res.json();
    },
    onSuccess: async () => {
      form.reset({
        productId: "",
        qtyReceived: 0,
        expiresAt: "",
      });
      setOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["batches"] });
    },
    onError: (error: ApiError) => {
      if (error?.fields) {
        for (const [field, message] of Object.entries(error.fields)) {
          form.setError(field as keyof CreateBatch, { message });
        }
      }
    },
  });

  function onSubmit(values: CreateBatch) {
    createBatch.mutate(values);
  }

  const productOptions = productsQuery.data ?? [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg">
          <PlusIcon />
          <span className="capitalize">
            {batchesT("buttons.createNewBatch")}
          </span>
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader
          className="capitalize mx-auto"
          title={batchesT("popups.createNewBatch.title")}
        >
          <DialogTitle>{batchesT("popups.createNewBatch.title")}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-3"
          >
            <FormItem>
              <FormLabel className="capitalize">product search</FormLabel>
              <FormControl>
                <Input
                  value={productSearch}
                  onChange={(event) => setProductSearch(event.target.value)}
                  placeholder="Search products..."
                />
              </FormControl>
            </FormItem>
            <FormField
              control={form.control}
              name="productId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="capitalize">product</FormLabel>
                  <FormControl>
                    <select
                      value={(field.value as string) ?? ""}
                      onChange={(event) => field.onChange(event.target.value)}
                      className="border-input h-9 w-full rounded-md border bg-transparent px-3 text-sm"
                    >
                      <option value="">Select a product</option>
                      {productsQuery.isLoading ? (
                        <option value="" disabled>
                          Loading...
                        </option>
                      ) : null}
                      {productsQuery.isError ? (
                        <option value="" disabled>
                          Failed to load products
                        </option>
                      ) : null}
                      {productOptions.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name} ({product.sku})
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="qtyReceived"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="capitalize">
                    initial received quantity
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      inputMode="numeric"
                      value={(field.value as string) ?? ""}
                      onChange={(event) => field.onChange(event.target.value)}
                      placeholder="0"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="expiresAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="capitalize">expiry date</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="date"
                      value={(field.value as string) ?? ""}
                      onChange={(event) => field.onChange(event.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-between items-center">
              <Button variant="secondary" onClick={() => setOpen(false)}>
                {commonT("buttons.cancel")}
              </Button>
              <Button
                type="submit"
                className="capitalize"
                disabled={createBatch.isPending}
              >
                {formT("submit.labels.createNewBatch")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default AddBatch;
