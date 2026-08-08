import { Loader2 } from "lucide-react";

export default function Loader() {
  return (
    <div className="flex h-full items-center justify-center pt-8" role="status">
      <Loader2 className="animate-spin motion-reduce:animate-none" aria-hidden="true" />
      <span className="sr-only">Loading</span>
    </div>
  );
}
