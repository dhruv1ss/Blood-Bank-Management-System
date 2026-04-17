import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useThemeStore = create(
    persist(
        (set, get) => ({
            theme: 'light',
            isDark: false,
            toggleTheme: () => {
                const newTheme = get().theme === 'light' ? 'dark' : 'light';
                set({ theme: newTheme, isDark: newTheme === 'dark' });
                document.documentElement.classList.toggle('dark', newTheme === 'dark');
            },
            initTheme: () => {
                const theme = get().theme;
                set({ isDark: theme === 'dark' });
                document.documentElement.classList.toggle('dark', theme === 'dark');
            },
            setTheme: (theme) => {
                set({ theme, isDark: theme === 'dark' });
                document.documentElement.classList.toggle('dark', theme === 'dark');
            },
        }),
        {
            name: 'lifeflow-theme',
        }
    )
);
