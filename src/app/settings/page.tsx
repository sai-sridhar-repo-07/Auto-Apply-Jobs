import { SettingsContent } from "@/components/settings/SettingsContent";

export default function SettingsPage() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1>Settings</h1>
        <p className="text-muted-foreground mt-1">Configure your profile, API keys, and preferences</p>
      </div>
      <SettingsContent />
    </div>
  );
}
