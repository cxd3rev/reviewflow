import { Link } from "react-router-dom";
import { AyvWrldLogo, Logo } from "../../components/ui/Logo.jsx";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-[#0a0a0a]/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 md:px-6">
        <div className="flex min-w-0 items-center gap-4 md:gap-6">
          <Logo variant="wordmark" />
          <span className="hidden h-6 w-px bg-white/10 sm:block" aria-hidden="true" />
          <AyvWrldLogo className="ayv-on-dark hidden h-16 w-auto sm:block md:h-[4.5rem]" />
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link to="/signup" className="btn-primary px-4 sm:px-5">
            Get started
          </Link>
          <Link to="/login" className="btn-ghost border border-white/20 px-4 sm:px-5 text-white">
            Login
          </Link>
        </div>
      </div>
    </header>
  );
}
