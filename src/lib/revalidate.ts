import { revalidatePath } from "next/cache";

/** Clears cached public pages, so a saved change shows up on the website straight away. */
export function refreshCatalog() {
  revalidatePath("/");
  revalidatePath("/courses");
  revalidatePath("/courses/[slug]", "page");
}

export function refreshBlog() {
  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath("/blog/[slug]", "page");
}