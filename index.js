
/**
 * SillyTavern Extension Loader
 * This script runs in the SillyTavern browser context.
 */

(function() {
    const extensionName = "gemini-agent-ext";
    const extensionFolderPath = `extensions/${extensionName}/`;

    function initExtension() {
        console.log("Gemini Agent Extension: Initializing...");

        // 1. Create a button in the SillyTavern Extension menu
        const extensionMenuButton = document.createElement('div');
        extensionMenuButton.classList.add('list-group-item', 'list-group-item-action', 'clickable');
        extensionMenuButton.innerHTML = `
            <i class="fas fa-robot"></i>
            <span class="extension_name">Gemini Agent</span>
        `;

        extensionMenuButton.addEventListener('click', () => {
            showGeminiWindow();
        });

        // Add to SillyTavern's extensions list
        const extensionsList = document.getElementById('extensions_settings_list');
        if (extensionsList) {
            extensionsList.appendChild(extensionMenuButton);
        }
    }

    function showGeminiWindow() {
        // Check if window already exists
        if (document.getElementById('gemini-agent-container')) {
            const existing = document.getElementById('gemini-agent-container');
            existing.style.display = existing.style.display === 'none' ? 'flex' : 'none';
            return;
        }

        // Create a floating container for the React App
        const container = document.createElement('div');
        container.id = 'gemini-agent-container';
        container.style.cssText = `
            position: fixed;
            top: 60px;
            right: 20px;
            width: 450px;
            height: 80vh;
            background: #0d0d0d;
            border: 1px solid #333;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.8);
            z-index: 2001;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            resize: both;
        `;

        // Create Header/Draggable area
        const header = document.createElement('div');
        header.style.cssText = `
            padding: 10px;
            background: #1a1a1a;
            cursor: move;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #333;
        `;
        header.innerHTML = `
            <span style="font-weight: bold; font-size: 12px; color: #888; text-transform: uppercase;">Gemini Agent Utility</span>
            <button id="gemini-close-btn" style="background:none; border:none; color:#666; cursor:pointer;">✕</button>
        `;

        // Iframe to load our React app (index.html)
        const iframe = document.createElement('iframe');
        iframe.src = `${window.location.origin}/extensions/${extensionName}/index.html`;
        iframe.style.cssText = `
            flex: 1;
            border: none;
            width: 100%;
            height: 100%;
        `;

        container.appendChild(header);
        container.appendChild(iframe);
        document.body.appendChild(container);

        // Simple Close Logic
        document.getElementById('gemini-close-btn').onclick = () => {
            container.style.display = 'none';
        };

        // Simple Drag Logic
        let isDragging = false;
        let offset = [0,0];
        header.onmousedown = (e) => {
            isDragging = true;
            offset = [container.offsetLeft - e.clientX, container.offsetTop - e.clientY];
        };
        document.onmousemove = (e) => {
            if (!isDragging) return;
            container.style.left = (e.clientX + offset[0]) + 'px';
            container.style.top = (e.clientY + offset[1]) + 'px';
            container.style.right = 'auto'; // Remove right constraint once moved
        };
        document.onmouseup = () => { isDragging = false; };
    }

    // Load extension when SillyTavern is ready
    if (document.readyState === 'complete') {
        initExtension();
    } else {
        window.addEventListener('load', initExtension);
    }
})();
