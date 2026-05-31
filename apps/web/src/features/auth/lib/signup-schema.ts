import { z } from "zod";

export const signupSchema = z.object({
  email: z.string().min(1, "이메일을 입력하세요").email("이메일 형식이 아닙니다"),
  password: z.string().min(8, "비밀번호는 8자 이상이어야 합니다"),
  nickname: z
    .string()
    .min(2, "닉네임은 2자 이상이어야 합니다")
    .max(20, "닉네임은 20자 이하여야 합니다"),
});

export type SignupSchema = z.infer<typeof signupSchema>;
