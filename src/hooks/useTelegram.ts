import { useEffect, useMemo, useState, useCallback } from "react";

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        close: () => void;
        enableClosingConfirmation?: () => void;
        disableClosingConfirmation?: () => void;
        disableVerticalSwipes?: () => void;
        enableVerticalSwipes?: () => void;
        setHeaderColor?: (color: string) => void;
        setBackgroundColor?: (color: string) => void;
        requestFullscreen?: () => void;
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            photo_url?: string;
            language_code?: string;
          };
          start_param?: string;
        };
        themeParams: Record<string, string>;
        colorScheme: "light" | "dark";
        viewportHeight: number;
        viewportStableHeight: number;
        isExpanded: boolean;
        platform: string;
        MainButton: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          isActive: boolean;
          show: () => void;
          hide: () => void;
          onClick: (cb: () => void) => void;
          offClick: (cb: () => void) => void;
          setText: (text: string) => void;
          enable: () => void;
          disable: () => void;
          showProgress: (leaveActive?: boolean) => void;
          hideProgress: () => void;
          setParams?: (params: Record<string, string | boolean>) => void;
        };
        BackButton: {
          isVisible: boolean;
          show: () => void;
          hide: () => void;
          onClick: (cb: () => void) => void;
          offClick: (cb: () => void) => void;
        };
        HapticFeedback: {
          impactOccurred: (style: "light" | "medium" | "heavy" | "rigid" | "soft") => void;
          notificationOccurred: (type: "error" | "success" | "warning") => void;
          selectionChanged: () => void;
        };
        onEvent: (event: string, cb: () => void) => void;
        offEvent: (event: string, cb: () => void) => void;
      };
    };
  }
}

export function useTelegram() {
  const [isReady, setIsReady] = useState(false);
  const webApp = typeof window !== "undefined" ? window.Telegram?.WebApp : undefined;

  useEffect(() => {
    if (!webApp) {
      setIsReady(true);
      return;
    }

    webApp.ready();
    webApp.expand();

    try {
      webApp.setHeaderColor?.("#07110d");
      webApp.setBackgroundColor?.("#07110d");
      webApp.disableVerticalSwipes?.();
    } catch {
      /* older clients */
    }

    setIsReady(true);
  }, [webApp]);

  const user = webApp?.initDataUnsafe?.user;

  const haptic = useMemo(
    () => ({
      light: () => webApp?.HapticFeedback?.impactOccurred("light"),
      medium: () => webApp?.HapticFeedback?.impactOccurred("medium"),
      heavy: () => webApp?.HapticFeedback?.impactOccurred("heavy"),
      success: () => webApp?.HapticFeedback?.notificationOccurred("success"),
      error: () => webApp?.HapticFeedback?.notificationOccurred("error"),
      warning: () => webApp?.HapticFeedback?.notificationOccurred("warning"),
      selection: () => webApp?.HapticFeedback?.selectionChanged(),
    }),
    [webApp]
  );

  const mainHandlerRef = { current: () => {} };

  const showMainButton = useCallback(
    (text: string, onClick: () => void) => {
      const mb = webApp?.MainButton;
      if (!mb) return;
      mainHandlerRef.current = onClick;
      mb.setText(text);
      try {
        mb.setParams?.({
          color: "#c7a05c",
          text_color: "#1a1208",
          is_active: true,
          is_visible: true,
        });
      } catch {
        /* ignore */
      }
      const stable = () => mainHandlerRef.current();
      mb.offClick(stable);
      mb.onClick(stable);
      mb.show();
      mb.enable();
    },
    [webApp]
  );

  const hideMainButton = useCallback(() => {
    const mb = webApp?.MainButton;
    if (!mb) return;
    mb.hide();
  }, [webApp]);

  const showBackButton = useCallback(
    (onClick: () => void) => {
      const bb = webApp?.BackButton;
      if (!bb) return;
      bb.show();
      bb.onClick(onClick);
    },
    [webApp]
  );

  const hideBackButton = useCallback(() => {
    webApp?.BackButton?.hide();
  }, [webApp]);

  const setClosingConfirmation = useCallback(
    (enabled: boolean) => {
      try {
        if (enabled) webApp?.enableClosingConfirmation?.();
        else webApp?.disableClosingConfirmation?.();
      } catch {
        /* ignore */
      }
    },
    [webApp]
  );

  return {
    isReady,
    webApp,
    user,
    userId: user?.id?.toString() ?? "local",
    userName: user?.first_name ?? "Игрок",
    photoUrl: user?.photo_url,
    initData: webApp?.initData ?? "",
    colorScheme: webApp?.colorScheme ?? "dark",
    platform: webApp?.platform ?? "web",
    isTelegram: Boolean(webApp),
    haptic,
    showMainButton,
    hideMainButton,
    showBackButton,
    hideBackButton,
    setClosingConfirmation,
  };
}
