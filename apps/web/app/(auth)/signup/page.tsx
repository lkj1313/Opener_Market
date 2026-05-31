import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui";
import { SignupForm } from "@/features/auth";

export default function SignupPage() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-title-2 text-primary">회원가입</CardTitle>
        <p className="text-body-2 text-primary">새로운 계정을 만들어보세요</p>
      </CardHeader>
      <CardContent>
        <SignupForm />
        <p className="mt-4 text-center text-body-2 text-primary">
          이미 계정이 있으신가요?{" "}
          <Link
            href="/login"
            className="text-primary underline-offset-4 hover:underline"
          >
            로그인
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
