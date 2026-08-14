import { useEffect, useState } from "react";
import { Plus, XIcon } from "lucide-react";

import { Button } from "../button";
import { Input } from "../input";
import { Switch } from "../switch";

export function RedirectSettings({
  showPomodoroTimer = true,
  customRedirectUrl = "",
  onShowPomodoroTimerChange,
  onCustomRedirectUrlChange,
}: {
  showPomodoroTimer?: boolean;
  customRedirectUrl?: string;
  onShowPomodoroTimerChange?: (show: boolean) => void;
  onCustomRedirectUrlChange?: (url: string) => void;
}) {
  const [url, setUrl] = useState(customRedirectUrl);
  const [showUrlForm, setShowUrlForm] = useState(Boolean(customRedirectUrl));

  useEffect(() => {
    setUrl(customRedirectUrl);
    setShowUrlForm(Boolean(customRedirectUrl));
  }, [customRedirectUrl]);

  return (
    <div className="flex flex-col gap-2 p-5 lg:items-start">
      <div className="w-full space-y-2 pb-3">
        <h3 className="text-lg font-semibold tracking-tight text-foreground">
          Redirect Page Settings
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Customize your redirect settings to control how websites are redirected
        </p>
      </div>

      {showUrlForm ? (
        <form
          className="w-full space-y-2 pb-3 sm:max-w-md"
          onSubmit={(event) => {
            event.preventDefault();
            const nextUrl = prefixHttps(url);
            setUrl(nextUrl);
            if (!nextUrl) setShowUrlForm(false);
            onCustomRedirectUrlChange?.(nextUrl);
          }}
        >
          <div className="flex items-center gap-2">
            <Input
              type="text"
              inputMode="url"
              aria-label="Custom redirect URL"
              placeholder="https://example.com"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
            />
            {customRedirectUrl && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0 text-muted-foreground hover:text-destructive"
                aria-label="Delete custom redirect URL"
                onClick={() => {
                  setUrl("");
                  setShowUrlForm(false);
                  onCustomRedirectUrlChange?.("");
                }}
              >
                <XIcon />
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button type="submit">Save</Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setUrl(customRedirectUrl);
                if (!customRedirectUrl) setShowUrlForm(false);
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <Button type="button" className="mb-3" onClick={() => setShowUrlForm(true)}>
          <Plus />
          Add custom redirect URL
        </Button>
      )}

      <div className="flex w-full items-center justify-between pt-3 sm:pt-0">
        <span className="min-w-0 flex-1 text-sm text-foreground">
          Show pomodoro timer on redirect page
        </span>
        <Switch
          checked={showPomodoroTimer}
          onCheckedChange={onShowPomodoroTimerChange}
          className="shrink-0"
        />
      </div>
    </div>
  );
}

function prefixHttps(value: string) {
  const url = value.trim();
  return url && !/^[a-z][a-z\d+.-]*:\/\//i.test(url) ? `https://${url}` : url;
}
