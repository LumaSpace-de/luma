import { DotPattern } from "@/components/dot-pattern"
import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <DotPattern
      className="fixed inset-0"
      dotSize={2}
      gap={20}
      baseColor="#3f3f46"
      glowColor="#22d3ee"
      proximity={150}
      glowIntensity={0.8}
      waveSpeed={0.3}
    >
      <div className="relative z-10 flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
        <div className="flex w-full max-w-sm flex-col gap-6">
          <LoginForm />
        </div>
      </div>
    </DotPattern>
  )
}