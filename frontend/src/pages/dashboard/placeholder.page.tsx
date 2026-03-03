import { PackageOpen } from "lucide-react";

export function PlaceholderPage({ title }: { title: string }) {
    return (
        <div className="flex flex-col items-center justify-center p-8 text-center min-h-[60vh]">
            <PackageOpen className="w-16 h-16 text-muted-foreground mb-6 opacity-40" />
            <h2 className="text-2xl font-semibold tracking-tight">В розробці</h2>
            <p className="text-muted-foreground mt-2 max-w-md">
                Модуль &quot;{title}&quot; наразі знаходиться в стадії активної розробки і скоро буде доступний.
            </p>
        </div>
    );
}
