"use client";

import Link from "next/link";
import { Button, Input, ThemeToggle } from "@/shared/ui";
import { Search, ShoppingCart } from "lucide-react";
import { useHeader } from "../model/use-header";

export function Header() {
  const { user, isLoggedIn, keyword, setKeyword, handleSearch, handleLogout } =
    useHeader();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center gap-4 px-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-title-3 text-primary"
        >
          Opener Market
        </Link>

        {/* Search */}
        <form
          onSubmit={handleSearch}
          className="flex flex-1 items-center gap-2"
        >
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="상품 검색..."
              className="pl-8"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
        </form>

        {/* Right Menu */}
        <nav className="flex items-center gap-2">
          <ThemeToggle />
          {isLoggedIn ? (
            <>
              <span className="text-body-2 text-primary hidden sm:inline">
                {user?.nickname}님
              </span>
              <Link href="/cart">
                <Button variant="ghost" size="icon">
                  <ShoppingCart className="h-5 w-5" />
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                로그아웃
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  로그인
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">회원가입</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
