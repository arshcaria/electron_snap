## Electron Windows Snap State Detection Demo

A minimal Electron example to reproduce and demonstrate issues around detecting and persisting the Windows window snap (Arrange/Snap) state.

### Features
- **Snap detection**: Uses a Windows native API via PowerShell (calling `user32.dll` `IsWindowArranged`) to determine whether the current Electron window is snapped.
- **Window info display**: Shows window position and size in the UI.
- **Security isolation**: `contextIsolation: true`, with a limited and safe `electronAPI` exposed via `preload.js`.

### Environment
- OS: Targeted at **Windows 10/11** (snap detection depends on Windows native API)

### Usage
- After launching the app, try snapping the window by dragging it to screen edges or using Windows shortcuts (e.g., Win+←/→).
- Click “Detect Status” to run a one-time detection and display the result.
- **Bug Reproduction**
    - Click Minimize
    - Restore the window from the taskbar
    - Click “Detect Status” again: you will see the snap state has been lost

### How it works (code structure)
- `main.js`
  - Creates the `BrowserWindow`, sets `preload.js`, enables `contextIsolation`.
  - Handles renderer requests via `ipcMain.handle('get-window-status')`.
  - Executes `check_snap.ps1` with the current **Electron process ID**, where the script calls `user32.dll` `IsWindowArranged` to check snap state.
  - Also returns the window `bounds` and the matching display `workArea` info.
- `preload.js`
  - Exposes a restricted API to the renderer via `contextBridge.exposeInMainWorld('electronAPI', { getWindowStatus })`.
- `renderer.js`
  - On button click, calls `window.electronAPI.getWindowStatus()` and renders the result.
- `index.html` / `style.css`
  - Basic UI and styling.
- `check_snap.ps1`
  - PowerShell script with embedded C#, calling `user32.dll` to detect window snap state.

### Project structure
```text
├─ index.html        # Page markup
├─ style.css         # Styles
├─ main.js           # Main process: window creation, IPC, PowerShell invocation
├─ preload.js        # Preload: exposes restricted API (contextIsolation)
├─ renderer.js       # Renderer: UI interactions and rendering
├─ check_snap.ps1    # Windows native API detection script
├─ package.json      # Project metadata and scripts (npm start)
└─ package-lock.json # Locked dependencies
```

### Platform notes and limitations
- Snap detection relies on Windows native APIs:
  - On non-Windows platforms, snap status is reported as `Unavailable` (`nativeIsArranged: null`).
  - On certain Windows versions or environments, `IsWindowArranged` may be unavailable or behave inconsistently.
- Process name constraint:
  - `check_snap.ps1` queries `Process.GetProcessesByName("electron")` and then matches the provided `ProcessId`. This works in development where the process name is `electron`. In packaged builds, the executable name may differ and the script can return `false`. For packaged apps, adjust how the process is resolved (or use `GetWindowThreadProcessId` to associate strictly by PID).
- PowerShell policy:
  - The script is launched with `-ExecutionPolicy Bypass`. If blocked by policy or security software, allow it locally.


