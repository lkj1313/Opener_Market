import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui";
import { LoginForm } from "@/features/auth";

export default function LoginPage() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-title-2 text-primary">로그인</CardTitle>
        <p className="text-body-2 text-primary">계정 정보를 입력해주세요</p>
      </CardHeader>
      <CardContent>
        <LoginForm />
        <p className="mt-4 text-center text-body-2 text-primary">
          계정이 없으신가요?{" "}
          <Link
            href="/signup"
            className="text-primary underline-offset-4 hover:underline"
          >
            회원가입
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
