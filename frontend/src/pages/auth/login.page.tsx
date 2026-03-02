import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSignIn } from "@/features/auth/sign-in/use-sign-in";
import { ApiError } from "@/shared/types/api";
import { useToast } from "@/shared/providers/toast-provider";
import usePageTitle from "@/shared/hooks/usePageTitle";

import { OrbitHero } from "@/shared/ui/animations/orbit-hero.animations";
import { LoginForm } from "@/shared/shadcn/components/auth/login-form";
import { themedLogo } from "@/app/config/logo.config";

export function LoginPage() {
    usePageTitle("Вхід");

    const nav = useNavigate();
    const loc = useLocation() as { state?: { from?: string } };
    const { mutateAsync, isPending } = useSignIn();
    const { toast } = useToast();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErrors({});

        try {
            await mutateAsync({ email, password });
            toast({ variant: "success", message: "Ви успішно увійшли!" });
            nav(loc.state?.from ?? "/dashboard", { replace: true });
        } catch (err) {
            if (err instanceof ApiError) {
                if (err.isValidation && err.body.errors) {
                    const fieldErrors: Record<string, string> = {};
                    for (const [key, msgs] of Object.entries(err.body.errors)) {
                        fieldErrors[key] = msgs[0];
                    }
                    setErrors(fieldErrors);
                } else {
                    toast({ variant: "destructive", message: err.body.message });
                }
            } else {
                toast({ variant: "destructive", message: "Щось пішло не так. Спробуйте пізніше." });
            }
        }
    }

    return (
        <div className="grid min-h-svh lg:grid-cols-2">
            <div className="flex flex-col gap-4 p-6 md:p-10">
                <div className="flex justify-center gap-2 md:justify-center">
                    <a href="#" className="flex items-center gap-2 font-medium">
                        <div className="flex w-full h-16 items-center">
                            <img src={themedLogo('full-no-bg')} alt="" className="w-48" />
                        </div>
                    </a>
                </div>
                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full">
                        <LoginForm
                            email={email}
                            password={password}
                            onEmailChange={setEmail}
                            onPasswordChange={setPassword}
                            onSubmit={onSubmit}
                            isPending={isPending}
                            errors={errors}
                        />
                    </div>
                </div>
            </div>
            <div className="bg-muted relative hidden lg:block h-svh">
                <div className="sticky top-0 h-svh flex items-center justify-center pointer-events-none">
                    <OrbitHero size={600} />
                </div>
            </div>
        </div>
    );
}