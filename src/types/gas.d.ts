export interface GasResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Define the functions available on the server
export interface GasServerFunctions {
  withSuccessHandler: (handler: (res: string) => void) => GasServerFunctions;
  withFailureHandler: (handler: (error: Error) => void) => GasServerFunctions;
  doGetAsApi: (payload: {
    key: string;
    action: string;
    product?: unknown;
    email?: string;
    url?: string;
  }) => void;
}

declare global {
  const google: {
    script: {
      run: {
        withSuccessHandler: (
          handler: (res: string) => void,
        ) => GasServerFunctions;
        withFailureHandler: (
          handler: (error: Error) => void,
        ) => GasServerFunctions;
      } & GasServerFunctions;
    };
  };
}
