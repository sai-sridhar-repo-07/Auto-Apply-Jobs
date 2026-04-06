import { SettingsContent } from "@/components/settings/SettingsContent";

export default function SettingsPage() {
  return (
    <div className="p-8 max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-1">Configure your profile, API key, and how JobCraft works</p>
      </div>
      <SettingsContent />
    </div>
  );
}
