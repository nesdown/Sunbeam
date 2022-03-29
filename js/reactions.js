const likeIconContainerSel = '.like-icon__container';
const likeIconSel = ".like-icon";
const likeIconActiveClass = "like-icon_active";
const newsCardSelector = ".news-card";
const newsIdAttributeName = "data-news-id";
const likedPostsKey = "likedPosts";
const likesCountSel = ".likes_counter__count";

localStorage.clear();
document.addEventListener("DOMContentLoaded", () => {
  updateLikeBtns();
});

document.addEventListener("click", ({ target }) => {
  if (target.closest(likeIconContainerSel)) {
    const newsId = target
      .closest(newsCardSelector)
      .getAttribute(newsIdAttributeName);
    likeAPost(newsId);
    updateLikeBtns();
  }
});

function omit(keyToOmit, { [keyToOmit]: _, ...omittedPropObj } = {}) {
  return omittedPropObj;
}

function likeAPost(postId) {
  const likedPosts = getFromLocalStorage(likedPostsKey);
  if (!likedPosts) {
    setToLocalStorage(likedPostsKey, {});
  }
  saveLikesToLocalStorage(postId);
}

function saveLikesToLocalStorage(postId) {
  const likedPosts = getFromLocalStorage(likedPostsKey);
  if (likedPosts[postId]) {
    setToLocalStorage(likedPostsKey, omit(postId, likedPosts));
    return;
  }
  sendApiRequest(postId)
  setToLocalStorage(likedPostsKey, {
    ...likedPosts,
    [postId]: true
  });
}

async function sendApiRequest(postId) {
  await fetch(baseUrl, {
    method: "POST",
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ postId: postId })
  }).then(res => {
    console.log("Request complete! response:", res);
  });
}

function setToLocalStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getFromLocalStorage(key) {
  const item = localStorage.getItem(key);
  return JSON.parse(item);
}

function updateLikeBtns() {
  const likeBtns = [...document.querySelectorAll(likeIconSel)];

  likeBtns.forEach((btn) => {
    const newsCard = btn.closest(newsCardSelector);
    const postId = newsCard.getAttribute(newsIdAttributeName);
    const likedPosts = getFromLocalStorage(likedPostsKey);
    const likesCountSpan = newsCard.querySelector(likesCountSel);
    const likesNum = parseInt(likesCountSpan.innerText);

    if (likedPosts && likedPosts[postId]) {
      btn.classList.add(likeIconActiveClass);
      likesCountSpan.innerText = likesNum + 1;
    } else {
      if (btn.classList.contains(likeIconActiveClass)) {
        likesCountSpan.innerText = likesNum - 1;
      }
      btn.classList.remove(likeIconActiveClass);
    }
  });
}
