import React from 'react'
import { Link } from 'react-router-dom'
import { RMHCLogo } from '@/components/RMHCLogo'
import { Heart, ShieldCheck, Mail, ExternalLink, Globe } from 'lucide-react'

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-card border-t border-border mt-auto font-raleway">
      {/* Top Banner with RMHC Mission */}
      <div className="bg-[#DA291C] text-white py-4 px-4 text-center">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-center gap-2 text-xs font-semibold">
          <Heart className="w-4 h-4 fill-white" />
          <span>
            Ronald McDonald House Charities® • <strong>Aproximando famílias</strong> perto do
            cuidado médico e apoio que precisam.
          </span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand and Description */}
          <div className="md:col-span-2 space-y-4">
            <RMHCLogo variant="horizontal" size="lg" subtext="Educação a Distância" />
            <p className="text-xs text-muted-foreground leading-relaxed max-w-md">
              A RMHC cria, encontra e apoia programas que impactam diretamente a saúde e o bem-estar
              de crianças e suas famílias. Apoiando lares acolhedores, cuidados de saúde de
              qualidade e formação continuada para voluntários e profissionais.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#005A9E] dark:text-blue-400 font-bold">
              <Globe className="w-4 h-4" />
              <span>Rede Global de Capítulos RMHC</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-foreground">
              Navegação
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link to="/courses" className="hover:text-primary transition-colors">
                  Catálogo de Cursos
                </Link>
              </li>
              <li>
                <Link to="/forum" className="hover:text-primary transition-colors">
                  Fórum da Comunidade
                </Link>
              </li>
              <li>
                <Link to="/sobre" className="hover:text-primary transition-colors">
                  Sobre a Instituição
                </Link>
              </li>
              <li>
                <Link to="/contato" className="hover:text-primary transition-colors">
                  Fale Conosco
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-primary transition-colors">
                  Área do Aluno
                </Link>
              </li>
              <li>
                <Link to="/professor" className="hover:text-primary transition-colors">
                  Área do Professor
                </Link>
              </li>
            </ul>
          </div>

          {/* Institutional / Contact & Programs */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-foreground">
              Institucional & Contato
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link
                  to="/sobre"
                  className="hover:text-primary transition-colors font-medium text-foreground"
                >
                  Casa Ronald McDonald Brasil
                </Link>
              </li>
              <li>Tel: (21) 2176-3808</li>
              <li>casaronald@crmbrasil.org.br</li>
              <li>Rua da Assembleia, 100 - RJ</li>
              <li className="pt-2 border-t border-border/60">
                <Link
                  to="/contato"
                  className="inline-flex items-center gap-1 text-primary hover:underline font-bold text-[11px]"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Envie uma mensagem
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal Disclaimer according to brand manual */}
        <div className="border-t border-border mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="space-y-1">
            <p className="text-[11px] text-muted-foreground font-semibold">
              © {currentYear} Ronald McDonald House Charities® (RMHC). Todos os direitos reservados.
            </p>
            <p className="text-[10px] text-muted-foreground/80 leading-relaxed max-w-3xl">
              As seguintes marcas comerciais são de propriedade da McDonald's Corporation e suas
              afiliadas: McDonald's, Ronald McDonald House Charities, Logo RMHC, Casa Ronald
              McDonald, Espaço da Família Ronald McDonald e Aproximando Famílias.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
            <span className="flex items-center gap-1 font-semibold text-primary">
              <ShieldCheck className="w-4 h-4" />
              Ambiente Seguro
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
