import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  ShieldCheck,
  Lock,
  Mail,
  User,
  AlertCircle,
  ArrowRight,
  KeyRound,
  CheckCircle2,
} from 'lucide-react'
import { toast } from '@/components/ui/use-toast'

export const AuthPage: React.FC = () => {
  const { login, signup, requestPasswordReset, isAuthenticated, user, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const initialTab = searchParams.get('mode') === 'signup' ? 'signup' : 'login'
  const [activeTab, setActiveTab] = useState<string>(initialTab)

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  const [signupName, setSignupName] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('')

  const [forgotEmail, setForgotEmail] = useState('')
  const [isForgotOpen, setIsForgotOpen] = useState(false)
  const [forgotSuccess, setForgotSuccess] = useState(false)

  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        navigate('/admin')
      } else if (user.role === 'instructor') {
        navigate('/professor')
      } else {
        navigate('/')
      }
    }
  }, [isAuthenticated, user, navigate])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setLoading(true)

    try {
      const loggedIn = await login(loginEmail.trim(), loginPassword)
      toast({
        title: `Bem-vindo(a), ${loggedIn.name || 'Aluno(a)'}!`,
        description: 'Login realizado com sucesso.',
      })
      if (loggedIn.role === 'admin') {
        navigate('/admin')
      } else if (loggedIn.role === 'instructor') {
        navigate('/professor')
      } else {
        navigate('/')
      }
    } catch (err: any) {
      console.error('Login error:', err)
      setErrorMsg(err?.message || 'E-mail ou senha inválidos. Por favor, tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (signupPassword.length < 8) {
      setErrorMsg('A senha precisa ter pelo menos 8 caracteres.')
      return
    }
    if (signupPassword !== signupConfirmPassword) {
      setErrorMsg('As senhas não coincidem.')
      return
    }

    setLoading(true)
    try {
      await signup(signupEmail.trim(), signupPassword, signupName.trim())
      toast({
        title: 'Conta criada com sucesso!',
        description: 'Bem-vindo(a) à plataforma do Instituto Ronald McDonald.',
      })
      navigate('/')
    } catch (err: any) {
      console.error('Signup error:', err)
      setErrorMsg(err?.message || 'Erro ao cadastrar. Este e-mail pode já estar em uso.')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!forgotEmail.trim()) return
    setLoading(true)
    setErrorMsg(null)

    try {
      await requestPasswordReset(forgotEmail.trim())
      setForgotSuccess(true)
      toast({
        title: 'Solicitação enviada!',
        description: 'Verifique sua caixa de entrada para redefinir sua senha.',
      })
    } catch (err: any) {
      console.error('Password reset error:', err)
      setErrorMsg('Não foi possível enviar o e-mail de recuperação. Verifique o endereço digitado.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 py-12 bg-gradient-to-b from-muted/50 via-background to-muted/20">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Intro */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#DA291C] to-[#b81d12] shadow-lg shadow-red-500/25 mb-1">
            <span className="text-[#FFC72C] font-black text-3xl select-none drop-shadow">M</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Instituto Ronald McDonald
          </h1>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            Acesse seus cursos, certificados e participe da nossa comunidade de capacitação
          </p>
        </div>

        {errorMsg && (
          <Alert variant="destructive" className="animate-shake">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">{errorMsg}</AlertDescription>
          </Alert>
        )}

        {isForgotOpen ? (
          <Card className="border-border/60 shadow-lg">
            <CardHeader className="space-y-1">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-primary" />
                Recuperação de Senha
              </CardTitle>
              <CardDescription className="text-xs">
                Digite seu e-mail cadastrado para receber instruções de redefinição de senha.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {forgotSuccess ? (
                <div className="text-center py-4 space-y-3">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-medium">Instruções enviadas com sucesso!</p>
                  <p className="text-xs text-muted-foreground">
                    Verifique seu e-mail ({forgotEmail}) e siga as instruções para cadastrar uma
                    nova senha.
                  </p>
                  <Button
                    variant="outline"
                    className="w-full mt-2"
                    onClick={() => {
                      setIsForgotOpen(false)
                      setForgotSuccess(false)
                    }}
                  >
                    Voltar para o Login
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="forgot-email" className="text-xs font-semibold">
                      E-mail cadastrado
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="forgot-email"
                        type="email"
                        placeholder="seu.email@exemplo.com"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="pl-9 text-sm"
                        required
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-semibold"
                  >
                    {loading ? 'Enviando...' : 'Enviar link de recuperação'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full text-xs text-muted-foreground"
                    onClick={() => setIsForgotOpen(false)}
                  >
                    Cancelar e voltar
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="border-border/60 shadow-lg backdrop-blur-sm">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <CardHeader className="pb-3">
                <TabsList className="grid grid-cols-2 w-full h-10 p-1 bg-muted/80">
                  <TabsTrigger value="login" className="text-xs md:text-sm font-semibold">
                    Entrar
                  </TabsTrigger>
                  <TabsTrigger value="signup" className="text-xs md:text-sm font-semibold">
                    Criar Conta
                  </TabsTrigger>
                </TabsList>
              </CardHeader>

              {/* LOGIN TAB */}
              <TabsContent value="login">
                <form onSubmit={handleLogin}>
                  <CardContent className="space-y-4 pt-1">
                    <div className="space-y-1.5">
                      <Label htmlFor="login-email" className="text-xs font-semibold">
                        E-mail
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="aluno@institutoronald.org.br"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          className="pl-9 text-sm"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="login-password" className="text-xs font-semibold">
                          Senha
                        </Label>
                        <button
                          type="button"
                          onClick={() => setIsForgotOpen(true)}
                          className="text-xs text-primary hover:underline font-medium"
                        >
                          Esqueceu sua senha?
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="login-password"
                          type="password"
                          placeholder="••••••••"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="pl-9 text-sm"
                          required
                        />
                      </div>
                    </div>

                    <div className="p-3 bg-muted/40 rounded-lg text-[11px] text-muted-foreground border border-border/50">
                      💡 <strong>Dica de teste:</strong> Admin:{' '}
                      <code className="text-primary font-mono font-semibold">
                        william@korenambiental.com
                      </code>{' '}
                      / Senha:{' '}
                      <code className="text-primary font-mono font-semibold">Skip@Pass</code>
                    </div>
                  </CardContent>

                  <CardFooter className="flex flex-col space-y-3 pt-2">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-primary hover:bg-primary/90 text-white font-semibold shadow-md shadow-red-500/10"
                    >
                      {loading ? 'Entrando...' : 'Entrar na Plataforma'}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardFooter>
                </form>
              </TabsContent>

              {/* SIGNUP TAB */}
              <TabsContent value="signup">
                <form onSubmit={handleSignup}>
                  <CardContent className="space-y-3 pt-1">
                    <div className="space-y-1.5">
                      <Label htmlFor="signup-name" className="text-xs font-semibold">
                        Nome Completo
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="signup-name"
                          type="text"
                          placeholder="Ex: Maria dos Santos"
                          value={signupName}
                          onChange={(e) => setSignupName(e.target.value)}
                          className="pl-9 text-sm"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="signup-email" className="text-xs font-semibold">
                        E-mail
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="seu.email@exemplo.com"
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                          className="pl-9 text-sm"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="signup-pass" className="text-xs font-semibold">
                          Senha (mín 8)
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="signup-pass"
                            type="password"
                            placeholder="••••••••"
                            value={signupPassword}
                            onChange={(e) => setSignupPassword(e.target.value)}
                            className="pl-9 text-sm"
                            minLength={8}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="signup-pass-confirm" className="text-xs font-semibold">
                          Confirmar Senha
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="signup-pass-confirm"
                            type="password"
                            placeholder="••••••••"
                            value={signupConfirmPassword}
                            onChange={(e) => setSignupConfirmPassword(e.target.value)}
                            className="pl-9 text-sm"
                            minLength={8}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <p className="text-[11px] text-muted-foreground pt-1">
                      Ao se cadastrar, você concorda com nossos Termos de Uso e Política de
                      Privacidade do Instituto Ronald McDonald.
                    </p>
                  </CardContent>

                  <CardFooter className="flex flex-col space-y-3 pt-2">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-primary hover:bg-primary/90 text-white font-semibold shadow-md shadow-red-500/10"
                    >
                      {loading ? 'Criando Conta...' : 'Criar Minha Conta Gratuita'}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardFooter>
                </form>
              </TabsContent>
            </Tabs>
          </Card>
        )}

        {/* Security & Privacy Banner */}
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="w-4 h-4 text-green-600 dark:text-green-400" />
          <span>Ambiente seguro • Proteção de dados e privacidade garantidas</span>
        </div>
      </div>
    </div>
  )
}
