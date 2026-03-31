import { SocialLinks } from "./social-links";

export function Footer() {
  return (
    <footer className="border-t border-border/50">
      <div className="mx-auto flex max-w-3xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Marcus Ruud. All rights reserved.
        </p>
        <SocialLinks />
      </div>
    </footer>
  );
}
