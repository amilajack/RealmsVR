import * as types from './types';
import API from '@/services/api';
import Mesher from '@/services/mesher';

export function create({
  name,
}) {
  return {
    type: types.REALM_CREATE,
    payload: API.fetch({
      body: {
        name,
      },
      endpoint: 'realm',
      method: 'PUT',
    }),
  };
}

export function generateGeometry({ size, voxels }) {
  return {
    type: types.REALM_UPDATE_GEOMETRY,
    payload: Mesher.generate({ size, voxels }),
  };
}

export function fetch(slug) {
  return dispatch => dispatch({
    type: types.REALM_FETCH,
    payload: API.fetch({
      endpoint: `realm/${slug}`,
    })
      .then(realm => (
        API.fetch({
          endpoint: `realm/${realm._id}/voxels`,
        })
          .then((voxels) => {
            voxels = new Uint32Array(voxels);
            dispatch(generateGeometry({ size: realm.size, voxels }));
            return {
              ...realm,
              voxels,
            };
          })
      )),
  });
}

export function reset() {
  return {
    type: types.REALM_RESET,
  };
}

export function updateVoxels({
  color,
  normal,
  point,
  remove,
}) {
  return (dispatch, getState) => {
    const { realm: { size, voxels: current } } = getState();
    const [x, y, z] = ['x', 'y', 'z'].map((axis) => {
      let position = Math.floor(point[axis] + (normal[axis] * 0.5 * (remove ? -1 : 1)));
      while (position < 0) position += size;
      while (position >= size) position -= size;
      return position;
    });
    const randomized = {
      r: Math.min(Math.max(Math.round((color.r * 0xFF) + (Math.random() * 8) - 4), 0), 255),
      g: Math.min(Math.max(Math.round((color.g * 0xFF) + (Math.random() * 8) - 4), 0), 255),
      b: Math.min(Math.max(Math.round((color.b * 0xFF) + (Math.random() * 8) - 4), 0), 255),
    };
    const value = remove ? (
      0x00
    ) : (
      (0x01 << 24) | (randomized.r << 16) | (randomized.g << 8) | randomized.b
    );
    const voxels = new Uint32Array(current);
    voxels[z * size * size + y * size + x] = value;
    dispatch(generateGeometry({ size, voxels }));
    return dispatch({
      type: types.REALM_UPDATE_VOXELS,
      payload: { voxels },
    });
  };
}
