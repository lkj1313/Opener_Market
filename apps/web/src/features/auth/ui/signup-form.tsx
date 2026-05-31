"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button, Input, Label } from "@/shared/ui";
import { useSignup } from "../model/use-signup";
import { signupSchema, type SignupSchema } from "../lib/signup-schema";

export function SignupForm() {
  const router = useRouter();
  const { mutate, isPending, error } = useSignup();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupSchema>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = (data: SignupSchema) => {
    mutate(data, {
      onSuccess: () => {
        toast.success("회원가입에 성공했습니다");
        router.push("/login");
      },
    });
  };

  const serverError = error
    ? (error as { message?: string }).message || "회원가입에 실패했습니다."
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
          placeholder="8자 이상"
          {...register("password")}
        />
        {errors.password && (
          <p className="text-caption text-error">{errors.password.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="nickname">닉네임</Label>
        <Input
          id="nickname"
          type="text"
          placeholder="2~20자"
          {...register("nickname")}
        />
        {errors.nickname && (
          <p className="text-caption text-error">{errors.nickname.message}</p>
        )}
      </div>

      {serverError && <p className="text-caption text-error">{serverError}</p>}

      <Button type="submit" disabled={isPending} className="mt-2">
        {isPending ? "가입 중..." : "회원가입"}
      </Button>
    </form>
  );
}
