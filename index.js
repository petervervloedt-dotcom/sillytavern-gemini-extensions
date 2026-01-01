
/**
 * SillyTavern Extension Loader: Gemini Multi-Modal Agent
 * This script runs in the main SillyTavern window context.
 */

(function() {
    // Dynamically detect the extension path to avoid hardcoding folder names
    const scriptSrc = document.currentScript ? document.currentScript.src : '';
    const extensionPath = scriptSrc.substring(0, scriptSrc.lastIndexOf('/') + 1);
    
    console.log("Gemini Agent Extension: Loading from", extensionPath);

    function initExtension() {
        // Create the menu item in SillyTavern's extensions list
        const extensionMenuButton = document.createElement('div');
        extensionMenuButton.classList.add('list-group-item', 'list-group-item-action', 'clickable');
        extensionMenuButton.innerHTML = `
            <i class="fas fa-magic"></i>
            <span class="extension_name">Gemini Agent</span>
        `;

        extensionMenuButton.addEventListener('click', () => {
            toggleGeminiWindow();
        });

        // Add to SillyTavern's extensions panel
        const extensionsList = document.getElementById('extensions_settings_list');
        if (extensionsList) {
            extensionsList.appendChild(extensionMenuButton);
        } else {
            // Fallback if the settings panel isn't open yet
            const observer = new MutationObserver((mutations, obs) => {
                const list = document.getElementById('extensions_settings_list');
                if (list) {
                    list.appendChild(extensionMenuButton);
                    obs.disconnect();
                }
            });
            observer.observe(document.body, { childList: true, subtree: true });
        }
    }

    function toggleGeminiWindow() {
        const containerId = 'gemini-agent-container';
        let container = document.getElementById(containerId);

        if (container) {
            container.style.display = container.style.display === 'none' ? 'flex' : 'none';
            return;
        }

        // Create a floating, draggable window
        container = document.createElement('div');
        container.id = containerId;
        container.style.cssText = `
            position: fixed;
            top: 70px;
            right: 20px;
            width: 420px;
            height: 75vh;
            background: #0d0d0d;
            border: 1px solid #222;
            border-radius: 10px;
            box-shadow: 0 15px 50px rgba(0,0,0,0.9);
            z-index: 3000;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            resize: both;
            min-width: 300px;
            min-height: 400px;
        `;

        // Draggable Header
        const header = document.createElement('div');
        header.style.cssText = `
            padding: 12px;
            background: #161616;
            cursor: move;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #222;
            user-select: none;
        `;
        header.innerHTML = `
            <div style="display:flex; align-items:center; gap:8px;">
                <i class="fas fa-sparkles" style="color:#6366f1; font-size: 12px;"></i>
                <span style="font-weight: bold; font-size: 11px; color: #ddd; text-transform: uppercase; letter-spacing: 1px;">Gemini Agent Utility</span>
            </div>
            <div id="gemini-close-btn" style="cursor:pointer; color:#555; font-size: 16px; padding: 0 5px;">&times;</div>
        `;

        // Content Iframe
        const iframe = document.createElement('iframe');
        iframe.src = `${extensionPath}index.html`;
        iframe.style.cssText = `
            flex: 1;
            border: none;
            width: 100%;
            height: 100%;
            background: transparent;
        `;

        container.appendChild(header);
        container.appendChild(iframe);
        document.body.appendChild(container);

        // Close logic
        document.getElementById('gemini-close-btn').onclick = () => {
            container.style.display = 'none';
        };

        // Improved Dragging
        let active = false;
        let currentX, currentY, initialX, initialY;
        let xOffset = 0, yOffset = 0;

        header.onmousedown = (e) => {
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;
            if (e.target === header || header.contains(e.target)) active = true;
        };

        document.onmousemove = (e) => {
            if (active) {
                e.preventDefault();
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
                xOffset = currentX;
                yOffset = currentY;
                container.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
            }
        };

        document.onmouseup = () => { active = false; };
    }

    // Initialize
    if (document.readyState === 'complete') {
        initExtension();
    } else {
        window.addEventListener('load', initExtension);
    }
})();
