import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuthStore } from "@opener/shared";
import { toast } from "sonner";

export function useHeader() {
  const router = useRouter();
  const { user, isLoggedIn, logout } = useAuthStore();
  const [keyword, setKeyword] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) {
      router.push(`/products?keyword=${encodeURIComponent(keyword.trim())}`);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success("로그아웃되었습니다");
    router.push("/");
  };

  return {
    user,
    isLoggedIn,
    keyword,
    setKeyword,
    handleSearch,
    handleLogout,
  };
}
