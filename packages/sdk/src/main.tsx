import { render } from 'preact';
import { WaitlistWidget } from './components/WaitlistWidget';

// Export for programmatic use
export { WaitlistWidget };
export type { WidgetMode, Theme, SuccessData } from './components/WaitlistWidget';

// Web Component wrapper
class VWaitlistElement extends HTMLElement {
  private shadow: ShadowRoot;
  private mountPoint: HTMLDivElement;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    this.mountPoint = document.createElement('div');
    this.mountPoint.style.all = 'initial';
    this.shadow.appendChild(this.mountPoint);
  }

  connectedCallback() {
    const projectId = this.getAttribute('project-id');
    const mode = this.getAttribute('mode') as 'input' | 'modal' | null;
    const theme = this.getAttribute('theme') as 'light' | 'dark' | null;
    const primaryColor = this.getAttribute('primary-color');
    const apiBaseUrl = this.getAttribute('api-base-url');

    if (!projectId) {
      console.error('v-waitlist: project-id attribute is required');
      return;
    }

    // Inject styles
    const style = document.createElement('style');
    style.textContent = `
      :host {
        display: block;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      }
      .vw-hidden {
        display: none !important;
      }
    `;
    this.shadow.appendChild(style);

    // Render widget
    render(
      <WaitlistWidget
        projectId={projectId}
        mode={mode || undefined}
        theme={theme || undefined}
        primaryColor={primaryColor || undefined}
        apiBaseUrl={apiBaseUrl || undefined}
      />,
      this.mountPoint
    );
  }

  disconnectedCallback() {
    render(null, this.mountPoint);
  }
}

// Register the custom element
if (!customElements.get('v-waitlist')) {
  customElements.define('v-waitlist', VWaitlistElement);
}

// Also export as default
export default VWaitlistElement;
