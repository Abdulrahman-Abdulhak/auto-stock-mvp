import { AppContainer, Logo } from "@components";
import { navLinks } from "@lib/routing";

import Navbar from "./Navbar";

function Header() {
  return (
    <header className="bg-primary text-primary-foreground py-4">
      <AppContainer>
        <div className="flex items-center gap-2">
          <Logo className="text-heading-4" />
          <Navbar links={navLinks} />
        </div>
      </AppContainer>
    </header>
  );
}

export default Header;
