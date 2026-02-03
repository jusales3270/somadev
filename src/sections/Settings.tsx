import { motion } from 'framer-motion';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Database,
  Palette,
  Globe,
  Key,
  Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

function SettingSection({ 
  title, 
  description, 
  icon: Icon,
  children 
}: { 
  title: string; 
  description?: string;
  icon: typeof SettingsIcon;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-xl border border-border bg-card"
    >
      <div className="flex items-start gap-4 mb-6">
        <div className="w-10 h-10 rounded-lg bg-soma-cyan/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-soma-cyan" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {children}
    </motion.div>
  );
}

export function Settings() {
  return (
    <div className="h-[calc(100vh-140px)] flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-soma-cyan" />
            Configurações
          </h1>
          <p className="text-muted-foreground text-sm">
            Personalize sua experiência no SomaDev
          </p>
        </div>

        <Button className="gap-2 bg-soma-cyan hover:bg-soma-cyan/90">
          <Save className="w-4 h-4" />
          Salvar Alterações
        </Button>
      </motion.div>

      {/* Settings Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex-1 overflow-y-auto custom-scrollbar"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-4">
          {/* Profile */}
          <SettingSection
            title="Perfil"
            description="Suas informações pessoais"
            icon={User}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input defaultValue="João Developer" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input defaultValue="joao@somadev.me" type="email" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Avatar</Label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-soma-cyan to-soma-purple flex items-center justify-center">
                    <span className="text-xl font-bold text-white">JD</span>
                  </div>
                  <Button variant="outline" size="sm">
                    Alterar Avatar
                  </Button>
                </div>
              </div>
            </div>
          </SettingSection>

          {/* Notifications */}
          <SettingSection
            title="Notificações"
            description="Configure como recebe alertas"
            icon={Bell}
          >
            <div className="space-y-4">
              {[
                { label: 'Notificações por email', defaultChecked: true },
                { label: 'Alertas de deploy', defaultChecked: true },
                { label: 'Atualizações de agentes', defaultChecked: false },
                { label: 'Resumo semanal', defaultChecked: true },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-sm text-foreground">{item.label}</span>
                  <Switch defaultChecked={item.defaultChecked} />
                </div>
              ))}
            </div>
          </SettingSection>

          {/* Appearance */}
          <SettingSection
            title="Aparência"
            description="Personalize o tema e cores"
            icon={Palette}
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Tema</Label>
                <div className="flex gap-2">
                  {['Dark Industrial', 'Dark', 'Light'].map((theme) => (
                    <button
                      key={theme}
                      className={cn(
                        "px-4 py-2 rounded-lg border text-sm transition-colors",
                        theme === 'Dark Industrial'
                          ? "border-soma-cyan bg-soma-cyan/10 text-soma-cyan"
                          : "border-border hover:border-soma-cyan/30"
                      )}
                    >
                      {theme}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Cor de Destaque</Label>
                <div className="flex gap-2">
                  {[
                    { color: 'soma-cyan', hex: '#06b6d4' },
                    { color: 'soma-purple', hex: '#8b5cf6' },
                    { color: 'soma-green', hex: '#10b981' },
                    { color: 'soma-orange', hex: '#f59e0b' },
                  ].map(({ color, hex }) => (
                    <button
                      key={color}
                      className={cn(
                        "w-10 h-10 rounded-lg border-2 transition-all",
                        color === 'soma-cyan'
                          ? "border-white scale-110"
                          : "border-transparent hover:scale-105"
                      )}
                      style={{ backgroundColor: hex }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </SettingSection>

          {/* Security */}
          <SettingSection
            title="Segurança"
            description="Configurações de acesso e API"
            icon={Shield}
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>API Key</Label>
                <div className="flex gap-2">
                  <Input 
                    type="password" 
                    defaultValue="sk-somadev-xxxxxxxxxxxx" 
                    readOnly 
                  />
                  <Button variant="outline" size="icon">
                    <Key className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Autenticação 2FA</span>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Sessões ativas</span>
                <span className="text-sm font-mono text-soma-cyan">3 dispositivos</span>
              </div>
            </div>
          </SettingSection>

          {/* Database */}
          <SettingSection
            title="Banco de Dados"
            description="Conexões e configurações"
            icon={Database}
          >
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-secondary/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">PostgreSQL</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-soma-green/10 text-soma-green">
                    Conectado
                  </span>
                </div>
                <p className="text-xs text-muted-foreground font-mono">
                  supabase.co:5432/somadev
                </p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Redis</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-soma-green/10 text-soma-green">
                    Conectado
                  </span>
                </div>
                <p className="text-xs text-muted-foreground font-mono">
                  redis.somadev.me:6379
                </p>
              </div>
            </div>
          </SettingSection>

          {/* Language */}
          <SettingSection
            title="Idioma e Região"
            description="Preferências de localização"
            icon={Globe}
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Idioma</Label>
                <select className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm">
                  <option>Português (Brasil)</option>
                  <option>English</option>
                  <option>Español</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Fuso Horário</Label>
                <select className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm">
                  <option>America/Sao_Paulo (GMT-3)</option>
                  <option>America/New_York (GMT-5)</option>
                  <option>Europe/London (GMT+0)</option>
                </select>
              </div>
            </div>
          </SettingSection>
        </div>
      </motion.div>
    </div>
  );
}
