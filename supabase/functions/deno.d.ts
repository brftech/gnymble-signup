// Deno type declarations for VS Code
declare global {
  const Deno: {
    env: {
      get(key: string): string | undefined;
    };
  };
}

export {};
