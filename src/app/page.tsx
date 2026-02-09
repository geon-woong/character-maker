import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Sparkles } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center gap-8 px-4 py-24">
      <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
        Character Maker
      </h1>
      <p className="max-w-md text-center text-lg text-gray-600">
        파츠를 조합해서 나만의 캐릭터를 만들어보세요.
      </p>
      <Link href="/maker">
        <Button size="lg" className="gap-2">
          <Sparkles className="h-5 w-5" />
          캐릭터 만들기
        </Button>
      </Link>
    </div>
  );
}
