export const DESKTOP_VIDEO_MQ = "(min-width: 768px)";

export function cleanMediaUrl(url: string) {
  return url.split("#")[0];
}

export function pickDeviceVideoSrc(mobile: string, desktop?: string) {
  const phone = cleanMediaUrl(mobile);
  const pc = desktop ? cleanMediaUrl(desktop) : phone;
  if (typeof window === "undefined") return phone;
  return window.matchMedia(DESKTOP_VIDEO_MQ).matches ? pc : phone;
}

export function assignDeviceVideoSrc(video: HTMLVideoElement) {
  const mobile = video.dataset.mobileSrc ?? video.dataset.src ?? "";
  const desktop = video.dataset.desktopSrc;
  const next = pickDeviceVideoSrc(mobile, desktop);
  if (!next) return "";
  if (video.getAttribute("src") !== next) video.src = next;
  return next;
}

export function watchDeviceVideoSrc(video: HTMLVideoElement, options?: { assignNow?: boolean }) {
  const apply = () => {
    const before = video.getAttribute("src") ?? "";
    if (!options?.assignNow && !before) return;
    const next = assignDeviceVideoSrc(video);
    if (!next || before === next) return;
    video.muted = true;
    video.defaultMuted = true;
    void video.play().catch(() => undefined);
  };
  if (options?.assignNow) apply();
  const media = window.matchMedia(DESKTOP_VIDEO_MQ);
  media.addEventListener("change", apply);
  return () => media.removeEventListener("change", apply);
}
