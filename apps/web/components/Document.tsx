const accessibilityPreference = `try{if(localStorage.getItem('accessibility-enhanced')==='true')document.documentElement.classList.add('visually-enhanced')}catch{}`;

export function Document({ children, lang }: { children: React.ReactNode; lang: "ru" | "kk" }) {
  return <html lang={lang} suppressHydrationWarning><body><script dangerouslySetInnerHTML={{ __html: accessibilityPreference }} />{children}</body></html>;
}
