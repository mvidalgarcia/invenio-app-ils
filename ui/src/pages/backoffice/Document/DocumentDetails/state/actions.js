import React from 'react';
import { Link } from 'react-router-dom';
import {
  DELETE_IS_LOADING,
  DELETE_SUCCESS,
  DELETE_HAS_ERROR,
  IS_LOADING,
  SUCCESS,
  HAS_ERROR,
} from './types';
import { ES_DELAY } from '@config';
import { goTo } from '@history';
import { document as documentApi, loan as loanApi } from '@api';
import { DateTime } from 'luxon';
import { toShortDate } from '@api/date';
import { BackOfficeRoutes } from '@routes/urls';
import {
  sendErrorNotification,
  sendSuccessNotification,
} from '@components/Notifications';

export const fetchDocumentDetails = documentPid => {
  return async dispatch => {
    dispatch({
      type: IS_LOADING,
    });

    await documentApi
      .get(documentPid)
      .then(response => {
        dispatch({
          type: SUCCESS,
          payload: response.data,
        });
      })
      .catch(error => {
        dispatch({
          type: HAS_ERROR,
          payload: error,
        });
        dispatch(sendErrorNotification(error));
      });
  };
};

export const deleteDocument = documentPid => {
  return async dispatch => {
    dispatch({
      type: DELETE_IS_LOADING,
    });

    try {
      await documentApi.delete(documentPid);
      dispatch({
        type: DELETE_SUCCESS,
        payload: { documentPid: documentPid },
      });
      dispatch(
        sendSuccessNotification(
          'Success!',
          `The document ${documentPid} has been deleted.`
        )
      );
      setTimeout(() => {
        goTo(BackOfficeRoutes.documentsList);
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

export const updateDocument = (documentPid, path, value) => {
  return async dispatch => {
    dispatch({
      type: IS_LOADING,
    });

    await documentApi
      .patch(documentPid, [
        {
          op: 'replace',
          path: path,
          value: value,
        },
      ])
      .then(response => {
        dispatch({
          type: SUCCESS,
          payload: response.data,
        });
        dispatch(
          sendSuccessNotification(
            'Success!',
            `The document ${documentPid} has been updated.`
          )
        );
      })
      .catch(error => {
        dispatch({
          type: HAS_ERROR,
          payload: error,
        });
        dispatch(sendErrorNotification(error));
      });
  };
};

export const requestLoanForPatron = (
  documentPid,
  patronPid,
  { requestEndDate = null, deliveryMethod = null } = {}
) => {
  return async dispatch => {
    dispatch({
      type: IS_LOADING,
    });
    const today = toShortDate(DateTime.local());
    try {
      const response = await loanApi.doRequest(documentPid, patronPid, {
        requestExpireDate: requestEndDate,
        requestStartDate: today,
        deliveryMethod: deliveryMethod,
      });
      const loanPid = response.data.pid;
      const linkToLoan = (
        <p>
          The loan {loanPid} has been requested.{' '}
          <Link to={BackOfficeRoutes.loanDetailsFor(loanPid)}>
            You can now view the loan details.
          </Link>
        </p>
      );
      dispatch(sendSuccessNotification('Success!', linkToLoan));
      setTimeout(() => {
        dispatch(fetchDocumentDetails(documentPid));
      }, ES_DELAY);
    } catch (error) {
      dispatch({
        type: HAS_ERROR,
        payload: error,
      });
      dispatch(sendErrorNotification(error));
    }
  };
};
