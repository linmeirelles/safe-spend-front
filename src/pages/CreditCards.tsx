import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, CreditCard, Pencil, Trash2, Loader2, Calendar } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/format';
import { creditCardService } from '@/lib/services/creditCardService';
import { CreditCard as CreditCardType, CreditCardRequest } from '@/types';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const creditCardSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  closingDay: z.number().min(1).max(31, 'Dia deve ser entre 1 e 31'),
  dueDay: z.number().min(1).max(31, 'Dia deve ser entre 1 e 31'),
  limitValue: z.number().min(0, 'Limite deve ser positivo'),
});

type CreditCardFormData = z.infer<typeof creditCardSchema>;

export default function CreditCards() {
  const [creditCards, setCreditCards] = useState<CreditCardType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCardType | null>(null);
  const [deletingCard, setDeletingCard] = useState<CreditCardType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreditCardFormData>({
    resolver: zodResolver(creditCardSchema),
    defaultValues: {
      name: '',
      closingDay: 1,
      dueDay: 10,
      limitValue: 0,
    },
  });

  useEffect(() => {
    loadCreditCards();
  }, []);

  const loadCreditCards = async () => {
    setIsLoading(true);
    try {
      const data = await creditCardService.getAll();
      setCreditCards(data);
    } catch (error) {
      toast.error('Erro ao carregar cartões');
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingCard(null);
    reset({ name: '', closingDay: 1, dueDay: 10, limitValue: 0 });
    setIsDialogOpen(true);
  };

  const openEditDialog = (card: CreditCardType) => {
    setEditingCard(card);
    reset({
      name: card.name,
      closingDay: card.closingDay,
      dueDay: card.dueDay,
      limitValue: card.limitValue,
    });
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (card: CreditCardType) => {
    setDeletingCard(card);
    setIsDeleteDialogOpen(true);
  };

  const onSubmit = async (data: CreditCardFormData) => {
    setIsSubmitting(true);
    try {
      const request: CreditCardRequest = {
        name: data.name,
        closingDay: data.closingDay,
        dueDay: data.dueDay,
        limitValue: data.limitValue,
      };

      if (editingCard) {
        await creditCardService.update(editingCard.id, request);
        toast.success('Cartão atualizado com sucesso!');
      } else {
        await creditCardService.create(request);
        toast.success('Cartão criado com sucesso!');
      }

      setIsDialogOpen(false);
      loadCreditCards();
    } catch (error) {
      toast.error('Erro ao salvar cartão');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCard) return;

    try {
      await creditCardService.delete(deletingCard.id);
      toast.success('Cartão excluído com sucesso!');
      setIsDeleteDialogOpen(false);
      loadCreditCards();
    } catch (error) {
      toast.error('Erro ao excluir cartão');
    }
  };

  const totalLimit = creditCards.reduce((sum, card) => sum + card.limitValue, 0);
  const totalUsed = creditCards.reduce((sum, card) => sum + card.usedLimit, 0);
  const totalAvailable = creditCards.reduce((sum, card) => sum + card.availableLimit, 0);

  return (
    <DashboardLayout title="Cartões de Crédito">
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-muted-foreground">Gerencie seus cartões de crédito</p>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Cartão
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Limite Total</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalLimit)}</p>
                </div>
                <CreditCard className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Limite Usado</p>
                  <p className="text-2xl font-bold text-destructive">{formatCurrency(totalUsed)}</p>
                </div>
                <CreditCard className="h-8 w-8 text-destructive" />
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Limite Disponível</p>
                  <p className="text-2xl font-bold text-success">{formatCurrency(totalAvailable)}</p>
                </div>
                <CreditCard className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cards Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : creditCards.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">Nenhum cartão cadastrado</p>
              <p className="text-muted-foreground mb-4">Comece adicionando seu primeiro cartão</p>
              <Button onClick={openCreateDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Cartão
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {creditCards.map((card) => {
              const usagePercent = card.limitValue > 0 ? (card.usedLimit / card.limitValue) * 100 : 0;
              const isHighUsage = usagePercent > 80;

              return (
                <Card key={card.id} className="shadow-card hover:shadow-card-hover transition-shadow overflow-hidden">
                  <div className="h-2 bg-gradient-to-r from-primary via-primary to-primary/80" />
                  <CardHeader className="flex flex-row items-start justify-between pb-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <CreditCard className="h-5 w-5" />
                      </div>
                      <CardTitle className="text-base">{card.name}</CardTitle>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(card)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => openDeleteDialog(card)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Limite Usado</span>
                        <span className={isHighUsage ? 'text-destructive font-medium' : ''}>
                          {usagePercent.toFixed(0)}%
                        </span>
                      </div>
                      <Progress value={usagePercent} className={isHighUsage ? '[&>div]:bg-destructive' : ''} />
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{formatCurrency(card.usedLimit)}</span>
                        <span className="text-muted-foreground">{formatCurrency(card.limitValue)}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Disponível</span>
                        <span className="font-medium text-success">{formatCurrency(card.availableLimit)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 pt-2 border-t border-border text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Fecha dia {card.closingDay}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Vence dia {card.dueDay}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCard ? 'Editar Cartão' : 'Novo Cartão'}</DialogTitle>
            <DialogDescription>
              {editingCard ? 'Atualize os dados do cartão' : 'Adicione um novo cartão de crédito'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Cartão</Label>
                <Input
                  id="name"
                  placeholder="Ex: Nubank, Itaú Platinum"
                  {...register('name')}
                  className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="closingDay">Dia de Fechamento</Label>
                  <Input
                    id="closingDay"
                    type="number"
                    min="1"
                    max="31"
                    {...register('closingDay', { valueAsNumber: true })}
                    className={errors.closingDay ? 'border-destructive' : ''}
                  />
                  {errors.closingDay && <p className="text-sm text-destructive">{errors.closingDay.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDay">Dia de Vencimento</Label>
                  <Input
                    id="dueDay"
                    type="number"
                    min="1"
                    max="31"
                    {...register('dueDay', { valueAsNumber: true })}
                    className={errors.dueDay ? 'border-destructive' : ''}
                  />
                  {errors.dueDay && <p className="text-sm text-destructive">{errors.dueDay.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="limitValue">Limite</Label>
                <Input
                  id="limitValue"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  {...register('limitValue', { valueAsNumber: true })}
                  className={errors.limitValue ? 'border-destructive' : ''}
                />
                {errors.limitValue && <p className="text-sm text-destructive">{errors.limitValue.message}</p>}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : editingCard ? (
                  'Atualizar'
                ) : (
                  'Criar'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir cartão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o cartão "{deletingCard?.name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
