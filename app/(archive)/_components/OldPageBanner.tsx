import Link from 'next/link';

export default function OldPageBanner() {
  return (
    <div className="bg-rose-900/90 text-white px-4 py-2 text-center text-sm">
      Digging through the archives?{' '}
      <Link
        href="/"
        className="underline font-medium hover:text-rose-200 transition-colors"
      >
        new portfolio this way →
      </Link>
    </div>
  );
}
