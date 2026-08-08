import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/dropdown-menu";
import { useTheme } from "@/components/theme-provider";

export function ModeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" size="icon" />}>
        <Sun className="size-[1.2rem] scale-100 rotate-0 opacity-100 blur-0 transition-[scale,rotate,opacity,filter] duration-300 ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-none dark:scale-25 dark:-rotate-90 dark:opacity-0 dark:blur-[4px]" />
        <Moon className="absolute size-[1.2rem] scale-25 rotate-90 opacity-0 blur-[4px] transition-[scale,rotate,opacity,filter] duration-300 ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-none dark:scale-100 dark:rotate-0 dark:opacity-100 dark:blur-0" />
        <span className="sr-only">Toggle theme</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
