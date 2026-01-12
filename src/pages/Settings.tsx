import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/contexts/ThemeContext';
import { Moon, Sun, Monitor, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Settings() {
  const { theme, setTheme, actualTheme } = useTheme();

  const themeOptions = [
    {
      value: 'light' as const,
      label: 'Claro',
      icon: Sun,
      description: 'Tema claro para uso diurno',
    },
    {
      value: 'dark' as const,
      label: 'Escuro',
      icon: Moon,
      description: 'Tema escuro para reduzir fadiga visual',
    },
    {
      value: 'system' as const,
      label: 'Sistema',
      icon: Monitor,
      description: 'Usa a preferência do seu sistema',
    },
  ];

  return (
    <DashboardLayout title="Configurações">
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <p className="text-muted-foreground">Personalize sua experiência no SafeSpend</p>
        </div>

        {/* Appearance Settings */}
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              <CardTitle>Aparência</CardTitle>
            </div>
            <CardDescription>
              Escolha o tema que melhor se adequa ao seu estilo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Quick Toggle */}
            <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
              <div className="flex items-center gap-3">
                {actualTheme === 'dark' ? (
                  <Moon className="h-5 w-5 text-primary" />
                ) : (
                  <Sun className="h-5 w-5 text-primary" />
                )}
                <div>
                  <Label htmlFor="dark-mode" className="text-base font-medium">
                    Modo Escuro
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {theme === 'system' 
                      ? 'Seguindo preferência do sistema'
                      : actualTheme === 'dark' 
                        ? 'Ativado' 
                        : 'Desativado'}
                  </p>
                </div>
              </div>
              <Switch
                id="dark-mode"
                checked={actualTheme === 'dark'}
                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
              />
            </div>

            {/* Theme Options */}
            <div>
              <Label className="text-sm font-medium mb-3 block">
                Opções de Tema
              </Label>
              <div className="grid gap-3 sm:grid-cols-3">
                {themeOptions.map((option) => {
                  const Icon = option.icon;
                  const isSelected = theme === option.value;
                  
                  return (
                    <Button
                      key={option.value}
                      variant={isSelected ? 'default' : 'outline'}
                      className="h-auto p-4 flex-col items-start gap-2"
                      onClick={() => setTheme(option.value)}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <Icon className="h-4 w-4" />
                        <span className="font-medium">{option.label}</span>
                      </div>
                      <p className={`text-xs text-left w-full ${
                        isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'
                      }`}>
                        {option.description}
                      </p>
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Preview */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Pré-visualização
              </Label>
              <div className="p-4 rounded-lg border bg-muted/50 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-success"></div>
                  <div className="h-2 w-24 rounded bg-foreground/20"></div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-destructive"></div>
                  <div className="h-2 w-32 rounded bg-foreground/20"></div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-primary"></div>
                  <div className="h-2 w-20 rounded bg-foreground/20"></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Future Settings Placeholder */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Mais Configurações</CardTitle>
            <CardDescription>
              Novas opções de personalização em breve...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <p>🚧 Em desenvolvimento</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
