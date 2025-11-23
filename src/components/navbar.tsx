"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Search, Plus } from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import { clearUser } from "@/lib/slices/authSlice";
import { useRouter, usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/logo";
import { motion } from "framer-motion";

export function Navbar() {
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      // Clear Redux state (which will also clear persisted data)
      dispatch(clearUser());
      router.push("/login");
    }
  };

  return (
    <motion.nav
      className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Top Layer */}
      <div className="container mx-auto flex h-16 items-center justify-between px-4 border-b border-border/50">
        {/* Left: Logo */}
        <Logo size="md" />

        {/* Middle: Search Bar */}
        <div className="relative flex-1 max-w-2xl mx-8 hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Quick Search"
            className="w-full pl-9"
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
          />
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Add New Button */}
          <Button onClick={() => router.push("/create")} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Add New</span>
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
          </Button>

          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-ring">
                <Avatar>
                  <AvatarImage 
                    src={
                      user?.avatar || 
                      (user as any)?.avatar_url || 
                      (user as any)?.avatarUrl || 
                      (user as any)?.picture || 
                      undefined
                    } 
                    alt={user?.name || "User"} 
                  />
                  <AvatarFallback>
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{user?.name || "User"}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Bottom Layer */}
      <div className="container mx-auto flex h-12 items-center justify-between px-4">
        {/* Left: Main Navigation */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => router.push("/")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              pathname === "/" || pathname.startsWith("/create")
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Projects
          </button>
          <button
            onClick={() => router.push("/dashboard")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              pathname.startsWith("/dashboard")
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Dashboard
          </button>
        </div>

        {/* Right: Documentation and Support */}
        <div className="flex items-center gap-4">
          <a
            href="/docs"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Documentation
          </a>
          <a
            href="/support"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Support
          </a>
        </div>
      </div>
    </motion.nav>
  );
}

