// src/app/page.tsx
import { UnifiedWorkspaceDashboard } from "@/components/dashboard";

export default function HomePage() {
  // You might add authentication checks or redirects here if needed
  // before rendering the dashboard.
  return (
      <UnifiedWorkspaceDashboard />
  );
}
