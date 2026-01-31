import { GalleryVerticalEnd } from "lucide-react"
import { LoginForm } from "@/components/login-form"
import { DotPattern } from "@/components/dot-pattern"

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
      <div className="relative z-10 flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
        <div className="flex w-full max-w-sm flex-col gap-6">
          <a href="#" className="flex items-center gap-2 self-center font-medium text-white">
            <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg">
              <GalleryVerticalEnd className="size-5" />
            </div>
            <span className="text-xl font-semibold">LumaSpace</span>
          </a>
          <LoginForm />
        </div>
      </div>
    </DotPattern>
  )
}