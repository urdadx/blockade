import adultImage from "@/assets/categories/18plus.png";
import gamblingImage from "@/assets/categories/gambling.png";
import newsImage from "@/assets/categories/news.png";
import shoppingImage from "@/assets/categories/shopping.png";
import socialImage from "@/assets/categories/socials.png";
import sportsImage from "@/assets/categories/sports.png";
import type { CategoryId } from "@blockade/core";

export const categoryImages: Record<CategoryId, string> = {
  adult: adultImage,
  social: socialImage,
  news: newsImage,
  sports: sportsImage,
  shopping: shoppingImage,
  gambling: gamblingImage,
};
