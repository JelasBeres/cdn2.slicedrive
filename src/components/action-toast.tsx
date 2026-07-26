import { cn } from "@/lib/utils";

type ActionToastProps = {
  message: string;
  type?: "success" | "error";
};

export function ActionToast({ message, type = "success" }: ActionToastProps) {
  if (!message) return null;

  return (
    <div
      className={cn(
        "fixed bottom-5 right-5 z-[999] max-w-sm rounded-md border bg-[var(--panel-bg-2)] px-4 py-3 text-sm shadow-2xl",
        type === "success"
          ? "border-green-500/50 text-[var(--panel-green)]"
          : "border-red-500/50 text-[var(--panel-red)]",
      )}
    >
      {message}
    </div>
  );
}
