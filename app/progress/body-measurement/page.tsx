import { AppShell } from "@/components/layout/app-shell";
import { BodyMeasurementForm } from "./body-measurement-form";
import { BodyMeasurementSummary } from "./body-measurement-summary";

export default function BodyMeasurementPage() {
  return (
    <AppShell title="Body Measurement" eyebrow="Track physique changes">
      <BodyMeasurementSummary />
      <BodyMeasurementForm />
    </AppShell>
  );
}
