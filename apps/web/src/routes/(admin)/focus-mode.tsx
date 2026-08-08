import { PomodoroClock } from "@/components/pomodoro-clock";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/tabs";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/(admin)/focus-mode")({
  component: RouteComponent,
});

function RouteComponent() {
  const [clockStyle, setClockStyle] = useState<"dial" | "classic">("dial");

  return (
    <main className="mx-auto w-full max-w-7xl p-3 sm:p-4 md:p-5">
      <header className="flex flex-col gap-1 pb-6">
        <h1 className="font-display text-2xl font-semibold text-foreground">Focus mode</h1>
        <p className="text-sm text-pretty text-muted-foreground">
          Set a focus window, start the clock, and give one task your full attention.
        </p>
      </header>

      <Tabs
        value={clockStyle}
        onValueChange={(value) => setClockStyle(value as "dial" | "classic")}
        className="flex min-h-[calc(100dvh-10rem)] w-full flex-col items-center"
      >
        <TabsList aria-label="Clock style">
          <TabsTrigger value="dial">Dial</TabsTrigger>
          <TabsTrigger value="classic">Classic</TabsTrigger>
        </TabsList>

        <TabsContent
          value={clockStyle}
          className="mt-0 flex min-h-[calc(100dvh-15rem)] w-full flex-1 items-center justify-center px-0 py-6 focus-visible:ring-0 focus-visible:ring-offset-0 sm:px-6 sm:py-10"
        >
          <PomodoroClock
            defaultMinutes={5}
            stepMinutes={5}
            variant={clockStyle}
            className="transition-[max-width,min-height] duration-300 ease-out"
          />
        </TabsContent>
      </Tabs>
    </main>
  );
}
