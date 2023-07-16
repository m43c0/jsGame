// data structure used to compute directions of Player and Enemies on Map;
// each direction consists of a touple of coordinates, with one of them expressing a positive or negative offset of 1
// Adding a direction touple to the coordinates of an entity, results in the entity to be moved by one cell in that direction.
export const Direction = {
  Up: { x: 0, y: -1 },
  Down: { x: 0, y: 1 },
  Left: { x: -1, y: 0 },
  Right: { x: 1, y: 0 },
};
