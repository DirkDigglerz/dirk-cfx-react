import { create } from "zustand";
export type vector4 = { x: number; y: number; z: number; w: number };
export type FastTravelLocation = {
  name: string;
  price?: number;
  image?: string;
  coords: vector4;
};

export type FastTravelStore = {
  open?: boolean;
  locations: FastTravelLocation[];

}

export const useFastTravel = create<FastTravelStore>((set) => ({
  open: true,
  locations: [
    {
      name: "Valentine",
      price: 5,
      image: 'https://www.gamepressure.com/red-dead-redemption-2/gfx/word/471182078.jpg',
      coords: { x: -7.0, y: 12.0, z: 0.0, w: 0.0 },
    },
    {
      name: "Valentine",
      price: 5,
      image: 'https://fastly.picsum.photos/id/237/536/354.jpg?hmac=i0yVXW1ORpyCZpQ-CknuyV-jbtU7_x9EBQVhvT5aRr0',
      coords: { x: -7.0, y: 12.0, z: 0.0, w: 0.0 },
    },
    {
      name: "Valentine",
      price: 5,
      image: 'https://fastly.picsum.photos/id/237/536/354.jpg?hmac=i0yVXW1ORpyCZpQ-CknuyV-jbtU7_x9EBQVhvT5aRr0',
      coords: { x: -7.0, y: 12.0, z: 0.0, w: 0.0 },
    },
    {
      name: "Valentine",
      price: 5,
      image: 'https://fastly.picsum.photos/id/237/536/354.jpg?hmac=i0yVXW1ORpyCZpQ-CknuyV-jbtU7_x9EBQVhvT5aRr0',
      coords: { x: -7.0, y: 12.0, z: 0.0, w: 0.0 },
    },

  ],
}));
