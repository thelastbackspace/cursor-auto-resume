// Enhanced Cursor Auto Resume Script with UI Control
(function() {
    console.log('Cursor Auto Resume: Enhanced version running');
    
    // State management
    let isActive = true; // Script starts active by default
    let lastClickTime = 0;
    let injectedButton = null;
    
    // Button injection and management
    function createInfinityButton() {
        const button = document.createElement('div');
        button.className = 'anysphere-icon-button bg-[transparent] border-none text-foreground flex w-3 items-center justify-center cursor-auto-resume-btn';
        button.style.cursor = 'pointer';
        button.title = isActive ? 'Auto-resume is ON - Click to disable' : 'Auto-resume is OFF - Click to enable';
        
        const icon = document.createElement('span');
        icon.className = 'codicon codicon-infinity !text-[12px] none';
        
        button.appendChild(icon);
        updateButtonAppearance(button);
        
        // Add click handler
        button.addEventListener('click', toggleAutoResume);
        
        return button;
    }
    
    function updateButtonAppearance(button) {
        if (!button) return;
        
        const icon = button.querySelector('.codicon-infinity');
        if (isActive) {
            // Active state - bright white like native hover
            button.style.opacity = '1';
            button.style.color = '#ffffff';
            icon.style.color = '#ffffff';
            button.title = 'Auto-resume is ON - Click to disable';
        } else {
            // Disabled state - dimmed
            button.style.opacity = '0.5';
            button.style.color = '#888';
            icon.style.color = '#888';
            button.title = 'Auto-resume is OFF - Click to enable';
        }
    }
    
    function injectButton() {
        // Remove existing button if it exists
        const existingButton = document.querySelector('.cursor-auto-resume-btn');
        if (existingButton) {
            existingButton.remove();
        }
        
        // Find the button container
        const buttonContainer = document.querySelector('.button-container.composer-button-area');
        if (!buttonContainer) {
            console.log('Button container not found, will retry...');
            return false;
        }
        
        // Find the image button to insert before it
        const imageButton = buttonContainer.querySelector('.codicon-image-two')?.closest('.anysphere-icon-button');
        if (!imageButton) {
            console.log('Image button not found, will retry...');
            return false;
        }
        
        // Create and inject the infinity button
        injectedButton = createInfinityButton();
        buttonContainer.insertBefore(injectedButton, imageButton);
        
        console.log('Infinity button injected successfully');
        return true;
    }
    
    function toggleAutoResume() {
        isActive = !isActive;
        console.log(`Auto-resume ${isActive ? 'enabled' : 'disabled'}`);
        updateButtonAppearance(injectedButton);
    }
    
    // Main function that looks for and clicks the resume link
    function clickResumeLink() {
        // Only proceed if the script is active
        if (!isActive) return;
        
        // Prevent clicking too frequently (3 second cooldown)
        const now = Date.now();
        if (now - lastClickTime < 3000) return;
        
        // Find elements with rate limit text
        const elements = document.querySelectorAll('body *');
        for (const el of elements) {
            if (!el || !el.textContent) continue;
            
            // Check if element contains rate limit text
            if (el.textContent.includes('stop the agent after 25 tool calls') || 
                el.textContent.includes('Note: we default stop')) {
                
                // Find the resume link inside this element
                const links = el.querySelectorAll('a, span.markdown-link, [role="link"], [data-link]');
                for (const link of links) {
                    if (link.textContent.trim() === 'resume the conversation') {
                        console.log('Clicking "resume the conversation" link');
                        link.click();
                        lastClickTime = now;
                        return;
                    }
                }
            }
        }
    }
    
    // Monitor for DOM changes to reinject button when needed
    function setupDOMObserver() {
        const observer = new MutationObserver((mutations) => {
            let shouldReinject = false;
            
            mutations.forEach((mutation) => {
                // Check if button container was added/modified
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            if (node.classList?.contains('composer-button-area') || 
                                node.querySelector?.('.composer-button-area')) {
                                shouldReinject = true;
                            }
                        }
                    });
                }
            });
            
            // Check if our button still exists
            if (!document.querySelector('.cursor-auto-resume-btn')) {
                shouldReinject = true;
            }
            
            if (shouldReinject) {
                // Add a small delay to ensure DOM is stable
                setTimeout(() => {
                    injectButton();
                }, 100);
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        return observer;
    }
    
    // Initialize the script
    function initialize() {
        // Try to inject button immediately
        if (!injectButton()) {
            // If injection fails, retry every second until successful
            const retryInterval = setInterval(() => {
                if (injectButton()) {
                    clearInterval(retryInterval);
                }
            }, 1000);
        }
        
        // Setup DOM observer for reinjection
        setupDOMObserver();
        
        // Run resume checking periodically
        setInterval(clickResumeLink, 1000);
        
        // Also run once immediately
        clickResumeLink();
    }
    
    // Start the script
    initialize();
    
})(); 