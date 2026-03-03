type RuntimePromptResponse = {
  runtimes?: string[];
};

type InstallModePromptResponse = {
  installMode?: 'symlink' | 'copy';
};

export function resolveRuntimeSelection(response: RuntimePromptResponse): {
  runtimes: string[];
  cancelled: boolean;
} {
  if (!Array.isArray(response.runtimes)) {
    return {
      runtimes: [],
      cancelled: true,
    };
  }

  return {
    runtimes: response.runtimes,
    cancelled: false,
  };
}

export function resolveInstallModeSelection(
  response: InstallModePromptResponse,
  fallbackMode: 'symlink' | 'copy',
): {
  installMode: 'symlink' | 'copy';
  cancelled: boolean;
} {
  if (response.installMode !== 'symlink' && response.installMode !== 'copy') {
    return {
      installMode: fallbackMode,
      cancelled: true,
    };
  }

  return {
    installMode: response.installMode,
    cancelled: false,
  };
}
