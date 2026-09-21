/* ============================================================
   Native-shell glue. Does nothing in a browser — every call is
   guarded on Capacitor actually being present, so the same files
   ship to the web and inside the iOS app.
   ============================================================ */
(function () {
  const cap = window.Capacitor;
  if (!cap || !cap.Plugins) return;
  const { SplashScreen, StatusBar } = cap.Plugins;

  // The status bar overlays the web view, so the game's own safe-area
  // padding positions the HUD; we only need its content to be light
  // against the dark board.
  if (StatusBar) {
    // "Dark" here means dark *background*, i.e. light content.
    StatusBar.setStyle({ style: "DARK" }).catch(() => {});
  }

  // launchAutoHide is off in capacitor.config.json so the splash stays up
  // until the first board is actually dealt — otherwise iOS tears it away
  // while the page is still blank and the player sees a flash of empty
  // background before the bottles appear.
  if (SplashScreen) {
    const hide = () => SplashScreen.hide({ fadeOutDuration: 250 }).catch(() => {});
    let done = false;
    const once = () => { if (!done) { done = true; hide(); } };
    const ready = setInterval(() => {
      if (window.PuruPop && window.PuruPop.state.tubes.length > 0) {
        clearInterval(ready);
        once();
      }
    }, 60);
    // Never leave the splash stuck up if the board can't be dealt.
    setTimeout(() => { clearInterval(ready); once(); }, 6000);
  }
})();
