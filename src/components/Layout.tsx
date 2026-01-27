import { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { FloatingButtons } from "./FloatingButtons";

interface LayoutProps {
  children: ReactNode;
  showFloating?: boolean;
}

export function Layout({ children, showFloating = true }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      {showFloating && <FloatingButtons />}
    </div>
  );
}
