import { Metadata } from 'next';
import { SyncDemo } from './SyncDemo';

export const metadata: Metadata = {
  title: 'Sync Engine Demo',
  description:
    "A sync engine built from scratch, inspired by Linear's architecture.",
};

export default function SyncPage() {
  return <SyncDemo />;
}
