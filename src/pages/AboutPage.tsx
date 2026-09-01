import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { RMHCLogo } from '@/components/RMHCLogo'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Heart,
  Users,
  Building2,
  MapPin,
  Sparkles,
  HandHeart,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Smile,
  Compass,
  PhoneCall,
} from 'lucide-react'

export const AboutPage: React.FC = () => {
  const [donationModalOpen, setDonationModalOpen] = useState(false)
  const [volunteerModalOpen, setVolunteerModalOpen] = useState(false)

  const impactStats = [
    {
      value: '3 Milhões',
      number: '3+',
      label: 'milhões de crianças e adolescentes impactados',
      icon: Smile,
      color: 'text-[#DA291C] dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900/50',
    },
    {
      value: '2.000+',
      number: '2000',
      label: 'projetos realizados em todo o país',
      icon: Sparkles,
      color: 'text-[#FFC72C] dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/50',
    },
    {
      value: '100+',
      number: '100',
      label: 'instituições apoiadas',
      icon: Building2,
      color: 'text-[#005A9E] dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/50',
    },
    {
      value: '20',
      number: '20',
      label: 'estados em todas as regiões do Brasil',
      icon: MapPin,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/50',
    },
  ]

  const corePillars = [
    {
      title: 'Acolhimento & Estadia',
      desc: 'Hospedagem gratuita, alimentação e suporte integral para crianças em tratamento e seus acompanhantes longe de casa.',
    },
    {
      title: 'Apoio Psicossocial',
      desc: 'Equipes multidisciplinares e voluntários dedicados a fortalecer os vínculos afetivos e a saúde mental da família.',
    },
    {
      title: 'Capacitação & Diagnóstico Precoce',
      desc: 'Formação continuada e cursos para profissionais e voluntários aumentarem as chances de cura e qualidade de vida.',
    },
  ]

  return (
    <div className="font-raleway min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-red-50 via-background to-background dark:from-red-950/20 dark:via-background dark:to-background border-b border-border/60 py-16 md:py-24">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#DA291C_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-neutral-900 border border-red-200 dark:border-red-900/60 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#DA291C] animate-pulse" />
              <span className="text-xs font-bold text-[#DA291C] dark:text-red-400 uppercase tracking-wider">
                Casa Ronald McDonald Brasil
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground tracking-tight leading-tight">
              A família está sempre presente.
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed font-normal">
              O Instituto Ronald McDonald agora é <strong>Casa Ronald McDonald Brasil</strong>.
              Seguimos cuidando de famílias com crianças que precisam de assistência médica,
              removendo barreiras e fortalecendo o cuidado.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              <Button
                onClick={() => setDonationModalOpen(true)}
                className="bg-[#DA291C] hover:bg-[#b81d12] text-white font-bold px-6 py-2.5 h-auto rounded-xl shadow-lg shadow-red-600/20 transition-all hover:scale-[1.02]"
              >
                <Heart className="w-4 h-4 mr-2 fill-white" />
                Doe agora
              </Button>
              <Button
                variant="outline"
                onClick={() => setVolunteerModalOpen(true)}
                className="border-border hover:bg-muted font-bold px-6 py-2.5 h-auto rounded-xl"
              >
                <HandHeart className="w-4 h-4 mr-2 text-[#005A9E]" />
                Seja um Voluntário
              </Button>
              <Button
                asChild
                variant="ghost"
                className="font-bold px-4 py-2.5 h-auto text-muted-foreground hover:text-foreground"
              >
                <Link to="/contato">
                  Fale Conosco
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Story / About Section */}
      <section className="py-16 md:py-20 border-b border-border/60">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Image / Graphic presentation */}
            <div className="lg:col-span-5 space-y-4">
              <div className="relative rounded-2xl overflow-hidden border border-border/80 shadow-xl bg-card">
                <img
                  src="https://img.usecurling.com/p/800/600?q=children%20hospital%20family%20care&color=warm"
                  alt="Casa Ronald McDonald Brasil - Apoio à Família"
                  className="w-full h-80 sm:h-96 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-6 text-white">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded bg-[#DA291C] text-[10px] font-bold uppercase tracking-wider">
                      Desde 1999
                    </span>
                    <span className="text-xs text-white/80 font-medium">
                      Transformando realidades
                    </span>
                  </div>
                  <h3 className="font-bold text-lg leading-snug">
                    Acolhimento humanizado para crianças e adolescentes em tratamento
                  </h3>
                </div>
              </div>

              {/* Highlight card */}
              <div className="p-4 rounded-xl bg-muted/50 border border-border flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#005A9E]/10 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-[#005A9E]" />
                </div>
                <div className="text-xs text-muted-foreground">
                  <strong className="text-foreground block font-bold">
                    Referência em Cuidado Centrado na Família
                  </strong>
                  Promovemos saúde, diagnóstico precoce e dignidade em todas as regiões brasileiras.
                </div>
              </div>
            </div>

            {/* Narrative text */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-3">
                <Badge
                  variant="outline"
                  className="text-xs font-bold text-[#005A9E] border-[#005A9E]/30 bg-blue-50/50 dark:bg-blue-950/30"
                >
                  Nossa História e Missão
                </Badge>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
                  Sobre a Casa Ronald McDonald Brasil
                </h2>
              </div>

              <div className="prose prose-neutral dark:prose-invert max-w-none space-y-4 text-muted-foreground leading-relaxed text-sm sm:text-base">
                <p>
                  Todos os anos, milhares de crianças e adolescentes no Brasil precisam enfrentar
                  jornadas complexas de cuidado em saúde. Nesses momentos, o tratamento médico é
                  essencial, mas as famílias também precisam de acolhimento, estrutura e apoio para
                  permanecerem juntas.
                </p>
                <p>
                  Desde 1999, a Casa Ronald McDonald Brasil atua para transformar essa realidade,
                  oferecendo serviços essenciais que removem barreiras, fortalecem as famílias e
                  ajudam a promover melhores condições de cuidado quando crianças e adolescentes
                  necessitam de assistência médica.
                </p>
              </div>

              {/* Pillars grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                {corePillars.map((pillar, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl border border-border/70 bg-card hover:border-primary/40 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="w-5 h-5 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                        {i + 1}
                      </span>
                      <h4 className="font-bold text-xs text-foreground">{pillar.title}</h4>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      {pillar.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Numbers Section */}
      <section className="py-16 md:py-20 bg-muted/30 border-b border-border/60 relative">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center space-y-3 mb-12">
            <Badge
              variant="outline"
              className="text-xs font-bold text-[#DA291C] border-red-300 dark:border-red-900 bg-red-50 dark:bg-red-950/40"
            >
              Resultados que Transformam
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
              Nosso impacto
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Números construídos com dedicação contínua, parcerias e a solidariedade de voluntários
              e doadores em todo o território nacional.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {impactStats.map((stat, idx) => {
              const Icon = stat.icon
              return (
                <Card
                  key={idx}
                  className={`border ${stat.bgColor} hover:shadow-lg transition-all duration-300 group hover:-translate-y-1`}
                >
                  <CardContent className="p-6 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-neutral-900 shadow-sm mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    <div className="space-y-1">
                      <span className={`block text-3xl sm:text-4xl font-black ${stat.color}`}>
                        {stat.value}
                      </span>
                      <p className="text-xs sm:text-sm font-semibold text-foreground leading-snug">
                        {stat.label}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Volunteer Section */}
      <section className="py-16 md:py-20 border-b border-border/60">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-800 text-white rounded-3xl p-8 sm:p-12 lg:p-14 shadow-2xl relative overflow-hidden">
            {/* Ambient decorative elements */}
            <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#DA291C]/20 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-[#005A9E]/20 blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              <div className="lg:col-span-8 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold tracking-wider uppercase border border-white/20">
                  <Users className="w-3.5 h-3.5 text-[#FFC72C]" />
                  Junte-se à Nossa Rede
                </div>

                <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white">
                  Seja um voluntário!
                </h2>

                <div className="space-y-4 text-neutral-300 text-sm sm:text-base leading-relaxed">
                  <p>
                    Para fortalecer nossa missão e apoiar famílias com crianças e adolescentes que
                    precisam de cuidado em saúde, contamos com pessoas dispostas a fazer a
                    diferença.
                  </p>
                  <p>
                    Na Casa Ronald McDonald Brasil, o voluntariado é uma forma de contribuir
                    diretamente para o acolhimento, o bem-estar e a rotina das famílias atendidas,
                    especialmente nas unidades do Programa Casa Ronald McDonald.
                  </p>
                  <p>
                    Você pode ajudar de acordo com suas habilidades, disponibilidade e localidade.
                    Também há oportunidades para empresas que desejam engajar suas equipes por meio
                    do voluntariado corporativo. Venha fazer parte dessa rede de cuidado e apoio às
                    famílias.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Button
                    onClick={() => setVolunteerModalOpen(true)}
                    className="bg-[#FFC72C] hover:bg-[#e6b225] text-neutral-950 font-bold px-6 py-2.5 h-auto rounded-xl shadow-lg transition-all hover:scale-[1.02]"
                  >
                    <HandHeart className="w-4 h-4 mr-2" />
                    Quero ser voluntário
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="border-white/30 bg-white/10 hover:bg-white/20 text-white font-bold px-5 py-2.5 h-auto rounded-xl"
                  >
                    <Link to="/contato">
                      <PhoneCall className="w-4 h-4 mr-2" />
                      Falar com a equipe
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Side Card info */}
              <div className="lg:col-span-4 bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 space-y-4">
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#FFC72C]" />
                  Modalidades de Apoio
                </h4>
                <ul className="space-y-3 text-xs text-neutral-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#FFC72C] shrink-0 mt-0.5" />
                    <span>
                      <strong>Voluntariado Presencial:</strong> Atividades lúdicas, apoio
                      operacional e recreação nas unidades.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#FFC72C] shrink-0 mt-0.5" />
                    <span>
                      <strong>Voluntariado Técnico & EAD:</strong> Produção de conteúdo, tutoria e
                      suporte aos cursos da plataforma.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#FFC72C] shrink-0 mt-0.5" />
                    <span>
                      <strong>Voluntariado Corporativo:</strong> Programas estruturados para equipes
                      de empresas parceiras.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA / Difference Section */}
      <section className="py-16 md:py-20 bg-gradient-to-t from-red-50/50 via-background to-background dark:from-red-950/10 dark:via-background dark:to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-red-100 dark:bg-red-950/60 border border-red-200 dark:border-red-900/60 flex items-center justify-center mx-auto shadow-inner">
              <Heart className="w-8 h-8 text-[#DA291C] fill-[#DA291C]" />
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
                Você pode fazer a diferença
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto">
                Com sua ajuda, podemos apoiar ainda mais famílias durante a jornada do tratamento.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Button
                onClick={() => setDonationModalOpen(true)}
                className="bg-[#DA291C] hover:bg-[#b81d12] text-white font-black text-base px-8 py-3.5 h-auto rounded-2xl shadow-xl shadow-red-600/30 hover:scale-105 transition-all"
              >
                <Heart className="w-5 h-5 mr-2 fill-white" />
                Doe agora
              </Button>
              <Button
                asChild
                variant="outline"
                className="font-bold text-sm px-6 py-3.5 h-auto rounded-2xl border-border hover:bg-muted"
              >
                <Link to="/courses">Explorar Cursos EAD</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Modal Doe Agora */}
      <Dialog open={donationModalOpen} onOpenChange={setDonationModalOpen}>
        <DialogContent className="sm:max-w-md font-raleway">
          <DialogHeader className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/60 flex items-center justify-center text-[#DA291C] mb-1">
              <Heart className="w-5 h-5 fill-[#DA291C]" />
            </div>
            <DialogTitle className="text-xl font-bold">Doe para a Casa Ronald McDonald</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              Sua contribuição mantém famílias acolhidas, unidas e com apoio integral durante o
              tratamento médico de seus filhos.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="p-4 rounded-xl bg-muted/60 border border-border space-y-2">
              <span className="text-xs font-bold text-foreground block">
                Chave PIX Oficial (CNPJ):
              </span>
              <div className="flex items-center justify-between gap-2 p-2.5 bg-background rounded-lg border border-border font-mono text-xs font-semibold select-all">
                <span>02.128.069/0001-92</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Titular: Casa Ronald McDonald Brasil (Instituto Ronald McDonald)
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-xs text-[#005A9E] dark:text-blue-300">
              Para doações corporativas, apadrinhamento de quartos ou parcerias institucionais,
              entre em contato pelo telefone <strong>(21) 2176-3808</strong> ou e-mail{' '}
              <strong>casaronald@crmbrasil.org.br</strong>.
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDonationModalOpen(false)}
              className="text-xs"
            >
              Fechar
            </Button>
            <Button
              asChild
              size="sm"
              className="bg-[#DA291C] hover:bg-[#b81d12] text-white text-xs font-bold"
            >
              <Link to="/contato" onClick={() => setDonationModalOpen(false)}>
                Fale com a Captação
              </Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Voluntariado */}
      <Dialog open={volunteerModalOpen} onOpenChange={setVolunteerModalOpen}>
        <DialogContent className="sm:max-w-lg font-raleway">
          <DialogHeader className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-[#FFC72C] mb-1">
              <HandHeart className="w-5 h-5 text-amber-600" />
            </div>
            <DialogTitle className="text-xl font-bold">Faça parte do Voluntariado</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              O voluntariado transforma vidas — a das famílias acolhidas e a sua própria.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs text-muted-foreground leading-relaxed">
            <p>
              Temos oportunidades presenciais nas Casas Ronald McDonald e Espaços da Família, além
              de voluntariado corporativo e técnico em nossa plataforma de capacitação EAD.
            </p>
            <div className="p-3.5 rounded-xl bg-muted/60 border border-border space-y-1.5">
              <span className="font-bold text-foreground block text-xs">Como participar:</span>
              <p>
                1. Envie uma mensagem através da nossa página de contato com o assunto{' '}
                <strong>"Dúvida"</strong> ou <strong>"Outro"</strong> informando seu interesse em
                voluntariar.
              </p>
              <p>2. Nossa coordenação entrará em contato para apresentar as vagas disponíveis.</p>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setVolunteerModalOpen(false)}
              className="text-xs"
            >
              Cancelar
            </Button>
            <Button
              asChild
              size="sm"
              className="bg-[#005A9E] hover:bg-[#00477e] text-white text-xs font-bold"
            >
              <Link to="/contato" onClick={() => setVolunteerModalOpen(false)}>
                Ir para o Formulário de Contato
              </Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
export default AboutPage
