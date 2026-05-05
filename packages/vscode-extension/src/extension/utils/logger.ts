import * as vscode from 'vscode';

export class Logger {
  private outputChannel: vscode.OutputChannel;

  constructor(outputChannel: vscode.OutputChannel) {
    this.outputChannel = outputChannel;
  }

  private formatMessage(level: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    let formatted = `[${timestamp}] ${level}: ${message}`;
    
    if (data !== undefined) {
      if (typeof data === 'object') {
        formatted += `\n${JSON.stringify(data, null, 2)}`;
      } else {
        formatted += ` ${data}`;
      }
    }
    
    return formatted;
  }

  log(message: string, data?: any) {
    const formatted = this.formatMessage('INFO', message, data);
    this.outputChannel.appendLine(formatted);
  }

  error(message: string, data?: any) {
    const formatted = this.formatMessage('ERROR', message, data);
    this.outputChannel.appendLine(formatted);
  }

  warn(message: string, data?: any) {
    const formatted = this.formatMessage('WARN', message, data);
    this.outputChannel.appendLine(formatted);
  }

  debug(message: string, data?: any) {
    const formatted = this.formatMessage('DEBUG', message, data);
    this.outputChannel.appendLine(formatted);
  }

  separator(title?: string) {
    const line = '='.repeat(60);
    if (title) {
      const padding = Math.max(0, 60 - title.length - 4);
      const leftPad = Math.floor(padding / 2);
      const rightPad = padding - leftPad;
      this.outputChannel.appendLine(`${'='.repeat(leftPad)} ${title} ${'='.repeat(rightPad)}`);
    } else {
      this.outputChannel.appendLine(line);
    }
  }

  show() {
    this.outputChannel.show();
  }
}