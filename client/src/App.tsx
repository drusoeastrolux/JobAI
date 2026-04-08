import { useState } from "react";
import RuixenMoonChat from "@/components/ui/ruixen-moon-chat";
import LandingPage from "@/components/ui/LandingPage";

const VIEW_KEY = "ruixen_view";

export default function App() {
  const [view, setView] = useState<"landing" | "chat">(
    () => (localStorage.getItem(VIEW_KEY) === "chat" ? "chat" : "landing")
  );

  const goToChat = () => {
    localStorage.setItem(VIEW_KEY, "chat");
    setView("chat");
  };

  const goToLanding = () => {
    localStorage.setItem(VIEW_KEY, "landing");
    setView("landing");
  };

  if (view === "chat") {
    return <RuixenMoonChat onBack={goToLanding} />;
  }

  return <LandingPage onLaunchChat={goToChat} />;
}
