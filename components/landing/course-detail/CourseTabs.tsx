'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, HelpCircle, User } from 'lucide-react';

type Props = {
  contentSlot: React.ReactNode;
  instructorSlot: React.ReactNode;
  faqSlot: React.ReactNode | null;
};

export function CourseTabs({ contentSlot, instructorSlot, faqSlot }: Props) {
  const [tab, setTab] = useState<string>('content');

  return (
    <Tabs
      value={tab}
      onValueChange={(v) => setTab(v as string)}
      className="gap-6"
    >
      <div className="border-b border-border">
        <TabsList
          variant="line"
          className="-mb-px w-full justify-start flex-wrap"
        >
          <TabsTrigger value="content" className="px-3 sm:px-4 gap-2">
            <BookOpen className="size-4" /> Contenido
          </TabsTrigger>
          <TabsTrigger value="instructor" className="px-3 sm:px-4 gap-2">
            <User className="size-4" /> Instructor
          </TabsTrigger>

          {faqSlot && (
            <TabsTrigger value="faq" className="px-3 sm:px-4 gap-2">
              <HelpCircle className="size-4" /> FAQ
            </TabsTrigger>
          )}
        </TabsList>
      </div>

      <TabsContent value="content" className="pt-2">
        {contentSlot}
      </TabsContent>
      <TabsContent value="instructor" className="pt-2">
        {instructorSlot}
      </TabsContent>
      {faqSlot && (
        <TabsContent value="faq" className="pt-2">
          {faqSlot}
        </TabsContent>
      )}
    </Tabs>
  );
}
