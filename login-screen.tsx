"use client"

import React, { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Loader2, ArrowRight, ShieldX, Instagram } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card"

const HOTMART_URL = "https://odontostudioia.kpages.online/garantaacesso"

export function LoginScreen() {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showDenied, setShowDenied] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!name.trim() || !email.trim()) {
      setError("Preencha seu nome e o e-mail da compra.")
      return
    }

    setIsLoading(true)

    try {
      // 1. CHAMA SUA API (aquela que lê o Google Sheets)
      const response = await fetch("/api/check-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      })

      const data = await response.json()

      // 2. SE O STATUS NA PLANILHA FOR "PURCHASE_APPROVED"
      if (data.hasAccess) {
        const userEmail = email.trim().toLowerCase()
        const internalPass = "StudioDentistaAuth2026!"

        // 3. TENTA LOGAR (Para quem já tem conta)
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: userEmail,
          password: internalPass,
        })

        // 4. SE DER ERRO NO LOGIN (Provavelmente usuário novo), CADASTRA
        if (signInError) {
          const { error: signUpError } = await supabase.auth.signUp({
            email: userEmail,
            password: internalPass,
            options: {
              data: {
                full_name: name,
              },
            },
          })

          if (signUpError) {
            throw new Error("Erro ao criar conta automática.")
          }

          // Tenta logar uma segunda vez após o cadastro
          await supabase.auth.signInWithPassword({
            email: userEmail,
            password: internalPass,
          })
        }

        // Se chegou aqui, o AuthProvider vai detectar a sessão e abrir o Dashboard!
      } else {
        // SE NÃO TIVER "PURCHASE_APPROVED" NA PLANILHA, BLOQUEIA
        setShowDenied(true)
      }
    } catch (err) {
      console.error("Erro no login:", err)
      setError("Falha ao validar acesso. Verifique sua conexão.")
    } finally {
      setIsLoading(false)
    }
  }

  if (showDenied) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4 text-center">
        <div className="max-w-md space-y-6">
          <ShieldX className="mx-auto h-16 w-16 text-red-600" />
          <h2 className="text-3xl font-bold font-serif">Acesso Restrito</h2>
          <p className="text-muted-foreground">Não identificamos sua compra para o e-mail: <br /><strong>{email}</strong></p>
          <Button asChild className="w-full h-12 text-lg">
            <a href={HOTMART_URL} target="_blank" rel="noopener noreferrer">
              Adquirir Acesso Agora
            </a>
          </Button>
          <button onClick={() => setShowDenied(false)} className="text-sm underline text-muted-foreground hover:text-primary">
            Tentar outro e-mail
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md shadow-2xl border-border/50">
        <CardHeader className="text-center space-y-1">
          <h1 className="font-serif text-3xl font-bold tracking-tight">Odonto Studio AI</h1>
          <CardDescription>Acesse com os dados da sua compra</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Seu Nome</Label>
              <Input
                id="name"
                placeholder="Dr. Rafael Silva"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail da Compra (Hotmart)</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 text-base"
              />
            </div>
            {error && (
              <div className="p-3 rounded bg-red-50 border border-red-100">
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}
            <Button type="submit" disabled={isLoading} className="w-full h-12 text-base font-semibold transition-all">
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Validando...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>Entrar no Painel</span>
                  <ArrowRight className="h-5 w-5" />
                </div>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      <div className="mt-6 flex items-center gap-3">
        <p className="text-xs text-muted-foreground">
          {"Powered by "}
          <a
            href="https://bybmidia.digital/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary hover:underline"
          >
            BYB Midia Digital
          </a>
        </p>
        <a
          href="https://www.instagram.com/bybmidia/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
          aria-label="Instagram da BYB Midia"
        >
          <Instagram className="h-4 w-4" />
        </a>
      </div>
    </div>
  )
}