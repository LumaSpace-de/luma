import { GalleryVerticalEnd } from "lucide-react"

import { DotPattern } from "@/components/dot-pattern"
import { SignupForm } from "@/components/signup-form"

export default function SignupPage() {
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
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <GalleryVerticalEnd className="size-4" />
          </div>
          LumaSpace
        </a>
        <SignupForm />
      </div>
    </div>
   </DotPattern>
  )
}
