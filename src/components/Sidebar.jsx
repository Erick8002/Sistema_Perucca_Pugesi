import React from 'react';
import logoImg from '../assets/Logo.png';

export default function Sidebar() {
  return (
    <aside className="w-36 bg-white border-r border-gray-200 flex flex-col items-center py-6 shrink-0">
      <img src={logoImg} alt="Logo" className="w-28"/>
      
    </aside>
  );
}