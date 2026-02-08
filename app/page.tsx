import Link from "next/link"

import { Button } from "@/components/ui/button"

export default function IndexPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-10">
      <h1 className="text-2xl font-bold text-foreground">
        Welcome to LumaSpace
      </h1>
      <p className="text-muted-foreground">
        Your workspace dashboard
      </p>
      <Link href="/login">
        <Button>Login</Button>
      </Link>
    </div>
  )
}
