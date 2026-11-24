
import { ThemeProvider } from "@/components/theme-provider";
import { BackgroundProvider } from "@/components/theme/background-context";
import { ChatEmojiProvider } from "@/components/theme/chat-emoji-context";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Character Getter — Genshin Impact Companion",
  description: "Disciplined character management, pull planning, and progression tracking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen parchment-pattern font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <BackgroundProvider>
            <ChatEmojiProvider>
              {children}
            </ChatEmojiProvider>
          </BackgroundProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
