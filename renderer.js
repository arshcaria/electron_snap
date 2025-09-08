// Renderer process script for bug demonstration app

document.addEventListener('DOMContentLoaded', function() {
    const detectButton = document.getElementById('detectButton');
    if (detectButton) {
        detectButton.addEventListener('click', detectWindowStatus);
    }
});

// Detect window status
async function detectWindowStatus() {
    try {
        updateStatus('Detecting window status...', true);
        const info = await window.electronAPI.getWindowStatus();
        displayWindowStatus(info);
    } catch (error) {
        updateStatus(`Detection failed: ${error.message}`);
    }
}

// Update status display
function updateStatus(message, isLoading = false) {
    const statusDiv = document.getElementById('statusInfo');
    if (!statusDiv) return;
    
    if (isLoading) {
        statusDiv.innerHTML = `<span class="status-label">${message}</span>`;
    } else {
        statusDiv.innerHTML = `<span class="status-label">Error:</span> ${message}`;
    }
    statusDiv.classList.add('show');
}

// Display window status information
function displayWindowStatus(info) {
    const statusDiv = document.getElementById('statusInfo');
    if (!statusDiv) return;
    
    // Native API detection result
    const nativeStatus = info.nativeIsArranged === null ? 'Unavailable' : 
                        info.nativeIsArranged === true ? 'Snapped' : 'Not Snapped';
    const nativeClass = info.nativeIsArranged === true ? 'snapped' : '';
    
    statusDiv.innerHTML = `
        <div><span class="status-label">Snap Status:</span> 
             <span class="snap-status ${nativeClass}">${nativeStatus}</span></div>
        <div class="current-state">
            <span class="status-label">Position:</span> ${info.bounds.x}, ${info.bounds.y}<br>
            <span class="status-label">Size:</span> ${info.bounds.width} × ${info.bounds.height}
        </div>
    `;
    
    statusDiv.classList.add('show');
}

