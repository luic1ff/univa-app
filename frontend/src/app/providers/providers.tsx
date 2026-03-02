import React from "react";
import { MotionConfig } from "framer-motion";
import { ToastProvider } from "@/shared/providers/toast-provider";
import { TooltipProvider } from "@/shared/shadcn/ui/tooltip.tsx";
import { AuthProvider } from "@/app/providers/auth-provider.tsx";
import { SettingsProvider } from "@/app/providers/settings-provider.tsx";
import { useUserSettings } from "@/entities/user/hooks/use-user-settings";

/**
 * Inner wrapper — lives inside SettingsProvider so useUserSettings can
 * subscribe to the store after it has been populated.
 * Passes `reducedMotion` into framer-motion's MotionConfig so that
 * ALL motion.* elements respect the user's animations preference.
 */
function AnimationProvider({ children }: { children: React.ReactNode }) {
    const { animations } = useUserSettings();
    return (
        <MotionConfig reducedMotion={animations ? "never" : "always"}>
            {children}
        </MotionConfig>
    );
}

export function AppProviders({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <SettingsProvider>
                <AnimationProvider>
                    <TooltipProvider delayDuration={0}>
                        <ToastProvider>{children}</ToastProvider>
                    </TooltipProvider>
                </AnimationProvider>
            </SettingsProvider>
        </AuthProvider>
    );
}