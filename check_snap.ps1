# PowerShell script to detect if window is snapped
# Get the passed process ID parameter
param([int]$ProcessId)

Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
using System.Diagnostics;

public class WindowAPI {
    [DllImport("user32.dll")]
    public static extern IntPtr GetForegroundWindow();
    
    [DllImport("user32.dll")]
    public static extern bool IsWindowArranged(IntPtr hwnd);
    
    [DllImport("user32.dll")]
    public static extern bool IsZoomed(IntPtr hwnd);
    
    [DllImport("user32.dll")]
    public static extern bool IsIconic(IntPtr hwnd);
    
    [DllImport("user32.dll")]
    public static extern int GetWindowThreadProcessId(IntPtr hWnd, out int processId);
    
    public static bool IsElectronWindowArranged(int processId) {
        try {
            Process[] processes = Process.GetProcessesByName("electron");
            foreach (Process proc in processes) {
                if (proc.Id == processId) {
                    IntPtr hwnd = proc.MainWindowHandle;
                    if (hwnd != IntPtr.Zero) {
                        return IsWindowArranged(hwnd);
                    }
                }
            }
            return false;
        } catch {
            return false;
        }
    }
}
"@

try {
    $result = [WindowAPI]::IsElectronWindowArranged($ProcessId)
    Write-Host $result
} catch {
    Write-Host "false"
}
