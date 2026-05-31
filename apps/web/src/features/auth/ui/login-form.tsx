"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button, Input, Label } from "@/shared/ui";
import { useLogin } from "../model/use-login";
import { loginSchema, type LoginSchema } from "../lib/login-schema";

export function LoginForm() {
  const router = useRouter();
  const { mutate, isPending, error } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  });

  const onSubmit = (data: LoginSchema) => {
    mutate(data, {
      onSuccess: () => {
        toast.success("로그인에 성공했습니다");
        router.push("/");
      },
    });
  };

  const serverError = error
    ? (error as { message?: string }).message || "로그인에 실패했습니다."
    : null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">이메일</Label>
        <Input
          id="email"
          type="email"
          placeholder="email@example.com"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-caption text-error">{errors.email.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password">비밀번호</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          {...register("password")}
        />
        {errors.password && (
          <p className="text-caption text-error">{errors.password.message}</p>
        )}
      </div>

      {serverError && <p className="text-caption text-error">{serverError}</p>}

      <Button type="submit" disabled={isPending} className="mt-2">
        {isPending ? "로그인 중..." : "로그인"}
      </Button>
    </form>
  );
}
