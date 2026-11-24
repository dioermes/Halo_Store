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
