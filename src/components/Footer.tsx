import React from 'react'
import { Link } from 'react-router-dom'
import { Heart, Mail, Phone, MapPin, ExternalLink } from 'lucide-react'

export const Footer: React.FC = () => {
  return (
    <footer className="border-t bg-muted/40 text-muted-foreground mt-auto pb-16 md:pb-0">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1: Brand & Mission */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#DA291C] to-[#b81d12] flex items-center justify-center shadow-sm">
                <span className="text-[#FFC72C] font-black text-xl leading-none">M</span>
              </div>
              <span className="font-bold text-base text-foreground">Instituto Ronald McDonald</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Aproximando famílias e transformando o tratamento do câncer infantojuvenil no Brasil
              através da educação, capacitação e apoio contínuo.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
              <Heart className="w-3.5 h-3.5 fill-primary" />
              <span>Educação que salva vidas</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-foreground tracking-tight">Plataforma</h4>
            <ul className="space-y-2 text-xs">
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
                <Link to="/profile" className="hover:text-primary transition-colors">
                  Meus Certificados
                </Link>
              </li>
              <li>
                <Link to="/auth" className="hover:text-primary transition-colors">
                  Área do Aluno
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Institutional */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-foreground tracking-tight">Institucional</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://institutoronald.org.br"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors inline-flex items-center gap-1"
                >
                  Site Oficial RM <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://institutoronald.org.br/quem-somos/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors inline-flex items-center gap-1"
                >
                  Quem Somos <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://institutoronald.org.br/faca-sua-doacao/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors inline-flex items-center gap-1"
                >
                  Como Ajudar / Doações <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <span className="text-muted-foreground">Termos de Uso & Privacidade</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-foreground tracking-tight">
              Contato & Suporte
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 shrink-0 text-primary mt-0.5" />
                <span>Rio de Janeiro, RJ - Brasil</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 shrink-0 text-primary" />
                <span>contato@institutoronald.org.br</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 shrink-0 text-primary" />
                <span>(21) 3721-0000</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border/60 mt-8 pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-muted-foreground gap-4">
          <p>
            © {new Date().getFullYear()} Instituto Ronald McDonald. Todos os direitos reservados.
          </p>
          <p className="flex items-center gap-1">
            Plataforma de Capacitação e Ensino a Distância (EAD)
          </p>
        </div>
      </div>
    </footer>
  )
}
