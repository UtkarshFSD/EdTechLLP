import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { Snackbar, SnackbarType } from "../components/ui/Snackbar";

interface SnackbarOptions {
  message: string;
  type?: SnackbarType;
  duration?: number;
}

interface SnackbarContextValue {
  showSnackbar: (options: SnackbarOptions) => void;
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
}

const SnackbarContext = createContext<SnackbarContextValue | null>(null);

interface SnackbarState {
  visible: boolean;
  message: string;
  type: SnackbarType;
  duration: number;
}

const DEFAULT_STATE: SnackbarState = {
  visible: false,
  message: "",
  type: "success",
  duration: 3000,
};

export function SnackbarProvider({ children }: { children: React.ReactNode }) {
  const [snack, setSnack] = useState<SnackbarState>(DEFAULT_STATE);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hide = useCallback(() => {
    setSnack((s) => ({ ...s, visible: false }));
  }, []);

  const showSnackbar = useCallback(
    ({ message, type = "success", duration = 3000 }: SnackbarOptions) => {
      if (hideTimer.current) clearTimeout(hideTimer.current);

      setSnack({ visible: true, message, type, duration });

      hideTimer.current = setTimeout(() => {
        hide();
      }, duration);
    },
    [hide],
  );

  const showSuccess = useCallback(
    (message: string, duration?: number) =>
      showSnackbar({ message, type: "success", duration }),
    [showSnackbar],
  );

  const showError = useCallback(
    (message: string, duration?: number) =>
      showSnackbar({ message, type: "error", duration }),
    [showSnackbar],
  );

  return (
    <SnackbarContext.Provider value={{ showSnackbar, showSuccess, showError }}>
      {children}
      <Snackbar
        visible={snack.visible}
        message={snack.message}
        type={snack.type}
        onHide={hide}
      />
    </SnackbarContext.Provider>
  );
}

export function useSnackbar(): SnackbarContextValue {
  const ctx = useContext(SnackbarContext);
  if (!ctx)
    throw new Error("useSnackbar must be used within <SnackbarProvider>");
  return ctx;
}
