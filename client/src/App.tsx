import { useState } from "react";
import RuixenMoonChat from "@/components/ui/ruixen-moon-chat";
import LandingPage from "@/components/ui/LandingPage";

export default function App() {
  const [view, setView] = useState<"landing" | "chat">("landing");

  if (view === "chat") {
    return <RuixenMoonChat onBack={() => setView("landing")} />;
  }

  return <LandingPage onLaunchChat={() => setView("chat")} />;
}
