"use client";

import { z } from "zod";

import { useState } from "react";
import { Loader2, PlusIcon } from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shadecn";
import { useForm } from "react-hook-form";
import { Searchbar } from "@components";

type ProductOption = {
  id: number;
  name: string;
  sku: string;
};

type ProductsResponse = {
  data: ProductOption[];
};

type UnitOption = {
  id: number;
  code: string;
};

type UnitsResponse = {
  data: UnitOption[];
};

function translatedSchema(t: ReturnType<typeof useTranslations>) {
  return z.object({
    productId: z.preprocess((value) => {
      if (value == null || value === "") return -1;
      const num = Number(value);
      return Number.isFinite(num) ? num : -1;
    }, z.number().int().min(1, t("errors.productId.required"))),
    unitId: z.preprocess((value) => {
      if (value == null || value === "") return -1;
      const num = Number(value);
      return Number.isFinite(num) ? num : -1;
    }, z.number().int().min(1, t("errors.unitId.required"))),
    qtyReceived: z.coerce
      .number()
      .int(t("errors.currentStock.integer"))
      .min(0, t("errors.currentStock.notNegative"))
      .default(0),
    expiresAt: z.preprocess(
      (value) => (typeof value === "string" ? value.trim() : ""),
      z
        .string()
        .min(1, t("errors.expiresAt.required"))
        .refine((value) => {
          const date = new Date(`${value}T00:00:00`);
          return !Number.isNaN(date.getTime());
        }, t("errors.expiresAt.invalid"))
        .refine((value) => {
          const date = new Date(`${value}T00:00:00`);
          const tomorrow = new Date();
          tomorrow.setHours(0, 0, 0, 0);
          tomorrow.setDate(tomorrow.getDate() + 1);
          return date >= tomorrow;
        }, t("errors.expiresAt.atLeastTomorrow"))
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

async function getUnits(args: { signal?: AbortSignal }): Promise<UnitOption[]> {
  const res = await fetch("/api/units", {
    method: "GET",
    headers: { "content-type": "application/json" },
    cache: "no-store",
    signal: args.signal,
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(`Failed to load units (${res.status}). ${msg}`);
  }

  const data = (await res.json()) as UnitsResponse;
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
      unitId: "",
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

  const unitsQuery = useQuery({
    queryKey: ["units"],
    queryFn: ({ signal }) => getUnits({ signal }),
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
          unitId: values.unitId,
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
        unitId: "",
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
  const unitOptions = unitsQuery.data ?? [];

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
            <Searchbar
              onDebouncedChange={setProductSearch}
              section="createNewBatch"
            />
            <FormField
              control={form.control}
              name="productId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="capitalize">
                    {formT("productSelect.labels.createNewBatch")}
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
                            "productSelect.placeholders.createNewBatch"
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
                          <SelectItem key={product.id} value={`${product.id}`}>
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
              name="unitId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="capitalize">
                    {formT("unitSelect.labels.createNewBatch")}
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
                            "unitSelect.placeholders.createNewBatch"
                          )}
                        />
                      </SelectTrigger>
                      <SelectContent className="w-full">
                        {unitsQuery.isLoading ? (
                          <SelectItem value="loading" disabled>
                            {commonT("state.loading")}
                          </SelectItem>
                        ) : null}
                        {unitsQuery.isError ? (
                          <SelectItem value="error" disabled>
                            {commonT("state.failedToLoadUnits")}
                          </SelectItem>
                        ) : null}
                        {unitOptions.map((unit) => (
                          <SelectItem key={unit.id} value={`${unit.id}`}>
                            {unit.code}
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
              name="qtyReceived"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="capitalize">
                    {formT("qtyReceived.labels.createNewBatch")}
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
            <FormField
              control={form.control}
              name="expiresAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="capitalize">
                    {formT("expiresAt.labels.createNewBatch")}
                  </FormLabel>
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
                {createBatch.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  formT("submit.labels.createNewBatch")
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default AddBatch;
