/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_OTHER_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  puter?: {
    ai: {
      chat: (prompt: string | any[], options?: any) => Promise<any>;
      txt2img: (prompt: string, options?: any) => Promise<HTMLImageElement | any>;
    };
    auth?: {
      isSignedIn: () => boolean;
      signIn: () => Promise<any>;
      getUser: () => Promise<any>;
    };
  };
}
