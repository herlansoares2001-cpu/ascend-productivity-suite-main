import { useEffect } from 'react';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard, KeyboardResize } from '@capacitor/keyboard';

export const useMobileSetup = () => {
    useEffect(() => {
        const configMobile = async () => {
            try {
                if ((window as any).Capacitor) {
                    // Status Bar
                    await StatusBar.setStyle({ style: Style.Dark });
                    await StatusBar.setBackgroundColor({ color: '#09090b' });
                    await StatusBar.setOverlaysWebView({ overlay: false });

                    // Keyboard
                    await Keyboard.setAccessoryBarVisible({ isVisible: false });
                    await Keyboard.setResizeMode({ mode: KeyboardResize.Native });
                }
            } catch (e) {
                console.log('Mobile plugins not available (web mode)');
            }
        };
        configMobile();
    }, []);
};
