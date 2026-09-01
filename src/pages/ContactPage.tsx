import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { sendContactMessage } from '@/services/support'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Phone,
  Mail,
  Clock,
  MapPin,
  Send,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  MessageSquare,
  Building,
  Heart,
  Loader2,
  Linkedin,
  Facebook,
  Youtube,
  Instagram,
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export const ContactPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth()

  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const subjectOptions = [
    { value: 'Elogio', label: 'Elogio' },
    { value: 'Reclamação', label: 'Reclamação' },
    { value: 'Dúvida', label: 'Dúvida' },
    { value: 'Denúncia', label: 'Denúncia' },
    { value: 'Outro', label: 'Outro' },
  ]

  const socialLinks = [
    {
      name: 'Instagram',
      handle: '@casaronaldmcdonaldbrasil',
      url: 'https://instagram.com/casaronaldmcdonaldbrasil',
      icon: Instagram,
      color: 'hover:text-pink-600 hover:border-pink-300 dark:hover:border-pink-900',
    },
    {
      name: 'LinkedIn',
      handle: 'Casa Ronald McDonald Brasil',
      url: 'https://www.linkedin.com/company/instituto-ronald-mcdonald/',
      icon: Linkedin,
      color: 'hover:text-blue-600 hover:border-blue-300 dark:hover:border-blue-900',
    },
    {
      name: 'Facebook',
      handle: 'Instituto Ronald McDonald',
      url: 'https://www.facebook.com/InstitutoRonaldMcDonald',
      icon: Facebook,
      color: 'hover:text-blue-700 hover:border-blue-300 dark:hover:border-blue-900',
    },
    {
      name: 'YouTube',
      handle: 'Instituto Ronald McDonald',
      url: 'https://www.youtube.com/user/institutoronald',
      icon: Youtube,
      color: 'hover:text-red-600 hover:border-red-300 dark:hover:border-red-900',
    },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!name.trim()) {
      setErrorMessage('Por favor, informe o seu nome.')
      return
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Por favor, informe um e-mail válido.')
      return
    }

    if (!subject) {
      setErrorMessage('Por favor, selecione um assunto.')
      return
    }

    if (!message.trim() || message.trim().length < 10) {
      setErrorMessage('Por favor, escreva uma mensagem com pelo menos 10 caracteres.')
      return
    }

    try {
      setIsSubmitting(true)
      await sendContactMessage({
        name,
        email,
        subject,
        message,
        userId: user?.id,
      })

      setIsSuccess(true)
      toast({
        title: 'Mensagem enviada com sucesso!',
        description: 'Agradecemos o contato. Nossa equipe responderá o mais breve possível.',
      })

      // Reset form if desired
      setMessage('')
      if (!isAuthenticated) {
        setName('')
        setEmail('')
        setSubject('')
      }
    } catch (err: any) {
      console.error('Error submitting contact form:', err)
      setErrorMessage(
        err?.message ||
          'Não foi possível enviar sua mensagem no momento. Por favor, tente novamente.',
      )
      toast({
        title: 'Erro ao enviar mensagem',
        description: 'Verifique seus dados ou tente novamente em alguns instantes.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResetSuccess = () => {
    setIsSuccess(false)
    setSubject('')
    setMessage('')
  }

  return (
    <div className="font-raleway min-h-screen bg-background">
      {/* Header Banner */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 via-background to-background dark:from-blue-950/20 dark:via-background dark:to-background border-b border-border/60 py-14 md:py-20">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#005A9E_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl space-y-4">
          <Badge
            variant="outline"
            className="text-xs font-bold text-[#005A9E] border-[#005A9E]/30 bg-blue-50/80 dark:bg-blue-950/40 uppercase tracking-wider"
          >
            Atendimento & Relacionamento
          </Badge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground tracking-tight leading-tight">
            Fale com a Casa Ronald
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Se você deseja falar com a nossa equipe, esclarecer dúvidas ou saber mais sobre a Casa
            Ronald McDonald, utilize os canais abaixo ou envie uma mensagem pelo formulário.
          </p>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Left Column: Direct Channels & Address */}
            <div className="lg:col-span-5 space-y-6">
              {/* Official Contact Channels */}
              <Card className="border-border shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-[#DA291C]" />
                    Canais de Atendimento
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Estamos prontos para acolher você e responder a qualquer solicitação.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-1">
                  {/* Telefone */}
                  <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-muted/40 border border-border/70 hover:border-[#DA291C]/40 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-950/60 text-[#DA291C] flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                        Telefone
                      </span>
                      <a
                        href="tel:2121763808"
                        className="text-sm sm:text-base font-extrabold text-foreground hover:text-[#DA291C] transition-colors"
                      >
                        (21) 2176-3808
                      </a>
                      <p className="text-[11px] text-muted-foreground">Ligação direta com a sede</p>
                    </div>
                  </div>

                  {/* E-mail */}
                  <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-muted/40 border border-border/70 hover:border-[#005A9E]/40 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-[#005A9E] flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                        E-mail
                      </span>
                      <a
                        href="mailto:casaronald@crmbrasil.org.br"
                        className="text-xs sm:text-sm font-extrabold text-foreground hover:text-[#005A9E] transition-colors break-all"
                      >
                        casaronald@crmbrasil.org.br
                      </a>
                      <p className="text-[11px] text-muted-foreground">
                        Dúvidas, parcerias e institucional
                      </p>
                    </div>
                  </div>

                  {/* Horário */}
                  <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-muted/40 border border-border/70">
                    <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-[#d49b06] flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                        Horário de atendimento
                      </span>
                      <p className="text-sm font-extrabold text-foreground">de 9h às 18h</p>
                      <p className="text-[11px] text-muted-foreground">Segunda a Sexta-feira</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Address / Onde Estamos */}
              <Card className="border-border shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-[#005A9E]" />
                    Onde estamos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-1 text-xs sm:text-sm text-muted-foreground">
                  <div className="p-3.5 rounded-xl bg-muted/40 border border-border/70 space-y-2">
                    <p className="font-semibold text-foreground leading-relaxed">
                      Rua da Assembleia, 100 - sala 2201 - Centro, Rio de Janeiro - RJ, 20011-904
                    </p>
                    <a
                      href="https://maps.google.com/?q=Rua+da+Assembleia+100+Centro+Rio+de+Janeiro+RJ"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#005A9E] dark:text-blue-400 hover:underline pt-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Ver no Google Maps
                    </a>
                  </div>
                </CardContent>
              </Card>

              {/* Social Media Links */}
              <Card className="border-border shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold text-foreground">
                    Redes Sociais Oficiais
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Acompanhe nossas histórias, campanhas e atualizações.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {socialLinks.map((s, idx) => {
                      const Icon = s.icon
                      return (
                        <a
                          key={idx}
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center gap-2.5 p-2.5 rounded-xl border border-border/70 bg-card hover:bg-muted/50 transition-all group ${s.color}`}
                        >
                          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-xs text-foreground block truncate">
                              {s.name}
                            </span>
                            <span className="text-[10px] text-muted-foreground truncate block">
                              {s.handle}
                            </span>
                          </div>
                        </a>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Interactive Form */}
            <div className="lg:col-span-7">
              <Card className="border-border shadow-md h-full flex flex-col justify-between">
                <CardHeader className="border-b border-border/60 bg-muted/20">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-xl font-black text-foreground">
                      Envie uma mensagem
                    </CardTitle>
                    <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
                      Atendimento Digital
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">
                    Preencha os campos abaixo. Sua mensagem será direcionada ao setor responsável.
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-6 md:p-8 flex-1">
                  {isSuccess ? (
                    <div className="py-10 text-center space-y-4 animate-fadeIn">
                      <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto shadow-inner">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      <div className="space-y-2 max-w-md mx-auto">
                        <h3 className="text-xl font-bold text-foreground">
                          Mensagem enviada com sucesso!
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                          Recebemos a sua mensagem e registramos o atendimento em nosso sistema.
                          Nossa equipe entrará em contato pelo e-mail informado o mais rápido
                          possível.
                        </p>
                      </div>

                      <div className="pt-4 flex justify-center gap-3">
                        <Button
                          onClick={handleResetSuccess}
                          variant="outline"
                          size="sm"
                          className="font-bold text-xs"
                        >
                          Enviar outra mensagem
                        </Button>
                        <Button
                          asChild
                          size="sm"
                          className="bg-[#005A9E] hover:bg-[#00477e] text-white font-bold text-xs"
                        >
                          <Link to="/">Voltar ao Início</Link>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      {errorMessage && (
                        <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-start gap-2.5">
                          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                          <span>{errorMessage}</span>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Nome */}
                        <div className="space-y-1.5">
                          <Label htmlFor="contact-name" className="text-xs font-bold">
                            Nome Completo <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="contact-name"
                            type="text"
                            placeholder="Seu nome"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="text-xs sm:text-sm h-10 rounded-xl"
                            disabled={isSubmitting}
                          />
                        </div>

                        {/* E-mail */}
                        <div className="space-y-1.5">
                          <Label htmlFor="contact-email" className="text-xs font-bold">
                            E-mail de Contato <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="contact-email"
                            type="email"
                            placeholder="seuemail@exemplo.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="text-xs sm:text-sm h-10 rounded-xl"
                            disabled={isSubmitting}
                          />
                        </div>
                      </div>

                      {/* Assunto */}
                      <div className="space-y-1.5">
                        <Label htmlFor="contact-subject" className="text-xs font-bold">
                          Assunto <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={subject}
                          onValueChange={(val) => setSubject(val)}
                          disabled={isSubmitting}
                        >
                          <SelectTrigger
                            id="contact-subject"
                            className="h-10 text-xs sm:text-sm rounded-xl"
                          >
                            <SelectValue placeholder="Selecione o assunto da mensagem" />
                          </SelectTrigger>
                          <SelectContent className="font-raleway">
                            {subjectOptions.map((opt) => (
                              <SelectItem
                                key={opt.value}
                                value={opt.value}
                                className="text-xs sm:text-sm font-medium"
                              >
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Mensagem */}
                      <div className="space-y-1.5">
                        <Label htmlFor="contact-message" className="text-xs font-bold">
                          Mensagem <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                          id="contact-message"
                          placeholder="Digite detalhadamente como podemos ajudar você ou sua dúvida..."
                          rows={6}
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          required
                          className="text-xs sm:text-sm rounded-xl resize-y min-h-[120px]"
                          disabled={isSubmitting}
                        />
                        <p className="text-[10px] text-muted-foreground text-right">
                          {message.length} caracteres
                        </p>
                      </div>

                      {/* Submit button */}
                      <div className="pt-2">
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full sm:w-auto min-w-[180px] bg-[#DA291C] hover:bg-[#b81d12] text-white font-bold h-11 px-6 rounded-xl shadow-md shadow-red-600/20 transition-all hover:scale-[1.01]"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Enviando...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4 mr-2" />
                              Enviar Mensagem
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
export default ContactPage
