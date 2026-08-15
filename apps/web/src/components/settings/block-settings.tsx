import { useState } from "react";
import { LockIcon } from "@/assets/icons/lock";
import { Switch } from "../switch";
import { BoltIcon } from "@/assets/icons/bolt-icon";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../dialog";
import { Input } from "../input";
import { Button } from "../button";
import { Label } from "../label";

export function BlockSettings({
  showContextMenu = true,
  passwordProtectionEnabled = false,
  onShowContextMenuChange,
  onSetPassword,
  onDisablePassword,
}: {
  showContextMenu?: boolean;
  passwordProtectionEnabled?: boolean;
  onShowContextMenuChange?: (show: boolean) => void;
  onSetPassword?: (password: string) => void | Promise<void>;
  onDisablePassword?: (password: string) => boolean | Promise<boolean>;
}) {
  const [passwordDialogMode, setPasswordDialogMode] = useState<"setup" | "disable">("setup");
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const handlePasswordToggle = (checked: boolean) => {
    if (checked === passwordProtectionEnabled) return;
    setPasswordDialogMode(checked ? "setup" : "disable");
    setPassword("");
    setConfirmPassword("");
    setPasswordError("");
    setIsPasswordDialogOpen(true);
  };

  const savePassword = async () => {
    setPasswordError("");
    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      return;
    }
    if (passwordDialogMode === "setup" && password !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setIsSavingPassword(true);
    try {
      if (passwordDialogMode === "setup") {
        await onSetPassword?.(password);
      } else if (!(await onDisablePassword?.(password))) {
        setPasswordError("Incorrect password.");
        return;
      }
      setIsPasswordDialogOpen(false);
      setPassword("");
      setConfirmPassword("");
    } catch {
      setPasswordError("Unable to save the password. Please try again.");
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="grid gap-8 p-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start">
      <div className="space-y-5">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold tracking-tight text-foreground">Block Settings</h3>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            Require a password before items can be removed from your block list
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between gap-2 py-2">
            <span className="truncate flex items-center gap-3 text-sm text-foreground">
              <LockIcon />
              Enable Password Protection
            </span>
            <Switch checked={passwordProtectionEnabled} onCheckedChange={handlePasswordToggle} />
          </div>
          <div className="flex items-center justify-between gap-4 py-5">
            <span className="truncate flex items-center gap-3 text-sm text-foreground">
              <BoltIcon />
              Show Blockade in the right-click menu
            </span>
            <Switch checked={showContextMenu} onCheckedChange={onShowContextMenuChange} />
          </div>
        </div>
      </div>

      <Dialog
        open={isPasswordDialogOpen}
        onOpenChange={(open) => {
          if (!isSavingPassword) setIsPasswordDialogOpen(open);
        }}
      >
        <DialogContent>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              void savePassword();
            }}
          >
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                {passwordDialogMode === "setup" ? "Set password" : "Disable password protection"}
              </DialogTitle>
              <DialogDescription>
                {passwordDialogMode === "setup"
                  ? "Create a password to prevent items from being removed from your block list."
                  : "Enter your password to disable protection."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="block-settings-password">Password</Label>
                <Input
                  id="block-settings-password"
                  type="password"
                  autoComplete={
                    passwordDialogMode === "setup" ? "new-password" : "current-password"
                  }
                  placeholder="Enter password"
                  value={password}
                  disabled={isSavingPassword}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>
              {passwordDialogMode === "setup" && (
                <div className="space-y-2">
                  <Label htmlFor="confirm-block-settings-password">Confirm password</Label>
                  <Input
                    id="confirm-block-settings-password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    disabled={isSavingPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                  />
                </div>
              )}
              {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSavingPassword}>
                {isSavingPassword
                  ? "Saving..."
                  : passwordDialogMode === "setup"
                    ? "Save password"
                    : "Disable protection"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
