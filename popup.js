document.addEventListener('DOMContentLoaded', function() {
  const apiKeyInput = document.getElementById('apiKey');
  const saveButton = document.getElementById('saveKey');
  const statusDiv = document.getElementById('status');
  const currentKeyDiv = document.getElementById('currentKey');

  loadCurrentKey();

  saveButton.addEventListener('click', saveApiKey);
  apiKeyInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      saveApiKey();
    }
  });

  async function loadCurrentKey() {
    try {
      const result = await chrome.storage.local.get(['openaiApiKey']);
      if (result.openaiApiKey) {
        const maskedKey = result.openaiApiKey.substring(0, 7) + '...' + result.openaiApiKey.substring(result.openaiApiKey.length - 4);
        currentKeyDiv.textContent = `Current key: ${maskedKey}`;
        showStatus('API key loaded', 'success');
      } else {
        currentKeyDiv.textContent = 'No API key saved';
        showStatus('Please enter your OpenAI API key', 'error');
      }
    } catch (error) {
      showStatus('Error loading API key', 'error');
    }
  }

  async function saveApiKey() {
    const apiKey = apiKeyInput.value.trim();
    
    if (!apiKey) {
      showStatus('Please enter an API key', 'error');
      return;
    }

    if (!apiKey.startsWith('sk-')) {
      showStatus('Invalid API key format', 'error');
      return;
    }

    try {
      await chrome.storage.local.set({ openaiApiKey: apiKey });
      showStatus('API key saved successfully!', 'success');
      apiKeyInput.value = '';
      
      setTimeout(() => {
        loadCurrentKey();
      }, 1000);
      
    } catch (error) {
      showStatus('Error saving API key', 'error');
    }
  }

  function showStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    
    if (type === 'success') {
      setTimeout(() => {
        statusDiv.textContent = '';
        statusDiv.className = '';
      }, 3000);
    }
  }
});