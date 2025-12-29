import { NextIntlClientProvider } from "next-intl";

type Props = {
  /** Children elements to be wrapped by the provider */
  children: React.ReactNode;
};

/**
 * Provides internationalization context using `NextIntlClientProvider`.
 * @returns The provider component that renders `children` inside `NextIntlClientProvider`.
 */
function InternationalizationProvider({ children }: Props) {
  return <NextIntlClientProvider>{children}</NextIntlClientProvider>;
}

export default InternationalizationProvider;
