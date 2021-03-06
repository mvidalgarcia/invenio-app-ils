import { ES_DELAY } from '@config';
import {
  IS_LOADING,
  SUCCESS,
  HAS_ERROR,
  DELETE_IS_LOADING,
  DELETE_SUCCESS,
  DELETE_HAS_ERROR,
} from './types';
import { internalLocation as internalLocationApi } from '@api';
import {
  sendErrorNotification,
  sendSuccessNotification,
} from '@components/Notifications';

export const fetchInternalLocations = () => {
  return async dispatch => {
    dispatch({
      type: IS_LOADING,
    });
    try {
      const response = await internalLocationApi.list();
      dispatch({
        type: SUCCESS,
        payload: response.data,
      });
    } catch (error) {
      dispatch({
        type: HAS_ERROR,
        payload: error,
      });
      dispatch(sendErrorNotification(error));
    }
  };
};

export const deleteInternalLocation = ilocPid => {
  return async dispatch => {
    dispatch({
      type: DELETE_IS_LOADING,
    });

    try {
      await internalLocationApi.delete(ilocPid);
      dispatch({
        type: DELETE_SUCCESS,
        payload: { internalLocationPid: ilocPid },
      });
      dispatch(
        sendSuccessNotification(
          'Success!',
          `The internal location ${ilocPid} has been deleted.`
        )
      );
      setTimeout(() => {
        dispatch(fetchInternalLocations());
      }, ES_DELAY);
    } catch (error) {
      dispatch({
        type: DELETE_HAS_ERROR,
        payload: error,
      });
      dispatch(sendErrorNotification(error));
    }
  };
};
