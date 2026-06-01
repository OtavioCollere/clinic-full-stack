import { PortalLayout } from "@/components/layout";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PortalLayout portal="patient">{children}</PortalLayout>;
}
