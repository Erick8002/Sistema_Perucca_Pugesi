import logoImg from '../assets/Logo.png';
export default function Sidebar() {
  return (
    <aside className="sticky top-0 flex h-screen w-16 shrink-0 flex-col items-center border-r border-gray-200 bg-white py-4 sm:w-24 sm:py-6 lg:w-36">
      <img src={logoImg} alt="Logo" className="w-12 sm:w-16 lg:w-28" />
    </aside>
  );
}