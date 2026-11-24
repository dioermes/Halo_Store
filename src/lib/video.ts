export function videoSrcWithFrame(url: string) {
  if (!url) return url;
  return `${url.split("#")[0]}#t=0.001`;
}
