import { Outlet } from "react-router-dom";

export default function SettingLayout() {
  return (
    <div className="w-full min-h-[calc(100vh-4.5rem)] overflow-y-auto bg-background text-foreground font-sans p-4 md:p-8">
      <Outlet />
    </div>
  );
}