type RuntimeDirectorySymlinkMapping = {
  source: string;
  target?: string;
  linkMode?: 'entry' | 'directory';
  sourceEntry?: string;
  targetEntry?: string;
};

export type { RuntimeDirectorySymlinkMapping };
