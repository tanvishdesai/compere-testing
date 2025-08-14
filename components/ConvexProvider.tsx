"use client";

import { ConvexProvider as ConvexProviderBase, ConvexReactClient } from "convex/react";
import { useState, useEffect } from "react";

export function ConvexProvider({ children }: { children: React.ReactNode }) {
  const [client, setClient] = useState<ConvexReactClient | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (convexUrl) {
      setClient(new ConvexReactClient(convexUrl));
    }
  }, []);

  // During SSR or if client is not available, render children without ConvexProvider
  if (!isClient || !client) {
    return <>{children}</>;
  }

  return (
    <ConvexProviderBase client={client}>
      {children}
    </ConvexProviderBase>
  );
}
