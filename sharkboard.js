// SharkBoard functionality with Firebase integration
import {
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js';

let db;
let unsubscribeListener = null;

// Wait for Firebase to be initialized
const waitForFirebase = () => {
  return new Promise((resolve) => {
    const checkInterval = setInterval(() => {
      if (window.firebaseDb) {
        clearInterval(checkInterval);
        db = window.firebaseDb;
        resolve();
      }
    }, 100);
  });
};

const DOM = {
  toggle: document.getElementById('sharkboard-toggle'),
  panel: document.getElementById('sharkboard-panel'),
  close: document.getElementById('sharkboard-close'),
  input: document.getElementById('sharkboard-input'),
  charCount: document.getElementById('char-count'),
  submit: document.getElementById('sharkboard-submit'),
  posts: document.getElementById('sharkboard-posts')
};

// Initialize SharkBoard
export const initSharkBoard = async () => {
  await waitForFirebase();
  
  // Toggle panel
  DOM.toggle.addEventListener('click', () => {
    if (DOM.panel.hasAttribute('hidden')) {
      DOM.panel.removeAttribute('hidden');
      loadPosts();
    } else {
      DOM.panel.setAttribute('hidden', '');
    }
  });

  // Close panel
  DOM.close.addEventListener('click', () => {
    DOM.panel.setAttribute('hidden', '');
  });

  // Character counter
  DOM.input.addEventListener('input', (e) => {
    DOM.charCount.textContent = e.target.value.length;
  });

  // Submit post
  DOM.submit.addEventListener('click', submitPost);

  // Keyboard shortcut (b key)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'b' && e.target === document.body) {
      e.preventDefault();
      if (DOM.panel.hasAttribute('hidden')) {
        DOM.panel.removeAttribute('hidden');
        loadPosts();
      } else {
        DOM.panel.setAttribute('hidden', '');
      }
    }
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !DOM.panel.hasAttribute('hidden')) {
      DOM.panel.setAttribute('hidden', '');
    }
  });

  // Load initial posts
  loadPosts();
};

// Submit new post
const submitPost = async () => {
  const content = DOM.input.value.trim();
  
  if (!content) {
    alert('Please write something to share!');
    return;
  }

  DOM.submit.disabled = true;
  DOM.submit.textContent = 'Posting...';

  try {
    const postsCollection = collection(db, 'sharkboard_posts');
    
    await addDoc(postsCollection, {
      content: content,
      author: 'Anonymous Visitor',
      timestamp: serverTimestamp(),
      likes: 0,
      edited: false
    });

    // Clear input
    DOM.input.value = '';
    DOM.charCount.textContent = '0';
    
    // Refresh posts
    loadPosts();
  } catch (error) {
    console.error('Error posting:', error);
    alert('Error posting. Please try again.');
  } finally {
    DOM.submit.disabled = false;
    DOM.submit.textContent = 'Post to Board';
  }
};

// Load and listen to posts
const loadPosts = () => {
  try {
    const postsCollection = collection(db, 'sharkboard_posts');
    const q = query(
      postsCollection,
      orderBy('timestamp', 'desc'),
      limit(50)
    );

    // Unsubscribe from previous listener
    if (unsubscribeListener) {
      unsubscribeListener();
    }

    // Subscribe to real-time updates
    unsubscribeListener = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        DOM.posts.innerHTML = '<p class="sharkboard-empty">No posts yet. Be the first! 🌊</p>';
        return;
      }

      DOM.posts.innerHTML = '';

      snapshot.forEach((doc) => {
        const post = doc.data();
        const postElement = createPostElement(doc.id, post);
        DOM.posts.appendChild(postElement);
      });
    }, (error) => {
      console.error('Error loading posts:', error);
      DOM.posts.innerHTML = '<p class="sharkboard-empty">Error loading posts. Try refreshing. 🦈</p>';
    });
  } catch (error) {
    console.error('Error setting up listener:', error);
    DOM.posts.innerHTML = '<p class="sharkboard-empty">Error connecting. Try refreshing. 🦈</p>';
  }
};

// Create post element
const createPostElement = (postId, post) => {
  const div = document.createElement('div');
  div.className = 'sharkboard-post';
  
  const timestamp = post.timestamp
    ? new Date(post.timestamp.toDate()).toLocaleString()
    : 'just now';

  div.innerHTML = `
    <div class="sharkboard-post-meta">
      <span class="sharkboard-post-author">${escapeHtml(post.author)}</span>
      <span>${timestamp}</span>
    </div>
    <div class="sharkboard-post-content">${escapeHtml(post.content)}</div>
    <div class="sharkboard-post-actions">
      <button class="sharkboard-post-action" data-post-id="${postId}" data-action="like">
        👍 ${post.likes || 0}
      </button>
      <button class="sharkboard-post-action" data-post-id="${postId}" data-action="delete">
        🗑️ Delete
      </button>
    </div>
  `;

  // Like button
  const likeBtn = div.querySelector('[data-action="like"]');
  likeBtn.addEventListener('click', async () => {
    try {
      const postRef = doc(db, 'sharkboard_posts', postId);
      await updateDoc(postRef, {
        likes: (post.likes || 0) + 1
      });
    } catch (error) {
      console.error('Error liking post:', error);
    }
  });

  // Delete button
  const deleteBtn = div.querySelector('[data-action="delete"]');
  deleteBtn.addEventListener('click', async () => {
    if (confirm('Are you sure? This cannot be undone.')) {
      try {
        await deleteDoc(doc(db, 'sharkboard_posts', postId));
      } catch (error) {
        console.error('Error deleting post:', error);
        alert('Error deleting post.');
      }
    }
  });

  return div;
};

// Escape HTML to prevent XSS
const escapeHtml = (text) => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

// Initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSharkBoard);
} else {
  initSharkBoard();
}