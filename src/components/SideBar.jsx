import DoubleSidebar from "./ui/DoubleSidebar";

export default function SideBar({ mobile = false, onNavigate }) {
  return <DoubleSidebar mobile={mobile} onNavigate={onNavigate} />;
}
