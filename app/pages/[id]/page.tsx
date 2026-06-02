import { FileText } from "lucide-react"

export default function PageView() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 text-muted-foreground">
      <FileText className="h-10 w-10 opacity-20" />
      <p className="text-sm">Seite wird geladen…</p>
    </div>
  )
}
