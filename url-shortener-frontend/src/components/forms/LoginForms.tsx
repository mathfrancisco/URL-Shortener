import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {useLogin} from "@/hooks/use-auth.ts";


const loginSchema = z.object({
    usernameOrEmail: z.string().min(3, 'Username ou email deve ter pelo menos 3 caracteres'),
    password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
    onSuccess?: () => void;
    onForgotPassword?: () => void;
}

export function LoginForm({ onSuccess, onForgotPassword }: LoginFormProps) {
    const [showPassword, setShowPassword] = useState(false);
    const loginMutation = useLogin();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        try {
            await loginMutation.mutateAsync(data);
            onSuccess?.();
        } catch (error) {
            // Error handled by the hook
        }
    };

    return (
        <div className="w-full max-w-md mx-auto space-y-6">
            <div className="space-y-2 text-center">
                <h1 className="text-3xl font-bold">Login</h1>
                <p className="text-muted-foreground">
                    Entre com suas credenciais para acessar sua conta
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="usernameOrEmail">Username ou Email</Label>
                    <Input
                        id="usernameOrEmail"
                        type="text"
                        placeholder="Digite seu username ou email"
                        {...register('usernameOrEmail')}
                        className={errors.usernameOrEmail ? 'border-red-500' : ''}
                    />
                    {errors.usernameOrEmail && (
                        <p className="text-sm text-red-500">{errors.usernameOrEmail.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Digite sua senha"
                            {...register('password')}
                            className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                            ) : (
                                <Eye className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                    {errors.password && (
                        <p className="text-sm text-red-500">{errors.password.message}</p>
                    )}
                </div>

                <div className="flex justify-end">
                    <Button
                        type="button"
                        variant="link"
                        className="px-0 text-sm"
                        onClick={onForgotPassword}
                    >
                        Esqueceu sua senha?
                    </Button>
                </div>

                <Button
                    type="submit"
                    className="w-full"
                    disabled={loginMutation.isPending}
                >
                    {loginMutation.isPending ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Entrando...
                        </>
                    ) : (
                        'Entrar'
                    )}
                </Button>
            </form>
        </div>
    );
}