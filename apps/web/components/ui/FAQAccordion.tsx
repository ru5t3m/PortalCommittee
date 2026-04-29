"use client";

import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";

export function FAQAccordion({ items }: { items: Array<{ question: string; answer: string }> }) {
  return (
    <Accordion.Root className="grid gap-4" type="single" collapsible>
      {items.map((item, index) => (
        <Accordion.Item key={item.question} value={`item-${index}`} className="rounded-2xl border border-slate-200 bg-white px-5 shadow-sm">
          <Accordion.Header>
            <Accordion.Trigger className="group flex w-full items-center justify-between gap-4 py-5 text-left font-semibold text-state-navy">
              {item.question}
              <ChevronDown className="h-5 w-5 text-state-teal transition-transform group-data-[state=open]:rotate-180" />
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="overflow-hidden text-sm leading-7 text-slate-600 data-[state=closed]:animate-none">
            <div className="pb-5">{item.answer}</div>
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}
