// eslint-disable-next-line no-restricted-globals
const context = self;

const meshVoxels = ({ promiseId, size, voxels }) => {
  const cache = {};
  const getVoxel = (x, y, z) => {
    if (x < 0) x += size;
    if (x >= size) x -= size;
    if (y < 0) y += size;
    if (y >= size) y -= size;
    if (z < 0) z += size;
    if (z >= size) z -= size;
    const hash = `${x}:${y}:${z}`;
    if (!cache[hash]) {
      const voxel = voxels[z * size * size + y * size + x];
      const type = (voxel >> 24) & 0xFF / 0xFF;
      const r = ((voxel >> 16) & 0xFF) / 0xFF;
      const g = ((voxel >> 8) & 0xFF) / 0xFF;
      const b = (voxel & 0xFF) / 0xFF;
      cache[hash] = {
        type,
        r,
        g,
        b,
      };
    }
    return cache[hash];
  };
  const test = (x, y, z) => (
    !!getVoxel(x, y, z).type
  );
  const ao = (n, [r, g, b]) => {
    let light = 1;
    n.forEach((n) => {
      if (n) {
        light = Math.max(light - 0.3, 0.4);
      }
    });
    return ([
      r * light,
      g * light,
      b * light,
    ]);
  };
  const index = [];
  const position = [];
  const color = [];
  const normal = [];
  let offset = 0;
  const pushFace = (
    p1, ao1,
    p2, ao2,
    p3, ao3,
    p4, ao4,
    c,
    n
  ) => {
    position.push(...p1, ...p2, ...p3, ...p4);
    color.push(...ao(ao1, c), ...ao(ao2, c), ...ao(ao3, c), ...ao(ao4, c));
    normal.push(...n, ...n, ...n, ...n);
    index.push(
      offset, offset + 1, offset + 2,
      offset + 2, offset + 3, offset
    );
    offset += 4;
  };
  for (let z = 0; z < size; z += 1) {
    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        const {
          type,
          r,
          g,
          b,
        } = getVoxel(x, y, z);
        if (type === 0x01) {
          // TOP
          if (!test(x, y + 1, z)) {
            pushFace(
              [x, y + 1, z + 1],
              [test(x - 1, y + 1, z), test(x, y + 1, z + 1), test(x - 1, y + 1, z + 1)],
              [x + 1, y + 1, z + 1],
              [test(x + 1, y + 1, z), test(x, y + 1, z + 1), test(x + 1, y + 1, z + 1)],
              [x + 1, y + 1, z],
              [test(x + 1, y + 1, z), test(x, y + 1, z - 1), test(x + 1, y + 1, z - 1)],
              [x, y + 1, z],
              [test(x - 1, y + 1, z), test(x, y + 1, z - 1), test(x - 1, y + 1, z - 1)],
              [r, g, b],
              [0, 1, 0]
            );
          }
          // BOTTOM
          if (!test(x, y - 1, z)) {
            pushFace(
              [x, y, z],
              [test(x - 1, y - 1, z), test(x, y - 1, z - 1), test(x - 1, y - 1, z - 1)],
              [x + 1, y, z],
              [test(x + 1, y - 1, z), test(x, y - 1, z - 1), test(x + 1, y - 1, z - 1)],
              [x + 1, y, z + 1],
              [test(x + 1, y - 1, z), test(x, y - 1, z + 1), test(x + 1, y - 1, z + 1)],
              [x, y, z + 1],
              [test(x - 1, y - 1, z), test(x, y - 1, z + 1), test(x - 1, y - 1, z + 1)],
              [r, g, b],
              [0, -1, 0]
            );
          }
          // SOUTH
          if (!test(x, y, z + 1)) {
            pushFace(
              [x, y, z + 1],
              [test(x - 1, y, z + 1), test(x, y - 1, z + 1), test(x - 1, y - 1, z + 1)],
              [x + 1, y, z + 1],
              [test(x + 1, y, z + 1), test(x, y - 1, z + 1), test(x + 1, y - 1, z + 1)],
              [x + 1, y + 1, z + 1],
              [test(x + 1, y, z + 1), test(x, y + 1, z + 1), test(x + 1, y + 1, z + 1)],
              [x, y + 1, z + 1],
              [test(x - 1, y, z + 1), test(x, y + 1, z + 1), test(x - 1, y + 1, z + 1)],
              [r, g, b],
              [0, 0, 1]
            );
          }
          // NORTH
          if (!test(x, y, z - 1)) {
            pushFace(
              [x + 1, y, z],
              [test(x + 1, y, z - 1), test(x, y - 1, z - 1), test(x + 1, y - 1, z - 1)],
              [x, y, z],
              [test(x - 1, y, z - 1), test(x, y - 1, z - 1), test(x - 1, y - 1, z - 1)],
              [x, y + 1, z],
              [test(x - 1, y, z - 1), test(x, y + 1, z - 1), test(x - 1, y + 1, z - 1)],
              [x + 1, y + 1, z],
              [test(x + 1, y, z - 1), test(x, y + 1, z - 1), test(x + 1, y + 1, z - 1)],
              [r, g, b],
              [0, 0, -1]
            );
          }
          // WEST
          if (!test(x + 1, y, z)) {
            pushFace(
              [x + 1, y, z + 1],
              [test(x + 1, y, z + 1), test(x + 1, y - 1, z), test(x + 1, y - 1, z + 1)],
              [x + 1, y, z],
              [test(x + 1, y, z - 1), test(x + 1, y - 1, z), test(x + 1, y - 1, z - 1)],
              [x + 1, y + 1, z],
              [test(x + 1, y, z - 1), test(x + 1, y + 1, z), test(x + 1, y + 1, z - 1)],
              [x + 1, y + 1, z + 1],
              [test(x + 1, y, z + 1), test(x + 1, y + 1, z), test(x + 1, y + 1, z + 1)],
              [r, g, b],
              [1, 0, 0]
            );
          }
          // EAST
          if (!test(x - 1, y, z)) {
            pushFace(
              [x, y, z],
              [test(x - 1, y, z - 1), test(x - 1, y - 1, z), test(x - 1, y - 1, z - 1)],
              [x, y, z + 1],
              [test(x - 1, y, z + 1), test(x - 1, y - 1, z), test(x - 1, y - 1, z + 1)],
              [x, y + 1, z + 1],
              [test(x - 1, y, z + 1), test(x - 1, y + 1, z), test(x - 1, y + 1, z + 1)],
              [x, y + 1, z],
              [test(x - 1, y, z - 1), test(x - 1, y + 1, z), test(x - 1, y + 1, z - 1)],
              [r, g, b],
              [-1, 0, 0]
            );
          }
        }
      }
    }
  }
  const geometry = {
    index: new Uint32Array(index),
    position: new Float32Array(position),
    color: new Float32Array(color),
    normal: new Float32Array(normal),
  };
  context.postMessage({
    geometry,
    promiseId,
  }, [
    geometry.index.buffer,
    geometry.position.buffer,
    geometry.color.buffer,
    geometry.normal.buffer,
  ]);
};

context.addEventListener('message', ({ data: { promiseId, size, voxels } }) => (
  setImmediate(() => meshVoxels({ promiseId, size, voxels }))
));
