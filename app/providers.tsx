"use client";

import { ReactNode } from "react";
import { createTheme, MantineColorsTuple, MantineProvider, MantineThemeOverride } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import "@mantine/notifications/styles.css";

export default function Providers({ children }: { children: ReactNode }) {
    const paleGreen: MantineColorsTuple = [
        "#eafbf0",
        "#dcf0e3",
        "#bbdfc7",
        "#97cca9",
        "#79bc90",
        "#65b380",
        "#58ad75",
        "#499865",
        "#3e8858",
        "#2e7649",
    ];

    const theme: MantineThemeOverride = createTheme({
        colors: {
            "pale-green": paleGreen,
        },
    });

    return (
        <MantineProvider theme={theme}>
            <Notifications position="bottom-center" zIndex={2000} />
            {children}
        </MantineProvider>
    );
}
