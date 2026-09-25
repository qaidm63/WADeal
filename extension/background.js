// WADeal Background Service Worker (Manifest V3)
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.storage.local.get(['wadeal_business_context', 'wadeal_client_id'], (res) => {
      const updates = {};
      if (!res.wadeal_client_id) {
        updates.wadeal_client_id = 'wadeal_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
      }
      if (!res.wadeal_business_context) {
        updates.wadeal_business_context = 'Luxury perfume brand. Standard bottle: $48. Bundle deal: Buy 2 for $80 with free nationwide delivery. Delivery window: 24–48 hours. Cash on delivery available. 14-day replacement guarantee.';
      }
      chrome.storage.local.set(updates);
    });
  }
});
