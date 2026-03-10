export type HumanLinks = {
  x?: string;
  portfolio?: string;
  product?: string;
};

export type HumanEntry = {
  id: string;
  name: string;
  imageUrl: string;
  links: HumanLinks;
};

export type MovieEntry = {
  id: string;
  title: string;
  posterUrl: string;
  year?: string;
  link?: string;
};

export type ProductEntry = {
  id: string;
  name: string;
  link?: string;
  reason: string;
  logoUrl: string;
};
