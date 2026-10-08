import { execFile } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execFileAsync = promisify(execFile);

export interface AntigravityStatus {
  isInstalled: boolean;
  cliBinaryPath?: string;
  ideBinaryPath?: string;
  version?: string;
  status: 'available' | 'offline' | 'uninstalled';
  details: string;
}

// Known paths on Windows for Antigravity
const POTENTIAL_CLI_PATHS = [
  path.join(process.env.APPDATA || '', 'Antigravity', 'bin', 'agy-node.cmd'),
  path.join(process.env.LOCALAPPDATA || '', 'Programs', 'Antigravity IDE', 'bin', 'antigravity-ide.cmd'),
  'C:\\Users\\gebel\\AppData\\Roaming\\Antigravity\\bin\\agy-node.cmd',
  'C:\\Users\\gebel\\AppData\\Local\\Programs\\Antigravity IDE\\bin\\antigravity-ide.cmd',
];

export const detectAntigravity = async (): Promise<AntigravityStatus> => {
  let foundCliPath: string | undefined;
  let foundIdePath: string | undefined;

  for (const p of POTENTIAL_CLI_PATHS) {
    if (fs.existsSync(p)) {
      if (p.includes('agy-node')) {
        foundCliPath = p;
      } else if (p.includes('antigravity-ide')) {
        foundIdePath = p;
      }
    }
  }

  if (!foundCliPath && !foundIdePath) {
    return {
      isInstalled: false,
      status: 'uninstalled',
      details: 'Binários oficiais do Google Antigravity não localizados nas pastas padrão do Windows.',
    };
  }

  // Probe version using the IDE binary or agy-node
  const testBinary = foundIdePath || foundCliPath!;
  try {
    const { stdout } = await execFileAsync(testBinary, ['--version'], { timeout: 6000 });
    const versionLine = stdout.trim().split('\n')[0];
    return {
      isInstalled: true,
      cliBinaryPath: foundCliPath,
      ideBinaryPath: foundIdePath,
      version: versionLine,
      status: 'available',
      details: `Google Antigravity detectado com sucesso (v${versionLine}).`,
    };
  } catch (err: any) {
    return {
      isInstalled: true,
      cliBinaryPath: foundCliPath,
      ideBinaryPath: foundIdePath,
      status: 'available',
      details: `Google Antigravity instalado em ${foundCliPath || foundIdePath}, aguardando sessão do agente local.`,
    };
  }
};
