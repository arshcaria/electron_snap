// Import app and BrowserWindow modules from electron package
const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');
const { execSync } = require('child_process');

// Define a function to create the application window
const createWindow = () => {
  // Create a new browser window
  const mainWindow = new BrowserWindow({
    width: 800, // Set window width
    height: 600, // Set window height
    webPreferences: {
      // __dirname points to the current file path
      // path.join is used to create cross-platform path strings
      // preload script loads before the renderer process and has access to Node.js APIs
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // Load the index.html file in the window
  mainWindow.loadFile('index.html');

  // Developer tools disabled for bug demonstration
  // mainWindow.webContents.openDevTools();
  
  return mainWindow;
};

// Use Windows native API to detect if window is snapped
function checkWindowArrangedNative(window) {
  if (process.platform !== 'win32') {
    return null; // Non-Windows platform
  }
  
  try {
    const processId = process.pid;
    const psScript = path.join(__dirname, 'check_snap.ps1');
    const result = execSync(`powershell -ExecutionPolicy Bypass -File "${psScript}" -ProcessId ${processId}`, 
                           { encoding: 'utf8', timeout: 5000 }).trim();
    return result === 'True';
  } catch (error) {
    console.log('Native API detection failed:', error.message);
    return null;
  }
}

// Simple function to get basic window info and native snap detection
function getWindowInfo(window) {
  const bounds = window.getBounds();
  const display = screen.getDisplayMatching(bounds);
  
  // Use native API to detect snap state
  const nativeResult = checkWindowArrangedNative(window);
  
  console.log('Window bounds:', bounds);
  console.log('Native API snap detection:', nativeResult);
  
  return {
    nativeIsArranged: nativeResult,
    bounds: bounds,
    workArea: display.workArea,
    display: {
      size: display.size,
      workAreaSize: display.workAreaSize
    }
  };
}

// IPC handler: Get window status
ipcMain.handle('get-window-status', (event) => {
  console.log('Received window status detection request...');
  const window = BrowserWindow.fromWebContents(event.sender);
  const info = getWindowInfo(window);
  console.log('Window info:', info);
  return info;
});

// When Electron app is ready, call the createWindow function
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  // Add a special listener for macOS. When the dock icon is clicked and no other windows are open,
  // recreate a window.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// When all windows are closed, exit the application.
// On Windows and Linux, closing all windows usually completely exits an application.
app.on('window-all-closed', () => {
  // On macOS, unless the user explicitly exits with Cmd + Q,
  // the application and its menu bar will remain active.
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
