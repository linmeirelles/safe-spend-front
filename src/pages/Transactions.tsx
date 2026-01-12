import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeftRight,
  Check,
  Filter,
  Search,
} from 'lucide-react';
import { formatCurrency, formatDate, getStartOfMonth, getEndOfMonth } from '@/lib/utils/format';
import { transactionService } from '@/lib/services/transactionService';
import { categoryService } from '@/lib/services/categoryService';
import { accountService } from '@/lib/services/accountService';
import { creditCardService } from '@/lib/services/creditCardService';
import {
  Transaction,
  TransactionRequest,
  TransactionType,
  Category,
  Account,
  CreditCard,
} from '@/types';
import { toast } from 'sonner';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const transactionSchema = z.object({
  description: z.string().min(2, 'Descrição deve ter no mínimo 2 caracteres'),
  amount: z.number().positive('Valor deve ser positivo'),
  date: z.string().min(1, 'Data é obrigatória'),
  paid: z.boolean(),
  type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']),
  categoryId: z.string().min(1, 'Categoria é obrigatória'),
  accountId: z.string().optional(),
  creditCardId: z.string().optional(),
  hasInstallments: z.boolean(),
  installmentCurrent: z.number().optional(),
  installmentTotal: z.number().optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

const transactionTypeConfig: Record<TransactionType, { label: string; icon: typeof ArrowUpRight; color: string }> = {
  INCOME: { label: 'Receita', icon: ArrowUpRight, color: 'text-success' },
  EXPENSE: { label: 'Despesa', icon: ArrowDownRight, color: 'text-destructive' },
  TRANSFER: { label: 'Transferência', icon: ArrowLeftRight, color: 'text-muted-foreground' },
};

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'INCOME' | 'EXPENSE' | 'pending'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    control,
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      description: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      paid: false,
      type: 'EXPENSE',
      categoryId: '',
      accountId: '',
      creditCardId: '',
      hasInstallments: false,
      installmentCurrent: 1,
      installmentTotal: 1,
    },
  });

  const transactionType = watch('type');
  const hasInstallments = watch('hasInstallments');
  const usesCreditCard = watch('creditCardId');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const startDate = getStartOfMonth();
      const endDate = getEndOfMonth();

      const [transactionsData, categoriesData, accountsData, creditCardsData] = await Promise.all([
        transactionService.getByPeriod(startDate, endDate),
        categoryService.getAll(),
        accountService.getAll(),
        creditCardService.getAll(),
      ]);

      setTransactions(transactionsData);
      setCategories(categoriesData);
      setAccounts(accountsData);
      setCreditCards(creditCardsData);
    } catch (error) {
      toast.error('Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingTransaction(null);
    reset({
      description: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      paid: false,
      type: 'EXPENSE',
      categoryId: '',
      accountId: '',
      creditCardId: '',
      hasInstallments: false,
      installmentCurrent: 1,
      installmentTotal: 1,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    reset({
      description: transaction.description,
      amount: transaction.amount,
      date: transaction.date,
      paid: transaction.paid,
      type: transaction.type,
      categoryId: transaction.categoryId,
      accountId: transaction.accountId || '',
      creditCardId: transaction.creditCardId || '',
      hasInstallments: !!transaction.installmentTotal && transaction.installmentTotal > 1,
      installmentCurrent: transaction.installmentCurrent || 1,
      installmentTotal: transaction.installmentTotal || 1,
    });
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (transaction: Transaction) => {
    setDeletingTransaction(transaction);
    setIsDeleteDialogOpen(true);
  };

  const onSubmit = async (data: TransactionFormData) => {
    setIsSubmitting(true);
    try {
      const request: TransactionRequest = {
        description: data.description,
        amount: data.amount,
        date: data.date,
        paid: data.paid,
        type: data.type,
        categoryId: data.categoryId,
        accountId: data.accountId || undefined,
        creditCardId: data.creditCardId || undefined,
        installmentCurrent: data.hasInstallments ? data.installmentCurrent : undefined,
        installmentTotal: data.hasInstallments ? data.installmentTotal : undefined,
      };

      if (editingTransaction) {
        await transactionService.update(editingTransaction.id, request);
        toast.success('Transação atualizada com sucesso!');
      } else {
        await transactionService.create(request);
        toast.success('Transação criada com sucesso!');
      }

      setIsDialogOpen(false);
      loadData();
    } catch (error) {
      toast.error('Erro ao salvar transação');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingTransaction) return;

    try {
      await transactionService.delete(deletingTransaction.id);
      toast.success('Transação excluída com sucesso!');
      setIsDeleteDialogOpen(false);
      loadData();
    } catch (error) {
      toast.error('Erro ao excluir transação');
    }
  };

  const handleMarkAsPaid = async (transaction: Transaction) => {
    try {
      await transactionService.markAsPaid(transaction.id);
      toast.success('Transação marcada como paga!');
      loadData();
    } catch (error) {
      toast.error('Erro ao marcar como paga');
    }
  };

  const getFilteredTransactions = () => {
    let filtered = transactions;

    if (activeTab === 'pending') {
      filtered = filtered.filter((t) => !t.paid);
    } else if (activeTab !== 'all') {
      filtered = filtered.filter((t) => t.type === activeTab);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (t) =>
          t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.categoryName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredTransactions = getFilteredTransactions();
  const filteredCategories = categories.filter((cat) => {
    if (transactionType === 'INCOME') return cat.type === 'INCOME';
    if (transactionType === 'EXPENSE') return cat.type === 'EXPENSE';
    return true;
  });

  const totalIncome = transactions.filter((t) => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);
  const pendingCount = transactions.filter((t) => !t.paid).length;

  return (
    <DashboardLayout title="Transações">
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-muted-foreground">Gerencie suas receitas e despesas</p>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Transação
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Receitas do Mês</p>
                  <p className="text-2xl font-bold text-success">{formatCurrency(totalIncome)}</p>
                </div>
                <ArrowUpRight className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Despesas do Mês</p>
                  <p className="text-2xl font-bold text-destructive">{formatCurrency(totalExpense)}</p>
                </div>
                <ArrowDownRight className="h-8 w-8 text-destructive" />
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Saldo do Mês</p>
                  <p className={`text-2xl font-bold ${totalIncome - totalExpense >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {formatCurrency(totalIncome - totalExpense)}
                  </p>
                </div>
                <ArrowLeftRight className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Table */}
        <Card className="shadow-card">
          <CardHeader className="pb-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
                <TabsList>
                  <TabsTrigger value="all">Todas</TabsTrigger>
                  <TabsTrigger value="INCOME">Receitas</TabsTrigger>
                  <TabsTrigger value="EXPENSE">Despesas</TabsTrigger>
                  <TabsTrigger value="pending" className="relative">
                    Pendentes
                    {pendingCount > 0 && (
                      <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
                        {pendingCount}
                      </span>
                    )}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 w-64"
                  />
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <ArrowLeftRight className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">Nenhuma transação encontrada</p>
                <p className="text-muted-foreground mb-4">Comece adicionando uma transação</p>
                <Button onClick={openCreateDialog}>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Transação
                </Button>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction) => {
                      const config = transactionTypeConfig[transaction.type];
                      const Icon = config.icon;

                      return (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div
                                className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                                  transaction.type === 'INCOME'
                                    ? 'bg-success/10 text-success'
                                    : transaction.type === 'EXPENSE'
                                    ? 'bg-destructive/10 text-destructive'
                                    : 'bg-muted text-muted-foreground'
                                }`}
                              >
                                <Icon className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="font-medium">{transaction.description}</p>
                                {transaction.installmentTotal && transaction.installmentTotal > 1 && (
                                  <p className="text-xs text-muted-foreground">
                                    Parcela {transaction.installmentCurrent}/{transaction.installmentTotal}
                                  </p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{transaction.categoryName || '-'}</Badge>
                          </TableCell>
                          <TableCell>{formatDate(transaction.date)}</TableCell>
                          <TableCell className={config.color + ' font-medium'}>
                            {transaction.type === 'INCOME' ? '+' : '-'}
                            {formatCurrency(transaction.amount)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={transaction.paid ? 'default' : 'secondary'}>
                              {transaction.paid ? 'Pago' : 'Pendente'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              {!transaction.paid && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-success hover:text-success"
                                  onClick={() => handleMarkAsPaid(transaction)}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                              )}
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(transaction)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => openDeleteDialog(transaction)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingTransaction ? 'Editar Transação' : 'Nova Transação'}</DialogTitle>
            <DialogDescription>
              {editingTransaction ? 'Atualize os dados da transação' : 'Adicione uma nova transação'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <div className="flex gap-2">
                  {(['INCOME', 'EXPENSE'] as TransactionType[]).map((type) => {
                    const config = transactionTypeConfig[type];
                    const Icon = config.icon;
                    return (
                      <Button
                        key={type}
                        type="button"
                        variant={transactionType === type ? 'default' : 'outline'}
                        className="flex-1"
                        onClick={() => {
                          setValue('type', type);
                          setValue('categoryId', '');
                        }}
                      >
                        <Icon className="mr-2 h-4 w-4" />
                        {config.label}
                      </Button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  placeholder="Ex: Supermercado, Salário"
                  {...register('description')}
                  className={errors.description ? 'border-destructive' : ''}
                />
                {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Valor</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    {...register('amount', { valueAsNumber: true })}
                    className={errors.amount ? 'border-destructive' : ''}
                  />
                  {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Data</Label>
                  <Input id="date" type="date" {...register('date')} className={errors.date ? 'border-destructive' : ''} />
                  {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Categoria</Label>
                <Controller
                  name="categoryId"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className={errors.categoryId ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredCategories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.categoryId && <p className="text-sm text-destructive">{errors.categoryId.message}</p>}
              </div>

              {transactionType === 'EXPENSE' && (
                <div className="space-y-4 p-4 rounded-lg bg-muted/50">
                  <Label className="text-sm font-medium">Pagar com</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="accountId" className="text-xs">Conta</Label>
                      <Controller
                        name="accountId"
                        control={control}
                        render={({ field }) => (
                          <Select
                            value={field.value || 'none'}
                            onValueChange={(v) => {
                              field.onChange(v === 'none' ? '' : v);
                              if (v && v !== 'none') setValue('creditCardId', '');
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Nenhuma</SelectItem>
                              {accounts.map((account) => (
                                <SelectItem key={account.id} value={account.id}>
                                  {account.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="creditCardId" className="text-xs">Cartão</Label>
                      <Controller
                        name="creditCardId"
                        control={control}
                        render={({ field }) => (
                          <Select
                            value={field.value || 'none'}
                            onValueChange={(v) => {
                              field.onChange(v === 'none' ? '' : v);
                              if (v && v !== 'none') setValue('accountId', '');
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Nenhum</SelectItem>
                              {creditCards.map((card) => (
                                <SelectItem key={card.id} value={card.id}>
                                  {card.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                  </div>
                </div>
              )}

              {transactionType === 'INCOME' && (
                <div className="space-y-2">
                  <Label>Conta destino</Label>
                  <Controller
                    name="accountId"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma conta" />
                        </SelectTrigger>
                        <SelectContent>
                          {accounts.map((account) => (
                            <SelectItem key={account.id} value={account.id}>
                              {account.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Controller
                  name="hasInstallments"
                  control={control}
                  render={({ field }) => (
                    <Checkbox id="hasInstallments" checked={field.value} onCheckedChange={field.onChange} />
                  )}
                />
                <Label htmlFor="hasInstallments" className="text-sm font-normal">
                  Parcelar transação
                </Label>
              </div>

              {hasInstallments && (
                <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-muted/50">
                  <div className="space-y-2">
                    <Label htmlFor="installmentCurrent" className="text-xs">Parcela Atual</Label>
                    <Input
                      id="installmentCurrent"
                      type="number"
                      min="1"
                      {...register('installmentCurrent', { valueAsNumber: true })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="installmentTotal" className="text-xs">Total de Parcelas</Label>
                    <Input
                      id="installmentTotal"
                      type="number"
                      min="1"
                      {...register('installmentTotal', { valueAsNumber: true })}
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Controller
                  name="paid"
                  control={control}
                  render={({ field }) => <Checkbox id="paid" checked={field.value} onCheckedChange={field.onChange} />}
                />
                <Label htmlFor="paid" className="text-sm font-normal">
                  Já foi pago
                </Label>
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
                ) : editingTransaction ? (
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
            <AlertDialogTitle>Excluir transação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a transação "{deletingTransaction?.description}"? Esta ação não pode ser desfeita.
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
