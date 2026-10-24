import BackgroundImage from "@/assets/background.avif";
import ChromeMono from "@/assets/chrome_mono.avif";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/dialog";
import { useBackgroundVideo } from "@/hooks/use-background-video";
import { Play, XIcon } from "lucide-react";
import { useRef } from "react";

const VIDEO_SRC = "/videos/blockade-launch.mp4";
const VIDEO_POSTER = "/videos/blockade-launch-poster.jpg";

export const ImageCTA = () => {
  // Starts after the page has loaded, so the card is all the first paint needs.
  const preloadedVideo = useBackgroundVideo(VIDEO_SRC);
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    // Stop the sound as soon as the dialog starts closing, not after its exit animation.
    <Dialog onOpenChange={(open) => !open && videoRef.current?.pause()}>
      <DialogTrigger
        aria-label="Play the Blockade launch video"
        className="group relative block aspect-[4/3] w-full min-w-0 cursor-pointer overflow-hidden rounded-3xl bg-cover bg-center p-[5%] text-left outline-none focus-visible:ring-3 focus-visible:ring-primary/50"
        style={{ backgroundImage: `url(${BackgroundImage})` }}
      >
        <span className="grid h-full min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center rounded-2xl bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[23px_23px] px-[8%] sm:px-[12%]">
          <span className="size-14 overflow-hidden rounded-xl sm:size-24 sm:rounded-2xl">
            <BrandLogo className="size-full" />
          </span>

          <span className="h-14 bg-[radial-gradient(#4f9dca_2px,transparent_2px)] bg-size-[23px_23px] bg-center" />

          <span className="size-14 overflow-hidden rounded-xl border border-white/20 bg-black sm:size-22 sm:rounded-2xl">
            <img src={ChromeMono} alt="Google Chrome" className="size-full object-cover" />
          </span>
        </span>

        <span className="absolute inset-0 grid place-items-center">
          <span className="flex items-center gap-2 rounded-full border border-white/70 bg-white/40 px-5 py-2.5 text-sm font-medium text-black shadow-lg shadow-black/10 backdrop-blur-md transition-transform duration-200 ease-out group-hover:scale-105 group-active:scale-95 sm:text-base">
            <Play strokeLinejoin="round" className="size-4 fill-current" />
            Watch demo
          </span>
        </span>
      </DialogTrigger>

      <DialogContent
        showCloseButton={false}
        className="max-w-[calc(100%-2rem)] gap-0 overflow-hidden bg-black p-0 ring-white/10 sm:max-w-5xl"
      >
        <DialogTitle className="sr-only">Blockade launch video</DialogTitle>
        <video
          ref={videoRef}
          src={preloadedVideo ?? VIDEO_SRC}
          poster={VIDEO_POSTER}
          className="aspect-video w-full"
          controls
          autoPlay
          playsInline
        />
        <DialogClose
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              className="absolute top-3 right-3 bg-black/50 text-white hover:bg-black/70 hover:text-white"
            />
          }
        >
          <XIcon />
          <span className="sr-only">Close</span>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};
