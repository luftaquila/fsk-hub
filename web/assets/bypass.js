let inappdeny_exec_vanillajs = (callback) => {
  if (document.readyState !== 'loading') {
    callback();
  } else {
    document.addEventListener('DOMContentLoaded', callback);
  }
};

inappdeny_exec_vanillajs(() => {
  if ((navigator.userAgent.toLowerCase()).match(/kakaotalk/i)) {
    // KakaoTalk
    location.href = 'kakaotalk://web/openExternal?url=' + encodeURIComponent(location.href);
  }
});
