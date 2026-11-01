export function confirmAction(message) {
  return new Promise(resolve => window.dispatchEvent(new CustomEvent('workspace-confirm', {detail:{message,resolve}})));
}
export function notify(message, tone='success') {
  window.dispatchEvent(new CustomEvent('workspace-notice', {detail:{message,tone}}));
}
