
import { Toggle } from "../Toggle/Toggle";
import "./ToggleDarkMode.css";

export function ToggleDarkMode() {
  return (
    <Toggle className="pill-shape" storage={localStorage} storageKey="dark-mode" />
  );
}
