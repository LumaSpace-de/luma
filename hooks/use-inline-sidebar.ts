import { createContext, useContext } from "react"

interface InlineSidebarContextType {
  open: boolean
  toggle: () => void
}

export const InlineSidebarContext = createContext<InlineSidebarContextType>({
  open: true,
  toggle: () => {},
})

export function useInlineSidebar() {
  return useContext(InlineSidebarContext)
}
