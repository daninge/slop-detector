let apiKey = null;
let processedPosts = new Set();

async function initializeExtension() {
  try {
    const result = await chrome.storage.local.get(['openaiApiKey']);
    apiKey = result.openaiApiKey;
    
    if (apiKey) {
      console.log('LinkedIn Slop Detector: API key loaded');
      startMonitoring();
    } else {
      console.log('LinkedIn Slop Detector: No API key found');
    }
  } catch (error) {
    console.error('LinkedIn Slop Detector: Error loading API key:', error);
  }
}

function startMonitoring() {
  if (window.location.hostname === 'www.linkedin.com' && window.location.pathname === '/feed/') {
    console.log('LinkedIn Slop Detector: Monitoring LinkedIn feed');
    
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type === 'childList') {
          checkForNewPosts();
        }
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    checkForNewPosts();
  }
}

function checkForNewPosts() {
  const posts = document.querySelectorAll('.feed-shared-update-v2');
  
  posts.forEach(async (post) => {
    const postId = post.getAttribute('data-urn') || generatePostId(post);
    
    if (!processedPosts.has(postId)) {
      processedPosts.add(postId);
      await analyzePost(post, postId);
    }
  });
}

function generatePostId(post) {
  const textContent = post.textContent.substring(0, 50);
  const timestamp = Date.now();
  return btoa(textContent + timestamp).substring(0, 20);
}

async function analyzePost(post, postId) {
  if (!apiKey) {
    console.log('LinkedIn Slop Detector: No API key available');
    return;
  }

  const textElement = post.querySelector('.feed-shared-inline-show-more-text');
  
  if (!textElement) {
    return;
  }

  const postText = textElement.textContent.trim();
  
  if (postText.length < 50) {
    return;
  }

  console.log('LinkedIn Slop Detector: Analyzing post:', postText.substring(0, 100) + '...');

  try {
    const isSlop = await callOpenAI(postText);
    
    if (isSlop) {
      console.log('LinkedIn Slop Detector: Slop detected, modifying post');
      markAsSlop(post, textElement);
    } else {
      console.log('LinkedIn Slop Detector: Genuine post detected');
    }
  } catch (error) {
    console.error('LinkedIn Slop Detector: Error analyzing post:', error);
  }
}

async function callOpenAI(postText) {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a LinkedIn post analyzer. Determine if a post is "slop" (low-quality engagement bait, meaningless inspirational content, fake stories for likes, or generic motivational posts) versus genuine content (job updates, real achievements, industry insights, or authentic personal/professional updates).

Respond with only "SLOP" or "GENUINE".

Examples of SLOP:
- "Agree? 👇 Comment below!" posts
- Fake inspirational stories that seem manufactured
- Generic motivational quotes with no personal context
- Obviously made-up scenarios designed for engagement
- Posts that exist purely to get likes/comments with no real value

Examples of GENUINE:
- Job change announcements
- Real project accomplishments
- Industry analysis or insights
- Authentic personal milestones
- Company updates or news`
          },
          {
            role: 'user',
            content: postText
          }
        ],
        max_tokens: 10,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const result = data.choices[0].message.content.trim().toLowerCase();
    
    return result.includes('slop');
  } catch (error) {
    console.error('LinkedIn Slop Detector: OpenAI API error:', error);
    return false;
  }
}

function markAsSlop(post, textElement) {
  post.classList.add('slop-detected');
  
  const originalText = textElement.textContent;
  textElement.textContent = '🚫 SLOP DETECTED: This post appears to be engagement bait or low-quality content designed to boost algorithmic reach.';
  
  const restoreButton = document.createElement('button');
  restoreButton.textContent = 'Show Original';
  restoreButton.className = 'slop-restore-btn';
  restoreButton.onclick = function() {
    textElement.textContent = originalText;
    restoreButton.remove();
    post.classList.remove('slop-detected');
  };
  
  textElement.parentNode.insertBefore(restoreButton, textElement.nextSibling);
}

chrome.storage.onChanged.addListener(function(changes, namespace) {
  if (changes.openaiApiKey) {
    apiKey = changes.openaiApiKey.newValue;
    if (apiKey) {
      console.log('LinkedIn Slop Detector: API key updated');
      startMonitoring();
    }
  }
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeExtension);
} else {
  initializeExtension();
}