import fs from "fs";
import path from "path";

interface LogEntry {
  timestamp: string;
  action: string;
  user?: string;
  details: any;
  ipAddress?: string;
  userAgent?: string;
}

class Logger {
  private logsDir: string;
  private logFile: string;

  constructor() {
    this.logsDir = path.join(process.cwd(), "logs");
    this.logFile = path.join(this.logsDir, "system.log");
    this.ensureLogsDir();
  }

  private ensureLogsDir() {
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }
  }

  private formatLogEntry(entry: LogEntry): string {
    return JSON.stringify(entry) + "\n";
  }

  public log(action: string, details: any, req?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      action,
      details,
    };

    if (req) {
      entry.ipAddress = req.ip || req.connection?.remoteAddress || 'unknown';
      entry.userAgent = req.get('User-Agent') || 'unknown';
    }

    const logLine = this.formatLogEntry(entry);
    
    try {
      fs.appendFileSync(this.logFile, logLine);
      console.log(`[LOG] ${action}:`, details);
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  public getLogs(limit: number = 100): LogEntry[] {
    try {
      if (!fs.existsSync(this.logFile)) {
        return [];
      }

      const content = fs.readFileSync(this.logFile, 'utf8');
      const lines = content.trim().split('\n').filter(line => line);
      
      // Get the last 'limit' lines
      const recentLines = lines.slice(-limit);
      
      return recentLines.map(line => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      }).filter(entry => entry !== null);
    } catch (error) {
      console.error('Failed to read log file:', error);
      return [];
    }
  }

  public clearLogs() {
    try {
      if (fs.existsSync(this.logFile)) {
        fs.writeFileSync(this.logFile, '');
        this.log('SYSTEM', { message: 'Logs cleared' });
      }
    } catch (error) {
      console.error('Failed to clear logs:', error);
    }
  }
}

export const logger = new Logger();
export default logger;