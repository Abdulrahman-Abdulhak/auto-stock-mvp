import { Logo } from "@components";
import Navbar from "./Navbar";

const links = [
  {
    label: "dashboard.label",
    href: "/dashboard",
  },
  {
    label: "products.label",
    href: "/products",
  },
  {
    label: "batches.label",
    href: "/batches",
  },
  {
    label: "transactions.label",
    href: "/transactions",
  },
  {
    label: "reports.label",
    href: "/reports",
  },
];

function Header() {
  return (
    <header className="bg-primary text-primary-foreground py-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Logo className="text-heading-4" />
          <Navbar links={links} />
        </div>
      </div>
    </header>
  );
}

export default Header;
