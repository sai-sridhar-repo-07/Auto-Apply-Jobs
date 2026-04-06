import { SettingsContent } from "@/components/settings/SettingsContent";

export default function SettingsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Configure your profile, API keys, and preferences</p>
      </div>
      <SettingsContent />
    </div>
  );
}
