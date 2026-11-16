import React from 'react';
import { MobileFooter } from '@/components/layout/MobileFooter';

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="pb-16 sm:pb-8">
      {children}
      <MobileFooter />
    </div>
  );
}
