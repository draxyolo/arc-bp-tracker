export type Blueprint = {
  id: number;
  name: string;
  coloredSrc: string;
  graySrc: string;
};

export const BLUEPRINTS: Blueprint[] = Array.from({ length: 75 }).map((_, i) => {
  const id = i + 1;
  return {
    id,
    name: `BP ${id}`,
    coloredSrc: `/bps/colored/${id}.png`,
    graySrc: `/bps/gray/${id}.png`,
  };
});
