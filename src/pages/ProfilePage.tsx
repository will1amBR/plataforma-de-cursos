import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { getUserEnrollments } from '@/services/courses'
import {
  getUserCertificates,
  getUserAchievements,
  getUserNotifications,
  markAllNotificationsAsRead,
} from '@/services/user'
import type { Enrollment, Certificate, AchievementItem, NotificationItem } from '@/types'
import { getCourseThumbnailUrl } from '@/types'
import pb from '@/lib/pocketbase/client'
import {
  User,
  BookOpen,
  Award,
  Trophy,
  Bell,
  Settings,
  KeyRound,
  CheckCircle2,
  Clock,
  PlayCircle,
  Download,
  Calendar,
  ExternalLink,
  Shield,
  Save,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from '@/components/ui/use-toast'

export const ProfilePage: React.FC = () => {
  const { user, isAuthenticated, refreshUser, getUserAvatarUrl } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const currentTab = searchParams.get('tab') || 'courses'

  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [achievements, setAchievements] = useState<AchievementItem[]>([])
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)

  // Edit Profile Form
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [updatingProfile, setUpdatingProfile] = useState(false)

  // Change Password Form
  const [currentPass, setCurrentPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirmNewPass, setConfirmNewPass] = useState('')
  const [updatingPass, setUpdatingPass] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth?mode=login')
      return
    }

    if (user) {
      setName(user.name || '')
    }

    const loadUserData = async () => {
      setLoading(true)
      try {
        const [enr, cert, ach, notif] = await Promise.all([
          getUserEnrollments(),
          getUserCertificates(),
          getUserAchievements(),
          getUserNotifications(),
        ])
        setEnrollments(enr)
        setCertificates(cert)
        setAchievements(ach)
        setNotifications(notif)
      } catch (err) {
        console.error('Error fetching profile data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [isAuthenticated, user, navigate])

  const handleTabChange = (val: string) => {
    const p = new URLSearchParams(searchParams)
    p.set('tab', val)
    setSearchParams(p)
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setUpdatingProfile(true)
    try {
      await pb.collection('users').update(user.id, {
        name: name.trim(),
      })
      await refreshUser()
      toast({
        title: 'Perfil atualizado!',
        description: 'Seus dados foram salvos com sucesso.',
      })
    } catch (err: any) {
      toast({
        title: 'Erro ao atualizar',
        description: err?.message || 'Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setUpdatingProfile(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (newPass.length < 8) {
      toast({
        title: 'Senha muito curta',
        description: 'A nova senha deve ter no mínimo 8 caracteres.',
        variant: 'destructive',
      })
      return
    }

    if (newPass !== confirmNewPass) {
      toast({
        title: 'Senhas divergentes',
        description: 'A confirmação de senha não confere.',
        variant: 'destructive',
      })
      return
    }

    setUpdatingPass(true)
    try {
      await pb.collection('users').update(user.id, {
        oldPassword: currentPass,
        password: newPass,
        passwordConfirm: confirmNewPass,
      })
      setCurrentPass('')
      setNewPass('')
      setConfirmNewPass('')
      toast({
        title: 'Senha alterada!',
        description: 'Sua senha foi atualizada com segurança.',
      })
    } catch (err: any) {
      toast({
        title: 'Erro ao trocar senha',
        description: err?.message || 'Verifique sua senha atual e tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setUpdatingPass(false)
    }
  }

  const handlePrintCertificate = (cert: Certificate) => {
    const courseTitle = cert.expand?.course_id?.title || 'Curso Instituto Ronald McDonald'
    const userName = user?.name || 'Aluno(a)'
    const dateStr = cert.issued_at
      ? new Date(cert.issued_at).toLocaleDateString('pt-BR')
      : new Date().toLocaleDateString('pt-BR')

    const win = window.open('', '_blank')
    if (!win) return

    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Certificado - ${courseTitle}</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 40px; background: #fafafa; }
            .cert-box { border: 12px solid #DA291C; background: #fff; padding: 50px; text-align: center; max-width: 800px; margin: 0 auto; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
            .logo { color: #DA291C; font-size: 28px; font-weight: bold; }
            .title { font-size: 36px; font-weight: 800; color: #111; margin-top: 20px; text-transform: uppercase; letter-spacing: 2px; }
            .subtitle { font-size: 16px; color: #666; margin-top: 10px; }
            .name { font-size: 32px; font-weight: bold; color: #DA291C; margin: 30px 0; border-bottom: 2px solid #eee; display: inline-block; padding-bottom: 5px; }
            .text { font-size: 16px; color: #444; line-height: 1.6; max-width: 600px; margin: 0 auto; }
            .footer { margin-top: 40px; display: flex; justify-content: space-between; align-items: flex-end; padding-top: 30px; border-top: 1px dashed #ccc; }
            .code { font-family: monospace; font-size: 12px; color: #888; }
            .btn-print { margin-top: 20px; text-align: center; }
            @media print {
              body { padding: 0; background: #fff; }
              .cert-box { border: 8px solid #DA291C; box-shadow: none; width: 100%; max-width: 100%; }
              .btn-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="cert-box">
            <div class="logo">INSTITUTO RONALD MCDONALD</div>
            <div class="title">Certificado de Conclusão</div>
            <div class="subtitle">Certificamos com orgulho que</div>
            <div class="name">${userName}</div>
            <div class="text">
              concluiu com êxito a capacitação no curso <strong>"${courseTitle}"</strong>, demonstrando dedicação e domínio dos temas apresentados na plataforma EAD.
            </div>
            <div class="footer">
              <div style="text-align: left;">
                <div style="font-weight: bold;">Instituto Ronald McDonald</div>
                <div style="font-size: 12px; color: #777;">Educação e Oncologia Infantojuvenil</div>
                <div style="font-size: 12px; color: #777;">Emitido em: ${dateStr}</div>
              </div>
              <div style="text-align: right;">
                <div class="code">Autenticidade: ${cert.code}</div>
              </div>
            </div>
          </div>
          <div class="btn-print">
            <button onclick="window.print()" style="padding: 12px 24px; background: #DA291C; color: #fff; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 16px;">
              Imprimir / Salvar PDF
            </button>
          </div>
        </body>
      </html>
    `)
    win.document.close()
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 flex-1">
      {/* Profile Header Card */}
      <div className="bg-gradient-to-r from-red-950 via-neutral-900 to-red-900 text-white rounded-3xl p-6 md:p-8 shadow-xl border border-white/10 flex flex-col md:flex-row items-center gap-6 justify-between">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <Avatar className="w-20 h-20 ring-4 ring-[#FFC72C]/40 shadow-lg">
            <AvatarImage src={getUserAvatarUrl(user)} />
            <AvatarFallback className="bg-primary text-white text-2xl font-bold">
              {user?.name?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl font-black text-white">{user?.name || 'Aluno(a)'}</h1>
              <Badge className="bg-[#FFC72C] text-neutral-900 font-bold uppercase text-[10px]">
                {user?.role || 'Aluno'}
              </Badge>
            </div>
            <p className="text-xs text-neutral-300">{user?.email}</p>
            <p className="text-xs text-neutral-400">
              Membro desde {new Date(user?.created || Date.now()).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>

        {/* Quick Stats Summary */}
        <div className="grid grid-cols-3 gap-3 text-center w-full md:w-auto">
          <div className="bg-white/10 backdrop-blur rounded-2xl p-3 border border-white/10 min-w-[90px]">
            <p className="text-xl font-extrabold text-white">{enrollments.length}</p>
            <p className="text-[10px] text-neutral-300 font-semibold uppercase">Cursos</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-2xl p-3 border border-white/10 min-w-[90px]">
            <p className="text-xl font-extrabold text-[#FFC72C]">{certificates.length}</p>
            <p className="text-[10px] text-neutral-300 font-semibold uppercase">Certificados</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-2xl p-3 border border-white/10 min-w-[90px]">
            <p className="text-xl font-extrabold text-white">{achievements.length}</p>
            <p className="text-[10px] text-neutral-300 font-semibold uppercase">Conquistas</p>
          </div>
        </div>
      </div>

      {/* Main Tabs Container */}
      <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 h-11 p-1 bg-muted/80 rounded-2xl">
          <TabsTrigger value="courses" className="text-xs font-semibold gap-1.5 rounded-xl">
            <BookOpen className="w-3.5 h-3.5" />
            Meus Cursos ({enrollments.length})
          </TabsTrigger>
          <TabsTrigger value="certificates" className="text-xs font-semibold gap-1.5 rounded-xl">
            <Award className="w-3.5 h-3.5" />
            Certificados ({certificates.length})
          </TabsTrigger>
          <TabsTrigger value="achievements" className="text-xs font-semibold gap-1.5 rounded-xl">
            <Trophy className="w-3.5 h-3.5" />
            Conquistas ({achievements.length})
          </TabsTrigger>
          <TabsTrigger value="settings" className="text-xs font-semibold gap-1.5 rounded-xl">
            <Settings className="w-3.5 h-3.5" />
            Editar Perfil & Senha
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: MEUS CURSOS */}
        <TabsContent value="courses" className="space-y-4">
          {enrollments.length === 0 ? (
            <Card className="p-12 text-center border-dashed">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base">Você ainda não se matriculou em nenhum curso</h3>
              <p className="text-xs text-muted-foreground mt-1 mb-4 max-w-sm mx-auto">
                Explore nosso catálogo gratuito de cursos e comece a aprender agora mesmo.
              </p>
              <Button
                asChild
                size="sm"
                className="bg-primary hover:bg-primary/90 text-white font-semibold"
              >
                <Link to="/courses">Ver Catálogo de Cursos</Link>
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrollments.map((enr) => {
                const course = enr.expand?.course_id
                if (!course) return null
                const isCompleted = enr.status === 'completed' || enr.progress >= 100

                return (
                  <Card
                    key={enr.id}
                    className="overflow-hidden border shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="aspect-video relative overflow-hidden bg-muted">
                        <img
                          src={getCourseThumbnailUrl(course)}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2.5 right-2.5">
                          <Badge
                            className={`text-[10px] font-bold uppercase ${
                              isCompleted ? 'bg-green-600 text-white' : 'bg-primary text-white'
                            }`}
                          >
                            {isCompleted ? 'Concluído' : 'Em Andamento'}
                          </Badge>
                        </div>
                      </div>

                      <CardContent className="p-4 space-y-3">
                        <h3 className="font-bold text-sm text-foreground line-clamp-1">
                          {course.title}
                        </h3>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Progresso</span>
                            <span className="font-bold text-primary">{enr.progress || 0}%</span>
                          </div>
                          <Progress value={enr.progress || 0} className="h-2" />
                        </div>
                      </CardContent>
                    </div>

                    <div className="p-4 pt-0">
                      <Button
                        asChild
                        className="w-full bg-primary hover:bg-primary/90 text-white text-xs font-semibold rounded-xl"
                      >
                        <Link to={`/courses/${course.slug || course.id}/learn`}>
                          <PlayCircle className="w-3.5 h-3.5 mr-1.5" />
                          {isCompleted ? 'Rever Aulas' : 'Continuar Aprendendo'}
                        </Link>
                      </Button>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* TAB 2: CERTIFICADOS */}
        <TabsContent value="certificates" className="space-y-4">
          {certificates.length === 0 ? (
            <Card className="p-12 text-center border-dashed">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-3">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base">Nenhum certificado emitido ainda</h3>
              <p className="text-xs text-muted-foreground mt-1 mb-4 max-w-sm mx-auto">
                Conclua todas as lições de um curso para liberar seu certificado com código de
                autenticidade oficial.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {certificates.map((cert) => (
                <Card
                  key={cert.id}
                  className="border-border/80 shadow-sm hover:shadow-md transition-all"
                >
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <Badge className="bg-amber-500 hover:bg-amber-500 text-neutral-900 font-bold text-[10px] gap-1">
                          <Award className="w-3 h-3" /> Certificado Oficial
                        </Badge>
                        <h4 className="font-bold text-base text-foreground pt-1">
                          {cert.expand?.course_id?.title || 'Curso Concluído'}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          Emitido em:{' '}
                          {cert.issued_at
                            ? new Date(cert.issued_at).toLocaleDateString('pt-BR')
                            : new Date().toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center shrink-0">
                        <Award className="w-6 h-6" />
                      </div>
                    </div>

                    <div className="p-2.5 bg-muted/60 rounded-xl flex items-center justify-between text-xs font-mono">
                      <span className="text-muted-foreground">Código:</span>
                      <span className="font-bold text-primary">{cert.code}</span>
                    </div>

                    <Button
                      onClick={() => handlePrintCertificate(cert)}
                      className="w-full bg-[#DA291C] hover:bg-[#b81d12] text-white text-xs font-semibold rounded-xl"
                    >
                      <Download className="w-3.5 h-3.5 mr-1.5" />
                      Visualizar / Imprimir Certificado
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* TAB 3: CONQUISTAS */}
        <TabsContent value="achievements" className="space-y-4">
          {achievements.length === 0 ? (
            <Card className="p-12 text-center border-dashed">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400 rounded-full flex items-center justify-center mx-auto mb-3">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base">Suas conquistas aparecerão aqui</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                Participe de cursos, complete aulas e interaja no fórum para desbloquear medalhas e
                conquistas.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {achievements.map((ach) => (
                <Card key={ach.id} className="border shadow-sm p-4 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shrink-0 shadow-md">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-foreground">{ach.title}</h4>
                    <p className="text-[11px] text-muted-foreground line-clamp-2">
                      {ach.description}
                    </p>
                    <span className="text-[10px] text-muted-foreground block mt-1">
                      {new Date(ach.created).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* TAB 4: CONFIGURAÇÕES & SENHA */}
        <TabsContent value="settings" className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Edit Profile Info */}
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                Dados Pessoais
              </CardTitle>
              <CardDescription className="text-xs">
                Atualize as informações exibidas no seu perfil e certificados.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="prof-name" className="text-xs font-semibold">
                    Nome Completo
                  </Label>
                  <Input
                    id="prof-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">E-mail (somente leitura)</Label>
                  <Input value={user?.email || ''} disabled className="text-xs bg-muted" />
                </div>

                <Button
                  type="submit"
                  disabled={updatingProfile}
                  className="bg-primary hover:bg-primary/90 text-white text-xs font-semibold rounded-xl"
                >
                  <Save className="w-3.5 h-3.5 mr-1.5" />
                  {updatingProfile ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-primary" />
                Alterar Senha
              </CardTitle>
              <CardDescription className="text-xs">
                Mantenha sua conta protegida alterando sua senha periodicamente.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="old-pass" className="text-xs font-semibold">
                    Senha Atual
                  </Label>
                  <Input
                    id="old-pass"
                    type="password"
                    placeholder="••••••••"
                    value={currentPass}
                    onChange={(e) => setCurrentPass(e.target.value)}
                    required
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="new-pass" className="text-xs font-semibold">
                    Nova Senha (mín 8)
                  </Label>
                  <Input
                    id="new-pass"
                    type="password"
                    placeholder="••••••••"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    required
                    minLength={8}
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="conf-new-pass" className="text-xs font-semibold">
                    Confirmar Nova Senha
                  </Label>
                  <Input
                    id="conf-new-pass"
                    type="password"
                    placeholder="••••••••"
                    value={confirmNewPass}
                    onChange={(e) => setConfirmNewPass(e.target.value)}
                    required
                    minLength={8}
                    className="text-xs"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={updatingPass}
                  className="bg-primary hover:bg-primary/90 text-white text-xs font-semibold rounded-xl mt-2"
                >
                  {updatingPass ? 'Alterando...' : 'Atualizar Senha'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
