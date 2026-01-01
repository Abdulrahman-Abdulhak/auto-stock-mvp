"use client";

import { z } from "zod";

import { useState } from "react";
import { PlusIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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

const MAX_NAME_LENGTH = 120;
const MAX_SKU_LENGTH = 64;

function translatedSchema(t: ReturnType<typeof useTranslations>) {
  return z.object({
    name: z
      .string()
      .trim()
      .min(2, t("errors.name.required"))
      .max(MAX_NAME_LENGTH, t("errors.name.tooLong")),

    sku: z
      .string()
      .trim()
      .min(2, t("errors.sku.required"))
      .max(MAX_SKU_LENGTH, t("errors.sku.tooLong"))
      // allow letters/numbers plus - _ . (common SKU patterns)
      .regex(/^[A-Za-z0-9][A-Za-z0-9._-]*$/, t("errors.sku.invalidChars")),

    minStockLevel: z.coerce
      .number()
      .int(t("errors.minStockLevel.integer"))
      .min(0, t("errors.minStockLevel.notNegative"))
      .default(0),

    currentStock: z.coerce
      .number()
      .int(t("errors.currentStock.integer"))
      .min(0, t("errors.currentStock.notNegative"))
      .default(0),
  });
}

export type CreateProductInput = z.input<ReturnType<typeof translatedSchema>>;
export type CreateProduct = z.output<ReturnType<typeof translatedSchema>>;

type ApiError = Error & { fields?: Record<string, string> };

function AddProduct() {
  const productsT = useTranslations("products");
  const formT = useTranslations("form");
  const commonT = useTranslations("common");

  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<CreateProductInput, unknown, CreateProduct>({
    resolver: zodResolver(translatedSchema(formT)),
    defaultValues: {
      name: "",
      sku: "",
      currentStock: 0,
      minStockLevel: 0,
    },
  });

  const createProduct = useMutation({
    mutationFn: async (values: CreateProduct) => {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const error = new Error(
          data?.error ?? `Failed to create product (${res.status})`
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
        name: "",
        sku: "",
        currentStock: 0,
        minStockLevel: 0,
      });
      setOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error: ApiError) => {
      if (error?.fields) {
        for (const [field, message] of Object.entries(error.fields)) {
          form.setError(field as keyof CreateProduct, { message });
        }
      }
    },
  });

  function onSubmit(values: CreateProduct) {
    createProduct.mutate(values);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg">
          <PlusIcon />
          <span className="capitalize">{productsT("buttons.addProduct")}</span>
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader
          className="capitalize mx-auto"
          title={productsT("popups.createNewProduct.title")}
        >
          <DialogTitle>
            {productsT("popups.createNewProduct.title")}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-3"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="capitalize">
                    {formT("name.labels.createNewProduct")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={formT(
                        "name.placeholders.createNewProduct"
                      ).capitalizeSentence()}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="uppercase">
                    {formT("sku.labels.createNewProduct")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={formT(
                        "sku.placeholders.createNewProduct"
                      ).capitalizeSentence()}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="minStockLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="capitalize">
                    {formT("minStockLevel.labels.createNewProduct")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      inputMode="numeric"
                      value={(field.value as string) ?? ""}
                      onChange={(event) => field.onChange(event.target.value)}
                      placeholder={formT(
                        "minStockLevel.placeholders.createNewProduct"
                      ).capitalizeSentence()}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="currentStock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="capitalize">
                    {formT("currentStock.labels.createNewProduct")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      inputMode="numeric"
                      value={(field.value as string) ?? ""}
                      onChange={(event) => field.onChange(event.target.value)}
                      placeholder={formT(
                        "currentStock.placeholders.createNewProduct"
                      ).capitalizeSentence()}
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
                disabled={createProduct.isPending}
              >
                {formT("submit.labels.createNewProduct")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default AddProduct;
