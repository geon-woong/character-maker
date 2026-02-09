'use client';

import { Shuffle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useCharacterStore } from '@/stores/character-store';
import { toast } from 'sonner';

export function RandomizeButton() {
  const randomizeAll = useCharacterStore((s) => s.randomizeAll);

  const handleRandomize = () => {
    randomizeAll();
    toast.success('랜덤 조합 완료!');
  };

  return (
    <Button variant="secondary" onClick={handleRandomize} className="gap-2">
      <Shuffle className="h-4 w-4" />
      랜덤 조합
    </Button>
  );
}
