"use client";

type ToastType = "success" | "error" | "info";

export function useToast() {
  return {
    show(message: string, type: ToastType = "info") {
      const element = document.createElement("div");
      element.className = `toast toast--${type}`;
      element.textContent = message;
      document.body.appendChild(element);
      window.setTimeout(() => element.classList.add("is-visible"), 10);
      window.setTimeout(() => {
        element.classList.remove("is-visible");
        window.setTimeout(() => element.remove(), 220);
      }, 2600);
    },
  };
}
