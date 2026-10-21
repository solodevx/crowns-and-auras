// Cloudinary resizes - we insert instructions after "/upload/".
// Cropping to a width and height with automatic quality and format.
export function optimizedImageUrl(
  url: string,
  width: number,
  height?: number,
): string {
  const resize = height
    ? `c_fill,g_auto,w_${width},h_${height}`
    : `c_limit,w_${width}`;
  return url.replace("/upload/", `/upload/${resize},q_auto,f_auto/`);
}