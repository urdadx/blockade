import Spinner from "./spinner";

export function GlobalLoader() {
  return (
    <div className="max-w-5xl lg:max-w-6xl w-full min-h-full mx-auto p-2 sm:p-6" role="status">
      <div className="flex items-center justify-center h-96">
        <Spinner size={30} />
        <span className="sr-only">Loading</span>
      </div>
    </div>
  );
}
