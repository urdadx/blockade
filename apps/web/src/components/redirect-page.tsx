import { ArrowLeftIcon, SettingsIcon } from "lucide-react";

import { Button } from "@/components/button";
import { DitherImage } from "@/components/dither-kit/dither-image";
import { PomodoroClock } from "@/components/pomodoro-clock";

const backgrounds = Object.values(
  import.meta.glob<string>("../assets/backgrounds/*.avif", {
    eager: true,
    import: "default",
  }),
);
const background = backgrounds[Math.floor(Math.random() * backgrounds.length)];

export function RedirectPage({
  onGoBack = () => history.back(),
  onManageBlockList,
}: {
  onGoBack?: () => void;
  onManageBlockList?: () => void;
}) {
  return (
    <main className="relative grid min-h-svh w-full place-items-center overflow-hidden bg-black p-4 sm:p-6">
      {background && (
        <DitherImage src={background} className="absolute inset-0 size-full opacity-70" />
      )}
      <div className="absolute inset-0 bg-black/45" />

      <section className="relative z-10 grid w-full max-w-5xl items-center gap-8 rounded-2xl border border-white/15 bg-black/55 p-5 text-white shadow-2xl backdrop-blur-md sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)] lg:p-10">
        <div className="flex flex-col items-start">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-white/65">
            Navigation blocked
          </p>
          <h1 className="max-w-xl font-display text-4xl font-semibold leading-none tracking-tight text-white sm:text-5xl lg:text-6xl">
            This distraction can wait.
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-6 text-white/75 sm:text-base">
            Blockade stopped this site before it could pull you away. Take a breath, start a focus
            session, and return to what matters.
          </p>
          <div className="mt-7 flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Button
              type="button"
              variant="secondary"
              className="bg-white text-black hover:bg-white/90"
              onClick={onGoBack}
            >
              <ArrowLeftIcon />
              Go back
            </Button>
            {onManageBlockList && (
              <Button
                type="button"
                variant="outline"
                className="border-white/25 bg-black/20 text-white hover:bg-white/10 hover:text-white"
                onClick={onManageBlockList}
              >
                <SettingsIcon />
                Manage block list
              </Button>
            )}
          </div>
        </div>

        <PomodoroClock className="relative z-10 mx-auto w-full" />
      </section>
    </main>
  );
}
