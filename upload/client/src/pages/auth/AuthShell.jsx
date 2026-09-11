import { Logo } from "../../components/ui/Logo.jsx";

export function AuthShell({ title, subtitle, children }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo variant="wordmark" />
        </div>
        <div className="card p-8">
          <h1 className="display text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1.5 mb-6 text-sm leading-6 text-muted">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}
