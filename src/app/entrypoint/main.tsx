import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "@/app/styles/index.css"

import { env } from "@/app/config"
import { AppProviders } from "@/app/providers"

void env.API_BASE_URL

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProviders />
  </StrictMode>
)
