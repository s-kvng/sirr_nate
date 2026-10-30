import { SystemHero } from "@/components/system/system-hero";
import { gates } from "@/content/gates";
import { profile } from "@/content/profile";

export default function Home() {
  return <SystemHero profile={profile} gates={gates} />;
}
